import { IS_BROWSER_ENV } from "../constants";

export interface CacheAdapter {
	set(className: string): void;
	has(className: string): boolean;
}

type CacheEntry = Record<string, boolean>;

const createVirtualCache = (): CacheAdapter => {
	const cache: CacheEntry = {};

	return {
		set(className) {
			cache[className] = true;
		},
		has(className) {
			return cache[className];
		},
	};
};

const createWebCache = (): CacheAdapter => {
	const cache: CacheEntry = {};

	return {
		set(className) {
			cache[className] = true;
		},
		has(className) {
			return cache[className];
		},
	};
};

export const createCache = (): CacheAdapter => {
	return IS_BROWSER_ENV ? createWebCache() : createVirtualCache();
};
