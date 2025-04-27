import { createStyleSheet } from "./stylesheet";
import type { StyleSheet, StyleSheetIdentifier } from "./stylesheet";

type Coulis = {
	getStyleSheet: (id: StyleSheetIdentifier) => StyleSheet;
	getStyleSheetIds: () => StyleSheetIdentifier[];
};

/**
 * Factory to create an aggregate instance to manage invariants for all style operations.
 * @returns The coulis instance.
 * @example
 *  const coulis = createCoulis();
 */
export const createCoulis = (): Coulis => {
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

	return {
		getStyleSheet(id: StyleSheetIdentifier) {
			return styleSheets[id];
		},
		getStyleSheetIds() {
			return ids;
		},
	};
};

export const coulis = createCoulis();
