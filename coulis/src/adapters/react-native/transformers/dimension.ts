import { Dimensions } from "react-native";

import type { Transform } from "./types";

export const transformDimension: Transform = (input) => {
	if (typeof input.value !== "string") return input;

	return {
		name: input.name,
		value: getDimensionValue(input.value),
	};
};

const getDimensionValue = (input: string) => {
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
