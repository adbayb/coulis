import type { ClassName, CreateStyleSheet, Rule } from "../types";

export const createVirtualStyleSheet: CreateStyleSheet = () => {
	const ruleByClassName = new Map<ClassName, Rule>();

	return {
		getContent() {
			return minify([...ruleByClassName.values()].join(""));
		},
		getHydratedClassNames() {
			return [];
		},
		insert(key, rule) {
			ruleByClassName.set(key, rule);
		},
		remove() {
			ruleByClassName.clear();
		},
	};
};

const minify = (value: string) => {
	return value.replaceAll(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};
