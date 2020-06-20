import { IS_BROWSER_ENV } from "../constants";
import { StyleSheets } from "./stylesheet";

type CacheEntry = Record<string, boolean>;

export interface CacheAdapter {
	set(className: string): void;
	has(className: string): boolean;
	entries(): CacheEntry;
}

const hydrate = (styleSheets: StyleSheets): CacheEntry => {
	console.log(styleSheets);
	// Array.from($0.sheet.rules).map(rule => rule.selectorText)

	return {};
};

export const createCache = (styleSheets: StyleSheets): CacheAdapter => {
	const cache: CacheEntry = IS_BROWSER_ENV ? hydrate(styleSheets) : {};

	return {
		set(className) {
			cache[className] = true;
		},
		has(className) {
			return cache[className];
		},
		entries() {
			return cache;
		},
	};
};
