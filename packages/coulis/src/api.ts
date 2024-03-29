import { NO_CLASSNAME, SHORTHAND_PROPERTIES } from "./constants";
import {
	isNumber,
	isObject,
	minify,
	toDeclaration,
	toManyDeclaration,
} from "./helpers";
import {
	StyleSheetType,
	createStyleSheetCollection,
} from "./entities/stylesheet";
import { createCache } from "./entities/cache";
import { process } from "./entities/processor";
import {
	AtConditionalGroupingRule,
	AtTextualRule,
	AtomicStyleObject,
	GlobalStyleObject,
	KeyframeStyleObject,
} from "./types";

const styleSheetColection = createStyleSheetCollection();
const cache = createCache(styleSheetColection);

/**
 * Create a contextual `atoms` tied to a [CSSGroupingRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSGroupingRule)
 * (ie. an at-rule that contains other rules nested within it (such as @media, @supports conditional rules...))
 * @param groupRule The styling rule instruction (such as `@media (min-width: 0px)`)
 * @returns The contextual `atoms` helper
 */
export const createAtoms = (
	atRule: AtConditionalGroupingRule,
	condition: string
) => {
	return createAtomsFactory(`${atRule} ${condition}`);
};

export const atoms = (styleObject: AtomicStyleObject) => {
	return createAtomsFactory()(styleObject);
};

export const extractStyles = () => {
	let stringifiedStyles = "";
	const styleSheetTypes = Object.keys(
		styleSheetColection
	) as Array<StyleSheetType>;
	const cacheEntries = cache.entries();
	const cacheKeys = Object.keys(cacheEntries);
	const styles = styleSheetTypes.map((type) => {
		const styleSheet = styleSheetColection[type];
		const content = minify(styleSheet.get());
		const keys = cacheKeys
			.filter((key) => cacheEntries[key] === type)
			.join();
		const stringifiedStyle = `<style data-coulis="${keys}">${content}</style>`;

		stringifiedStyles += stringifiedStyle;

		return {
			keys,
			content,
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
		cache,
		key: JSON.stringify(styleObject),
		styleSheet: styleSheetColection.global,
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
	});

export const keyframes = (styleObject: KeyframeStyleObject) =>
	process({
		cache,
		key: JSON.stringify(styleObject),
		styleSheet: styleSheetColection.global,
		strategy({ className }) {
			let ruleSet = "";
			const selectors = Object.keys(styleObject) as Array<
				keyof typeof styleObject
			>;

			for (const selector of selectors) {
				const style = styleObject[selector];

				if (!style) continue;

				ruleSet += `${
					isNumber(selector) ? `${selector}%` : selector
				}{${toManyDeclaration(style)}}`;
			}

			return `@keyframes ${className}{${ruleSet}}`;
		},
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
					? styleSheetColection.conditionalShorthand
					: styleSheetColection.conditionalLonghand
				: isShorthandProperty
				? styleSheetColection.shorthand
				: styleSheetColection.longhand;

			if (isObject(value)) {
				for (const selectorProperty of Object.keys(value)) {
					const selectorValue = value[selectorProperty];
					const isDefaultProperty = selectorProperty === "default";
					const className = process({
						cache,
						key: `${groupingRule}${property}${selectorValue}${
							isDefaultProperty ? "" : selectorProperty
						}`,
						styleSheet,
						strategy({ className }) {
							if (selectorValue === undefined)
								return NO_CLASSNAME;

							return wrapRuleSet(
								`.${className}${
									isDefaultProperty ? "" : selectorProperty
								}{${toDeclaration(property, selectorValue)}}`
							);
						},
					});

					if (className !== NO_CLASSNAME) {
						classNames = `${classNames} ${className}`;
					}
				}
			} else {
				const className = process({
					cache,
					key: `${groupingRule}${property}${value}`,
					styleSheet,
					strategy({ className }) {
						if (value === undefined) return NO_CLASSNAME;

						return wrapRuleSet(
							`.${className}{${toDeclaration(property, value)}}`
						);
					},
				});

				if (className !== NO_CLASSNAME) {
					classNames = `${classNames} ${className}`;
				}
			}
		}

		return classNames.trim();
	};
};
