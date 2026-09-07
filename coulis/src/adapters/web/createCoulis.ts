import type { SetCache } from "../../core/entities/cache";
import { createMapCache, createSetCache } from "../../core/entities/cache";
import type { RecordLike } from "../../core/entities/primitive";
import { isNumber, isObject } from "../../core/entities/primitive";
import type { StyleType } from "../../core/entities/style";
import { STYLE_TYPES } from "../../core/entities/style";
import type { CreateCoulis } from "../../core/ports/createCoulis";
import { IS_SERVER_ENVIRONMENT } from "./constants";
import type { CompiledTemplate } from "./helpers";
import {
	compileTemplate,
	createClassName,
	createCustomProperties,
	createDeclaration,
	evaluateCompiledTemplate,
	isShorthandProperty,
} from "./helpers";
import { createDomStyleSheet } from "./stylesheet/dom";
import { createVirtualStyleSheet } from "./stylesheet/virtual";
import type { ClassName, Rule, StyleSheet } from "./types";

type PropertyInfo = {
	customExpansion: readonly string[] | undefined;
	/**
	 * Declaration memo (`raw value -> declaration`). Declarations are pure functions of (name,
	 * value) so repeated `createStyles` calls reuse them without any string building, regex or
	 * `Set` lookup.
	 */
	declarations: Map<unknown, string>;
	isCSSShorthand: boolean;
	isCustomShorthand: boolean;
	resolverFn: ((input: never) => unknown) | undefined;
	resolverKind: PropertyResolverKind;
	resolverMap: Record<string, unknown> | undefined;
};

type PropertyResolverKind = 0 | 1 | 2;

const getResolvedValue = (info: PropertyInfo, value: unknown) => {
	if (info.resolverKind === 1) {
		return (info.resolverFn as (input: unknown) => unknown)(value);
	}

	if (info.resolverKind === 2) {
		return (info.resolverMap as Record<string, unknown>)[value as string] ?? value;
	}

	return value;
};

const getStyleType = (isCSSShorthand: boolean, isAtRule: boolean): StyleType => {
	if (isAtRule) {
		if (isCSSShorthand) {
			return "atShorthand";
		}

		return "atLonghand";
	}

	if (isCSSShorthand) {
		return "shorthand";
	}

	return "longhand";
};

