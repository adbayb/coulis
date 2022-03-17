import { SHORTHAND_PROPERTIES } from "./constants";
import { hash, isObject, minify } from "./helpers";
import { StyleSheetType, createStyleSheet } from "./entities/stylesheet";
import { createCache } from "./entities/cache";
import {
	createSerializer,
	toClassName,
	toDeclaration,
} from "./entities/serializer";
import { AtomicStyleObject, StyleObjectBySelector } from "./types";

const styleSheet = createStyleSheet();
const cache = createCache(styleSheet);
const serialize = createSerializer(cache);

/**
 * Create a scoped `atoms` to manage conditional styling rules (such as @media, @supports...)
 * @param groupRule The styling rule instruction (such as `@media (min-width: 0px)`)
 * @returns The scoped `atoms` helper
 */
export const createAtoms = (groupRule: string) => {
	const formatRuleSetWithScope = (ruleSet: string) => {
		return !groupRule ? ruleSet : `${groupRule}{${ruleSet}}`;
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	return (styleObject: AtomicStyleObject) => {
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

export const atoms = createAtoms("");

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

// @todo: refacto to reuse as much as possible serializer + update serializer to have key and selector arg and remove `ruleSetFormatter`
export const globals = (
	stylesBySelector: StyleObjectBySelector<keyof HTMLElementTagNameMap>
) => {
	const key = hash(JSON.stringify(stylesBySelector));

	if (cache.has(key)) {
		return;
	}

	let ruleSet = "";

	for (const selector in stylesBySelector) {
		const style = stylesBySelector[selector];

		if (!style) {
			continue;
		}

		let property: keyof typeof style;
		let declarationBlock = "";

		for (property in style) {
			const value = style[property];

			declarationBlock += `${toDeclaration(property, value)};`;
		}

		ruleSet += `${selector}{${declarationBlock}}`;
	}

	styleSheet.global.commit(ruleSet);
	cache.set(key, "global");
};

export const keyframes = (
	stylesBySelector: StyleObjectBySelector<"from" | "to">
) => {
	const key = hash(JSON.stringify(stylesBySelector));
	const animationName = toClassName(key);

	if (cache.has(key)) {
		console.log("hits", key, animationName);

		return animationName;
	}

	let ruleSet = "";

	for (const selector in stylesBySelector) {
		const style = stylesBySelector[selector];

		if (!style) {
			continue;
		}

		let property: keyof typeof style;
		let declarationBlock = "";

		for (property in style) {
			const value = style[property];

			declarationBlock += `${toDeclaration(property, value)};`;
		}

		ruleSet += `${selector}{${declarationBlock}}`;
	}

	ruleSet = `@keyframes ${animationName}{${ruleSet}}`;
	styleSheet.global.commit(ruleSet);
	cache.set(key, "global");

	return animationName;
};
