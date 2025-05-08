import { ORDERED_STYLESHEET_IDS, createStyleSheet } from "./stylesheet";
import type { StyleSheet, StyleSheetIdentifier } from "./stylesheet";

type Coulis = {
	getStyleSheet: (id: StyleSheetIdentifier) => StyleSheet;
	getStyleSheetIds: () => readonly StyleSheetIdentifier[];
};

/**
 * Factory to create an aggregate instance to manage invariants for all style operations.
 * @returns The coulis instance.
 * @example
 *  const coulis = createCoulis();
 */
export const createCoulis = (): Coulis => {
	const styleSheets = new Map<StyleSheetIdentifier, StyleSheet>(
		ORDERED_STYLESHEET_IDS.map((id) => {
			return [id, createStyleSheet(id)];
		}),
	);

	return {
		getStyleSheet(id: StyleSheetIdentifier) {
			return styleSheets.get(id) as StyleSheet;
		},
		getStyleSheetIds() {
			return ORDERED_STYLESHEET_IDS;
		},
	};
};

export const coulis = createCoulis();