export const createCoulis: CreateCoulis<{
	Input: {
		WithCSSVariables: true;
	};
	Output: ClassName;
}> = (contract) => {
	const createStyleSheet = IS_SERVER_ENVIRONMENT ? createVirtualStyleSheet : createDomStyleSheet;

	const styleSheetByTypeAdaptee = STYLE_TYPES.reduce(
		(output, type) => {
			output[type] = createStyleSheet(type);

			return output;
		},
		{} as Record<StyleType, StyleSheet>,
	);

	const classNameByTypeCache = createMapCache<StyleType, SetCache<ClassName>>();

	const hydratedClassNameCache = new Set(
		Object.values(styleSheetByTypeAdaptee).flatMap((styleSheet) => {
			return styleSheet.getHydratedClassNames();
		}),
	);

	const shorthands = (contract.shorthands ?? {}) as NonNullable<typeof contract.shorthands>;
	const shorthandNameList = Object.keys(shorthands);
	const customShorthandNames = new Set(shorthandNameList);
	let collectedCustomProperties = "";

	const properties = contract.properties(
		(contract.theme &&
			createCustomProperties(contract.theme, (name, value) => {
				collectedCustomProperties += `${name}:${String(value)};`;
			})) as Parameters<typeof contract.properties>[0],
	);

	const propertyRecord = properties as Record<string, unknown>;
	const shorthandRecord = shorthands as Record<string, readonly string[] | undefined>;

	if (contract.states) {
		for (const [name, template] of Object.entries(contract.states)) {
			if (
				!template.includes("coulis[selector]") ||
				!template.includes("coulis[declaration]")
			) {
				throw new Error(
					`The \`${name}\` state must include \`coulis[selector]\` and \`coulis[declaration]\` template markers.`,
				);
			}
		}
	}

	const compiledStateByName = Object.fromEntries(
		Object.entries(contract.states ?? {}).map(([name, template]) => {
			return [name, compileTemplate(template as string)];
		}),
	) as Record<string, CompiledTemplate>;

	/**
	 * Static per-property metadata, computed once per property name. Resolvers mirror the contract
	 * `properties` definition: function values are invoked, plain-object values act as lookup maps,
	 * anything else (including arrays) passes the value through as-is.
	 */
	const propertyInfoByName = new Map<string, PropertyInfo>();

	const getPropertyInfo = (name: string): PropertyInfo => {
		let info = propertyInfoByName.get(name);

		if (info === undefined) {
			const propertyValue = propertyRecord[name];
			let resolverFn: PropertyInfo["resolverFn"] = undefined;
			let resolverKind: PropertyResolverKind = 0;
			let resolverMap: PropertyInfo["resolverMap"] = undefined;

			if (typeof propertyValue === "function") {
				resolverFn = propertyValue as (input: never) => unknown;
				resolverKind = 1;
			} else if (isObject(propertyValue)) {
				resolverKind = 2;
				resolverMap = propertyValue;
			}

			info = {
				customExpansion: shorthandRecord[name],
				declarations: new Map(),
				isCSSShorthand: isShorthandProperty(name),
				isCustomShorthand: customShorthandNames.has(name),
				resolverFn,
				resolverKind,
				resolverMap,
			};

			propertyInfoByName.set(name, info);
		}

		return info;
	};

	const getDeclaration = (name: string, value: unknown, info: PropertyInfo) => {
		const { declarations } = info;
		let declaration = declarations.get(value);

		if (declaration === undefined) {
			declaration = createDeclaration({
				name,
				value: getResolvedValue(info, value),
			});

			declarations.set(value, declaration);
		}

		return declaration;
	};

	/**
	 * Fast class-name memo per style type: `cacheInput -> className`. Lets repeated `createStyles`
	 * calls skip hashing and stylesheet lookups entirely on cache hits.
	 */
	const classNameByInputByType = STYLE_TYPES.reduce(
		(output, type) => {
			output[type] = new Map<string, ClassName>();

			return output;
		},
		{} as Record<StyleType, Map<string, ClassName>>,
	);

	const commitRule = (
		type: StyleType,
		fastCache: Map<string, ClassName>,
		input: string,
		className: ClassName,
		rule: Rule,
	): ClassName => {
		if (hydratedClassNameCache.has(className)) {
			fastCache.set(input, className);

			return className;
		}

		let cache = classNameByTypeCache.get(type);

		if (!cache) {
			cache = createSetCache();
			classNameByTypeCache.add(type, cache);
		}

		if (cache.has(className)) {
			fastCache.set(input, className);

			return className;
		}

		cache.add(className);
		styleSheetByTypeAdaptee[type].insert(className, rule);
		fastCache.set(input, className);

		return className;
	};

	const createDeclarationBlock = (input: RecordLike) => {
		let declarationBlock = "";

		for (const propertyName of Object.keys(input)) {
			const value = input[propertyName];

			if (value === undefined) {
				continue;
			}

			if (customShorthandNames.has(propertyName)) {
				const shorthandedPropertyNames = shorthandRecord[propertyName];

				if (shorthandedPropertyNames === undefined) {
					continue;
				}

				for (const shorthandedPropertyName of shorthandedPropertyNames) {
					declarationBlock += getDeclaration(
						shorthandedPropertyName,
						value,
						getPropertyInfo(shorthandedPropertyName),
					);
				}
			} else {
				declarationBlock += getDeclaration(
					propertyName,
					value,
					getPropertyInfo(propertyName),
				);
			}
		}

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
		const fastCache = classNameByInputByType[type];
		const fastHit = fastCache.get(cacheInput);

		if (fastHit !== undefined) {
			return fastHit;
		}

		const className = createClassName(cacheInput);

		return commitRule(type, fastCache, cacheInput, className, onCreateRule({ className }));
	};

	insert({
		cacheInput: collectedCustomProperties,
		onCreateRule() {
			return `:root{${collectedCustomProperties}}`;
		},
		type: "global",
	});

	return {
		/**
		 * Creates a CSS `@keyframes` animation rule from a map of keyframe selectors (e.g.
		 * `"from"`, `"to"`, `"50%"`, or a plain number interpreted as a percentage) to style
		 * objects. Returns the generated animation name, which can be passed directly to an
		 * `animation` or `animationName` property.
		 *
		 * @example
		 * 	const spin = createKeyframes({
		 * 		from: { transform: "rotate(0deg)" },
		 * 		to: { transform: "rotate(360deg)" },
		 * 	});
		 * 	createStyles({ animation: `${spin} 1s linear infinite` });
		 *
		 * @param input - Style properties.
		 * @returns Animation name.
		 */
		createKeyframes(input) {
			return insert({
				cacheInput: JSON.stringify(input),
				onCreateRule({ className }) {
					let rule = "";
					const selectors = Object.keys(input) as (keyof typeof input)[];

					for (const selector of selectors) {
						const style = input[selector];

						if (!style) {
							continue;
						}

						const ruleSelector = isNumber(selector) ? `${selector}%` : selector;

						rule += `${ruleSelector}{${createDeclarationBlock(style)}}`;
					}

					return `@keyframes ${className}{${rule}}`;
				},
				type: "global",
			});
		},
		/**
		 * Generates atomic CSS class names for a given style object. Each property/value pair
		 * produces its own class name and CSS rule. Identical inputs always return the same
		 * space-separated class name string (cached). State variants (e.g. `{ base: "red", hover:
		 * "blue" }`) are supported when `states` is configured in the contract.
		 *
		 * @example
		 * 	const className = createStyles({ color: "neutralDark", display: "flex" });
		 *
		 * @param input - Style properties.
		 * @returns Class name.
		 */
		createStyles(input) {
			const classNames: ClassName[] = [];

			const collectBaseClassName = (declaration: string, info: PropertyInfo) => {
				const type: StyleType = info.isCSSShorthand ? "shorthand" : "longhand";
				const fastCache = classNameByInputByType[type];
				let className = fastCache.get(declaration);

				if (className === undefined) {
					const freshClassName = createClassName(declaration);

					className = commitRule(
						type,
						fastCache,
						declaration,
						freshClassName,
						`.${freshClassName}{${declaration}}`,
					);
				}

				classNames.push(className);
			};

			const collectStateClassName = (
				declaration: string,
				info: PropertyInfo,
				stateKey: string,
			) => {
				const isBaseState = stateKey === "base";

				if (isBaseState) {
					/*
					 * The key is not included to compute the className when `key` equals to "base" as base is equivalent to an unconditional value.
					 * This exclusion will allow to recycle cache if the style value has been already defined unconditionally.
					 */
					collectBaseClassName(declaration, info);

					return;
				}

				const compiledState = compiledStateByName[stateKey];

				if (compiledState === undefined) {
					return;
				}

				const cacheInput = `${stateKey}${declaration}`;

				const isAtRule = compiledState.needsRuntimeAtCheck
					? undefined
					: compiledState.isAtRule;

				const type =
					isAtRule === undefined
						? getStyleType(info.isCSSShorthand, false)
						: getStyleType(info.isCSSShorthand, isAtRule);

				const fastCache = classNameByInputByType[type];
				let className = fastCache.get(cacheInput);

				if (className === undefined) {
					const freshClassName = createClassName(cacheInput);

					const rule = evaluateCompiledTemplate(
						compiledState,
						`.${freshClassName}`,
						declaration,
					);

					const resolvedType =
						isAtRule === undefined
							? getStyleType(info.isCSSShorthand, rule.codePointAt(0) === 64) // `@`
							: type;

					className =
						resolvedType === type
							? commitRule(type, fastCache, cacheInput, freshClassName, rule)
							: insert({
									cacheInput,
									onCreateRule() {
										return rule;
									},
									type: resolvedType,
								});
				}

				classNames.push(className);
			};

			const collectClassNames = (name: string, info: PropertyInfo, value: unknown) => {
				if (!isObject(value)) {
					collectBaseClassName(getDeclaration(name, value, info), info);

					return;
				}

				for (const stateKey of Object.keys(value)) {
					collectStateClassName(
						getDeclaration(name, (value as RecordLike)[stateKey], info),
						info,
						stateKey,
					);
				}
			};

			for (const propertyName of Object.keys(input)) {
				const value = input[propertyName as keyof typeof input];
				const info = getPropertyInfo(propertyName);

				if (info.isCustomShorthand) {
					const shorthandedPropertyNames = info.customExpansion;

					if (shorthandedPropertyNames === undefined) {
						continue;
					}

					for (const shorthandedPropertyName of shorthandedPropertyNames) {
						collectClassNames(
							shorthandedPropertyName,
							getPropertyInfo(shorthandedPropertyName),
							value,
						);
					}
				} else {
					collectClassNames(propertyName, info, value);
				}
			}

			return classNames.join(" ");
		},
		/**
		 * Returns the list of all property names (including shorthands) accepted by `createStyles`
		 * and `setGlobalStyles`. Useful for runtime introspection or building tooling on top of a
		 * coulis instance.
		 *
		 * @example
		 * 	const contract = getContract();
		 *
		 * @returns The list of all property names.
		 */
		getContract() {
			return {
				propertyNames: [...shorthandNameList, ...Object.keys(properties)] as ReturnType<
					typeof this.getContract
				>["propertyNames"],
			};
		},
		/**
		 * Returns the collected style sheets as an array of metadata objects, each containing the
		 * `content` (CSS text) and `attributes` to set on the `<style>` element. Calling
		 * `.toString()` on the result produces a ready-to- inject HTML string of `<style>` tags.
		 *
		 * Call this **After** rendering your component tree (e.g. After `renderToString`) to
		 * collect all styles generated during that render.
		 *
		 * @example
		 * 	const html = `<head>${String(getMetadata())}</head><body>${body}</body>`;
		 *
		 * @returns Metadata object.
		 */
		getMetadata() {
			const metadata = STYLE_TYPES.map((type) => {
				const { getContent } = styleSheetByTypeAdaptee[type];
				const cachedClassNames = classNameByTypeCache.get(type);
				const content = getContent();

				return {
					attributes: {
						"data-coulis-cache": [...(cachedClassNames?.getAll() ?? [])].join(","),
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
						.map((attributeKey) => {
							return `${attributeKey}="${attributes[attributeKey]}"`;
						})
						.join(" ");

					output += `<style ${stringifiedAttributes}>${content}</style>`;

					return output;
				}, "");
			};

			return metadata;
		},
		/**
		 * Injects global (non-component) CSS rules: element selectors, `@import`, `@font-face`,
		 * `@charset`, and any other top-level CSS constructs. Rules are deduplicated — calling this
		 * multiple times with the same input only injects once.
		 *
		 * @example
		 * 	setGlobalStyles({
		 * 		"html,body": { margin: "none", padding: "none" },
		 * 		"@import": "url('https://fonts.googleapis.com/css?family=Open+Sans')",
		 * 	});
		 *
		 * @param input - Style properties.
		 */
		setGlobalStyles(input) {
			insert({
				cacheInput: JSON.stringify(input),
				onCreateRule() {
					let rule = "";
					const selectors = Object.keys(input);

					for (const selector of selectors) {
						const style = input[selector];

						if (style === undefined) {
							continue; // TODO: fix coulis side undefined value (see bienvenuemarket)
						}

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
