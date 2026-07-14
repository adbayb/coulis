import { Dimensions } from "react-native";
import type { Transform } from "./types";

let windowDimensions = Dimensions.get("window");

Dimensions.addEventListener("change", ({ window }) => {
	windowDimensions = window;
});

export const transformDimension: Transform = (input) => {
	if (typeof input.value !== "string") {
		return input;
	}

	return {
		name: input.name,
		value: getDimensionValue(input.value),
	};
};

const getDimensionValue = (input: string) => {
	// oxlint-disable-next-line unicorn/prefer-number-coercion
	const value = Number.parseFloat(input);

	if (Number.isNaN(value)) {
		return input;
	}

	if (input.endsWith("px")) {
		return value;
	}

	if (
		["em", "rem"].some((unit) => {
			return input.endsWith(unit);
		})
	) {
		return value * 16;
	}

	if (
		["vh", "vmax"].some((unit) => {
			return input.endsWith(unit);
		})
	) {
		return (value / 100) * windowDimensions.height;
	}

	if (
		["vw", "vmin"].some((unit) => {
			return input.endsWith(unit);
		})
	) {
		return (value / 100) * windowDimensions.width;
	}

	return input;
};
