import { minify } from "../helpers";
import { IS_BROWSER_ENVIRONMENT } from "../constants";
import { createClassName } from "./style";
import type { ClassName } from "./style";
import { createCache } from "./cache";
import type { Cache, CacheKey } from "./cache";

export type StyleSheetIdentifier =
	| "atLonghand"
	| "atShorthand"
	| "global"
	| "longhand"
	| "shorthand";

export type StyleSheet = {
	id: StyleSheetIdentifier;
	cache: Cache;
	commit: (parameters: {
		key: CacheKey;
		createRules: (className: string) => string[] | string;
	}) => ClassName;
	flush: () => void;
	getAttributes: (
		cachedKeys?: string,
	) => Record<"data-coulis-cache" | "data-coulis-id", string>;
	getContent: () => string;
};

type StyleSheetTarget = {
	flush: () => void;
	getContent: () => string;
	getHydrationInput: () => string[];
	insert: (rule: string) => void;
};

/**
 * Factory to create a style sheet instance depending on the running platform (browser vs. Server).
 * @param id - The identifier representing the targetted style.
 * @returns Cache, stylesheet instances and methods.
 * @example
 *  createStyleSheet("global");
 */
export const createStyleSheet = (id: StyleSheetIdentifier): StyleSheet => {
	const styleSheetTarget: StyleSheetTarget = (
		IS_BROWSER_ENVIRONMENT
			? createWebStyleSheetTarget
			: createVirtualStyleSheetTarget
	)(id);

	const hydrationInput = styleSheetTarget.getHydrationInput();
	const cache = createCache();

	return {
		id,
		cache,
		commit(parameters) {
			let className = cache.get(parameters.key);

			if (className) return className;

			className = createClassName(parameters.key);

			cache.add(parameters.key, className);

			if (hydrationInput.includes(className)) {
				return className;
			}

			const rules = parameters.createRules(className);

			if (typeof rules === "string") {
				styleSheetTarget.insert(rules);
			} else {
				for (const rule of rules) {
					styleSheetTarget.insert(rule);
				}
			}

			return className;
		},
		flush() {
			cache.flush();
			styleSheetTarget.flush();
		},
		getAttributes() {
			return {
				"data-coulis-cache": cache.getAll().join(","),
				"data-coulis-id": id,
			};
		},
		getContent() {
			return styleSheetTarget.getContent();
		},
	};
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
		document.head.append(element);
	}

	return {
		flush() {
			element.remove();
		},
		getContent() {
			/**
			 * `textContent` is more performant than `innerText` (no layout reflow).
			 * @see {@link https://esbench.com/bench/680c1f4e545f8900a4de2cf7 Benchmark}
			 */
			return element.textContent ?? "";
		},
		getHydrationInput() {
			const source = element.dataset.coulisCache;

			if (!source) return [];

			return source.split(",");
		},
		insert(rule) {
			/**
			 * `insertAdjacentText` is the most performant API for appending text.
			 * @see {@link https://esbench.com/bench/680c1080545f8900a4de2ce6 Benchmark}
			 */
			// eslint-disable-next-line unicorn/prefer-modern-dom-apis
			element.insertAdjacentText("beforeend", rule);
		},
	};
};
