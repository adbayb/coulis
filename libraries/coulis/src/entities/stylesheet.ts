import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";
import type { ScopeKey } from "../types";

export type StyleSheet = {
	commit: (rule: string) => void;
	element: HTMLStyleElement | null;
	flush: () => void;
	getAttributes: (
		cachedKeys?: string,
	) => Record<"data-coulis-cache" | "data-coulis-scope", string | undefined>;
	getContent: () => string;
	hydrate: () => string[];
};

type CreateStyleSheet = (scope: ScopeKey) => StyleSheet;

const createVirtualStyleSheet: CreateStyleSheet = (scope) => {
	let data: string[] = [];

	return {
		commit(rule: string) {
			data.push(rule);
		},
		element: null,
		flush() {
			data = [];
		},
		getAttributes(cachedKeys) {
			return {
				"data-coulis-cache": cachedKeys,
				"data-coulis-scope": scope,
			};
		},
		getContent() {
			return minify(data.join(""));
		},
		hydrate() {
			return [];
		},
	};
};

const createWebStyleSheet: CreateStyleSheet = (scope) => {
	let element = document.querySelector<HTMLStyleElement>(
		`style[data-coulis-scope="${scope}"]`,
	);

	if (!element) {
		element = document.createElement("style");
		element.dataset.coulisCache = "";
		element.dataset.coulisScope = scope;
		document.head.appendChild(element);
	}

	const getCacheDataFromElement = () => element.dataset.coulisCache;

	return {
		commit(rule: string) {
			if (IS_PROD_ENV && element.sheet) {
				// Faster, more reliable (check rule insertion order (e.g. "@import" must be inserted first)), but not debug friendly
				element.sheet.insertRule(rule, element.sheet.cssRules.length);
			} else {
				element.insertAdjacentHTML("beforeend", rule);
			}
		},
		element,
		flush() {
			element.remove();
		},
		getAttributes() {
			return {
				"data-coulis-cache": getCacheDataFromElement(),
				"data-coulis-scope": element.dataset.scope,
			};
		},
		getContent() {
			return element.innerText;
		},
		hydrate() {
			const source = getCacheDataFromElement();

			if (!source) return [];

			return source.split(",");
		},
	};
};

export const createStyleSheet: CreateStyleSheet = IS_BROWSER_ENV
	? createWebStyleSheet
	: createVirtualStyleSheet;

const minify = (value: string) => {
	return value.replace(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};
