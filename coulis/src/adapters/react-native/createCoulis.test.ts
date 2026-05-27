import type { Dimensions } from "react-native";
import type { MockInstance } from "vitest";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createCoulis } from "./createCoulis";

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

const createInstance = () => {
	return createCoulis({
		properties() {
			return {
				backgroundColor: true,
				height: true,
				width: true,
			};
		},
		shorthands: {
			size: ["width"],
		},
		theme: {
			colors: { primary: "blue" },
		},
	});
};

describe("createCoulis (react-native adapter)", () => {
	let debugSpy: MockInstance<typeof console.debug>;

	beforeEach(() => {
		debugSpy = vi.spyOn(console, "debug").mockReturnValue(undefined);
	});

	afterEach(() => {
		debugSpy.mockRestore();
	});

	test("should return a style object for basic properties", () => {
		const { createStyles } = createInstance();

		expect(createStyles({ width: "100px" })).toStrictEqual({ width: 100 });
	});

	test("should expand shorthands into their longhand properties", () => {
		const { createStyles } = createInstance();

		expect(createStyles({ size: "50px" })).toStrictEqual({ width: 50 });
	});

	test("should use base value when a stateful object is passed", () => {
		const { createStyles } = createInstance();

		expect(
			createStyles({ width: { base: "200px" } as unknown as string }),
		).toStrictEqual({ width: 200 });
		expect(debugSpy).toHaveBeenCalledWith(
			"States are not supported, ignoring non-base values.",
		);
	});

	test("should return the same object reference for identical inputs (cache)", () => {
		const { createStyles } = createInstance();
		const input = { width: "100px" };
		const first = createStyles(input);
		const second = createStyles(input);

		expect(first).toBe(second);
	});

	test("should return property names from getContract", () => {
		const { getContract } = createInstance();

		expect(getContract().propertyNames).toContain("width");
		expect(getContract().propertyNames).toContain("size");
	});

	test("should createKeyframes log a warning and return an empty object", () => {
		const { createKeyframes } = createInstance();

		expect(createKeyframes({})).toStrictEqual({});
		expect(debugSpy).toHaveBeenCalledWith(
			"The `react-native` platform does not support `createKeyframes` method. Ignoring the call...",
		);
	});

	test("should getMetadata log a warning and return an empty array", () => {
		const { getMetadata } = createInstance();

		expect(getMetadata()).toStrictEqual([]);
		expect(debugSpy).toHaveBeenCalledWith(
			"The `react-native` platform does not support `getMetadata` method. Ignoring the call...",
		);
	});

	test("should setGlobalStyles log a warning and do nothing", () => {
		const { setGlobalStyles } = createInstance();

		setGlobalStyles({});

		expect(debugSpy).toHaveBeenCalledWith(
			"The `react-native` platform does not support `setGlobalStyles` method. Ignoring the call...",
		);
	});
});
