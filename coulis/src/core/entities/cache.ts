export type SetCache<Key extends string> = {
	add: (key: Key) => void;
	getAll: () => Key[];
	has: (key: Key) => boolean;
	remove: (key: Key) => void;
	removeAll: () => void;
	removeAllExcept: (keys: Key[]) => void;
};

/**
 * Factory to create a set cache instance to manage caching operations.
 * @returns The cache instance.
 * @example
 * 	const cache = createSetCache();
 * 	cache.add("key");
 */
export const createSetCache = <Key extends string>(): SetCache<Key> => {
	const cache = new Set<Key>();

	const getKeys = () => {
		return [...cache.keys()];
	};

	const getAll: SetCache<Key>["getAll"] = () => {
		return [...cache.values()];
	};

	const remove: SetCache<Key>["remove"] = (key) => {
		cache.delete(key);
	};

	return {
		add(key) {
			cache.add(key);
		},
		getAll,
		has(key) {
			return cache.has(key);
		},
		remove,
		removeAll() {
			cache.clear();
		},
		removeAllExcept(keys: Key[]) {
			getKeys()
				.filter((key) => !keys.includes(key))
				.forEach((key) => {
					remove(key);
				});
		},
	};
};

export type MapCache<Key extends string, Value> = {
	add: (key: Key, value: Value) => void;
	get: (key: Key) => Value | undefined;
	getAll: () => Value[];
	has: (key: Key) => boolean;
	remove: (key: Key) => void;
	removeAll: () => void;
	removeAllExcept: (keys: Key[]) => void;
};

/**
 * Factory to create a map cache instance to manage caching operations.
 * @returns The cache instance.
 * @example
 * 	const cache = createMapCache();
 * 	cache.add("key", "value");
 */
export const createMapCache = <Key extends string, Value>(): MapCache<
	Key,
	Value
> => {
	const cache = new Map<Key, Value>();

	const getKeys = () => {
		return [...cache.keys()];
	};

	const getAll: MapCache<Key, Value>["getAll"] = () => {
		return [...cache.values()];
	};

	const remove: MapCache<Key, Value>["remove"] = (key) => {
		cache.delete(key);
	};

	return {
		add(key, value) {
			cache.set(key, value);
		},
		get(key) {
			return cache.get(key);
		},
		getAll,
		has(key) {
			return cache.has(key);
		},
		remove,
		removeAll() {
			cache.clear();
		},
		removeAllExcept(keys: Key[]) {
			getKeys()
				.filter((key) => !keys.includes(key))
				.forEach((key) => {
					remove(key);
				});
		},
	};
};
