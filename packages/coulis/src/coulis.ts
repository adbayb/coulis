import { SHORTHAND_PROPERTIES } from "./constants";
import { hash, isObject, merge, minify } from "./helpers";
import {
	StyleSheetKey,
	createStyleSheets,
	stringifyStyle,
} from "./domains/stylesheet";
import { createCache } from "./domains/cache";
import { createProcessor, toClassName } from "./domains/processor";
import { DeclarationBlock } from "./types";

const styleSheets = createStyleSheets();
const cache = createCache(styleSheets);
const processStyle = createProcessor(cache);

export const createCss = (groupRule: string) => {
	const formatRuleSetWithScope = (ruleSet: string) => {
		return !groupRule ? ruleSet : `${groupRule}{${ruleSet}}`;
	};

	return (...cssBlocks: DeclarationBlock[]) => {
		const cssBlock =
			cssBlocks.length <= 1 ? cssBlocks[0] : merge({}, ...cssBlocks);
		let classNames = "";

		for (const property in cssBlock) {
			const value = cssBlock[property];
			const styleSheet = groupRule
				? styleSheets.conditional
				: SHORTHAND_PROPERTIES[property]
				? styleSheets.shorthand
				: styleSheets.longhand;

			if (isObject(value)) {
				for (const selectorProperty in value) {
					const selectorValue =
						value[selectorProperty as keyof typeof value];
					const isDefaultProperty = selectorProperty === "default";
					const className = processStyle(
						isDefaultProperty
							? `${groupRule}${property}${selectorValue}`
							: `${groupRule}${property}${selectorValue}${selectorProperty}`,
						property,
						selectorValue,
						(className, declaration) =>
							formatRuleSetWithScope(
								`.${className}${
									isDefaultProperty ? "" : selectorProperty
								}{${declaration}}`
							),
						styleSheet
					);

					if (className !== null) {
						classNames = `${classNames} ${className}`;
					}
				}
			} else {
				const className = processStyle(
					`${groupRule}${property}${value}`,
					property,
					value,
					(className, declaration) =>
						formatRuleSetWithScope(`.${className}{${declaration}}`),
					styleSheet
				);

				if (className !== null) {
					classNames = `${classNames} ${className}`;
				}
			}
		}

		console.log(cache.entries());

		return classNames.trim();
	};
};

export const css = createCss("");

export const keyframes = (value: string) => {
	const key = hash(value);
	const className = `${toClassName(key)}`;
	const declarationBlock = `@keyframes ${className}{${minify(value)}}`;

	styleSheets.global.commit(declarationBlock, key);

	return className;
};

export const extractCss = () => {
	let style = "";

	Object.keys(styleSheets).map((key) => {
		const css = styleSheets[key as StyleSheetKey].getCss();

		style = `${style}${stringifyStyle(key as StyleSheetKey, css)}`;
	});

	return style;
};

export const raw = (value: string) => {
	styleSheets.global.commit(minify(value), hash(value));
};
