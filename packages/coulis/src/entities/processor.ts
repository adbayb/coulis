import { NO_CLASSNAME } from "../constants";
import { hash } from "../helpers";
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
	const className = hash(key);

	if (cache.has(className)) return className;

	const ruleSet = strategy({ className });

	// @note: empty string to unset className (eg. if a value is undefined)
	if (!ruleSet) return NO_CLASSNAME;

	styleSheet.commit(ruleSet);
	cache.set(className, styleSheet.type);

	return className;
};
