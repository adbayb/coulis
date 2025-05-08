export type CacheKey = string;

export type Cache<Value> = {
	add: (key: CacheKey, value: Value) => void;
	get: (key: CacheKey) => Value | undefined;
	getKeys: () => CacheKey[];
	getValues: () => Value[];
	has: (key: CacheKey) => boolean;
	remove: (key: CacheKey) => void;
	removeAll: () => void;
	removeAllExcept: (keys: CacheKey[]) => void;
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

	const getKeys: Cache<Value>["getKeys"] = () => {
		return [...cache.keys()];
	};

	const getValues: Cache<Value>["getValues"] = () => {
		return [...cache.values()];
	};

	const remove: Cache<Value>["remove"] = (key) => {
		cache.delete(key);
	};

	return {
		add(key, value) {
			cache.set(key, value);
		},
		get(key) {
			return cache.get(key);
		},
		getKeys,
		getValues,
		has(key) {
			return cache.has(key);
		},
		remove,
		removeAll() {
			cache.clear();
		},
		removeAllExcept(keys: CacheKey[]) {
			getKeys()
				.filter((key) => !keys.includes(key))
				.forEach((key) => {
					remove(key);
				});
		},
		toString() {
			return getValues().join(",");
		},
	};
};
