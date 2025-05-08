import { minify } from "../helpers";
import { IS_BROWSER_ENVIRONMENT } from "../constants";
import { createClassName } from "./style";
import type { ClassName } from "./style";
import { createCache } from "./cache";
import type { CacheKey } from "./cache";

type Rule = string;

/**
 * The insertion order is important to enforce the more precise properties take precedence over less precise ones.
 * Global properties has a lesser specificity than (<) shorthand ones:
 * global (e.g div { background-color }) < shorthand (e.g background) < longhand (e.g background-color) < conditional-shorthand (e.g @media { background }) < conditional-longhand (e.g @media { background-color }) properties.
 */
export const ORDERED_STYLESHEET_IDS = Object.freeze([
	"global",
	"shorthand",
	"longhand",
	"atShorthand",
	"atLonghand",
] as const);

export type StyleSheetIdentifier = (typeof ORDERED_STYLESHEET_IDS)[number];

export type StyleSheet = {
	id: StyleSheetIdentifier;
	commit: (
		key: CacheKey,
		createRule: (className: string) => Rule,
	) => ClassName;
	getAttributes: () => Record<"data-coulis-cache" | "data-coulis-id", string>;
	getCacheKeys: () => CacheKey[];
	getContent: () => string;
	remove: (preservableCacheKeys: CacheKey[]) => void;
};

type StyleSheetTarget = {
	getContent: () => string;
	getHydratedClassNames: () => CacheKey[];
	insert: (className: ClassName, rule: Rule) => void;
	remove: (preservableCacheKeys: CacheKey[]) => void;
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

	const classNameCache = createCache<ClassName>();
	const hydratedClassNames = styleSheetTarget.getHydratedClassNames();

	return {
		id,
		commit(key, createRule) {
			let className = classNameCache.get(key);

			if (className) return className;

			className = createClassName(key);

			classNameCache.add(key, className);

			if (hydratedClassNames.includes(className)) return className;

			styleSheetTarget.insert(key, createRule(className));

			return className;
		},
		getAttributes() {
			return {
				"data-coulis-cache": classNameCache.getValues().join(","),
				"data-coulis-id": id,
			};
		},
		getCacheKeys() {
			return classNameCache.getKeys();
		},
		getContent() {
			return styleSheetTarget.getContent();
		},
		remove(preservableCacheKeys) {
			classNameCache.removeAllExcept(preservableCacheKeys);
			styleSheetTarget.remove(preservableCacheKeys);
		},
	};
};

type CreateStyleSheetTarget = (id: StyleSheetIdentifier) => StyleSheetTarget;

const createVirtualStyleSheetTarget: CreateStyleSheetTarget = () => {
	const ruleCache = createCache<Rule>();

	return {
		getContent() {
			return minify(ruleCache.getValues().join(""));
		},
		getHydratedClassNames() {
			return [];
		},
		insert(key, rule) {
			ruleCache.add(key, rule);
		},
		remove(preservableCacheKeys) {
			ruleCache.removeAllExcept(preservableCacheKeys);
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
		remove() {
			element.remove();
		},
	};
};
