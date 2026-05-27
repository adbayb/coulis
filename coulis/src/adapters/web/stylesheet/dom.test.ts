// @vitest-environment happy-dom
import { afterEach, describe, expect, test, vi } from "vitest";

import { createDomStyleSheet } from "./dom";

const longhandSelector = 'style[data-coulis-type="longhand"]';
const redColorRule = ".c1{color:red;}";

describe(createDomStyleSheet, () => {
	afterEach(() => {
		document.head.innerHTML = "";
	});

	test("should create a <style> element in <head>", () => {
		createDomStyleSheet("longhand");

		expect(document.head.querySelector(longhandSelector)).not.toBeNull();
	});

	test("should reuse an existing <style> element on repeated calls", () => {
		createDomStyleSheet("longhand");
		createDomStyleSheet("longhand");

		expect(document.head.querySelectorAll(longhandSelector)).toHaveLength(
			1,
		);
	});

	test("should getContent include pending rules before flush", () => {
		const sheet = createDomStyleSheet("longhand");

		sheet.insert("c1", redColorRule);

		expect(sheet.getContent()).toContain(redColorRule);
	});

	test("should flush pending rules to the DOM via queueMicrotask", async () => {
		const sheet = createDomStyleSheet("longhand");

		const element =
			document.head.querySelector<HTMLStyleElement>(longhandSelector);

		sheet.insert("c1", redColorRule);
		sheet.insert("c2", ".c2{display:flex;}");

		expect(element?.textContent).toBe("");

		await Promise.resolve(); // flush microtasks

		expect(element?.textContent).toContain(redColorRule);
		expect(element?.textContent).toContain(".c2{display:flex;}");
	});

	test("should batch multiple inserts into one DOM write", async () => {
		const sheet = createDomStyleSheet("longhand");

		const element = document.head.querySelector<HTMLStyleElement>(
			longhandSelector,
		) as HTMLStyleElement;

		const spy = vi.spyOn(element, "insertAdjacentText");

		sheet.insert("c1", redColorRule);
		sheet.insert("c2", ".c2{display:flex;}");
		sheet.insert("c3", ".c3{margin:0;}");

		await Promise.resolve();

		expect(spy).toHaveBeenCalledExactlyOnceWith(
			"beforeend",
			".c1{color:red;}.c2{display:flex;}.c3{margin:0;}",
		);
	});

	test("should getHydratedClassNames should return empty array when data-coulis-cache is empty", () => {
		const sheet = createDomStyleSheet("longhand");

		expect(sheet.getHydratedClassNames()).toStrictEqual([]);
	});

	test("should getHydratedClassNames split data-coulis-cache by comma", () => {
		const element = document.createElement("style");

		element.dataset.coulisCache = "c1,c2,c3";
		element.dataset.coulisType = "shorthand";
		document.head.append(element);

		const sheet = createDomStyleSheet("shorthand");

		expect(sheet.getHydratedClassNames()).toStrictEqual(["c1", "c2", "c3"]);
	});

	test("should remove detach the element and clear pending rules", async () => {
		const sheet = createDomStyleSheet("longhand");

		sheet.insert("c1", redColorRule);
		sheet.remove();

		await Promise.resolve();

		expect(document.head.querySelector(longhandSelector)).toBeNull();
	});
});
