export type CacheKey = string;

type CacheRecord = Set<CacheKey>; // TODO: transform to Map

export type Cache = {
	add: (key: CacheKey) => void;
	flush: () => void;
	getValues: () => string[];
	has: (key: CacheKey) => boolean;
	toString: () => string;
};

export const createCache = (initialValues: string[]): Cache => {
	let cache: CacheRecord = new Set(initialValues);

	return {
		add(key) {
			cache.add(key);
		},
		flush() {
			cache = new Set();
		},
		getValues() {
			return [...cache.values()];
		},
		has(key) {
			return cache.has(key);
		},
		toString() {
			return Array.from(cache).join();
		},
	};
};
