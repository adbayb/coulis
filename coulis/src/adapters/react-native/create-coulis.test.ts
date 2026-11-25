import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createCoulis } from "./create-coulis";

// @ts-expect-error Partial mocking for testing purposes
vi.mock(import("react-native"), async () => {
	return import("./react-native.mock");
});

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

		expect(createStyles({ width: { base: "200px" } as unknown as string })).toStrictEqual({
			width: 200,
		});

		expect(debugSpy).toHaveBeenCalledWith(
			"States are not supported, ignoring non-base values.",
		);
	});

	test("should not share mutable results for identical inputs (cache)", () => {
		const { createStyles } = createInstance();
		const input = { width: "100px" };
		const first = createStyles(input);

		first.width = 200;
		expect(createStyles(input)).toStrictEqual({ width: 100 });
	});

	test("should return property names from getContract", () => {
		const { getContract } = createInstance();

		expect(getContract().propertyNames).toContain("width");
		expect(getContract().propertyNames).toContain("size");
	});

	test.each([
		["createKeyframes", {}],
		["getCriticalStyleSheets", []],
		["getStyleSheets", []],
		["setGlobalStyles", expect.any(Function)],
	] as const)("should %s log a warning and do nothing", (method, expected) => {
		const instance = createInstance();
		const call = instance[method] as (input?: unknown) => unknown;

		expect(call({})).toStrictEqual(expected);

		expect(debugSpy).toHaveBeenCalledWith(
			`The \`react-native\` platform does not support \`${method}\` method. Ignoring the call...`,
		);
	});
});
