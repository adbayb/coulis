import { minify } from "../helpers";
import { IS_BROWSER_ENVIRONMENT } from "../constants";
import { createClassName } from "./style";
import type { ClassName } from "./style";
import { createCache } from "./cache";
import type { CacheKey } from "./cache";

type Rule = string;

export type StyleSheetIdentifier =
	| "atLonghand"
	| "atShorthand"
	| "global"
	| "longhand"
	| "shorthand";

export type StyleSheet = {
	id: StyleSheetIdentifier;
	commit: (
		key: CacheKey,
		createRule: (className: string) => Rule,
	) => ClassName;
	delete: () => void;
	getAttributes: (
		cachedKeys?: string,
	) => Record<"data-coulis-cache" | "data-coulis-id", string>;
	getContent: () => string;
};

type StyleSheetTarget = {
	delete: () => void;
	getContent: () => string;
	getHydratedClassNames: () => CacheKey[];
	insert: (className: ClassName, rule: Rule) => void;
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

	const hydratedClassNames = styleSheetTarget.getHydratedClassNames();
	const cache = createCache();

	return {
		id,
		commit(key, createRule) {
			let className = cache.get(key);

			if (className) return className;

			className = createClassName(key);

			cache.add(key, className);

			if (hydratedClassNames.includes(className)) return className;

			styleSheetTarget.insert(className, createRule(className));

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
	let rules: Record<ClassName, Rule> = {};

	return {
		delete() {
			rules = {};
		},
		getContent() {
			return minify(Object.values(rules).join(""));
		},
		getHydratedClassNames() {
			return [];
		},
		insert(className, rule) {
			rules[className] = rule;
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
		getHydratedClassNames() {
			const source = element.dataset.coulisCache;

			if (!source) return [];

			return source.split(",");
		},
		insert(_, rule) {
			/**
			 * `insertAdjacentText` is the most performant API for appending text.
			 * @see {@link https://esbench.com/bench/680c1080545f8900a4de2ce6 Benchmark}
			 */
			// eslint-disable-next-line unicorn/prefer-modern-dom-apis
			element.insertAdjacentText("beforeend", rule);
		},
	};
};
