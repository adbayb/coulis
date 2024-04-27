import { SHORTHAND_PROPERTIES } from "./constants";
import { createScopes } from "./entities/scope";
import {
	isNumber,
	isObject,
	process,
	toDeclaration,
	toManyDeclaration,
} from "./helpers";
import type {
	AtConditionalGroupingRule,
	AtTextualRule,
	AtomicStyleObject,
	GlobalStyleObject,
	KeyframeStyleObject,
} from "./types";

const scopes = createScopes();

/**
 * Create a contextual `atoms` tied to a [CSSGroupingRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSGroupingRule)
 * (ie. An at-rule that contains other rules nested within it (such as @media, @supports conditional rules...)).
 * @param atRule - The styling rule instruction (such as `@media (min-width: 0px)`).
 * @param condition - The rule condition.
 * @returns The contextual `atoms` helper.
 * @example
 * 	createAtoms("@media", "(min-width: 576px)")
 */
export const createAtoms = (
	atRule: AtConditionalGroupingRule,
	condition: string,
) => {
	return createAtomsFactory(`${atRule} ${condition}`);
};

export const atoms = (styleObject: AtomicStyleObject) => {
	return createAtomsFactory()(styleObject);
};

type ExtractStylesOptions = {
	/**
	 * Automatically flush the cache after the method call.
	 * @default true - To prevent memory leaks. It can be disable if the cache should be shared across requests.
	 */
	flush: boolean;
};

/**
 * Extract the styles to inject it ahead of time (for server-side rendering/static site generation).
 * @param options - Options to modufy extraction behaviors.
 * @returns Object containing the content, attributes and a default `toString` operator.
 * @example
 * 	const styles = extractStyles({ flush: true });
 *  return `<head>${styles}</head>`;
 */
export const extractStyles = (
	options: ExtractStylesOptions = { flush: true },
) => {
	let stringifiedStyles = "";
	const scopeKeys = Object.keys(scopes) as (keyof typeof scopes)[];

	const styles = scopeKeys.map((scopeKey) => {
		const { cache, styleSheet } = scopes[scopeKey];
		const content = styleSheet.getContent();
		const cacheKeys = cache.toString();
		const stringifiedStyle = `<style data-coulis-cache="${cacheKeys}" data-coulis-scope="${scopeKey}">${content}</style>`;

		stringifiedStyles += stringifiedStyle;

		const output = {
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

		return output;
	});

	styles.toString = () => {
		return stringifiedStyles;
	};

	return styles;
};

export const globals = (styleObject: GlobalStyleObject) =>
	process({
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
		scope: scopes.global,
	});

export const keyframes = (styleObject: KeyframeStyleObject) =>
	process({
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
		scope: scopes.global,
	});

const createAtomsFactory = (groupingRule = "") => {
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
					? scopes.conditionalShorthand
					: scopes.conditionalLonghand
				: isShorthandProperty
					? scopes.shorthand
					: scopes.longhand;

			if (isObject(value)) {
				for (const selectorProperty of Object.keys(value)) {
					const selectorValue = value[selectorProperty];
					const isDefaultProperty = selectorProperty === "default";

					if (selectorValue === undefined) continue;

					classNames.push(
						process({
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
							scope,
						}),
					);
				}
			} else {
				if (value === undefined) continue;

				classNames.push(
					process({
						key: `${groupingRule}${property}${value}`,
						createRules(className) {
							return [
								wrapRule(
									`.${className}{${toDeclaration(property, value)}}`,
								),
							];
						},
						scope,
					}),
				);
			}
		}

		return classNames.join(" ");
	};
};
