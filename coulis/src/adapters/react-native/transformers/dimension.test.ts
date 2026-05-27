import type { Dimensions } from "react-native";

import { describe, expect, test, vi } from "vitest";

import { transformDimension } from "./dimension";

vi.mock(import("react-native"), (): { Dimensions: Dimensions } => ({
	Dimensions: {
		addEventListener: vi.fn(),
		get: vi.fn(() => ({
			fontScale: 0,
			height: 800,
			scale: 0,
			width: 400,
		})),
		set: vi.fn(),
	},
}));

describe(transformDimension, () => {
	test("should pass through non-string values unchanged", () => {
		expect(transformDimension({ name: "width", value: 42 })).toStrictEqual({
			name: "width",
			value: 42,
		});
	});

	test("should strip px and return a number", () => {
		expect(
			transformDimension({ name: "width", value: "16px" }),
		).toStrictEqual({ name: "width", value: 16 });
	});

	test("should convert em to pixels (× 16)", () => {
		expect(
			transformDimension({ name: "fontSize", value: "1em" }),
		).toStrictEqual({ name: "fontSize", value: 16 });
	});

	test("should convert rem to pixels (× 16)", () => {
		expect(
			transformDimension({ name: "fontSize", value: "1.5rem" }),
		).toStrictEqual({ name: "fontSize", value: 24 });
	});

	test("should convert vh using window height", () => {
		expect(
			transformDimension({ name: "height", value: "50vh" }),
		).toStrictEqual({ name: "height", value: 800 / 2 });
	});

	test("should convert vw using window width", () => {
		expect(
			transformDimension({ name: "width", value: "100vw" }),
		).toStrictEqual({ name: "width", value: 400 });
	});

	test("should return unknown units as-is", () => {
		expect(
			transformDimension({ name: "width", value: "50%" }),
		).toStrictEqual({ name: "width", value: "50%" });
	});
});
