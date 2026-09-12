import type { SetCache } from "../../core/entities/cache";
import { createMapCache, createSetCache } from "../../core/entities/cache";
import type { RecordLike } from "../../core/entities/primitive";
import { isNumeric, isObject } from "../../core/entities/primitive";
import type { StatesLike } from "../../core/entities/state";
import type { StyleType } from "../../core/entities/style";
import { STYLE_TYPES } from "../../core/entities/style";
import type { CreateCoulis } from "../../core/ports/createCoulis";
import { IS_SERVER_ENVIRONMENT } from "./constants";
import type { CompiledTemplate } from "./helpers";
import {
	createClassName,
	createCompiledTemplate,
	createCustomProperties,
	createDeclaration,
	getEvaluatedTemplate,
	isShorthandProperty,
} from "./helpers";
import { createDomStyleSheet } from "./stylesheet/dom";
import { createVirtualStyleSheet } from "./stylesheet/virtual";
import type { ClassName, Rule } from "./types";

type PropertyInfo = {
	/**
	 * Declaration memo (`raw value -> declaration`). Declarations are pure functions of (name,
	 * value) so repeated `createStyles` calls reuse them without any string building, regex or
	 * `Set` lookup.
	 */
	declarations: Map<unknown, string>;
	isCSSShorthand: boolean;
	resolverFn: ((input: never) => unknown) | undefined;
	resolverKind: PropertyResolverKind;
	resolverMap: Record<string, unknown> | undefined;
};

type PropertyResolverKind = "function" | "map" | "passthrough";

const getResolvedValue = (info: PropertyInfo, value: unknown) => {
	if (info.resolverKind === "function") {
		return (info.resolverFn as (input: unknown) => unknown)(value);
	}

	if (info.resolverKind === "map") {
		return (info.resolverMap as Record<string, unknown>)[value as string] ?? value;
	}

	return value;
};

const getStyleType = (isCSSShorthand: boolean, isAtRule: boolean): StyleType => {
	if (isAtRule) {
		return isCSSShorthand ? "atShorthand" : "atLonghand";
	}

	return isCSSShorthand ? "shorthand" : "longhand";
};

const createRecordByType = <Value>(createValue: (type: StyleType) => Value) => {
	return STYLE_TYPES.reduce(
		(output, type) => {
			output[type] = createValue(type);

			return output;
		},
		{} as Record<StyleType, Value>,
	);
};

