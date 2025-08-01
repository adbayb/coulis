import type { CreateCoulis } from "../../core/ports/createCoulis";
import { STYLE_TYPES } from "../../core/entities/style";
import type { StyleType } from "../../core/entities/style";
import { isNumber, isObject } from "../../core/entities/primitive";
import type { RecordLike } from "../../core/entities/primitive";
import { createMapCache, createSetCache } from "../../core/entities/cache";
import type { SetCache } from "../../core/entities/cache";
import type { ClassName, Rule, StyleSheet } from "./types";
import { createVirtualStyleSheet } from "./stylesheet/virtual";
import { createDomStyleSheet } from "./stylesheet/dom";
import {
	createClassName,
	createCustomProperties,
	createDeclaration,
	getEvaluatedTemplate,
	isShorthandProperty,
} from "./helpers";
import { IS_SERVER_ENVIRONMENT } from "./constants";

export const createCoulis: CreateCoulis<{
	Input: {
		WithCSSVariables: true;
	};
	Output: ClassName;
	// eslint-disable-next-line sonarjs/max-lines-per-function
}> = (contract) => {
	const createStyleSheet = IS_SERVER_ENVIRONMENT
		? createVirtualStyleSheet
		: createDomStyleSheet;

	const styleSheetByTypeAdaptee = STYLE_TYPES.reduce(
		(output, type) => {
			output[type] = createStyleSheet(type);

			return output;
		},
		{} as Record<StyleType, StyleSheet>,
	);

	const classNameByTypeCache = createMapCache<
		StyleType,
		SetCache<ClassName>
	>();

	const hydratedClassNameCache = new Set(
		Object.values(styleSheetByTypeAdaptee).flatMap((styleSheet) =>
			styleSheet.getHydratedClassNames(),
		),
	);

	const shorthands = (contract.shorthands ?? {}) as NonNullable<
		typeof contract.shorthands
	>;

	const shorthandNames = Object.keys(shorthands);
	let collectedCustomProperties = "";

	const properties = contract.properties(
		(contract.theme &&
			createCustomProperties(contract.theme, (name, value) => {
				collectedCustomProperties += `${name}:${String(value)};`;
			})) as Parameters<typeof contract.properties>[0],
	);

	const isCustomShorthandProperty = (name: string) => {
		return shorthandNames.includes(name);
	};

	const getDeclaration = ({
		name,
		value,
	}: {
		name: keyof RecordLike;
		value: RecordLike[keyof RecordLike];
	}) => {
		const propertyValue = properties[name as keyof typeof properties];

		return createDeclaration({
			name,
			value:
				typeof propertyValue === "function"
					? // eslint-disable-next-line @typescript-eslint/no-unsafe-call
						propertyValue(value)
					: isObject(propertyValue)
						? (propertyValue[value as string] ?? value)
						: value,
		});
	};

	const createDeclarationBlock = (input: RecordLike) => {
		let declarationBlock = "";
		const propertyNames = Object.keys(input);

		propertyNames.forEach((propertyName) => {
			const value = input[propertyName];

			if (value === undefined) return;

			if (isCustomShorthandProperty(propertyName)) {
				const shorthandedPropertyNames = shorthands[propertyName];

				if (shorthandedPropertyNames === undefined) return;

				shorthandedPropertyNames.forEach((shorthandedPropertyName) => {
					declarationBlock += getDeclaration({
						name: shorthandedPropertyName as string,
						value,
					});
				});
			} else {
				declarationBlock += getDeclaration({
					name: propertyName,
					value,
				});
			}
		});

		return declarationBlock;
	};

	const insert = ({
		cacheInput,
		onCreateRule,
		type,
	}: {
		cacheInput: string;
		onCreateRule: (input: { className: ClassName }) => Rule;
		type: StyleType;
	}): ClassName => {
		const className = createClassName(cacheInput);

		if (hydratedClassNameCache.has(className)) return className;

		let cache = classNameByTypeCache.get(type);

		if (!cache) {
			cache = createSetCache();
			classNameByTypeCache.add(type, cache);
		}

		if (cache.has(className)) return className;

		cache.add(className);
		styleSheetByTypeAdaptee[type].insert(
			className,
			onCreateRule({ className }),
		);

		return className;
	};

	insert({
		cacheInput: collectedCustomProperties,
		onCreateRule() {
			return `:root{${collectedCustomProperties}}`;
		},
		type: "global",
	});

	return {
		createKeyframes(input) {
			return insert({
				cacheInput: JSON.stringify(input),
				onCreateRule({ className }) {
					let rule = "";

					const selectors = Object.keys(
						input,
					) as (keyof typeof input)[];

					for (const selector of selectors) {
						const style = input[selector];

						if (!style) continue;

						const ruleSelector = isNumber(selector)
							? `${selector}%`
							: String(selector);

						rule += `${ruleSelector}{${createDeclarationBlock(style)}}`;
					}

					return `@keyframes ${className}{${rule}}`;
				},
				type: "global",
			});
		},
		createStyles(input) {
			const classNames: ClassName[] = [];

			const collectClassNames = (name: string, value: unknown) => {
				const isShorthandPropertyValue = isShorthandProperty(name);

				let type: StyleType = isShorthandPropertyValue
					? "shorthand"
					: "longhand";

				if (!isObject(value)) {
					const declaration = getDeclaration({
						name,
						value,
					});

					classNames.push(
						insert({
							cacheInput: declaration,
							onCreateRule({ className }) {
								return `.${className}{${declaration}}`;
							},
							type,
						}),
					);

					return;
				}

				const stateKeys = Object.keys(value);

				for (const stateKey of stateKeys) {
					const stateValue = value[stateKey];

					const declaration = getDeclaration({
						name,
						value: stateValue,
					});

					const isBaseState = stateKey === "base";

					const stateTemplate = isBaseState
						? "coulis[selector]{coulis[declaration]}"
						: contract.states?.[stateKey];

					if (stateTemplate === undefined) continue;

					const preComputedRule = getEvaluatedTemplate(
						stateTemplate,
						{
							declaration,
							selector: `.coulis[className]`,
						},
					);

					if (preComputedRule.startsWith("@")) {
						type = isShorthandPropertyValue
							? "atShorthand"
							: "atLonghand";
					}

					classNames.push(
						insert({
							/*
							 * The key is not included to compute the className when `key` equals to "base" as base is equivalent to an unconditional value.
							 * This exclusion will allow to recycle cache if the style value has been already defined unconditionally.
							 */
							cacheInput: isBaseState
								? declaration
								: `${stateKey}${declaration}`,
							onCreateRule({ className }) {
								return preComputedRule.replaceAll(
									"coulis[className]",
									className,
								);
							},
							type,
						}),
					);
				}
			};

			for (const propertyName of Object.keys(input)) {
				const value = input[propertyName as keyof typeof input];

				if (isCustomShorthandProperty(propertyName)) {
					const shorthandedPropertyNames = shorthands[propertyName];

					if (shorthandedPropertyNames === undefined) continue;

					for (const shorthandedPropertyName of shorthandedPropertyNames) {
						collectClassNames(
							shorthandedPropertyName as string,
							value,
						);
					}
				} else {
					collectClassNames(propertyName, value);
				}
			}

			return classNames.join(" ");
		},
		getContract() {
			return {
				propertyNames: [
					...shorthandNames,
					...Object.keys(properties),
				] as ReturnType<typeof this.getContract>["propertyNames"],
			};
		},
		getMetadata() {
			const metadata = STYLE_TYPES.map((type) => {
				const { getContent } = styleSheetByTypeAdaptee[type];
				const cachedClassNames = classNameByTypeCache.get(type);
				const content = getContent();

				return {
					attributes: {
						"data-coulis-cache": [
							...(cachedClassNames?.getAll() ?? []),
						].join(","),
						"data-coulis-type": type,
					},
					content,
				};
			});

			metadata.toString = () => {
				return metadata.reduce((output, { attributes, content }) => {
					const stringifiedAttributes = (
						Object.keys(attributes) as (keyof typeof attributes)[]
					)
						.map(
							// eslint-disable-next-line sonarjs/no-nested-functions
							(attributeKey) =>
								`${attributeKey}="${attributes[attributeKey]}"`,
						)
						.join(" ");

					output += `<style ${stringifiedAttributes}>${content}</style>`;

					return output;
				}, "");
			};

			return metadata;
		},
		setGlobalStyles(input) {
			insert({
				cacheInput: JSON.stringify(input),
				onCreateRule() {
					let rule = "";
					const selectors = Object.keys(input);

					for (const selector of selectors) {
						const style = input[selector];

						if (style === undefined) continue; // TODO: fix coulis side undefined value (see bienvenuemarket)

						rule +=
							typeof style === "string"
								? `${selector} ${style};`
								: `${selector}{${createDeclarationBlock(style)}}`;
					}

					return rule;
				},
				type: "global",
			});
		},
	};
};
