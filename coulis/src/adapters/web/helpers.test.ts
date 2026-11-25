import { describe, expect, test, vi } from "vitest";
import { createCompiledTemplate, createCustomProperties, getEvaluatedTemplate } from "./helpers";

describe(createCustomProperties, () => {
	test("should escape special characters in key names", () => {
		const onCreateProperty = vi.fn<(name: string, value: unknown) => void>();

		createCustomProperties({ "spacings-1.5": "2rem" }, onCreateProperty);
		expect(onCreateProperty).toHaveBeenCalledWith("--spacings-1-5", "2rem");
	});

	test("should handle deeply nested themes with sibling branches", () => {
		const onCreateProperty = vi.fn<(name: string, value: unknown) => void>();

		const output = createCustomProperties(
			{
				a: { nested: { x: "1px" }, sibling: "2px" },
				b: { y: "3px" },
			},
			onCreateProperty,
		);

		expect(onCreateProperty.mock.calls).toStrictEqual([
			["--a-nested-x", "1px"],
			["--a-sibling", "2px"],
			["--b-y", "3px"],
		]);

		expect(output).toStrictEqual({
			a: { nested: { x: "var(--a-nested-x)" }, sibling: "var(--a-sibling)" },
			b: { y: "var(--b-y)" },
		});
	});
});

describe(createCompiledTemplate, () => {
	test("should detect at-rules from the template first character", () => {
		expect(
			createCompiledTemplate("@media{coulis[selector]{coulis[declaration]}}").isAtRule,
		).toBe(true);

		expect(createCompiledTemplate("coulis[declaration]@media{coulis[selector]}").isAtRule).toBe(
			false,
		);
	});
});

describe(getEvaluatedTemplate, () => {
	test("should replace multiple occurrences", () => {
		const compiled = createCompiledTemplate(
			"coulis[selector][alt]{coulis[declaration]}coulis[selector]{coulis[declaration]}",
		);

		expect(getEvaluatedTemplate(compiled, ".c123", "color:red;")).toBe(
			".c123[alt]{color:red;}.c123{color:red;}",
		);
	});

	test("should preserve literal text and replacement values around adjacent markers", () => {
		const compiled = createCompiledTemplate(
			"coulis[unknown]coulis[selector]coulis[declaration]",
		);

		expect(getEvaluatedTemplate(compiled, ".c123", 'content:"coulis[selector]";')).toBe(
			'coulis[unknown].c123content:"coulis[selector]";',
		);
	});
});
