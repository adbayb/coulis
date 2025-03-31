import { minify } from "../helpers";
import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";
import { createClassName } from "./style";
import type { ClassName } from "./style";
import { createCache } from "./cache";
import type { Cache, CacheKey } from "./cache";

type StyleSheetIdentifier =
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
		document.head.append(element);
	}

	return {
		flush() {
			element.remove();
		},
		getContent() {
			// TODO: replace
			// eslint-disable-next-line unicorn/prefer-dom-node-text-content
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
 * Aggregate to scope and manage invariants for a given stylesheet instance.
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
		atLonghand: 4,
		atShorthand: 3,
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
