import { Dimensions } from "react-native";

type Transform = (input: { name: string; value: unknown }) => typeof input;

let windowDimensions = Dimensions.get("window");

Dimensions.addEventListener("change", ({ window }: { window: typeof windowDimensions }) => {
	windowDimensions = window;
});

const RELATIVE_UNIT_SCALES: Record<string, () => number> = {
	em: () => {
		return 16;
	},
	rem: () => {
		return 16;
	},
	vh: () => {
		return windowDimensions.height / 100;
	},
	vmax: () => {
		return Math.max(windowDimensions.width, windowDimensions.height) / 100;
	},
	vmin: () => {
		return Math.min(windowDimensions.width, windowDimensions.height) / 100;
	},
	vw: () => {
		return windowDimensions.width / 100;
	},
};

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
	for (const [unit, getUnitScale] of Object.entries(RELATIVE_UNIT_SCALES)) {
		if (input.endsWith(unit)) {
			return value * getUnitScale();
		}
	}

	return input;
};
