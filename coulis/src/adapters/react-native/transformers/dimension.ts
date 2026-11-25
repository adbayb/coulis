import { Dimensions } from "react-native";

type WindowDimensions = { height: number; width: number };

const createUnitScales = ({ height, width }: WindowDimensions) => {
	return {
		em: 16,
		rem: 16,
		vh: height / 100,
		vmax: Math.max(width, height) / 100,
		vmin: Math.min(width, height) / 100,
		vw: width / 100,
	};
};

let unitScales = createUnitScales(Dimensions.get("window"));

Dimensions.addEventListener("change", ({ window }: { window: WindowDimensions }) => {
	unitScales = createUnitScales(window);
});

/**
 * Transforms a CSS dimension into a React Native one: `px` values and viewport/font relative units
 * become numbers. Any other value is returned as is.
 *
 * @param input - The style value.
 * @returns The transformed value.
 */
export const transformDimension = (input: unknown) => {
	if (typeof input !== "string") {
		return input;
	}

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
