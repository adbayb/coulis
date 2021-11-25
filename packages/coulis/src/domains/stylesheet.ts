import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";

// @todo: rename StyleSheetKey to StyleSheetType
// @todo: StyleSheets should be an array and not record + use mapping to set order { global: 0, shorthand: 1, ...}
// following points TBC:
// @todo: remove data-coulis-type inside dom since order is deterministic (global is always the first...)
// @todo: rename data-coulis-keys to data-coulis
export type StyleSheetKey = "global" | "shorthand" | "longhand" | "conditional";
export interface StyleSheetAdapter {
	commit: (rule: string) => void;
	get: () => string;
	element: HTMLStyleElement | null;
	type: StyleSheetKey;
}

export type StyleSheets = Record<StyleSheetKey, StyleSheetAdapter>;

const createVirtualStyleSheet = (type: StyleSheetKey): StyleSheetAdapter => {
	const target: typeof createVirtualStyleSheet.slots[number] = [];

	createVirtualStyleSheet.slots[type] = target;
	createVirtualStyleSheet.prototype.valueOf = () => 2;

	return {
		commit(rule: string) {
			target.push(rule);
		},
		get() {
			return target.join("");
		},
		element: null,
		type,
	};
};

createVirtualStyleSheet.slots = {} as Record<string, string[]>;

const createWebStyleSheet = (type: StyleSheetKey): StyleSheetAdapter => {
	let element = document.querySelector(
		`[data-coulis-type=${type}]`
	) as HTMLStyleElement | null;

	if (element === null) {
		element = document.createElement("style");
		element.dataset.coulisType = type;
		document.head.appendChild(element);
	}

	const target = element;

	return {
		commit(rule: string) {
			if (IS_PROD_ENV) {
				target.sheet?.insertRule(rule);
			} else {
				// stl.innerHTML = `${stl.innerHTML}${rule}`;
				// stl.appendChild(document.createTextNode(rule));
				// @note: faster than other insertion alternatives https://jsperf.com/insertadjacenthtml-perf/22 :
				target.insertAdjacentHTML("beforeend", rule);
			}
		},
		get() {
			// @todo: to check, retrieve declaration block other ways
			return target.innerText;
		},
		element,
		type,
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
