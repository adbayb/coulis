import type { Dimensions } from "react-native";
import { describe, expect, test, vi } from "vitest";
import { transformDimension } from "./dimension";

// @ts-expect-error Partial mocking for testing purposes
vi.mock(import("react-native"), (): { Dimensions: Dimensions } => {
	return {
		Dimensions: {
			addEventListener: vi.fn(),
			get: vi.fn(() => {
				return {
					fontScale: 0,
					height: 800,
					scale: 0,
					width: 400,
				};
			}),
		},
	};
});

describe(transformDimension, () => {
	test.each([
		{ expected: { name: "width", value: 42 }, input: { name: "width", value: 42 } },
		{ expected: { name: "width", value: 16 }, input: { name: "width", value: "16px" } },
		{ expected: { name: "fontSize", value: 16 }, input: { name: "fontSize", value: "1em" } },
		{ expected: { name: "fontSize", value: 24 }, input: { name: "fontSize", value: "1.5rem" } },
		{ expected: { name: "height", value: 400 }, input: { name: "height", value: "50vh" } },
		{ expected: { name: "width", value: 400 }, input: { name: "width", value: "50vmax" } },
		{ expected: { name: "width", value: 200 }, input: { name: "width", value: "50vmin" } },
		{ expected: { name: "width", value: 400 }, input: { name: "width", value: "100vw" } },
		{ expected: { name: "width", value: "50%" }, input: { name: "width", value: "50%" } },
	])("should transform $input.value", ({ expected, input }) => {
		expect(transformDimension(input)).toStrictEqual(expected);
	});
});
