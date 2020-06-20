import { Property, Value } from "../types";
import { UNITLESS_PROPERTIES } from "../constants";
import { CacheAdapter } from "./cache";
import { StyleSheetAdapter } from "./stylesheet";

const hash = (str: string) => {
	// hash content based with FNV-1a algorithm:
	const FNVOffsetBasis = 2166136261;
	const FNVPrime = 16777619;
	let hash = FNVOffsetBasis;

	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash *= FNVPrime;
	}

	// @note: we convert hashed value to 32-bit unsigned integer
	// via logical unsigned shift operator >>>
	const uHash = hash >>> 0;

	// @note: we convert to hexadecimal
	return Number(uHash).toString(16);
};

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

export const toClassName = (hashInput: string, prefix = "c") => {
	return `${prefix}${hash(hashInput)}`;
};

export const createProcessor = (cache: CacheAdapter) => {
	return (
		key: string,
		property: string,
		value: Value,
		ruleSetFormatter: (className: string, declaration: string) => string,
		styleSheet: StyleSheetAdapter
	) => {
		const className = toClassName(key);

		if (cache.has(className)) {
			return className;
		}

		if (value === undefined) {
			return null;
		}

		const normalizedDeclaration = toDeclaration(property, value);
		const ruleSet = ruleSetFormatter(className, normalizedDeclaration);

		styleSheet.commit(ruleSet);
		cache.set(className);

		return className;
	};
};
