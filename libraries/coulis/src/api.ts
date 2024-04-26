import { NO_CLASSNAME, SHORTHAND_PROPERTIES } from "./constants";
import { createCache } from "./entities/cache";
import { process } from "./entities/processor";
import { createStyleSheetCollection } from "./entities/stylesheet";
import type { StyleSheetType } from "./entities/stylesheet";
import {
	isNumber,
	isObject,
	minify,
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

const styleSheetCollection = createStyleSheetCollection();
const cache = createCache(styleSheetCollection);

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

	const styleSheetTypes = Object.keys(
		styleSheetCollection,
	) as StyleSheetType[];

	const cacheEntries = cache.entries();
	const cacheKeys = Object.keys(cacheEntries);

	const styles = styleSheetTypes.map((type) => {
		const styleSheet = styleSheetCollection[type];
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
		strategy() {
			let ruleSet = "";

			for (const selector of Object.keys(styleObject)) {
				const style = styleObject[selector as AtTextualRule];

				if (!style) continue;

				if (typeof style === "string") {
					ruleSet += `${selector} ${style};`;
				} else {
					ruleSet += `${selector}{${toManyDeclaration(style)}}`;
				}
			}

			return ruleSet;
		},
		styleSheet: styleSheetCollection.global,
	});

export const keyframes = (styleObject: KeyframeStyleObject) =>
	process({
		key: JSON.stringify(styleObject),
		cache,
		strategy({ className }) {
			let ruleSet = "";

			const selectors = Object.keys(
				styleObject,
			) as (keyof typeof styleObject)[];

			for (const selector of selectors) {
				const style = styleObject[selector];

				if (!style) continue;

				ruleSet += `${
					isNumber(selector) ? `${selector}%` : selector
				}{${toManyDeclaration(style)}}`;
			}

			return `@keyframes ${className}{${ruleSet}}`;
		},
		styleSheet: styleSheetCollection.global,
	});

const createAtomsFactory = (groupingRule = "") => {
	const wrapRuleSet = (ruleSet: string) => {
		return !groupingRule ? ruleSet : `${groupingRule}{${ruleSet}}`;
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	return (styleObject: AtomicStyleObject) => {
		let classNames = "";

		for (const property of Object.keys(styleObject)) {
			const value = styleObject[property];
			const isShorthandProperty = SHORTHAND_PROPERTIES[property];

			const styleSheet = groupingRule
				? isShorthandProperty
					? styleSheetCollection.conditionalShorthand
					: styleSheetCollection.conditionalLonghand
				: isShorthandProperty
					? styleSheetCollection.shorthand
					: styleSheetCollection.longhand;

			if (isObject(value)) {
				for (const selectorProperty of Object.keys(value)) {
					const selectorValue = value[selectorProperty];
					const isDefaultProperty = selectorProperty === "default";

					const className = process({
						key: `${groupingRule}${property}${selectorValue}${
							isDefaultProperty ? "" : selectorProperty
						}`,
						cache,
						strategy(params) {
							if (selectorValue === undefined)
								return NO_CLASSNAME;

							return wrapRuleSet(
								`.${params.className}${
									isDefaultProperty ? "" : selectorProperty
								}{${toDeclaration(property, selectorValue)}}`,
							);
						},
						styleSheet,
					});

					if (className !== NO_CLASSNAME) {
						classNames = `${classNames} ${className}`;
					}
				}
			} else {
				const className = process({
					key: `${groupingRule}${property}${value}`,
					cache,
					strategy(params) {
						if (value === undefined) return NO_CLASSNAME;

						return wrapRuleSet(
							`.${params.className}{${toDeclaration(property, value)}}`,
						);
					},
					styleSheet,
				});

				if (className !== NO_CLASSNAME) {
					classNames = `${classNames} ${className}`;
				}
			}
		}

		return classNames.trim();
	};
};
