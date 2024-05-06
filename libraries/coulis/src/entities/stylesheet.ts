import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";
import type { ScopeKey } from "../types";

import type { ClassName } from "./className";

export type StyleSheet = {
	commit: (key: string, rule: string) => void;
	element: HTMLStyleElement | null;
	flush: () => void;
	getAttributes: (
		cachedKeys?: string,
	) => Record<"data-coulis-cache" | "data-coulis-scope", string>;
	getContent: () => string;
	hydrate: () => string[];
};

type CreateStyleSheet = (scope: ScopeKey) => StyleSheet;

const createVirtualStyleSheet: CreateStyleSheet = (scope) => {
	const cache = new Set<ClassName>();
	let rules: string[] = [];

	return {
		commit(key, rule) {
			if (cache.has(key)) return;

			cache.add(key);
			rules.push(rule);
		},
		element: null,
		flush() {
			cache.clear();
			rules = [];
		},
		getAttributes() {
			return {
				"data-coulis-cache": [...cache.keys()].join(","),
				"data-coulis-scope": scope,
			};
		},
		getContent() {
			return minify(rules.join(""));
		},
		hydrate() {
			return [];
		},
	};
};

const createWebStyleSheet: CreateStyleSheet = (scope) => {
	const cache = new Set<ClassName>();

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
			if (cache.has(key)) return;

			if (IS_PROD_ENV && element.sheet) {
				// Faster, more reliable (check rule insertion order (e.g. "@import" must be inserted first)), but not debug friendly
				element.sheet.insertRule(rule, element.sheet.cssRules.length);
			} else {
				element.insertAdjacentHTML("beforeend", rule);
			}

			cache.add(key);
		},
		element,
		flush() {
			cache.clear();
			element.remove();
		},
		getAttributes() {
			return {
				"data-coulis-cache": element.dataset.coulisCache as string,
				"data-coulis-scope": element.dataset.scope as ScopeKey,
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
