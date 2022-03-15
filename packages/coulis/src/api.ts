import { SHORTHAND_PROPERTIES } from "./constants";
import { hash, isObject, minify } from "./helpers";
import { StyleSheetType, createStyleSheet } from "./entities/stylesheet";
import { createCache } from "./entities/cache";
import { createSerializer, toClassName } from "./entities/serializer";
import { StyleObject } from "./types";

const styleSheet = createStyleSheet();
const cache = createCache(styleSheet);
const serialize = createSerializer(cache);

export const createCss = (groupRule: string) => {
	const formatRuleSetWithScope = (ruleSet: string) => {
		return !groupRule ? ruleSet : `${groupRule}{${ruleSet}}`;
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	return (styleObject: StyleObject) => {
		// @note: force typescript to reduce the typing evaluation cost due to heavy generic on css-type package
		const input = styleObject as Record<string, unknown>;
		let classNames = "";

		for (const property in input) {
			const value = input[property];
			const style = groupRule
				? styleSheet.conditional
				: SHORTHAND_PROPERTIES[property]
				? styleSheet.shorthand
				: styleSheet.longhand;

			if (isObject(value)) {
				for (const selectorProperty in value) {
					const selectorValue =
						value[selectorProperty as keyof typeof value];
					const isDefaultProperty = selectorProperty === "default";
					const className = serialize(
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
						style
					);

					if (className !== null) {
						classNames = `${classNames} ${className}`;
					}
				}
			} else {
				const className = serialize(
					`${groupRule}${property}${value}`,
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

export const css = createCss("");

export const keyframes = (value: string) => {
	const key = hash(value);
	const className = `${toClassName(key)}`;

	if (cache.has(key)) {
		return className;
	}

	const declarationBlock = `@keyframes ${className}{${minify(value)}}`;

	styleSheet.global.commit(declarationBlock);
	cache.set(key, "global");

	return className;
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

	styleSheet.global.commit(minify(value));
	cache.set(key, "global");
};
