import { IS_DEV_ENV, IS_INMEMORY_ENV } from "../constants";

// @todo: globalStyleElement
export interface StyleSheetAdapter {
	commit: (rule: string) => void;
}

type StyleSheetType = "global" | "shorthand" | "longhand" | "conditional";

class VirtualStyleSheet implements StyleSheetAdapter {
	static inMemoryCache: Record<string, string[]> = {};
	target: typeof VirtualStyleSheet.inMemoryCache["global"];

	constructor(key: StyleSheetType) {
		this.target = [];
		VirtualStyleSheet.inMemoryCache[key] = this.target;
	}

	commit(rule: string) {
		this.target.push(rule);
	}
}

class WebStyleSheet implements StyleSheetAdapter {
	target: HTMLStyleElement;

	constructor(key: StyleSheetType) {
		let element = document.querySelector(
			`[data-coulis=${key}]`
		) as HTMLStyleElement | null;

		// @todo: rehydration in case of element !== null
		if (element === null) {
			element = document.createElement("style");
			element.dataset.coulis = key;
			document.head.appendChild(element);
		}

		this.target = element;
	}

	commit(rule: string) {
		if (IS_DEV_ENV) {
			// stl.innerHTML = `${stl.innerHTML}${rule}`;
			// stl.appendChild(document.createTextNode(rule));
			// @note: faster than other insertion alternatives https://jsperf.com/insertadjacenthtml-perf/22 :
			this.target.insertAdjacentHTML("beforeend", rule);
		} else {
			this.target.sheet!.insertRule(rule);
		}
	}
}

export const getStyleSheet = (): Record<StyleSheetType, StyleSheetAdapter> => {
	const StyleSheet = IS_INMEMORY_ENV ? VirtualStyleSheet : WebStyleSheet;
	const globalSheet = new StyleSheet("global");
	const longhandSheet = new StyleSheet("longhand");
	const shorthandSheet = new StyleSheet("shorthand");
	const conditionalSheet = new StyleSheet("conditional");

	return {
		global: globalSheet,
		longhand: longhandSheet,
		shorthand: shorthandSheet,
		conditional: conditionalSheet,
	};
};
