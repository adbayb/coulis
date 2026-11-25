// @vitest-environment happy-dom
import { afterEach, describe, expect, test, vi } from "vitest";
import { createCoulis } from "./create-coulis";
import { createStyleSheet } from "./stylesheet";

describe("createStyleSheet (browser)", () => {
	afterEach(() => {
		document.head.innerHTML = "";
		document.body.innerHTML = "";
	});

	test("should create one <style> element per type in <head>", () => {
		createStyleSheet("longhand");
		createStyleSheet("longhand");
		expect(document.head.querySelectorAll(longhandSelector)).toHaveLength(1);
	});

	test("should insert atomic rules synchronously", () => {
		const sheet = createStyleSheet("longhand");

		sheet.setRule("c1", () => {
			return redColorRule;
		});

		sheet.setRule("c2", () => {
			return flexDisplayRule;
		});

		expect(getCssRules(longhandSelector)).toStrictEqual([
			".c1 { color: red; }",
			".c2 { display: flex; }",
		]);

		expect(sheet.serialize()).toStrictEqual({
			classNames: ["c1", "c2"],
			content: redColorRule + flexDisplayRule,
		});
	});

	test("should ignore invalid atomic rules", () => {
		const sheet = createStyleSheet("longhand");

		vi.spyOn(CSSStyleSheet.prototype, "insertRule").mockImplementationOnce(() => {
			throw new SyntaxError("Failed to parse the rule");
		});

		expect(() => {
			sheet.setRule("c1", () => {
				return ":-unknown-pseudo{}";
			});
		}).not.toThrow();
	});

	test("should insert global rules synchronously as text", () => {
		const sheet = createStyleSheet("global");

		sheet.setRule("g1", () => {
			return globalRule;
		});

		expect(getGlobalText()).toBe(globalRule);
	});

	test("should remove a global rule", () => {
		const sheet = createStyleSheet("global");

		sheet.setRule("g1", () => {
			return globalRule;
		});

		sheet.setRule("g2", () => {
			return ".x{color:blue;}";
		});

		sheet.removeRule("g1", globalRule);
		expect(getGlobalText()).toBe(".x{color:blue;}");

		sheet.setRule("g1", () => {
			return globalRule;
		});

		expect(getGlobalText()).toBe(`.x{color:blue;}${globalRule}`);
	});

	test("should remove a global rule serialized by the server", () => {
		appendStyleElement("global", "g1", String.raw`a::after{content:"\3C ";}`);

		const sheet = createStyleSheet("global");

		sheet.removeRule("g1", 'a::after{content:"<";}');
		expect(getGlobalText()).toBe("");
	});

	test("should not insert class names hydrated from data-coulis-cache", () => {
		appendStyleElement("longhand", "c1,c2", "");

		const sheet = createStyleSheet("longhand");

		const createRule = vi.fn(() => {
			return redColorRule;
		});

		sheet.setRule("c1", createRule);
		expect(createRule).not.toHaveBeenCalled();
		expect(sheet.serialize()).toStrictEqual({ classNames: [], content: "" });
	});

	test("should share inserted rules across sheets of the same element", () => {
		createStyleSheet("longhand").setRule("c1", () => {
			return redColorRule;
		});

		createStyleSheet("longhand").setRule("c1", () => {
			return flexDisplayRule;
		});

		expect(getCssRules(longhandSelector)).toStrictEqual([".c1 { color: red; }"]);
	});

	test("should apply styles before the next layout read", () => {
		const { createStyles } = createStatefulWebInstance();
		const element = document.createElement("div");

		document.body.append(element);
		element.className = createStyles({ color: "red" });
		expect(getComputedStyle(element).color).toBe("red");
	});

	test("should not reinsert styles hydrated from server metadata", () => {
		const server = createStatefulWebInstance();
		const className = server.createStyles({ color: "red" });
		const serverStyleSheets = server.getStyleSheets();

		document.head.innerHTML = "";

		for (const { attributes, content } of serverStyleSheets) {
			appendStyleElement(
				attributes["data-coulis-type"],
				attributes["data-coulis-cache"],
				content,
			);
		}

		const client = createStatefulWebInstance();

		expect(client.createStyles({ color: "red" })).toBe(className);
		expect(getCssRules(longhandSelector)).toStrictEqual([`.${className} { color: red; }`]);
	});
});

const longhandSelector = 'style[data-coulis-type="longhand"]';
const globalSelector = 'style[data-coulis-type="global"]';
const redColorRule = ".c1{color:red;}";
const flexDisplayRule = ".c2{display:flex;}";
const globalRule = "html,body{margin:0;}";

const getGlobalText = () => {
	return document.head.querySelector(globalSelector)?.textContent;
};

const appendStyleElement = (type: string, cache: string, content: string) => {
	const element = document.createElement("style");

	element.dataset.coulisCache = cache;
	element.dataset.coulisType = type;
	element.textContent = content;
	document.head.append(element);
};

const getCssRules = (selector: string) => {
	const rules = document.head.querySelector<HTMLStyleElement>(selector)?.sheet?.cssRules ?? [];

	return Array.from(rules, (rule) => {
		return rule.cssText;
	});
};

const createStatefulWebInstance = () => {
	return createCoulis({
		properties() {
			return { color: true };
		},
		states: {
			"": "@media print{coulis[selector]{coulis[declaration]}}",
		},
	});
};
