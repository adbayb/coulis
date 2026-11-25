import type { RecordLike } from "../../core/entities/primitive";
import { isObject } from "../../core/entities/primitive";
import type { StatesLike } from "../../core/entities/state";
import type { StyleType } from "../../core/entities/style";
import { resolvePropertyValue, STYLE_TYPES } from "../../core/entities/style";
import type { CreateCoulis } from "../../core/ports/create-coulis";
import { SHORTHAND_PROPERTIES } from "./constants";
import type { CompiledTemplate } from "./helpers";
import {
	createClassName,
	createCompiledTemplate,
	createCustomProperties,
	createDeclaration,
	getEvaluatedTemplate,
	getKebabName,
	memoize,
} from "./helpers";
import type { StyleSheet } from "./stylesheet";
import { createStyleSheet } from "./stylesheet";
import type { ClassName, Rule } from "./types";

/**
 * Creates a web instance that generates atomic CSS rules for browser injection and server-side
 * rendering.
 *
 * @param contract - Style properties, theme, states, and shorthand definitions.
 * @returns Web styling methods for the configured contract.
 */
export const createCoulis: CreateCoulis<{
	Input: {
		WithCSSVariables: true;
	};
	Output: ClassName;
}> = (contract) => {
	const sheets = Object.fromEntries(
		STYLE_TYPES.map((type) => {
			return [type, createStyleSheet(type)];
		}),
	) as Record<StyleType, StyleSheet>;

	/**
	 * Class name by cache input, shared by all style types: cache inputs never collide across types
	 * (declarations, state-prefixed declarations, and serialized global inputs).
	 */
	const classNameByCacheInput = new Map<string, ClassName>();
	let rootDeclarations = "";

	const properties = contract.properties(
		(contract.theme &&
			createCustomProperties(contract.theme, (name, value) => {
				rootDeclarations += `${name}:${value as string};`;
			})) as Parameters<typeof contract.properties>[0],
	);

	const definitionByPropertyName = properties as RecordLike;
	const shorthands = (contract.shorthands ?? {}) as Record<string, readonly string[] | undefined>;
	const shorthandNames = Object.keys(shorthands);
	const states: StatesLike = contract.states ?? {};
	const compiledStateByName = new Map<string, CompiledTemplate>();

	for (const [name, template] of Object.entries(states)) {
		if (!template.includes("coulis[selector]") || !template.includes("coulis[declaration]")) {
			throw new Error(
				`The \`${name}\` state must include \`coulis[selector]\` and \`coulis[declaration]\` markers.`,
			);
		}

		compiledStateByName.set(name, createCompiledTemplate(template));
	}

	const getProperty = memoize((name: string): Property => {
		const kebabName = getKebabName(name);
		const definition = definitionByPropertyName[name];

		return {
			getDeclaration: memoize((value: unknown) => {
				return createDeclaration(kebabName, name, resolvePropertyValue(definition, value));
			}),
			isCSSShorthand: SHORTHAND_PROPERTIES.has(name),
		};
	});

	/**
	 * Resolves a style property name to the properties it applies: the custom shorthand expansion
	 * if any, the property itself otherwise.
	 */
	const getExpandedProperties = memoize((name: string): readonly Property[] => {
		const names = shorthandNames.includes(name) ? (shorthands[name] ?? []) : [name];

		return names.map((expandedName) => {
			return getProperty(expandedName);
		});
	});

	const getOrCreateClassName = (
		type: StyleType,
		cacheInput: string,
		createRule: (className: ClassName) => Rule,
	): ClassName => {
		let className = classNameByCacheInput.get(cacheInput);

		if (className !== undefined) {
			return className;
		}

		className = createClassName(cacheInput);
		sheets[type].setRule(className, createRule);
		classNameByCacheInput.set(cacheInput, className);

		return className;
	};

	const getOrCreateAtomicClassName = (
		property: Property,
		value: unknown,
		stateName = "base",
	): ClassName => {
		const declaration = property.getDeclaration(value);

		if (stateName === "base") {
			/*
			 * The state name is excluded from the cache input when it equals "base", as base is equivalent to an unconditional value.
			 * This exclusion allows to recycle the cache if the style value has already been defined unconditionally.
			 */
			return getOrCreateClassName(
				getStyleType(property.isCSSShorthand, false),
				declaration,
				(className) => {
					return `.${className}{${declaration}}`;
				},
			);
		}

		const compiledState = compiledStateByName.get(stateName);

		if (compiledState === undefined) {
			return "";
		}

		const cacheInput = `${stateName.length}:${stateName}${declaration}`;

		return getOrCreateClassName(
			getStyleType(property.isCSSShorthand, compiledState.isAtRule),
			cacheInput,
			(className) => {
				return getEvaluatedTemplate(compiledState, `.${className}`, declaration);
			},
		);
	};

	const createDeclarationBlock = (input: RecordLike) => {
		let declarationBlock = "";

		for (const name of Object.keys(input)) {
			const value = input[name];

			if (value === undefined) {
				continue;
			}

			for (const property of getExpandedProperties(name)) {
				declarationBlock += property.getDeclaration(value);
			}
		}

		return declarationBlock;
	};

	if (rootDeclarations) {
		getOrCreateClassName("global", rootDeclarations, () => {
			return `:root{${rootDeclarations}}`;
		});
	}

	const globalReferenceCounts = new Map<ClassName, number>();

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
			return getOrCreateClassName("global", JSON.stringify(input), (className) => {
				let rule = "";

				for (const selector of Object.keys(input) as (keyof typeof input)[]) {
					const style = input[selector];

					if (!style) {
						continue;
					}

					const ruleSelector = Number.isNaN(Number(selector)) ? selector : `${selector}%`;

					rule += `${ruleSelector}{${createDeclarationBlock(style)}}`;
				}

				return `@keyframes ${className}{${rule}}`;
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

			for (const name of Object.keys(input)) {
				const value: unknown = input[name as keyof typeof input];

				for (const property of getExpandedProperties(name)) {
					if (!isObject(value)) {
						classNames.push(getOrCreateAtomicClassName(property, value));

						continue;
					}

					for (const stateName of Object.keys(value)) {
						const className = getOrCreateAtomicClassName(
							property,
							value[stateName],
							stateName,
						);

						if (className) {
							classNames.push(className);
						}
					}
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
				propertyNames: [...shorthandNames, ...Object.keys(properties)] as ReturnType<
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
		 * Styles are cached for the instance lifetime (shared by every request on a server). Pass
		 * the rendered HTML to only keep the atomic rules whose class names are used in it (global
		 * rules and keyframes are always kept).
		 *
		 * @example
		 * 	const body = renderToString(<App />);
		 * 	const html = `<head>${String(getMetadata(body))}</head><body>${body}</body>`;
		 *
		 * @param html - The rendered HTML to extract the critical styles from.
		 * @returns Metadata object.
		 */
		getMetadata(html) {
			// Class attributes repeat a lot: deduplicating them first avoids splitting each occurrence.
			const usedClassNames =
				html === undefined
					? undefined
					: new Set(
							[...new Set(html.match(/class="[^"]*/gu))].flatMap((attribute) => {
								return attribute.slice(7).split(" ");
							}),
						);

			let styleElements = "";

			const metadata = STYLE_TYPES.map((type) => {
				const { classNames, content } = sheets[type].getMetadata(
					type === "global" ? undefined : usedClassNames,
				);

				const cache = classNames.join(",");

				styleElements += `<style data-coulis-cache="${cache}" data-coulis-type="${type}">${content}</style>`;

				return {
					attributes: {
						"data-coulis-cache": cache,
						"data-coulis-type": type,
					},
					content,
				};
			});

			metadata.toString = () => {
				return styleElements;
			};

			return metadata;
		},
		/**
		 * Injects global (non-component) CSS rules: element selectors, `@import`, `@font-face`,
		 * `@charset`, and any other top-level CSS constructs. Rules are deduplicated — calling this
		 * multiple times with the same input only injects once.
		 *
		 * Returns a function removing the rules, to call once. Calls with the same input are
		 * reference counted: the rules are removed once every caller has removed them (e.g. nested
		 * providers setting the same theme-dependent rules).
		 *
		 * @example
		 * 	const removeGlobalStyles = setGlobalStyles({
		 * 		"html,body": { margin: "none", padding: "none" },
		 * 		"@import": "url('https://fonts.googleapis.com/css?family=Open+Sans')",
		 * 	});
		 *
		 * @param input - Style properties.
		 * @returns A function removing the rules.
		 */
		setGlobalStyles(input) {
			const cacheInput = JSON.stringify(input);

			const createRule = () => {
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
			};

			const className = getOrCreateClassName("global", cacheInput, createRule);

			globalReferenceCounts.set(className, (globalReferenceCounts.get(className) ?? 0) + 1);

			return () => {
				const count = (globalReferenceCounts.get(className) ?? 1) - 1;

				globalReferenceCounts.set(className, count);

				if (count === 0) {
					classNameByCacheInput.delete(cacheInput);
					sheets.global.removeRule(className, createRule());
				}
			};
		},
	};
};

type Property = {
	/**
	 * Memoized `raw value -> declaration` builder: repeated values skip value resolution and string
	 * building entirely.
	 */
	getDeclaration: (value: unknown) => string;
	isCSSShorthand: boolean;
};

/**
 * Picks the style type from `STYLE_TYPES` order: (at-)shorthand types precede (at-)longhand ones.
 *
 * @param isCSSShorthand - Whether the property is a CSS shorthand.
 * @param isAtRule - Whether the rule is an at-rule.
 * @returns The style type.
 */
const getStyleType = (isCSSShorthand: boolean, isAtRule: boolean): StyleType => {
	return STYLE_TYPES[(isAtRule ? 3 : 1) + Number(!isCSSShorthand)] as StyleType;
};
