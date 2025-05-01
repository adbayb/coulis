export type CacheKey = string;

export type Cache<Value> = {
	add: (key: CacheKey, value: Value) => void;
	delete: (key: CacheKey) => void;
	deleteAll: () => void;
	get: (key: CacheKey) => Value | undefined;
	getAll: () => Value[];
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
export const createCache = <Value = string>(): Cache<Value> => {
	const cache = new Map<CacheKey, Value>();

	const getAll = () => {
		return [...cache.values()];
	};

	return {
		add(key, value) {
			cache.set(key, value);
		},
		delete(key) {
			cache.delete(key);
		},
		deleteAll() {
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
