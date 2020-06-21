import { SHORTHAND_PROPERTIES } from "./constants";
import { hash, isObject, merge, minify } from "./helpers";
import { StyleSheetKey, createStyleSheets } from "./domains/stylesheet";
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

		return classNames.trim();
	};
};

export const css = createCss("");

export const keyframes = (value: string) => {
	const key = hash(value);
	const className = `${toClassName(key)}`;

	if (cache.has(key)) {
		return className;
	}

	const declarationBlock = `@keyframes ${className}{${minify(value)}}`;

	styleSheets.global.commit(declarationBlock);
	cache.set(key, "global");

	return className;
};

export const extractStyles = () => {
	const styleSheetTypes = Object.keys(styleSheets) as StyleSheetKey[];
	const cacheEntries = cache.entries();
	const cacheKeys = Object.keys(cacheEntries);

	return styleSheetTypes.map((type) => {
		const styleSheet = styleSheets[type];
		const cssValue = minify(styleSheet.get());
		const keys = cacheKeys.filter((key) => cacheEntries[key] === type);

		return {
			keys,
			content: cssValue,
			type,
			toString() {
				return `<style data-coulis-type="${type}" data-coulis-keys="${keys.join(
					","
				)}">${cssValue}</style>`;
			},
		};
	});
};

export const raw = (value: string) => {
	const key = hash(value);

	if (cache.has(key)) {
		return;
	}

	styleSheets.global.commit(minify(value));
	cache.set(key, "global");
};
