import { IS_BROWSER_ENV } from "../constants";
import { StyleSheet, StyleSheetType } from "./stylesheet";

type CacheEntry = Record<string, StyleSheetType>;

export interface CacheAdapter {
	set(key: string, target: StyleSheetType): void;
	has(key: string): boolean;
	entries(): CacheEntry;
}

const hydrate = (styleSheet: StyleSheet): CacheEntry => {
	const sheets = Object.values(styleSheet);
	const hydratedCache: CacheEntry = {};

	sheets.forEach(({ element, type }) => {
		if (!element) {
			return;
		}

		const keys = element.dataset.coulisKeys?.split(",") || [];

		keys.forEach((key) => {
			hydratedCache[key] = type;
		});
	});

	return hydratedCache;
};

export const createCache = (styleSheet: StyleSheet): CacheAdapter => {
	const cache: CacheEntry = IS_BROWSER_ENV ? hydrate(styleSheet) : {};

	return {
		set(key, target: StyleSheetType) {
			cache[key] = target;
		},
		has(key) {
			return Boolean(cache[key]);
		},
		entries() {
			return cache;
		},
	};
};
