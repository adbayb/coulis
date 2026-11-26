import { describe, expect, test, vi } from "vitest";
import { transformDimension } from "./dimension";

// @ts-expect-error Partial mocking for testing purposes (the real module cannot be loaded outside React Native): a 400x800 window that never changes.
vi.mock(import("react-native"), () => {
	return {
		Dimensions: {
			addEventListener() {
				// No window change to listen to.
			},
			get() {
				return { height: 800, width: 400 };
			},
		},
	};
});

describe(transformDimension, () => {
	test.each([
		[42, 42],
		["16px", 16],
		["1em", 16],
		["1.5rem", 24],
		["50vh", 400],
		["50vmax", 400],
		["50vmin", 200],
		["100vw", 400],
		["50%", "50%"],
	])("should transform %s", (input, expected) => {
		expect(transformDimension(input)).toBe(expected);
	});
});
