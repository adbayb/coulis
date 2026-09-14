import { minify } from "../helpers";
import type { ClassName, CreateStyleSheet, Rule } from "../types";

export const createVirtualStyleSheet: CreateStyleSheet = () => {
	const ruleByClassName = new Map<ClassName, Rule>();
	let cachedContent: string | undefined = undefined;

	return {
		clear() {
			ruleByClassName.clear();
			cachedContent = undefined;
		},
		getContent() {
			return cachedContent ?? minify([...ruleByClassName.values()].join(""));
		},
		getHydratedClassNames() {
			return [];
		},
		setRule(key, rule) {
			ruleByClassName.set(key, rule);
			cachedContent = undefined;
		},
	};
};