export const createCoulis: CreateCoulis<{
	Input: {
		WithCSSVariables: true;
	};
	Output: ClassName;
}> = (contract) => {
	const createStyleSheet = IS_SERVER_ENVIRONMENT ? createVirtualStyleSheet : createDomStyleSheet;

	const styleSheetByType = createRecordByType((type) => {
		return createStyleSheet(type);
	});

	const classNameByTypeCache = createMapCache<StyleType, SetCache<ClassName>>();

	const hydratedClassNameCache = new Set(
		Object.values(styleSheetByType).flatMap((styleSheet) => {
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
	const states: StatesLike = contract.states ?? {};

	for (const [name, template] of Object.entries(states)) {
		if (!template.includes("coulis[selector]") || !template.includes("coulis[declaration]")) {
			throw new Error(
				`The \`${name}\` state must include \`coulis[selector]\` and \`coulis[declaration]\` template markers.`,
			);
		}
	}

	const compiledStateByName = Object.fromEntries(
		Object.entries(states).map(([name, template]) => {
			return [name, createCompiledTemplate(template)];
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
			let resolverKind: PropertyResolverKind = "passthrough";
			let resolverMap: PropertyInfo["resolverMap"] = undefined;

			if (typeof propertyValue === "function") {
				resolverFn = propertyValue as (input: never) => unknown;
				resolverKind = "function";
			} else if (isObject(propertyValue)) {
				resolverKind = "map";
				resolverMap = propertyValue;
			}

			info = {
				declarations: new Map(),
				isCSSShorthand: isShorthandProperty(name),
				resolverFn,
				resolverKind,
				resolverMap,
			};

			propertyInfoByName.set(name, info);
		}

		return info;
	};

	const getExpandedPropertyNames = (name: string): readonly string[] => {
		if (customShorthandNames.has(name)) {
			return shorthandRecord[name] ?? [];
		}

		return [name];
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
	const classNameByInputByType = createRecordByType(() => {
		return new Map<string, ClassName>();
	});

	const setRule = (
		type: StyleType,
		cacheInput: string,
		className: ClassName,
		rule: Rule,
	): ClassName => {
		if (!hydratedClassNameCache.has(className)) {
			let cache = classNameByTypeCache.get(type);

			if (!cache) {
				cache = createSetCache();
				classNameByTypeCache.set(type, cache);
			}

			if (!cache.has(className)) {
				cache.set(className);
				styleSheetByType[type].setRule(className, rule);
			}
		}

		classNameByInputByType[type].set(cacheInput, className);

		return className;
	};

	const getOrCreateClassName = ({
		cacheInput,
		createRule,
		type,
	}: {
		cacheInput: string;
		createRule: (input: { className: ClassName }) => Rule;
		type: StyleType;
	}): ClassName => {
		const cachedClassName = classNameByInputByType[type].get(cacheInput);

		if (cachedClassName !== undefined) {
			return cachedClassName;
		}

		const className = createClassName(cacheInput);

		return setRule(type, cacheInput, className, createRule({ className }));
	};

	const createDeclarationBlock = (input: RecordLike) => {
		let declarationBlock = "";

		for (const propertyName of Object.keys(input)) {
			const value = input[propertyName];

			if (value === undefined) {
				continue;
			}

			for (const expandedPropertyName of getExpandedPropertyNames(propertyName)) {
				declarationBlock += getDeclaration(
					expandedPropertyName,
					value,
					getPropertyInfo(expandedPropertyName),
				);
			}
		}

		return declarationBlock;
	};

	const getCachedType = (cacheInput: string) => {
		for (const type of STYLE_TYPES) {
			const className = classNameByInputByType[type].get(cacheInput);

			if (className !== undefined) {
				return { className, type };
			}
		}

		return undefined;
	};

	const getOrCreateAtomicClassName = (
		declaration: string,
		info: PropertyInfo,
		stateKey?: string,
	): ClassName => {
		if (stateKey === undefined || stateKey === "base") {
			/*
			 * The key is not included to compute the className when `key` equals to "base" as base is equivalent to an unconditional value.
			 * This exclusion will allow to recycle cache if the style value has been already defined unconditionally.
			 */
			const type: StyleType = info.isCSSShorthand ? "shorthand" : "longhand";

			return getOrCreateClassName({
				cacheInput: declaration,
				createRule({ className }) {
					return `.${className}{${declaration}}`;
				},
				type,
			});
		}

		const compiledState = compiledStateByName[stateKey];

		if (compiledState === undefined) {
			return "";
		}

		const cacheInput = `${stateKey}${declaration}`;

		if (!compiledState.needsRuntimeAtCheck) {
			return getOrCreateClassName({
				cacheInput,
				createRule({ className }) {
					return getEvaluatedTemplate(compiledState, `.${className}`, declaration);
				},
				type: getStyleType(info.isCSSShorthand, compiledState.isAtRule),
			});
		}

		/*
		 * Template starts with the declaration marker: the at-rule status depends on the
		 * declaration itself, so evaluate first, then commit to the resolved type.
		 */
		const cachedType = getCachedType(cacheInput);

		if (cachedType !== undefined) {
			return cachedType.className;
		}

		const className = createClassName(cacheInput);
		const rule = getEvaluatedTemplate(compiledState, `.${className}`, declaration);
		const resolvedType = getStyleType(info.isCSSShorthand, rule.startsWith("@"));

		return setRule(resolvedType, cacheInput, className, rule);
	};

	getOrCreateClassName({
		cacheInput: collectedCustomProperties,
		createRule() {
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
			return getOrCreateClassName({
				cacheInput: JSON.stringify(input),
				createRule({ className }) {
					let rule = "";

					for (const selector of Object.keys(input) as (keyof typeof input)[]) {
						const style = input[selector];

						if (!style) {
							continue;
						}

						const ruleSelector = isNumeric(selector) ? `${selector}%` : selector;

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

			const collectClassNames = (name: string, info: PropertyInfo, value: unknown) => {
				if (!isObject(value)) {
					classNames.push(
						getOrCreateAtomicClassName(getDeclaration(name, value, info), info),
					);

					return;
				}

				for (const stateKey of Object.keys(value)) {
					const className = getOrCreateAtomicClassName(
						getDeclaration(name, (value as RecordLike)[stateKey], info),
						info,
						stateKey,
					);

					if (className) {
						classNames.push(className);
					}
				}
			};

			for (const propertyName of Object.keys(input)) {
				const value = input[propertyName as keyof typeof input];

				for (const expandedPropertyName of getExpandedPropertyNames(propertyName)) {
					collectClassNames(
						expandedPropertyName,
						getPropertyInfo(expandedPropertyName),
						value,
					);
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
				const { getContent } = styleSheetByType[type];
				const cachedClassNames = classNameByTypeCache.get(type);
				const content = getContent();

				return {
					attributes: {
						"data-coulis-cache": (cachedClassNames?.getValues() ?? []).join(","),
						"data-coulis-type": type,
					},
					content,
				};
			});

			metadata.toString = () => {
				return metadata
					.map(({ attributes, content }) => {
						const stringifiedAttributes = (
							Object.keys(attributes) as (keyof typeof attributes)[]
						)
							.map((attributeKey) => {
								return `${attributeKey}="${attributes[attributeKey]}"`;
							})
							.join(" ");

						return `<style ${stringifiedAttributes}>${content}</style>`;
					})
					.join("");
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
			getOrCreateClassName({
				cacheInput: JSON.stringify(input),
				createRule() {
					let rule = "";

					for (const selector of Object.keys(input)) {
						const style = input[selector];

						if (style === undefined) {
							continue; // Skip unset values.
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
