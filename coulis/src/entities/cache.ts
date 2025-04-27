export type CacheKey = string;

type CacheValue = string;

export type Cache = {
	add: (key: CacheKey, value: CacheValue) => void;
	flush: () => void;
	get: (key: CacheKey) => CacheValue | undefined;
	getAll: () => CacheValue[];
	has: (key: CacheKey) => boolean;
	toString: () => string;
};

/**
 * Factory to create a cache instance to manage caching operations.
 * @returns The cache instance.
 * @example
 * 	const cache = createCache();
 * 	cache.add("key", "value");
 */
export const createCache = (): Cache => {
	const cache = new Map<CacheKey, string>();

	const getAll = () => {
		return [...cache.values()];
	};

	return {
		add(key, value) {
			cache.set(key, value);
		},
		flush() {
			cache.clear();
		},
		get(key) {
			return cache.get(key);
		},
		getAll,
		has(key) {
			return cache.has(key);
		},
		toString() {
			return getAll().join(",");
		},
	};
};
