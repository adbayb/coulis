import { UNITLESS_PROPERTIES } from "./constants";
import type { StyleObject } from "./types";

export const isNumber = (value: unknown): value is number => {
	return typeof value === "number" || !Number.isNaN(Number(value));
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
	return value !== null && typeof value === "object";
};

export const toDeclaration = (property: string, value: number | string) => {
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

	// From JS camelCase to CSS kebeb-case
	const normalizedProperty = property.replace(
		/([A-Z])/g,
		(matched) => `-${matched.toLowerCase()}`,
	);

	// Format value to follow CSS specs (unitless number)
	const normalizedValue =
		typeof value === "string" || UNITLESS_PROPERTIES[property]
			? value
			: `${value}px`;

	return `${normalizedProperty}:${normalizedValue};`;
};

export const toManyDeclaration = <Style extends StyleObject>(
	styleObject: Style,
) => {
	let declarationBlock = "";

	for (const property of Object.keys(styleObject)) {
		const value = styleObject[property];

		if (value) {
			declarationBlock += toDeclaration(property, value);
		}
	}

	return declarationBlock;
};
