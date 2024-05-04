import type { ScopeKey } from "../types";

import { createClassName } from "./className";
import type { ClassName } from "./className";
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
	commit: (params: {
		key: string;
		createRules: (className: string) => string[];
	}) => ClassName;
	styleSheet: StyleSheet;
};

// TODO: rename to `createStyleSheets` and move it in stylesheet file
const createScopes = () => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const scopes = {} as Record<ScopeKey, Scope>;

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
 * @returns Cache, stylesheet instances and methods.
 * @example
 *  createScope("global");
 */
const createScope = (key: ScopeKey): Scope => {
	// TODO: remove cache and scope, and rely only on createStyleSheet: the cache should be internalized within createXXXStyleSheet factory (already for createWebStyleSheet, missing for createVirtualStyleSheet)
	const styleSheet = createStyleSheet(key);

	return {
		commit(params) {
			const className = createClassName(params.key);
			const rules = params.createRules(className);

			for (const rule of rules) {
				styleSheet.commit(className, rule);
			}

			return className;
		},
		styleSheet,
	};
};

export const SCOPES = createScopes();
