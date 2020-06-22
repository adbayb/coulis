import { IS_BROWSER_ENV } from "../constants";
import { StyleSheetKey, StyleSheets } from "./stylesheet";

type CacheEntry = Record<string, StyleSheetKey>;

export interface CacheAdapter {
	set(key: string, target: StyleSheetKey): void;
	has(key: string): boolean;
	entries(): CacheEntry;
}

const hydrate = (styleSheets: StyleSheets): CacheEntry => {
	const sheets = Object.values(styleSheets);
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

export const createCache = (styleSheets: StyleSheets): CacheAdapter => {
	const cache: CacheEntry = IS_BROWSER_ENV ? hydrate(styleSheets) : {};

	return {
		set(key, target: StyleSheetKey) {
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
