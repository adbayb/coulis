import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";
import { minify } from "../helpers";

export interface StyleSheetAdapter {
	commit: (rule: string, cacheKey: string) => void;
	getCss: () => string;
	getKeys: () => string[];
}

export type StyleSheetKey = "global" | "shorthand" | "longhand" | "conditional";

export type StyleSheets = Record<StyleSheetKey, StyleSheetAdapter>;

const createVirtualStyleSheet = (key: StyleSheetKey): StyleSheetAdapter => {
	const target: typeof createVirtualStyleSheet.slots[number] = [];
	const cacheKeys: string[] = [];

	createVirtualStyleSheet.slots[key] = target;

	return {
		commit(rule: string, cacheKey: string) {
			target.push(rule);
			cacheKeys.push(cacheKey);
		},
		getCss() {
			return target.join("");
		},
		getKeys() {
			return cacheKeys;
		},
	};
};

createVirtualStyleSheet.slots = {} as Record<string, string[]>;

const createWebStyleSheet = (key: StyleSheetKey): StyleSheetAdapter => {
	let element = document.querySelector(
		`[data-coulis=${key}]`
	) as HTMLStyleElement | null;

	if (element === null) {
		element = document.createElement("style");
		element.dataset.coulis = key;
		document.head.appendChild(element);
	}

	const target = element;

	return {
		commit(rule: string) {
			if (IS_PROD_ENV) {
				target.sheet!.insertRule(rule);
			} else {
				// stl.innerHTML = `${stl.innerHTML}${rule}`;
				// stl.appendChild(document.createTextNode(rule));
				// @note: faster than other insertion alternatives https://jsperf.com/insertadjacenthtml-perf/22 :
				target.insertAdjacentHTML("beforeend", rule);
			}
		},
		getCss() {
			// @todo: to check, retrieve declaration block other ways
			return target.innerText;
		},
		getKeys() {
			// @note: not needed now in stylesheet level since hydratation is done on mount at a global level
			return [];
		},
	};
};

export const createStyleSheets = (): Record<
	StyleSheetKey,
	StyleSheetAdapter
> => {
	const createStyleSheet = IS_BROWSER_ENV
		? createWebStyleSheet
		: createVirtualStyleSheet;
	const globalSheet = createStyleSheet("global");
	const longhandSheet = createStyleSheet("longhand");
	const shorthandSheet = createStyleSheet("shorthand");
	const conditionalSheet = createStyleSheet("conditional");

	return {
		global: globalSheet,
		longhand: longhandSheet,
		shorthand: shorthandSheet,
		conditional: conditionalSheet,
	};
};

export const stringifyStyle = (key: StyleSheetKey, value: string) => {
	return `<style data-coulis="${key}">${minify(value)}</style>`;
};
