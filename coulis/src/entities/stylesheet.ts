import { minify } from "../helpers";
import { IS_BROWSER_ENVIRONMENT } from "../constants";
import { createClassName } from "./style";
import type { ClassName } from "./style";
import { createCache } from "./cache";
import type { CacheKey } from "./cache";

export type StyleSheetIdentifier =
	| "atLonghand"
	| "atShorthand"
	| "global"
	| "longhand"
	| "shorthand";

export type StyleSheet = {
	id: StyleSheetIdentifier;
	commit: (parameters: {
		key: CacheKey;
		createRule: (className: string) => string;
	}) => ClassName;
	delete: () => void;
	getAttributes: (
		cachedKeys?: string,
	) => Record<"data-coulis-cache" | "data-coulis-id", string>;
	getContent: () => string;
};

type StyleSheetTarget = {
	delete: () => void;
	getContent: () => string;
	getHydrationInput: () => string[];
	insert: (rule: string) => void;
};

/**
 * Factory to create a style sheet instance depending on the running platform (browser vs. Server).
 * @param id - The identifier representing the targetted style.
 * @returns StyleSheet instance.
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
		commit({ key, createRule }) {
			let className = cache.get(key);

			if (className) return className;

			className = createClassName(key);

			cache.add(key, className);

			if (hydrationInput.includes(className)) return className;

			styleSheetTarget.insert(createRule(className));

			return className;
		},
		delete() {
			cache.deleteAll();
			styleSheetTarget.delete();
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

type CreateStyleSheetTarget = (id: StyleSheetIdentifier) => StyleSheetTarget;

const createVirtualStyleSheetTarget: CreateStyleSheetTarget = () => {
	let rules: string[] = [];

	return {
		delete() {
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

const createWebStyleSheetTarget: CreateStyleSheetTarget = (id) => {
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
		delete() {
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
