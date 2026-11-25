import type { RecordLike } from "../../core/entities/primitive";
import { isObject } from "../../core/entities/primitive";
import type { StatesLike } from "../../core/entities/state";
import type { StyleType } from "../../core/entities/style";
import { resolvePropertyValue, STYLE_TYPES } from "../../core/entities/style";
import type { CreateCoulis } from "../../core/ports/create-coulis";
import { SHORTHAND_PROPERTIES, UNITLESS_PROPERTIES } from "./constants";
import type { CompiledTemplate } from "./helpers";
import {
	createClassName,
	createCompiledTemplate,
	createCustomProperties,
	getEvaluatedTemplate,
	memoize,
} from "./helpers";
import type { ClassName, Rule, StyleSheet } from "./stylesheet";
import { createStyleSheet } from "./stylesheet";

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

	const shorthands = (contract.shorthands ?? {}) as Record<string, readonly string[] | undefined>;
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

	/**
	 * Resolves a style property name to the declarations it applies: a custom shorthand applies all
	 * its properties at once (one declaration block, so one class name), any other name applies
	 * itself.
	 */
	const getStyleProperty = memoize((name: string): Property => {
		const names = Object.hasOwn(shorthands, name) ? (shorthands[name] ?? []) : [name];

		/*
		 * Per property: its definition, its CSS kebab-case name, and the unit added to numbers
		 * (none for unitless properties, as per CSS specs).
		 */
		const entries = names.map((propertyName) => {
			return [
				(properties as RecordLike)[propertyName],
				propertyName.replaceAll(/[A-Z]/gu, "-$&").toLowerCase(),
				UNITLESS_PROPERTIES.has(propertyName) ? "" : "px",
			] as const;
		});

		return {
			getDeclaration: memoize((value: unknown) => {
				let declaration = "";

				if (value === undefined) {
					return declaration; // Skip unset values.
				}

				for (const [definition, kebabName, numberUnit] of entries) {
					const resolvedValue = resolvePropertyValue(definition, value);
					const unit = typeof resolvedValue === "string" ? "" : numberUnit;

					declaration += `${kebabName}:${resolvedValue as string}${unit};`;
				}

				return declaration;
			}),
			// A block mixing CSS shorthands and longhands goes with shorthands, so it never overrides longhands set by other class names.
			isCSSShorthand: names.some((propertyName) => {
				return SHORTHAND_PROPERTIES.has(propertyName);
			}),
		};
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

		if (!declaration) {
			return "";
		}

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
			declarationBlock += getStyleProperty(name).getDeclaration(input[name]);
		}

		return declarationBlock;
	};

	if (rootDeclarations) {
		getOrCreateClassName("global", rootDeclarations, () => {
			return `:root{${rootDeclarations}}`;
		});
	}

	const globalReferenceCounts = new Map<ClassName, number>();

	const serializeStyleSheets = (usedClassNames?: Set<ClassName>) => {
		let styleElements = "";

		const styleSheets = STYLE_TYPES.map((type) => {
			const { classNames, content } = sheets[type].serialize(usedClassNames);
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

		styleSheets.toString = () => {
			return styleElements;
		};

		return styleSheets;
	};

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
				const property = getStyleProperty(name);

				for (const stateName of isObject(value) ? Object.keys(value) : ["base"]) {
					const className = getOrCreateAtomicClassName(
						property,
						isObject(value) ? value[stateName] : value,
						stateName,
					);

					if (className) {
						classNames.push(className);
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
				propertyNames: [
					...Object.keys(shorthands),
					...Object.keys(properties),
				] as ReturnType<typeof this.getContract>["propertyNames"],
			};
		},
		/**
		 * Returns the style sheets a rendered HTML needs (critical styles): the atomic rules whose
		 * class names are used in the HTML, plus every global rule and keyframes. Same output as
		 * `getStyleSheets`.
		 *
		 * @example
		 * 	const body = renderToString(<App />);
		 * 	const html = `<head>${String(getCriticalStyleSheets(body))}</head><body>${body}</body>`;
		 *
		 * @param html - The rendered HTML.
		 * @returns The style sheets.
		 */
		getCriticalStyleSheets(html) {
			/*
			 * Class attributes repeat a lot: they are deduplicated before collecting their words (class
			 * names are base-36 hashes, so words are enough to find them).
			 */
			const classAttributes = [...new Set(html.match(/class="[^"]*/gu))].join(" ");

			return serializeStyleSheets(new Set(classAttributes.match(/\w+/gu)));
		},
		/**
		 * Returns every style sheet generated so far by the instance, as an array of `{ attributes,
		 * content }` objects to render as `<style>` elements. `String()` on the result gives the
		 * `<style>` tags.
		 *
		 * Styles are cached for the instance lifetime and shared by every request on a server: use
		 * it when the rendered HTML is not available (e.g. streaming rendering). Call it after
		 * rendering to include the styles generated during the render.
		 *
		 * @example
		 * 	useServerInsertedHTML(() => {
		 * 		return <div dangerouslySetInnerHTML={{ __html: String(getStyleSheets()) }} />;
		 * 	});
		 *
		 * @returns The style sheets.
		 */
		getStyleSheets: serializeStyleSheets,
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
