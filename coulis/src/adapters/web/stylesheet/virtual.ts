import { createMapCache } from "../../../core/entities/cache";
import { minify } from "../helpers";
import type { ClassName, CreateStyleSheet, Rule } from "../types";

export const createVirtualStyleSheet: CreateStyleSheet = () => {
	const ruleByClassName = createMapCache<ClassName, Rule>();
	let cachedContent: string | undefined = undefined;

	return {
		clear() {
			ruleByClassName.clear();
			cachedContent = undefined;
		},
		getContent() {
			return cachedContent ?? minify(ruleByClassName.getValues().join(""));
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
