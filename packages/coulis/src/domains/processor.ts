import { Property, Value } from "../types";
import { UNITLESS_PROPERTIES } from "../constants";
import { hash } from "../helpers";
import { CacheAdapter } from "./cache";
import { StyleSheetAdapter } from "./stylesheet";

export const toDeclaration = (property: Property, value: Value) => {
	// @section: from JS camelCase to CSS kebeb-case
	const normalizedProperty = property.replace(
		/([A-Z])/g,
		(matched) => `-${matched.toLowerCase()}`
	);
	// @section: format value to follow CSS specs (unitless number)
	const normalizedValue =
		typeof value !== "number" || UNITLESS_PROPERTIES[property]
			? value
			: `${value}px`;

	return `${normalizedProperty}:${normalizedValue}`;
};

// @note: Anatomy of a css syntax:
// .className { background-color: blue; color: red } = css rule-set
// .className = selector
// { background-color: blue; color: red } = declaration block (contains one or more declarations separated by semicolons)
// background-color: blue = a declaration
// background-color = property (or property name)
// blue = value (or property value)

export const toClassName = (key: string) => {
	return `c${key}`;
};

export const createProcessor = (cache: CacheAdapter) => {
	return (
		key: string,
		property: string,
		value: Value,
		ruleSetFormatter: (className: string, declaration: string) => string,
		styleSheet: StyleSheetAdapter
	) => {
		const cacheKey = hash(key);
		const className = toClassName(cacheKey);

		if (cache.has(cacheKey)) {
			return className;
		}

		if (value === undefined) {
			return null;
		}

		const normalizedDeclaration = toDeclaration(property, value);
		const ruleSet = ruleSetFormatter(className, normalizedDeclaration);

		styleSheet.commit(ruleSet);
		cache.set(cacheKey, styleSheet.type);

		return className;
	};
};
