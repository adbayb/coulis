import { NO_CLASSNAME, SHORTHAND_PROPERTIES } from "./constants";
import { isNumber, isObject, minify, toDeclaration } from "./helpers";
import { StyleSheetType, createStyleSheet } from "./entities/stylesheet";
import { createCache } from "./entities/cache";
import { process } from "./entities/processor";
import {
	AtConditionalGroupingRule,
	AtTextualRule,
	AtomicStyleObject,
	GlobalStyleObject,
	KeyframeStyleObject,
} from "./types";

const styleSheet = createStyleSheet();
const cache = createCache(styleSheet);

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
	const styleSheetTypes = Object.keys(styleSheet) as StyleSheetType[];
	const cacheEntries = cache.entries();
	const cacheKeys = Object.keys(cacheEntries);

	return styleSheetTypes.map((type) => {
		const style = styleSheet[type];
		const cssValue = minify(style.get());
		const keys = cacheKeys.filter((key) => cacheEntries[key] === type);

		return {
			keys,
			content: cssValue,
			type,
			toString() {
				return `<style data-type="${type}" data-keys="${keys.join(
					","
				)}" data-coulis>${cssValue}</style>`;
			},
		};
	});
};

export const globals = (styleObject: GlobalStyleObject) =>
	process({
		cache,
		key: JSON.stringify(styleObject),
		styleSheet: styleSheet.global,
		strategy() {
			let ruleSet = "";

			for (const selector of Object.keys(styleObject)) {
				const style = styleObject[selector as AtTextualRule];

				if (!style) continue;

				if (typeof style === "string") {
					ruleSet += `${selector} ${style};`;
				} else {
					let declarationBlock = "";

					for (const property of Object.keys(style)) {
						const value = style[property];

						declarationBlock += `${toDeclaration(
							property,
							value
						)};`;
					}

					ruleSet += `${selector}{${declarationBlock}}`;
				}
			}

			return ruleSet;
		},
	});

export const keyframes = (styleObject: KeyframeStyleObject) =>
	process({
		cache,
		key: JSON.stringify(styleObject),
		styleSheet: styleSheet.global,
		strategy({ className }) {
			let ruleSet = "";
			const selectors = Object.keys(styleObject) as Array<
				keyof typeof styleObject
			>;

			for (const selector of selectors) {
				const style = styleObject[selector];

				if (!style) continue;

				let declarationBlock = "";

				for (const property of Object.keys(style)) {
					const value = style[property];

					declarationBlock += `${toDeclaration(property, value)};`;
				}

				ruleSet += `${
					isNumber(selector) ? `${selector}%` : selector
				}{${declarationBlock}}`;
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
			const style = groupingRule
				? styleSheet.conditional
				: SHORTHAND_PROPERTIES[property]
				? styleSheet.shorthand
				: styleSheet.longhand;

			if (isObject(value)) {
				for (const selectorProperty of Object.keys(value)) {
					const selectorValue = value[selectorProperty];
					const isDefaultProperty = selectorProperty === "default";
					const className = process({
						cache,
						key: `${groupingRule}${property}${selectorValue}${
							isDefaultProperty ? "" : selectorProperty
						}`,
						styleSheet: style,
						strategy({ className }) {
							if (selectorValue === undefined)
								return NO_CLASSNAME;

							const declarationBlock = toDeclaration(
								property,
								selectorValue
							);

							return wrapRuleSet(
								`.${className}${
									isDefaultProperty ? "" : selectorProperty
								}{${declarationBlock}}`
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
					styleSheet: style,
					strategy({ className }) {
						if (value === undefined) return NO_CLASSNAME;

						const declarationBlock = toDeclaration(property, value);

						return wrapRuleSet(
							`.${className}{${declarationBlock}}`
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
