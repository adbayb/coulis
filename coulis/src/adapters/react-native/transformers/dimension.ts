import { Dimensions } from "react-native";

type Transform = (input: { name: string; value: unknown }) => typeof input;

let windowDimensions = Dimensions.get("window");

const createUnitScales = () => {
	return {
		em: 16,
		rem: 16,
		vh: windowDimensions.height / 100,
		vmax: Math.max(windowDimensions.width, windowDimensions.height) / 100,
		vmin: Math.min(windowDimensions.width, windowDimensions.height) / 100,
		vw: windowDimensions.width / 100,
	};
};

let unitScales = createUnitScales();

Dimensions.addEventListener("change", ({ window }: { window: typeof windowDimensions }) => {
	windowDimensions = window;
	unitScales = createUnitScales();
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

	/*
	 * Note: `rem` also ends with `em`, but both scale to 16 so order is irrelevant. No other unit
	 * is a suffix of another (`vmax`/`vmin` don't end with `vh`/`vw`), keeping alphabetical.
	 */
	for (const [unit, scale] of Object.entries(unitScales)) {
		if (input.endsWith(unit)) {
			return value * scale;
		}
	}

	return input;
};
