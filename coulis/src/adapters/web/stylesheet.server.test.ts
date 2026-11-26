import { describe, expect, test } from "vitest";
import { createStyleSheet } from "./stylesheet";

describe("createStyleSheet (server)", () => {
	test("should accumulate inserted rules once", () => {
		const sheet = createStyleSheet("longhand");

		sheet.setRule("c1", createRedColorRule);
		sheet.setRule("c2", createFlexDisplayRule);
		sheet.setRule("c1", createFlexDisplayRule);

		expect(sheet.serialize()).toStrictEqual({
			cache: "c1,c2",
			content: ".c1{color:red;}.c2{display:flex;}",
		});
	});

	test("should only keep included rules", () => {
		const sheet = createStyleSheet("longhand");

		sheet.setRule("c1", createRedColorRule);
		sheet.setRule("c2", createFlexDisplayRule);

		expect(sheet.serialize(new Set(["c2"]))).toStrictEqual({
			cache: "c2",
			content: ".c2{display:flex;}",
		});
	});

	test("should keep the rules included after a previous serialization of the same class names", () => {
		const sheet = createStyleSheet("longhand");
		const usedClassNames = new Set(["c1", "c2"]);

		sheet.setRule("c1", createRedColorRule);
		expect(sheet.serialize(usedClassNames).cache).toBe("c1");
		expect(sheet.serialize(usedClassNames)).toBe(sheet.serialize(usedClassNames));
		expect(sheet.serialize().cache).toBe("c1");
		sheet.setRule("c2", createFlexDisplayRule);
		expect(sheet.serialize(usedClassNames).cache).toBe("c1,c2");
		expect(sheet.serialize(new Set(["c2"])).cache).toBe("c2");
		expect(sheet.serialize().cache).toBe("c1,c2");
	});

	test("should remove rules", () => {
		const sheet = createStyleSheet("global");

		sheet.setRule("c1", createRedColorRule);
		expect(sheet.serialize().content).toBe(".c1{color:red;}");
		sheet.removeRule("c1", ".c1{color:red;}");
		expect(sheet.serialize().content).toBe("");
	});

	test("should always keep global rules", () => {
		const sheet = createStyleSheet("global");

		sheet.setRule("c1", createRedColorRule);

		expect(sheet.serialize(new Set())).toStrictEqual({
			cache: "c1",
			content: ".c1{color:red;}",
		});
	});
});

const createRedColorRule = (className: string) => {
	return `.${className}{color:red;}`;
};

const createFlexDisplayRule = (className: string) => {
	return `.${className}{display:flex;}`;
};
