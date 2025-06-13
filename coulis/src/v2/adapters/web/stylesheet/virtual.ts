import type { ClassName, CreateStyleSheet, Rule } from "./types";

export const createVirtualStyleSheet: CreateStyleSheet = () => {
	const ruleCache = new Map<ClassName, Rule>();

	return {
		getContent() {
			return minify([...ruleCache.values()].join(""));
		},
		getHydratedClassNames() {
			return [];
		},
		insert(key, rule) {
			ruleCache.set(key, rule);
		},
		remove() {
			ruleCache.clear();
		},
	};
};

const minify = (value: string) => {
	return value.replaceAll(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};
