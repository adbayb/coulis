import { IS_BROWSER_ENV } from "../constants";

import type { StyleSheetCollection, StyleSheetType } from "./stylesheet";

type CacheEntry = Record<string, StyleSheetType>;

export type Cache = {
	entries: () => CacheEntry;
	has: (key: string) => boolean;
	set: (key: string, target: StyleSheetType) => void;
};

const hydrate = (styleSheets: StyleSheetCollection): CacheEntry => {
	const sheets = Object.values(styleSheets);
	const hydratedCache: CacheEntry = {};

	sheets.forEach(({ element, type }) => {
		if (!element) return;

		const keys = element.dataset.coulis;

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
		entries() {
			return cache;
		},
		has(key) {
			return Boolean(cache[key]);
		},
		set(key, target: StyleSheetType) {
			cache[key] = target;
		},
	};
};
