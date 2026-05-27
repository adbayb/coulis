import { describe, expect, test } from "vitest";

import { createMapCache, createSetCache } from "./cache";

describe(createSetCache, () => {
	test("should add and find a key", () => {
		const cache = createSetCache<string>();

		cache.add("key1");

		expect(cache.has("key1")).toBe(true);
	});

	test("should return false for a missing key", () => {
		const cache = createSetCache<string>();

		expect(cache.has("missing")).toBe(false);
	});

	test("should deduplicate identical keys", () => {
		const cache = createSetCache<string>();

		cache.add("key1");
		// eslint-disable-next-line sonarjs/no-element-overwrite
		cache.add("key1");

		expect(cache.getAll()).toStrictEqual(["key1"]);
	});

	test("should return all keys in insertion order", () => {
		const cache = createSetCache<string>();

		cache.add("a");
		cache.add("b");
		cache.add("c");

		expect(cache.getAll()).toStrictEqual(["a", "b", "c"]);
	});

	test("should remove a specific key", () => {
		const cache = createSetCache<string>();

		cache.add("key1");
		cache.add("key2");
		cache.remove("key1");

		expect(cache.has("key1")).toBe(false);
		expect(cache.has("key2")).toBe(true);
	});

	test("should remove all keys", () => {
		const cache = createSetCache<string>();

		cache.add("key1");
		cache.add("key2");
		cache.removeAll();

		expect(cache.getAll()).toStrictEqual([]);
	});
});

describe(createMapCache, () => {
	test("should add and retrieve a value", () => {
		const cache = createMapCache<string, number>();

		cache.add("key1", 42);

		expect(cache.get("key1")).toBe(42);
	});

	test("should return undefined for a missing key", () => {
		const cache = createMapCache<string, number>();

		expect(cache.get("missing")).toBeUndefined();
	});

	test("should return false for has() on a missing key", () => {
		const cache = createMapCache<string, number>();

		expect(cache.has("missing")).toBe(false);
	});

	test("should overwrite an existing key", () => {
		const cache = createMapCache<string, number>();

		cache.add("key1", 1);
		cache.add("key1", 99);

		expect(cache.get("key1")).toBe(99);
	});

	test("should return all values in insertion order", () => {
		const cache = createMapCache<string, number>();

		cache.add("a", 1);
		cache.add("b", 2);
		cache.add("c", 3);

		expect(cache.getAll()).toStrictEqual([1, 2, 3]);
	});

	test("should remove a specific key", () => {
		const cache = createMapCache<string, number>();

		cache.add("key1", 1);
		cache.add("key2", 2);
		cache.remove("key1");

		expect(cache.has("key1")).toBe(false);
		expect(cache.has("key2")).toBe(true);
	});

	test("should remove all keys", () => {
		const cache = createMapCache<string, number>();

		cache.add("key1", 1);
		cache.add("key2", 2);
		cache.removeAll();

		expect(cache.getAll()).toStrictEqual([]);
	});
});
