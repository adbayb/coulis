import { describe, expect, test } from "vitest";

import {
	createClassName,
	createCustomProperties,
	createDeclaration,
	// eslint-disable-next-line sonarjs/no-built-in-override
	escape,
	getEvaluatedTemplate,
	minify,
} from "./helpers";

describe(escape, () => {
	test("should replace special CSS characters with hyphens", () => {
		expect(escape("spacings-1.5")).toBe("spacings-1-5");
	});

	test("should escape all punctuation characters", () => {
		expect(escape("a!b@c#d$e")).toBe("a-b-c-d-e");
	});

	test("should leave alphanumeric and hyphen characters unchanged", () => {
		expect(escape("my-token-name")).toBe("my-token-name");
	});
});

describe(createClassName, () => {
	test("should return a string starting with 'c'", () => {
		expect(createClassName("any-input")).toMatch(/^c[\da-f]+$/);
	});

	test("should be deterministic for the same input", () => {
		expect(createClassName("same-input")).toBe(
			createClassName("same-input"),
		);
	});

	test("should produce different hashes for different inputs", () => {
		expect(createClassName("input-a")).not.toBe(createClassName("input-b"));
	});
});

describe(createDeclaration, () => {
	test("should convert camelCase property to kebab-case", () => {
		expect(
			createDeclaration({ name: "backgroundColor", value: "red" }),
		).toBe("background-color:red;");
	});

	test("should append px unit to numeric values for dimensional properties", () => {
		expect(createDeclaration({ name: "width", value: 100 })).toBe(
			"width:100px;",
		);
	});

	test("should not append px for unitless properties", () => {
		expect(createDeclaration({ name: "opacity", value: 0.5 })).toBe(
			"opacity:0.5;",
		);
	});

	test("should keep string values as-is", () => {
		expect(createDeclaration({ name: "display", value: "flex" })).toBe(
			"display:flex;",
		);
	});
});

describe(createCustomProperties, () => {
	test("should create CSS custom property names from nested theme keys", () => {
		const collected: [string, unknown][] = [];

		createCustomProperties(
			{ colors: { primary: "blue", secondary: "red" } },
			(name, value) => collected.push([name, value]),
		);

		expect(collected).toContainEqual(["--colors-primary", "blue"]);
		expect(collected).toContainEqual(["--colors-secondary", "red"]);
	});

	test("should return an output map with var() references", () => {
		const output = createCustomProperties(
			{ spacings: { sm: "4px" } },
			() => {
				// noop
			},
		);

		expect(output.spacings.sm).toBe("var(--spacings-sm)");
	});

	test("should escape special characters in key names", () => {
		const collected: [string, unknown][] = [];

		createCustomProperties({ "spacings-1.5": "2rem" }, (name) =>
			collected.push([name, null]),
		);

		expect(collected[0]?.[0]).toBe("--spacings-1-5");
	});
});

describe(getEvaluatedTemplate, () => {
	test("should replace coulis[selector] and coulis[declaration] markers", () => {
		const template = "coulis[selector]:hover{coulis[declaration]}";

		expect(
			getEvaluatedTemplate(template, {
				declaration: "color:red;",
				selector: ".c123",
			}),
		).toBe(".c123:hover{color:red;}");
	});

	test("should replace multiple occurrences", () => {
		const template =
			"coulis[selector][alt]{coulis[declaration]}coulis[selector]{coulis[declaration]}";

		expect(
			getEvaluatedTemplate(template, {
				declaration: "color:red;",
				selector: ".c123",
			}),
		).toBe(".c123[alt]{color:red;}.c123{color:red;}");
	});
});

describe(minify, () => {
	test("should remove newlines", () => {
		expect(minify("a {\n  color: red;\n}")).toBe("a{color: red;}");
	});

	test("should collapse multiple spaces", () => {
		expect(minify("a {  color:  red; }")).toBe("a{color:red; }");
	});

	test("should remove whitespace before opening braces", () => {
		expect(minify("a {color: red;}")).toBe("a{color: red;}");
	});
});
