import { NO_CLASSNAME } from "../constants";
import { hash } from "../helpers";

import type { Cache } from "./cache";
import type { StyleSheet } from "./stylesheet";

type ProcessParameters = {
	key: string;
	cache: Cache;
	strategy: (params: { className: string }) => /* ruleSet */ string;
	styleSheet: StyleSheet;
};

export const process = ({
	key,
	cache,
	strategy,
	styleSheet,
}: ProcessParameters) => {
	const className = hash(key);

	if (cache.has(className)) return className;

	const ruleSet = strategy({ className });

	// @note: empty string to unset className (eg. if a value is undefined)
	if (!ruleSet) return NO_CLASSNAME;

	styleSheet.commit(ruleSet);
	cache.set(className, styleSheet.type);

	return className;
};
