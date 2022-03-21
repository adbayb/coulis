import { NO_CLASSNAME } from "../constants";
import { hash, toClassName } from "../helpers";
import { Cache } from "./cache";
import { StyleSheet } from "./stylesheet";

type ProcessParameters = {
	cache: Cache;
	key: string;
	styleSheet: StyleSheet;
	strategy: (params: { className: string }) => /* ruleSet */ string;
};

export const process = ({
	cache,
	key,
	strategy,
	styleSheet,
}: ProcessParameters) => {
	const cacheKey = hash(key);
	const className = toClassName(cacheKey);

	if (cache.has(cacheKey)) return className;

	const ruleSet = strategy({ className });

	// @note: empty string to unset className (eg. if a value is undefined)
	if (!ruleSet) return NO_CLASSNAME;

	styleSheet.commit(ruleSet);
	cache.set(cacheKey, styleSheet.type);

	return className;
};
