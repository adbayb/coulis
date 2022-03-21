import { IS_BROWSER_ENV } from "../constants";
import { StyleSheetCollection, StyleSheetType } from "./stylesheet";

type CacheEntry = Record<string, StyleSheetType>;

export interface Cache {
	set(key: string, target: StyleSheetType): void;
	has(key: string): boolean;
	entries(): CacheEntry;
}

const hydrate = (styleSheets: StyleSheetCollection): CacheEntry => {
	const sheets = Object.values(styleSheets);
	const hydratedCache: CacheEntry = {};

	sheets.forEach(({ element, type }) => {
		if (!element) return;

		const keys = element.dataset.keys;

		if (!keys) return;

		keys.split(",").forEach((key) => {
			hydratedCache[key] = type;
		});
	});

	return hydratedCache;
};

export const createCache = (styleSheets: StyleSheetCollection): Cache => {
	const cache: CacheEntry = IS_BROWSER_ENV ? hydrate(styleSheets) : {};

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
