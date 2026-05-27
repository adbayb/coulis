import { describe, expect, test } from "vitest";

import { createVirtualStyleSheet } from "./virtual";

const redColorRule = ".c1{color:red;}";

describe(createVirtualStyleSheet, () => {
	test("should return empty content initially", () => {
		const sheet = createVirtualStyleSheet("longhand");

		expect(sheet.getContent()).toBe("");
	});

	test("should accumulate inserted rules", () => {
		const sheet = createVirtualStyleSheet("longhand");

		sheet.insert("c1", redColorRule);
		sheet.insert("c2", ".c2{display:flex;}");

		expect(sheet.getContent()).toContain(redColorRule);
		expect(sheet.getContent()).toContain(".c2{display:flex;}");
	});

	test("should return minified content", () => {
		const sheet = createVirtualStyleSheet("longhand");

		sheet.insert("c1", ".c1 {\n  color:red;\n}");

		expect(sheet.getContent()).toBe(".c1{color:red;}");
	});

	test("should cache minified content between calls", () => {
		const sheet = createVirtualStyleSheet("longhand");

		sheet.insert("c1", redColorRule);

		const first = sheet.getContent();
		const second = sheet.getContent();

		expect(first).toBe(second);
	});

	test("should invalidate cache after a new insert", () => {
		const sheet = createVirtualStyleSheet("longhand");

		sheet.insert("c1", redColorRule);

		const before = sheet.getContent();

		sheet.insert("c2", ".c2{display:flex;}");

		const after = sheet.getContent();

		expect(after).not.toBe(before);
		expect(after).toContain(".c2{display:flex;}");
	});

	test("should always return empty hydrated class names", () => {
		const sheet = createVirtualStyleSheet("longhand");

		expect(sheet.getHydratedClassNames()).toStrictEqual([]);
	});

	test("should clear all rules on remove", () => {
		const sheet = createVirtualStyleSheet("longhand");

		sheet.insert("c1", redColorRule);
		sheet.remove();

		expect(sheet.getContent()).toBe("");
	});

	test("should invalidate cache on remove", () => {
		const sheet = createVirtualStyleSheet("longhand");

		sheet.insert("c1", redColorRule);

		const before = sheet.getContent();

		sheet.remove();

		expect(sheet.getContent()).not.toBe(before);
	});
});
