export const isObject = (value: unknown): value is Record<string, unknown> => {
	return value !== null && typeof value === "object";
};

export const merge = <ItemShape extends Record<string, unknown>>(
	target: ItemShape,
	...sources: ItemShape[]
): ItemShape => {
	if (sources.length === 0) {
		return target;
	}

	const source = sources[0];

	for (const key in source) {
		const sourceValue = source[key];
		const targetValue = target[key];

		if (isObject(sourceValue) && isObject(targetValue)) {
			target[key] = merge(targetValue, sourceValue);
		} else {
			target[key] = sourceValue;
		}
	}

	sources.shift();

	return merge(target, ...sources);
};

export const minify = (value: string) => {
	return value.replace(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};