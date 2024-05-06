import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";
import type { ScopeKey } from "../types";

import { createCache } from "./cache";
import type { Cache, CacheKey } from "./cache";
import { createClassName } from "./className";
import type { ClassName } from "./className";

type StyleSheetIdentifier = ScopeKey; // TODO: internalize and remove ScopeKey type

export type StyleSheet = {
	id: StyleSheetIdentifier;
	cache: Cache;
	commit: (params: {
		key: CacheKey;
		createRules: (className: string) => string[] | string;
	}) => ClassName;
	flush: () => void;
	getAttributes: (
		cachedKeys?: string,
	) => Record<"data-coulis-cache" | "data-coulis-id", string>;
	target: StyleSheetTarget;
};

export type StyleSheetTarget = {
	flush: () => void;
	getContent: () => string;
	getHydrationInput: () => string[];
	insert: (rule: string) => void;
};

type CreateStyleSheet = (id: StyleSheetIdentifier) => StyleSheetTarget;

const createVirtualStyleSheetTarget: CreateStyleSheet = () => {
	let rules: string[] = [];

	return {
		flush() {
			rules = [];
		},
		getContent() {
			return minify(rules.join(""));
		},
		getHydrationInput() {
			return [];
		},
		insert(rule) {
			rules.push(rule);
		},
	};
};

const createWebStyleSheetTarget: CreateStyleSheet = (id) => {
	let element = document.querySelector<HTMLStyleElement>(
		`style[data-coulis-id="${id}"]`,
	);

	if (!element) {
		element = document.createElement("style");
		element.dataset.coulisCache = "";
		element.dataset.coulisId = id;
		document.head.appendChild(element);
	}

	return {
		flush() {
			element.remove();
		},
		getContent() {
			return element.innerText;
		},
		getHydrationInput() {
			const source = element.dataset.coulisCache;

			if (!source) return [];

			return source.split(",");
		},
		insert(rule) {
			if (IS_PROD_ENV && element.sheet) {
				// Faster, more reliable (check rule insertion order (e.g. "@import" must be inserted first)), but not debug friendly
				element.sheet.insertRule(rule, element.sheet.cssRules.length);
			} else {
				element.insertAdjacentHTML("beforeend", rule);
			}
		},
	};
};

/**
 * Aggregate to scope and manage invariants for a given coulis instance.
 * @param id - The identifier representing the targetted style.
 * @returns Cache, stylesheet instances and methods.
 * @example
 *  createStyleSheet("global");
 */
export const createStyleSheet = (id: StyleSheetIdentifier): StyleSheet => {
	const styleSheetTarget = (
		IS_BROWSER_ENV
			? createWebStyleSheetTarget
			: createVirtualStyleSheetTarget
	)(id);

	const cache = createCache(styleSheetTarget.getHydrationInput());

	return {
		id,
		cache,
		commit(params) {
			const className = createClassName(params.key);

			if (cache.has(className)) return className;

			const rules = params.createRules(className);

			if (typeof rules === "string") {
				styleSheetTarget.insert(rules);
			} else {
				for (const rule of rules) {
					styleSheetTarget.insert(rule);
				}
			}

			cache.add(className);

			return className;
		},
		flush() {
			cache.flush();
			styleSheetTarget.flush();
		},
		getAttributes() {
			return {
				"data-coulis-cache": cache.getValues().join(","),
				"data-coulis-id": id,
			};
		},
		target: styleSheetTarget,
	};
};

export const createStyleSheets = (): Record<
	StyleSheetIdentifier,
	StyleSheet
> => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const styleSheets = {} as Record<StyleSheetIdentifier, StyleSheet>;

	/**
	 * The insertion order is important to enforce the more precise properties take precedence over less precise ones.
	 * Global properties has a lesser specificity than (<) shorthand ones:
	 * global (e.g div { background-color }) < shorthand (e.g background) < longhand (e.g background-color) < conditional-shorthand (e.g @media { background }) < conditional-longhand (e.g @media { background-color }) properties.
	 */
	const INSERTION_ORDER_BY_ID = Object.freeze({
		conditionalLonghand: 4,
		conditionalShorthand: 3,
		global: 0,
		longhand: 2,
		shorthand: 1,
	});

	const ids = (
		Object.keys(INSERTION_ORDER_BY_ID) as StyleSheetIdentifier[]
	).sort((a, b) => {
		return INSERTION_ORDER_BY_ID[a] - INSERTION_ORDER_BY_ID[b];
	});

	for (const id of ids) {
		styleSheets[id] = createStyleSheet(id);
	}

	return styleSheets;
};

export const STYLESHEETS = createStyleSheets();

const minify = (value: string) => {
	return value.replace(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};
