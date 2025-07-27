import type { ClassName, CreateStyleSheet, Rule } from "../types";
import { createMapCache } from "../../../core/entities/cache";

export const createVirtualStyleSheet: CreateStyleSheet = () => {
	const ruleByClassName = createMapCache<ClassName, Rule>();

	return {
		getContent() {
			return minify([...ruleByClassName.getAll()].join(""));
		},
		getHydratedClassNames() {
			return [];
		},
		insert(key, rule) {
			ruleByClassName.add(key, rule);
		},
		remove() {
			ruleByClassName.removeAll();
		},
	};
};

const minify = (value: string) => {
	return value.replaceAll(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};
