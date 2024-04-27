import type { ScopeKey } from "../types";

import { createCache } from "./cache";
import type { Cache } from "./cache";
import { createStyleSheet } from "./stylesheet";
import type { StyleSheet } from "./stylesheet";

/**
 * The order is important. Global properties has a lesser specificity than (<) shorthand ones:
 * global < shorthand < longhand < conditional-shorthand < conditional-longhand properties.
 */
const INSERTION_ORDER_BY_SCOPE = Object.freeze({
	conditionalLonghand: 4,
	conditionalShorthand: 3,
	global: 0,
	longhand: 2,
	shorthand: 1,
});

export type Scope = {
	cache: Cache;
	styleSheet: StyleSheet;
};

export const createScopes = () => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const scopes = {} as Record<
		ScopeKey,
		{ cache: Cache; styleSheet: StyleSheet }
	>;

	const scopeKeys = (
		Object.keys(INSERTION_ORDER_BY_SCOPE) as ScopeKey[]
	).sort((a, b) => {
		return INSERTION_ORDER_BY_SCOPE[a] - INSERTION_ORDER_BY_SCOPE[b];
	});

	for (const scopeKey of scopeKeys) {
		scopes[scopeKey] = createScope(scopeKey);
	}

	return scopes;
};

/**
 * Aggregate to scope and manage invariants for a given coulis instance.
 * @param key - The scope key representing the targetted style.
 * @returns Scoped cache and stylesheet instances.
 * @example
 *  createScope("global");
 */
const createScope = (key: ScopeKey): Scope => {
	const styleSheet = createStyleSheet(key);

	return {
		cache: createCache(styleSheet),
		styleSheet,
	};
};
