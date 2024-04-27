import type { StyleSheet } from "./stylesheet";

type CacheKey = string;

type CacheRecord = Set<CacheKey>;

export type Cache = {
	add: (key: CacheKey) => void;
	flush: () => void;
	has: (key: CacheKey) => boolean;
	toString: () => string;
};

export const createCache = (styleSheet: StyleSheet): Cache => {
	let cache: CacheRecord = new Set(styleSheet.hydrate());

	return {
		add(key) {
			cache.add(key);
		},
		flush() {
			cache = new Set();
		},
		has(key) {
			return cache.has(key);
		},
		toString() {
			return Array.from(cache).join();
		},
	};
};
