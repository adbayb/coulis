import { isObject } from "./object";

export const merge = <ItemShape extends Record<string, any>>(
	target: ItemShape,
	...sources: ItemShape[]
): ItemShape => {
	if (sources.length === 0) {
		return target;
	}

	const source = sources[0];

	for (const key of Object.keys(source)) {
		const sourceValue = source[key];
		const targetValue = target[key];

		if (isObject(sourceValue) && isObject(targetValue)) {
			// @ts-ignore
			target[key] = merge(targetValue, sourceValue);
		} else {
			// @ts-ignore
			target[key] = sourceValue;
		}
	}

	sources.shift();

	return merge(target, ...sources);
};
