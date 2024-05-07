/**
 * CSS syntax anatomy.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax
 *
 * `.className { background-color: blue; color: red }` = Rule (or Ruleset)
 * `.className` = Selector
 * `{ background-color: blue; color: red }` = Declaration block (contains one or more declarations separated by semicolons)
 * `background-color: blue;` = Declaration
 * `background-color` = Property (or property name)
 * `blue = Value` (or property value)
 */

/* eslint-disable sort-keys-custom-order/object-keys */
import type { PropertiesFallback } from "csstype";

import type { UngreedyString } from "../types";

export type LooseStyleProperties = Record<
	UngreedyString,
	number | string | undefined
> &
	StyleProperties;

export type StyleProperties = PropertiesFallback<UngreedyString | number>;

export type ClassName = string;

export const createClassName = (value: string) => {
	// hash content based with FNV-1a algorithm:
	const FNVOffsetBasis = 2166136261;
	const FNVPrime = 16777619;
	let hashedValue = FNVOffsetBasis;

	for (let i = 0; i < value.length; i++) {
		hashedValue ^= value.charCodeAt(i);
		hashedValue *= FNVPrime;
	}

	// We convert hashed value to 32-bit unsigned integer
	// via logical unsigned shift operator >>>
	const uHash = hashedValue >>> 0;

	// A coulis className is generated by prefixing with "c"
	// and converting generated hash to hexadecimal
	return `c${Number(uHash).toString(16)}`;
};

export const createDeclaration = ({
	name,
	value,
}: {
	name: keyof StyleProperties;
	value: StyleProperties[keyof StyleProperties];
}) => {
	// From JS camelCase to CSS kebeb-case
	const transformedPropertyName = name.replace(
		/([A-Z])/g,
		(matched) => `-${matched.toLowerCase()}`,
	);

	// Format value to follow CSS specs (unitless number)
	const transformedPropertyValue =
		typeof value === "string" || UNITLESS_PROPERTIES[name]
			? String(value)
			: `${String(value)}px`;

	return `${transformedPropertyName}:${transformedPropertyValue};`;
};

export const createDeclarations = <Properties extends StyleProperties>(
	properties: Properties,
) => {
	let declarationBlock = "";
	const propertyNames = Object.keys(properties) as (keyof StyleProperties)[];

	for (const propertyName of propertyNames) {
		const value = properties[propertyName];

		if (value) {
			declarationBlock += createDeclaration({
				name: propertyName,
				value,
			});
		}
	}

	return declarationBlock;
};

export const isShorthandProperty = (name: keyof StyleProperties) => {
	return Boolean(SHORTHAND_PROPERTIES[name]);
};

type Indexable = Partial<Record<keyof StyleProperties, boolean>>;

// Taken from https://raw.githubusercontent.com/facebook/react/b98adb648a27640db8467064e537b238b8c306ce/packages/react-dom/src/shared/CSSProperty.js
const UNITLESS_PROPERTIES: Indexable = {
	animationIterationCount: true,
	borderImageOutset: true,
	borderImageSlice: true,
	borderImageWidth: true,
	boxFlex: true,
	boxFlexGroup: true,
	boxOrdinalGroup: true,
	columnCount: true,
	columns: true,
	flex: true,
	flexGrow: true,
	flexShrink: true,
	gridArea: true,
	gridRow: true,
	gridRowEnd: true,
	gridRowStart: true,
	gridColumn: true,
	gridColumnEnd: true,
	gridColumnStart: true,
	fontWeight: true,
	lineClamp: true,
	lineHeight: true,
	opacity: true,
	order: true,
	orphans: true,
	tabSize: true,
	widows: true,
	zIndex: true,
	zoom: true,
	// SVG properties
	fillOpacity: true,
	floodOpacity: true,
	stopOpacity: true,
	strokeDasharray: true,
	strokeDashoffset: true,
	strokeMiterlimit: true,
	strokeOpacity: true,
	strokeWidth: true,
	// Property prefixes
	WebkitLineClamp: true,
};

// From PREACT:
// export const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
const SHORTHAND_PROPERTIES: Indexable = {
	animation: true,
	background: true,
	border: true,
	borderBottom: true,
	borderColor: true,
	borderLeft: true,
	borderRadius: true,
	borderRight: true,
	borderStyle: true,
	borderTop: true,
	borderWidth: true,
	columnRule: true,
	columns: true,
	flex: true,
	flexFlow: true,
	font: true,
	grid: true,
	gridArea: true,
	gridColumn: true,
	gridRow: true,
	gridTemplate: true,
	listStyle: true,
	margin: true,
	offset: true,
	outline: true,
	overflow: true,
	padding: true,
	placeContent: true,
	placeItems: true,
	placeSelf: true,
	textDecoration: true,
	transition: true,
};
