import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";

export type StyleSheetType = keyof typeof INSERTION_ORDER_BY_TYPE;

export type StyleSheet = {
	commit: (rule: string) => void;
	element: HTMLStyleElement | null;
	get: () => string;
	type: StyleSheetType;
};

export type StyleSheetCollection = Record<StyleSheetType, StyleSheet>;

export const createStyleSheetCollection = (): StyleSheetCollection => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const collection = {} as StyleSheetCollection;
	const types = Object.keys(INSERTION_ORDER_BY_TYPE) as StyleSheetType[];

	for (const type of types) {
		collection[type] = createStyleSheet(type);
	}

	return collection;
};

// @note: The order is important. Global properties has a lesser specificity than (<) shorthand ones:
// global < shorthand < longhand < conditional-shorthand < conditional-longhand properties
const INSERTION_ORDER_BY_TYPE = Object.freeze({
	conditionalLonghand: 4,
	conditionalShorthand: 3,
	global: 0,
	longhand: 2,
	shorthand: 1,
});

const createVirtualStyleSheet = () => {
	const slots: Record<string, string[]> = {};

	return (type: StyleSheetType): StyleSheet => {
		const target: (typeof slots)[number] = [];

		slots[type] = target;

		return {
			commit(rule: string) {
				target.push(rule);
			},
			element: null,
			get() {
				return target.join("");
			},
			type,
		};
	};
};

const createWebStyleSheet = () => {
	const elements =
		document.querySelectorAll<HTMLStyleElement>(`style[data-coulis]`);

	return (type: StyleSheetType): StyleSheet => {
		let element = elements[INSERTION_ORDER_BY_TYPE[type]];

		if (!element) {
			element = document.createElement("style");
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
			element,
			get() {
				return target.innerText;
			},
			type,
		};
	};
};

const createStyleSheet = IS_BROWSER_ENV
	? createWebStyleSheet()
	: createVirtualStyleSheet();
