import { UNITLESS_PROPERTIES } from "./constants";
import type { Property } from "./entities/property";
import type { StyleObject } from "./types";

/**
 * Compose multiple class names together.
 * @param classNames - A collection of string-based class names.
 * @returns The composed class names.
 * @example
 * const classNames = compose(styles({ backgroundColor: "red" }), styles({ color: "red" }));
 * document.getElementById("my-element-id").className = classNames;
 */
export const compose = (...classNames: string[]) => {
	return classNames.join(" ");
};

export const isNumber = (value: unknown): value is number => {
	return typeof value === "number" || !Number.isNaN(Number(value));
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
	return value !== null && typeof value === "object";
};

export const transformPropertyValue = (
	name: Property["name"],
	value: Property["value"],
) => {
	return typeof value === "string" || UNITLESS_PROPERTIES[name]
		? value
		: `${value}px`;
};

export const toDeclaration = ({ name, value }: Property) => {
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
	const transformedPropertyName = name.replace(
		/([A-Z])/g,
		(matched) => `-${matched.toLowerCase()}`,
	);

	// Format value to follow CSS specs (unitless number)
	const transformedPropertyValue = transformPropertyValue(name, value);

	return `${transformedPropertyName}:${transformedPropertyValue};`;
};

export const toManyDeclaration = <Style extends StyleObject>(
	styleObject: Style,
) => {
	let declarationBlock = "";

	for (const propertyName of Object.keys(styleObject)) {
		const value = styleObject[propertyName];

		if (value) {
			declarationBlock += toDeclaration({ name: propertyName, value });
		}
	}

	return declarationBlock;
};
