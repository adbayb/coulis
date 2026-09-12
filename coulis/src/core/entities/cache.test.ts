import { describe, expect, test } from "vitest";
import { createMapCache, createSetCache } from "./cache";

describe(createSetCache, () => {
	test("should add and find a key", () => {
		const cache = createSetCache<string>();

		cache.set("key1");
		expect(cache.has("key1")).toBe(true);
	});

	test("should return false for a missing key", () => {
		const cache = createSetCache<string>();

		expect(cache.has("missing")).toBe(false);
	});

	test("should deduplicate identical keys", () => {
		const cache = createSetCache<string>();

		cache.set("key1");
		cache.set("key1");
		expect(cache.getValues()).toStrictEqual(["key1"]);
	});

	test("should return all keys in insertion order", () => {
		const cache = createSetCache<string>();

		cache.set("a");
		cache.set("b");
		cache.set("c");
		expect(cache.getValues()).toStrictEqual(["a", "b", "c"]);
	});

	test("should delete a specific key", () => {
		const cache = createSetCache<string>();

		cache.set("key1");
		cache.set("key2");
		cache.delete("key1");
		expect(cache.has("key1")).toBe(false);
		expect(cache.has("key2")).toBe(true);
	});

	test("should clear all keys", () => {
		const cache = createSetCache<string>();

		cache.set("key1");
		cache.set("key2");
		cache.clear();
		expect(cache.getValues()).toStrictEqual([]);
	});
});

describe(createMapCache, () => {
	test("should add and retrieve a value", () => {
		const cache = createMapCache<string, number>();

		cache.set("key1", 42);
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

		cache.set("key1", 1);
		cache.set("key1", 99);
		expect(cache.get("key1")).toBe(99);
	});

	test("should return all values in insertion order", () => {
		const cache = createMapCache<string, number>();

		cache.set("a", 1);
		cache.set("b", 2);
		cache.set("c", 3);
		expect(cache.getValues()).toStrictEqual([1, 2, 3]);
	});

	test("should delete a specific key", () => {
		const cache = createMapCache<string, number>();

		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.delete("key1");
		expect(cache.has("key1")).toBe(false);
		expect(cache.has("key2")).toBe(true);
	});

	test("should clear all keys", () => {
		const cache = createMapCache<string, number>();

		cache.set("key1", 1);
		cache.set("key2", 2);
		cache.clear();
		expect(cache.getValues()).toStrictEqual([]);
	});
});
