import { SHORTHAND_PROPERTIES } from "./constants";
import { createScopes } from "./entities/scope";
import {
	isNumber,
	isObject,
	toDeclaration,
	toManyDeclaration,
} from "./helpers";
import type {
	AtConditionalGroupingRule,
	AtTextualRule,
	AtomicStyleObject,
	GlobalStyleObject,
	KeyframeStyleObject,
	ScopeKey,
} from "./types";

const SCOPES = createScopes();

/**
 * Create a contextual `styles` tied to a [CSSGroupingRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSGroupingRule)
 * (ie. An at-rule that contains other rules nested within it (such as @media, @supports conditional rules...)).
 * @param atRule - The styling rule instruction (such as `@media (min-width: 0px)`).
 * @param condition - The rule condition.
 * @returns The contextual `atoms` helper.
 * @example
 * 	createStyles("@media", "(min-width: 576px)")
 */
export const createStyles = (
	atRule: AtConditionalGroupingRule,
	condition: string,
) => {
	return createStylesFactory(`${atRule} ${condition}`);
};

/**
 * Define and generate a new style rule set applicable to an element via the returned class name.
 * @param styleObject - A style record containing CSS declarations to apply to a given element.
 * @returns The generated class name.
 * @example
 * 	const className = styles({ backgroundColor: "red" });
 * 	document.getElementById("my-element-id").className = className;
 */
export const styles = (styleObject: AtomicStyleObject) => {
	return createStylesFactory()(styleObject);
};

type ExtractStylesOptions = {
	/**
	 * Automatically flush the cache after the method call.
	 * @default true - To prevent memory leaks. It can be disabled if the cache needs be shared across requests.
	 */
	flush: boolean;
};

/**
 * Extract all the generated styles (including global ones) to inject it ahead of time (useful to avoid FOUC if the document is generated via server side).
 * @param options - Options to modufy extraction behaviors.
 * @returns Object containing the content, attributes and a default `toString` operator.
 * @example
 * 	const styles = extract({ flush: true });
 *  return `<head>${styles}</head>`;
 */
export const extract = (options: ExtractStylesOptions = { flush: true }) => {
	let stringifiedStyles = "";
	const scopeKeys = Object.keys(SCOPES) as ScopeKey[];

	const output = scopeKeys.map((scopeKey) => {
		const { cache, styleSheet } = SCOPES[scopeKey];
		const content = styleSheet.getContent();
		const cacheKeys = cache.toString();
		const stringifiedStyle = `<style data-coulis-cache="${cacheKeys}" data-coulis-scope="${scopeKey}">${content}</style>`;

		stringifiedStyles += stringifiedStyle;

		const scopedOutput = {
			attributes: styleSheet.getAttributes(cacheKeys),
			content,
			toString() {
				return stringifiedStyle;
			},
		};

		if (options.flush && scopeKey !== "global") {
			// Flush only local styles to preserve styles defined globally as they're not re-rendered:
			cache.flush();
			styleSheet.flush();
		}

		return scopedOutput;
	});

	output.toString = () => {
		return stringifiedStyles;
	};

	return output;
};

/**
 * Define and generate style rules set globally.
 * @param styleObject - A style record containing CSS declarations to apply to a given element.
 * @example
 * 	globalStyles({ "html": { "background-color": "red" } });
 */
export const globalStyles = (styleObject: GlobalStyleObject) => {
	SCOPES.global.commit({
		key: JSON.stringify(styleObject),
		createRules() {
			const rules: string[] = [];

			for (const selector of Object.keys(styleObject)) {
				const style = styleObject[selector as AtTextualRule];

				if (!style) continue;

				if (typeof style === "string") {
					rules.push(`${selector} ${style};`);
				} else {
					rules.push(`${selector}{${toManyDeclaration(style)}}`);
				}
			}

			return rules;
		},
	});
};

/**
 * Create an animation name by defining a `keyframes` style rule set globally.
 * @param styleObject - A style record containing CSS declarations to apply to a given element.
 * @returns The generated animation name (see `animation-name` CSS property).
 * @example
 * 	const animationName = createAnimationName({ from: { opacity: 0 }, to: { opacity: 1 } });
 * 	const className = styles({ animation: `${animationName} 2000ms linear infinite`, });
 * 	document.getElementById("my-element-id").className = className;
 */
export const createAnimationName = (styleObject: KeyframeStyleObject) => {
	return SCOPES.global.commit({
		key: JSON.stringify(styleObject),
		createRules(className) {
			let rule = "";

			const selectors = Object.keys(
				styleObject,
			) as (keyof typeof styleObject)[];

			for (const selector of selectors) {
				const style = styleObject[selector];

				if (!style) continue;

				rule += `${
					isNumber(selector) ? `${selector}%` : selector
				}{${toManyDeclaration(style)}}`;
			}

			return [`@keyframes ${className}{${rule}}`];
		},
	});
};

const createStylesFactory = (groupingRule = "") => {
	const wrapRule = (rule: string) => {
		return !groupingRule ? rule : `${groupingRule}{${rule}}`;
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	return (styleObject: AtomicStyleObject) => {
		const classNames: string[] = [];

		for (const property of Object.keys(styleObject)) {
			const value = styleObject[property];
			const isShorthandProperty = SHORTHAND_PROPERTIES[property];

			const scope = groupingRule
				? isShorthandProperty
					? SCOPES.conditionalShorthand
					: SCOPES.conditionalLonghand
				: isShorthandProperty
					? SCOPES.shorthand
					: SCOPES.longhand;

			if (value === undefined) continue;

			if (isObject(value)) {
				for (const selectorProperty of Object.keys(value)) {
					const selectorValue = value[selectorProperty];
					const isDefaultProperty = selectorProperty === "default";

					if (selectorValue === undefined) continue;

					classNames.push(
						scope.commit({
							key: `${groupingRule}${property}${selectorValue}${
								isDefaultProperty ? "" : selectorProperty
							}`,
							createRules(className) {
								return [
									wrapRule(
										`.${className}${
											isDefaultProperty
												? ""
												: selectorProperty
										}{${toDeclaration(property, selectorValue)}}`,
									),
								];
							},
						}),
					);
				}
			} else {
				classNames.push(
					scope.commit({
						key: `${groupingRule}${property}${value}`,
						createRules(className) {
							return [
								wrapRule(
									`.${className}{${toDeclaration(property, value)}}`,
								),
							];
						},
					}),
				);
			}
		}

		return classNames.join(" ");
	};
};
