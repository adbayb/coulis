import { IS_BROWSER_ENV, IS_PROD_ENV } from "../constants";

/**
 * The order is important. Global properties has a lesser specificity than (<) shorthand ones:
 * global < shorthand < longhand < conditional-shorthand < conditional-longhand properties.
 */
const INSERTION_ORDER_BY_TYPE = Object.freeze({
	conditionalLonghand: 4,
	conditionalShorthand: 3,
	global: 0,
	longhand: 2,
	shorthand: 1,
});

export type StyleSheetType = keyof typeof INSERTION_ORDER_BY_TYPE;

export type StyleSheet = {
	commit: (rule: string) => void;
	element: HTMLStyleElement | null;
	get: () => string;
	type: StyleSheetType;
};

export type StyleSheets = Record<StyleSheetType, StyleSheet>;

export const createStyleSheets = (): StyleSheets => {
	const createStyleSheet = IS_BROWSER_ENV
		? createWebStyleSheet()
		: createVirtualStyleSheet();

	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const collection = {} as StyleSheets;

	const types = (
		Object.keys(INSERTION_ORDER_BY_TYPE) as StyleSheetType[]
	).sort((a, b) => {
		return INSERTION_ORDER_BY_TYPE[a] - INSERTION_ORDER_BY_TYPE[b];
	});

	for (const type of types) {
		collection[type] = createStyleSheet(type);
	}

	return collection;
};

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

		return {
			commit(rule: string) {
				if (IS_PROD_ENV && element.sheet) {
					// Faster, more reliable (check rule insertion order (e.g. "@import" must be inserted first)), but not debug friendly
					element.sheet.insertRule(
						rule,
						element.sheet.cssRules.length,
					);
				} else {
					element.insertAdjacentHTML("beforeend", rule);
				}
			},
			element,
			get() {
				return element.innerText;
			},
			type,
		};
	};
};
