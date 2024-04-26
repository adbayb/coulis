import { SHORTHAND_PROPERTIES } from "./constants";
import { createCache } from "./entities/cache";
import { createStyleSheets } from "./entities/stylesheet";
import type { StyleSheetType } from "./entities/stylesheet";
import {
	isNumber,
	isObject,
	minify,
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

const styleSheets = createStyleSheets();
const cache = createCache(styleSheets);

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

export const extractStyles = () => {
	let stringifiedStyles = "";
	const styleSheetTypes = Object.keys(styleSheets) as StyleSheetType[];
	const cacheEntries = cache.entries();
	const cacheKeys = Object.keys(cacheEntries);

	const styles = styleSheetTypes.map((type) => {
		const styleSheet = styleSheets[type];
		const content = minify(styleSheet.get());

		const keys = cacheKeys
			.filter((key) => cacheEntries[key] === type)
			.join();

		const stringifiedStyle = `<style data-coulis="${keys}">${content}</style>`;

		stringifiedStyles += stringifiedStyle;

		return {
			content,
			keys,
			toString() {
				return stringifiedStyle;
			},
		};
	});

	styles.toString = () => {
		return stringifiedStyles;
	};

	return styles;
};

export const globals = (styleObject: GlobalStyleObject) =>
	process({
		key: JSON.stringify(styleObject),
		cache,
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
		styleSheet: styleSheets.global,
	});

export const keyframes = (styleObject: KeyframeStyleObject) =>
	process({
		key: JSON.stringify(styleObject),
		cache,
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
		styleSheet: styleSheets.global,
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

			const styleSheet = groupingRule
				? isShorthandProperty
					? styleSheets.conditionalShorthand
					: styleSheets.conditionalLonghand
				: isShorthandProperty
					? styleSheets.shorthand
					: styleSheets.longhand;

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
							cache,
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
							styleSheet,
						}),
					);
				}
			} else {
				if (value === undefined) continue;

				classNames.push(
					process({
						key: `${groupingRule}${property}${value}`,
						cache,
						createRules(className) {
							return [
								wrapRule(
									`.${className}{${toDeclaration(property, value)}}`,
								),
							];
						},
						styleSheet,
					}),
				);
			}
		}

		return classNames.join(" ");
	};
};
