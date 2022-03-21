import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";

export type StyleSheetType =
	| "global"
	| "shorthand"
	| "longhand"
	| "conditionalShorthand"
	| "conditionalLonghand";

export interface StyleSheet {
	commit: (rule: string) => void;
	get: () => string;
	element: HTMLStyleElement | null;
	type: StyleSheetType;
}

export type StyleSheetCollection = Record<StyleSheetType, StyleSheet>;

const createVirtualStyleSheet = (type: StyleSheetType): StyleSheet => {
	const target: typeof createVirtualStyleSheet.slots[number] = [];

	createVirtualStyleSheet.slots[type] = target;

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

// @todo: avoid appending already inserted rules
const createWebStyleSheet = (type: StyleSheetType): StyleSheet => {
	let element = document.querySelector<HTMLStyleElement>(
		`style[data-type="${type}"][data-coulis]`
	);

	if (element === null) {
		element = document.createElement("style");
		element.dataset.type = type;
		element.dataset.coulis = "";
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
			return target.innerText;
		},
		element,
		type,
	};
};

export const createStyleSheet = (): StyleSheetCollection => {
	const create = IS_BROWSER_ENV
		? createWebStyleSheet
		: createVirtualStyleSheet;

	// @note: The order is important for following lines.
	// Global has a lesser specificity than (<) shorthand properties:
	// global < shorthand < longhand < conditional-shorthand < conditional-longhand properties
	return {
		global: create("global"),
		shorthand: create("shorthand"),
		longhand: create("longhand"),
		conditionalShorthand: create("conditionalShorthand"),
		conditionalLonghand: create("conditionalLonghand"),
	};
};
