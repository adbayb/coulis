import { Dimensions } from "react-native";

import { logger } from "../../../core/entities/logger";
import type { PropertyValue } from "./types";

/**
 * A factory to set up and share translation behaviors.
 * @param name - The style property name.
 * @param factory - The translation function.
 * @returns The decorated translatation function.
 * @example
 * const borderRadius = createTranslation<number>("borderRadius", () => 2);
 */
export const createPropertyValue = <Output>(
	name: string,
	factory: PropertyValue<Error | Output>,
): PropertyValue<Output> => {
	return (input) => {
		const output = factory(input);

		if (output instanceof Error) {
			logger.debug(
				`The \`${name}\` property cannot be translated. The value will be returned as it's. Cause: ${output.message}.`,
			);

			return input as Output;
		}

		return output;
	};
};

export const createPropertyValueError = (input: string) => {
	return new Error(input);
};

export const getDimensionValue = (input: string) => {
	const value = Number.parseFloat(input);

	if (Number.isNaN(value)) return input;

	if (input.endsWith("px")) return value;

	if (["em", "rem"].some((unit) => input.endsWith(unit))) return value * 16;

	if (["vh", "vmax"].some((unit) => input.endsWith(unit)))
		return (value / 100) * Dimensions.get("window").height;

	if (["vw", "vmin"].some((unit) => input.endsWith(unit)))
		return (value / 100) * Dimensions.get("window").width;

	return input;
};
