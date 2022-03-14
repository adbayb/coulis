import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";

export type StyleSheetType =
	| "global"
	| "shorthand"
	| "longhand"
	| "conditional";

export interface StyleSheetAdapter {
	commit: (rule: string) => void;
	get: () => string;
	element: HTMLStyleElement | null;
	type: StyleSheetType;
}

export type StyleSheet = Record<StyleSheetType, StyleSheetAdapter>;

const createVirtualStyleSheet = (type: StyleSheetType): StyleSheetAdapter => {
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

const createWebStyleSheet = (type: StyleSheetType): StyleSheetAdapter => {
	let element = document.querySelector<HTMLStyleElement>(
		`[data-coulis-type=${type}]`
	);

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

export const createStyleSheet = (): StyleSheet => {
	const create = IS_BROWSER_ENV
		? createWebStyleSheet
		: createVirtualStyleSheet;
	// @note: The order is important for following lines.
	// Global has a lesser specificity than (<) shorthand properties:
	// global < shorthand < longhand properties
	const globalSheet = create("global");
	const shorthandSheet = create("shorthand");
	const longhandSheet = create("longhand");
	// @todo: remove conditional sheet. The property name should be checked instead and dispatched either in long/short or global sheet
	const conditionalSheet = create("conditional");

	return {
		global: globalSheet,
		longhand: longhandSheet,
		shorthand: shorthandSheet,
		conditional: conditionalSheet,
	};
};
