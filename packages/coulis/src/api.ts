import { SHORTHAND_PROPERTIES } from "./constants";
import { hash, isNumber, isObject, minify } from "./helpers";
import { StyleSheetType, createStyleSheet } from "./entities/stylesheet";
import { createCache } from "./entities/cache";
import {
	createProcessor,
	toClassName,
	toDeclaration,
} from "./entities/processor";
import {
	AtConditionalGroupingRule,
	AtTextualRule,
	AtomicStyleObject,
	GlobalStyleObject,
	KeyframeStyleObject,
} from "./types";

const styleSheet = createStyleSheet();
const cache = createCache(styleSheet);
const process = createProcessor(cache);

const createAtomsFactory = (rule = "") => {
	const formatRuleSetWithScope = (ruleSet: string) => {
		return !rule ? ruleSet : `${rule}{${ruleSet}}`;
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	return (styleObject: AtomicStyleObject) => {
		// @note: force typescript to reduce the typing evaluation cost due to heavy generic on css-type package
		const input = styleObject as Record<string, unknown>;
		let classNames = "";

		for (const property of Object.keys(input)) {
			const value = input[property];
			const style = rule
				? styleSheet.conditional
				: SHORTHAND_PROPERTIES[property]
				? styleSheet.shorthand
				: styleSheet.longhand;

			if (isObject(value)) {
				for (const selectorProperty of Object.keys(value)) {
					const selectorValue =
						value[selectorProperty as keyof typeof value];
					const isDefaultProperty = selectorProperty === "default";
					const className = process(
						isDefaultProperty
							? `${rule}${property}${selectorValue}`
							: `${rule}${property}${selectorValue}${selectorProperty}`,
						property,
						selectorValue,
						(className, declaration) =>
							formatRuleSetWithScope(
								`.${className}${
									isDefaultProperty ? "" : selectorProperty
								}{${declaration}}`
							),
						style
					);

					if (className !== null) {
						classNames = `${classNames} ${className}`;
					}
				}
			} else {
				const className = process(
					`${rule}${property}${value}`,
					property,
					value,
					(className, declaration) =>
						formatRuleSetWithScope(`.${className}{${declaration}}`),
					style
				);

				if (className !== null) {
					classNames = `${classNames} ${className}`;
				}
			}
		}

		return classNames.trim();
	};
};

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

export const atoms = createAtomsFactory();

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

// @todo: refacto to reuse as much as possible processor + update processor to have key and selector arg and remove `ruleSetFormatter`
export const globals = (stylesBySelector: GlobalStyleObject) => {
	const key = hash(JSON.stringify(stylesBySelector));

	if (cache.has(key)) {
		return;
	}

	let ruleSet = "";

	for (const selector of Object.keys(stylesBySelector)) {
		const style = stylesBySelector[selector as AtTextualRule];

		if (!style) continue;

		if (typeof style === "string") {
			ruleSet += `${selector} ${style};`;
		} else {
			let declarationBlock = "";

			for (const property of Object.keys(style)) {
				const value = style[property];

				declarationBlock += `${toDeclaration(property, value)};`;
			}

			ruleSet += `${selector}{${declarationBlock}}`;
		}
	}

	styleSheet.global.commit(ruleSet);
	cache.set(key, "global");
};

export const keyframes = (stylesBySelector: KeyframeStyleObject) => {
	const key = hash(JSON.stringify(stylesBySelector));
	const animationName = toClassName(key);

	if (cache.has(key)) return animationName;

	let ruleSet = "";
	const selectors = Object.keys(stylesBySelector) as Array<
		keyof typeof stylesBySelector
	>;

	for (const selector of selectors) {
		const style = stylesBySelector[selector];

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

	ruleSet = `@keyframes ${animationName}{${ruleSet}}`;
	styleSheet.global.commit(ruleSet);
	cache.set(key, "global");

	return animationName;
};
