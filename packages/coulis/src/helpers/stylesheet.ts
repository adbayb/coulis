import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";

// @todo: globalStyleElement
export interface StyleSheetAdapter {
	commit: (rule: string) => void;
	getDeclarationBlock: () => string;
}

export type StyleSheetKey = "global" | "shorthand" | "longhand" | "conditional";

class VirtualStyleSheet implements StyleSheetAdapter {
	static inMemoryCache: Record<string, string[]> = {};
	target: typeof VirtualStyleSheet.inMemoryCache["global"];

	constructor(key: StyleSheetKey) {
		this.target = [];
		VirtualStyleSheet.inMemoryCache[key] = this.target;
	}

	commit(rule: string) {
		this.target.push(rule);
	}

	getDeclarationBlock() {
		return this.target.join("");
	}
}

class WebStyleSheet implements StyleSheetAdapter {
	target: HTMLStyleElement;

	constructor(key: StyleSheetKey) {
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
		if (IS_PROD_ENV) {
			this.target.sheet!.insertRule(rule);
		} else {
			// stl.innerHTML = `${stl.innerHTML}${rule}`;
			// stl.appendChild(document.createTextNode(rule));
			// @note: faster than other insertion alternatives https://jsperf.com/insertadjacenthtml-perf/22 :
			this.target.insertAdjacentHTML("beforeend", rule);
		}
	}

	getDeclarationBlock() {
		// @todo: to check, retrieve declaration block other ways
		return this.target.innerText;
	}
}

export const createStyleSheets = (): Record<
	StyleSheetKey,
	StyleSheetAdapter
> => {
	const StyleSheet = IS_BROWSER_ENV ? WebStyleSheet : VirtualStyleSheet;
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

export const stringifyStyle = (key: StyleSheetKey, value: string) => {
	return `<style data-coulis="${key}">${value}</style>`;
};
