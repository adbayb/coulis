/* eslint-disable sonarjs/no-invariant-returns, sonarjs/max-lines-per-function */
import type {
	Adapter,
	CreateAdapter,
	CustomProperties,
	CustomProperty,
	WithNewLeafNodes,
} from "../../core/ports/adapter";
import { STYLE_TYPES } from "../../core/entities/style";
import type { StyleProperties, StyleType } from "../../core/entities/style";
import type { RecordLike } from "../../core/entities/primitive";
import type { ClassName, Rule, StyleSheet } from "./types";
import { createVirtualStyleSheet } from "./stylesheet/virtual";
import { createDomStyleSheet } from "./stylesheet/dom";
import {
	compose,
	createClassName,
	createDeclaration,
	createDeclarations,
	createError,
	escape,
	isNumber,
	isObject,
	isShorthandProperty,
} from "./helpers";

// eslint-disable-next-line unicorn/prefer-global-this
export const IS_SERVER_ENVIRONMENT = typeof window === "undefined";

export const createId = (input: RecordLike) => {
	return createClassName(JSON.stringify(input));
};

export const createWebAdapter: CreateAdapter<ClassName> = () => {
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

	const classNameByTypeCache = new Map<StyleType, Set<ClassName>>();

	const hydratedClassNameCache = new Set(
		Object.values(styleSheetByTypeAdaptee).flatMap((styleSheet) =>
			styleSheet.getHydratedClassNames(),
		),
	);

	const getMetadata: Adapter<ClassName>["getMetadata"] = () => {
		return STYLE_TYPES.map((type) => {
			const { getContent } = styleSheetByTypeAdaptee[type];
			const content = getContent();

			/*
			 * TODO: To prevent [cross-request state pollution](https://vuejs.org/guide/scaling-up/ssr.html#cross-request-state-pollution), flush styles generated dynamically while preserving, via the `globalCacheKeys` input, the ones shared/defined globally (at file/module scope):
			 * remove(globalCacheKeys);
			 */

			return {
				attributes: {
					"data-coulis-cache": [
						...(classNameByTypeCache.get(type)?.values() ?? []),
					].join(","),
					"data-coulis-type": type,
				},
				content,
			};
		});
	};

	const insert = ({
		id,
		rule,
		type,
	}: {
		id: ClassName;
		rule: Rule;
		type: StyleType;
	}) => {
		let cache = classNameByTypeCache.get(type);

		if (!cache) {
			cache = new Set();
			classNameByTypeCache.set(type, cache);
		}

		if (cache.has(id)) return;

		styleSheetByTypeAdaptee[type].insert(id, rule);
		cache.add(id);
	};

	return {
		createCustomProperties(input) {
			const { collectedProperties, nodes } =
				createCustomPropertiesRecursively(input);

			const id = createId(input);

			if (hydratedClassNameCache.has(id)) return nodes;

			const variables = collectedProperties.reduce(
				(output, property) =>
					`${output}--${property.name}:${property.value};`,
				"",
			);

			insert({
				id,
				rule: `:root{${variables}}`,
				type: "global",
			});

			return nodes;
		},
		createKeyframes(input) {
			const id = createId(input);

			if (hydratedClassNameCache.has(id)) return id;

			let rule = "";
			const selectors = Object.keys(input) as (keyof typeof input)[];

			for (const selector of selectors) {
				const style = input[selector];

				if (!style) continue;

				const ruleSelector = isNumber(selector)
					? `${selector}%`
					: String(selector);

				rule += `${ruleSelector}{${createDeclarations(style)}}`;
			}

			insert({
				id,
				rule: `@keyframes ${id}{${rule}}`,
				type: "global",
			});

			return id;
		},
		createStyles(properties, options) {
			type ShorthandProperties = NonNullable<
				typeof options
			>["shorthands"];

			const shorthands = options?.shorthands ?? {};
			const states = options?.states ?? {};
			const configuredShorthandNames = Object.keys(shorthands);

			const isShorthandKey = (
				key: string,
			): key is Extract<keyof ShorthandProperties, string> => {
				return configuredShorthandNames.includes(key);
			};

			const getDeclaration = ({
				name,
				value,
			}: {
				name: keyof StyleProperties;
				value: number | string | undefined;
			}) => {
				if (value === undefined) return;

				const propertyConfig = properties[name];

				if (!propertyConfig) {
					throw new Error(
						createError({
							api: "styles",
							cause: `No configuration found for property \`${name}\``,
							solution:
								"Review the corresponding `createStyles` factory to include the needed property configuration",
						}),
					);
				}

				const mappedValue =
					typeof propertyConfig === "function"
						? propertyConfig(value)
						: isObject(propertyConfig)
							? propertyConfig[value]
							: value;

				return createDeclaration({
					name,
					value: mappedValue ?? value,
				});
			};

			const createClassNames = (
				name: keyof StyleProperties,
				value:
					| Record<string, number | string | undefined>
					| number
					| string
					| undefined,
				// eslint-disable-next-line sonarjs/cognitive-complexity, sonarjs/cyclomatic-complexity
			) => {
				const classNames: string[] = [];
				const isNativeShorthandProperty = isShorthandProperty(name);

				let type: StyleType = isNativeShorthandProperty
					? "shorthand"
					: "longhand";

				if (!isObject(value)) {
					const declaration = getDeclaration({
						name,
						value,
					});

					if (!declaration) return classNames;

					const className = createClassName(declaration);

					classNames.push(className);

					if (hydratedClassNameCache.has(className))
						return classNames;

					insert({
						id: className,
						rule: `.${className}{${declaration}}`,
						type,
					});

					return classNames;
				}

				const keys = Object.keys(value);

				for (const key of keys) {
					const inputValue = value[key];

					const declaration = getDeclaration({
						name,
						value: inputValue,
					});

					if (!declaration) continue;

					const isBaseState = key === "base";

					const stateBuilder = isBaseState
						? () => `.{{className}}{${declaration}}`
						: states[key];

					if (typeof stateBuilder !== "function") {
						throw new TypeError(
							createError({
								api: "styles",
								cause: `No configuration found for state \`${key}\``,
								solution:
									"Review the corresponding `createStyles` factory to include the needed `states` configuration",
							}),
						);
					}

					const preComputedRule = stateBuilder({
						className: ".{{className}}",
						declaration,
					});

					if (preComputedRule.startsWith("@")) {
						type = isNativeShorthandProperty
							? "atShorthand"
							: "atLonghand";
					}

					/*
					 * The key is not included to compute the className when `key` equals to "base" as base is equivalent to an unconditional value.
					 * This exclusion will allow to recycle cache if the style value has been already defined unconditionally.
					 */
					const className = createClassName(
						isBaseState ? declaration : `${key}${declaration}`,
					);

					classNames.push(className);

					if (hydratedClassNameCache.has(className)) continue;

					insert({
						id: className,
						rule: preComputedRule.replace(
							"{{className}}",
							className,
						),
						type,
					});
				}

				return classNames;
			};

			return (input) => {
				const classNames: string[] = [];

				for (const propertyName of Object.keys(input)) {
					const value = (
						input as Record<
							string,
							Parameters<typeof createClassNames>[1]
						>
					)[propertyName];

					if (isShorthandKey(propertyName)) {
						const shorthandConfig = shorthands[
							propertyName
						] as (keyof StyleProperties)[];

						for (const shorthandName of shorthandConfig) {
							classNames.push(
								...createClassNames(shorthandName, value),
							);
						}
					} else {
						classNames.push(
							...createClassNames(
								propertyName as keyof StyleProperties,
								value,
							),
						);
					}
				}

				return classNames.join(" ");
			};
		},
		createVariants(styles, variants) {
			return (selectedValueByVariant) => {
				const classNames: ClassName[] = [];
				const variantKeys = Object.keys(selectedValueByVariant);

				for (const variant of variantKeys) {
					const selectedVariant = selectedValueByVariant[variant];
					const propertiesByVariant = variants[variant];

					const variantProperties =
						propertiesByVariant?.[selectedVariant as string];

					if (variantProperties === undefined) continue;

					classNames.push(styles(variantProperties));
				}

				return compose(...classNames);
			};
		},
		getMetadata,
		getMetadataAsString() {
			return getMetadata().reduce((output, { attributes, content }) => {
				const stringifiedAttributes = (
					Object.keys(attributes) as (keyof typeof attributes)[]
				)
					.map(
						(attributeKey) =>
							`${attributeKey}="${attributes[attributeKey]}"`,
					)
					.join(" ");

				output += `<style ${stringifiedAttributes}>${content}</style>`;

				return output;
			}, "");
		},
		setGlobalStyles(input) {
			const id = createId(input);

			if (hydratedClassNameCache.has(id)) return;

			let rule = "";
			const selectors = Object.keys(input);

			for (const selector of selectors) {
				const style = input[selector];

				if (style === undefined) continue;

				rule +=
					typeof style === "string"
						? `${selector} ${style};`
						: `${selector}{${createDeclarations(style)}}`;
			}

			insert({
				id,
				rule,
				type: "global",
			});
		},
	};
};

const createCustomPropertiesRecursively = <const P extends CustomProperties>(
	properties: P,
	propertyNameParts: CustomProperty["name"][] = [],
	collectedProperties: CustomProperty[] = [],
) => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const nodes = {} as WithNewLeafNodes<P, CustomProperty["value"]>;
	const tokenNames = Object.keys(properties) as (keyof P)[];

	for (const tokenName of tokenNames) {
		const value = properties[tokenName];

		propertyNameParts.push(tokenName as string);

		if (isObject(value)) {
			const output = createCustomPropertiesRecursively(
				value,
				propertyNameParts,
				collectedProperties,
			);

			propertyNameParts = [];
			nodes[tokenName] = output.nodes as (typeof nodes)[keyof P];
		} else {
			const property: CustomProperty = {
				name: escape(propertyNameParts.join("-")),
				value: value as string,
			};

			nodes[tokenName] =
				`var(--${property.name})` as (typeof nodes)[keyof P];
			collectedProperties.push(property);
			propertyNameParts.pop();
		}
	}

	return { collectedProperties, nodes };
};
