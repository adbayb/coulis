export type SetCache<Key extends string> = {
	clear: () => void;
	delete: (key: Key) => void;
	getValues: () => Key[];
	has: (key: Key) => boolean;
	set: (key: Key) => void;
};

/**
 * Factory to create a set cache instance to manage caching operations.
 *
 * @example
 * 	const cache = createSetCache();
 * 	cache.set("key");
 *
 * @returns The cache instance.
 */
export const createSetCache = <Key extends string>(): SetCache<Key> => {
	const cache = new Set<Key>();

	return {
		clear() {
			cache.clear();
		},
		delete(key) {
			cache.delete(key);
		},
		getValues() {
			return [...cache];
		},
		has(key) {
			return cache.has(key);
		},
		set(key) {
			cache.add(key);
		},
	};
};

export type MapCache<Key extends string, Value> = {
	clear: () => void;
	delete: (key: Key) => void;
	get: (key: Key) => undefined | Value;
	getValues: () => Value[];
	has: (key: Key) => boolean;
	set: (key: Key, value: Value) => void;
};

/**
 * Factory to create a map cache instance to manage caching operations.
 *
 * @example
 * 	const cache = createMapCache();
 * 	cache.set("key", "value");
 *
 * @returns The cache instance.
 */
export const createMapCache = <Key extends string, Value>(): MapCache<Key, Value> => {
	const cache = new Map<Key, Value>();

	return {
		clear() {
			cache.clear();
		},
		delete(key) {
			cache.delete(key);
		},
		get(key) {
			return cache.get(key);
		},
		getValues() {
			return [...cache.values()];
		},
		has(key) {
			return cache.has(key);
		},
		set(key, value) {
			cache.set(key, value);
		},
	};
};
