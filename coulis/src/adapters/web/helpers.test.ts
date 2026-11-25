import { describe, expect, test } from "vitest";
import { createCompiledTemplate, createCustomProperties, getEvaluatedTemplate } from "./helpers";

describe(createCustomProperties, () => {
	test("should escape special characters in key names", () => {
		const collected: [string, unknown][] = [];

		createCustomProperties({ "spacings-1.5": "2rem" }, (name) => {
			collected.push([name, undefined]);
		});

		expect(collected[0]?.[0]).toBe("--spacings-1-5");
	});

	test("should handle deeply nested themes with sibling branches", () => {
		const collected: [string, unknown][] = [];

		const output = createCustomProperties(
			{
				a: { nested: { x: "1px" }, sibling: "2px" },
				b: { y: "3px" },
			},
			(name, value) => {
				collected.push([name, value]);
			},
		);

		expect(collected).toContainEqual(["--a-nested-x", "1px"]);
		expect(collected).toContainEqual(["--a-sibling", "2px"]);
		expect(collected).toContainEqual(["--b-y", "3px"]);
		expect(output.a.nested.x).toBe("var(--a-nested-x)");
		expect(output.b.y).toBe("var(--b-y)");
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
