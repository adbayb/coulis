import { UNITLESS_PROPERTIES } from "./constants";

export const isNumber = (value: unknown): value is number => {
	return typeof value === "number" || !Number.isNaN(Number(value));
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
	return value !== null && typeof value === "object";
};

export const hash = (str: string) => {
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

export const minify = (value: string) => {
	return value.replace(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};

export const toClassName = (key: string) => {
	return `c${key}`;
};

export const toDeclaration = (property: string, value: unknown) => {
	// @note: Anatomy of a css syntax:
	// .className { background-color: blue; color: red } = css rule-set
	// .className = selector
	// { background-color: blue; color: red } = declaration block (contains one or more declarations separated by semicolons)
	// background-color: blue = a declaration
	// background-color = property (or property name)
	// blue = value (or property value)

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
