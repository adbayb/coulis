import type { ClassName, CreateStyleSheet, Rule } from "../types";

import { createMapCache } from "../../../core/entities/cache";

export const createVirtualStyleSheet: CreateStyleSheet = () => {
	const ruleByClassName = createMapCache<ClassName, Rule>();
	let cachedContent: string | undefined = undefined;

	return {
		getContent() {
			return (
				cachedContent ?? minify([...ruleByClassName.getAll()].join(""))
			);
		},
		getHydratedClassNames() {
			return [];
		},
		insert(key, rule) {
			ruleByClassName.add(key, rule);
			cachedContent = undefined;
		},
		remove() {
			ruleByClassName.removeAll();
			cachedContent = undefined;
		},
	};
};

const minify = (value: string) => {
	return value.replaceAll(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};
