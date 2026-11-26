import { describe, expect, test, vi } from "vitest";
import {
	createCompiledTemplate,
	createCustomProperties,
	findClassNames,
	getEvaluatedTemplate,
} from "./helpers";

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

describe(findClassNames, () => {
	test("should find the class names of every class attribute", () => {
		const classNames = findClassNames(
			'<p class="c1 c2" title="c3"><b class="c4">c5</b><i class="c1 c2"></i><u class="c2 c1"></u></p>',
		);

		expect([...classNames]).toStrictEqual(["class", "c1", "c2", "c4"]);
	});

	test("should find the class names of attributes sharing their length and last characters", () => {
		const classNames = findClassNames(
			'<p class="c1abc"></p><p class="c2abc"></p><p class="c1abc"></p><p class="c3abc"></p>',
		);

		expect([...classNames]).toStrictEqual(["class", "c1abc", "c2abc", "c3abc"]);
	});

	test("should find the class names of an unclosed class attribute", () => {
		expect([...findClassNames('<p class="c1 c2')]).toStrictEqual(["class", "c1", "c2"]);
	});

	test("should not find any class name without class attributes", () => {
		expect(findClassNames("<p>c1</p>").size).toBe(0);
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
