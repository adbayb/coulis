import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";

// @todo: globalStyleElement
export interface StyleSheetAdapter {
	commit: (rule: string) => void;
	getDeclarationBlock: () => string;
}

export type StyleSheetKey = "global" | "shorthand" | "longhand" | "conditional";

const createVirtualStyleSheet = (key: StyleSheetKey): StyleSheetAdapter => {
	const target: typeof createVirtualStyleSheet.slots[number] = [];

	createVirtualStyleSheet.slots[key] = target;

	return {
		commit(rule: string) {
			target.push(rule);
		},
		getDeclarationBlock() {
			return target.join("");
		},
	};
};

createVirtualStyleSheet.slots = {} as Record<string, string[]>;

const createWebStyleSheet = (key: StyleSheetKey): StyleSheetAdapter => {
	let element = document.querySelector(
		`[data-coulis=${key}]`
	) as HTMLStyleElement | null;

	// @todo: rehydration in case of element !== null
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
		getDeclarationBlock() {
			// @todo: to check, retrieve declaration block other ways
			return target.innerText;
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
	return `<style data-coulis="${key}">${value}</style>`;
};
