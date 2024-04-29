import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";
import type { ScopeKey } from "../types";

export type StyleSheet = {
	commit: (key: string, rule: string) => void;
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
		commit(_, rule) {
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

	return {
		commit(key, rule) {
			const cacheData = element.dataset.coulisCache;
			const cacheSplitKeys = cacheData?.split(",");

			// Manage cache via data attribute to persist it in the same manner as server-side to prevent any existing style rules re-insertion
			// in case of hot reload update (which reset the global scope including in-memory cache)
			if (cacheSplitKeys?.includes(key)) return;

			if (IS_PROD_ENV && element.sheet) {
				// Faster, more reliable (check rule insertion order (e.g. "@import" must be inserted first)), but not debug friendly
				element.sheet.insertRule(rule, element.sheet.cssRules.length);
			} else {
				element.insertAdjacentHTML("beforeend", rule);
			}

			element.dataset.coulisCache = `${cacheData},${key}`;
		},
		element,
		flush() {
			element.remove();
		},
		getAttributes() {
			return {
				"data-coulis-cache": element.dataset.coulisCache,
				"data-coulis-scope": element.dataset.scope,
			};
		},
		getContent() {
			return element.innerText;
		},
		hydrate() {
			const source = element.dataset.coulisCache;

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
