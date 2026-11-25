import { describe, expect, test } from "vitest";
import { createStyleSheet } from "./stylesheet";

describe("createStyleSheet (server)", () => {
	test("should return empty metadata initially", () => {
		expect(createStyleSheet("longhand").getMetadata()).toStrictEqual({
			classNames: [],
			content: "",
		});
	});

	test("should accumulate inserted rules once", () => {
		const sheet = createStyleSheet("longhand");

		sheet.setRule("c1", createRedColorRule);
		sheet.setRule("c2", createFlexDisplayRule);
		sheet.setRule("c1", createFlexDisplayRule);

		expect(sheet.getMetadata()).toStrictEqual({
			classNames: ["c1", "c2"],
			content: ".c1{color:red;}.c2{display:flex;}",
		});
	});

	test("should only keep included rules", () => {
		const sheet = createStyleSheet("longhand");

		sheet.setRule("c1", createRedColorRule);
		sheet.setRule("c2", createFlexDisplayRule);

		expect(sheet.getMetadata(new Set(["c2"]))).toStrictEqual({
			classNames: ["c2"],
			content: ".c2{display:flex;}",
		});
	});

	test("should escape `<` to not close the <style> element", () => {
		const sheet = createStyleSheet("longhand");

		sheet.setRule("c1", () => {
			return '.c1{content:"</style>";}';
		});

		expect(sheet.getMetadata().content).toBe(String.raw`.c1{content:"\3C /style>";}`);
	});

	test("should remove rules", () => {
		const sheet = createStyleSheet("global");

		sheet.setRule("c1", createRedColorRule);
		sheet.removeRule("c1", ".c1{color:red;}");
		expect(sheet.getMetadata().content).toBe("");
	});
});

const createRedColorRule = (className: string) => {
	return `.${className}{color:red;}`;
};

const createFlexDisplayRule = (className: string) => {
	return `.${className}{display:flex;}`;
};
