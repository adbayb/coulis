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

export const hash = (str: string) => {
	// hash content based with FNV-1a algorithm:
	const FNVOffsetBasis = 2166136261;
	const FNVPrime = 16777619;
	let hash = FNVOffsetBasis;

	for (let i = 0; i < str.length; i++) {
		hash ^= str.charCodeAt(i);
		hash *= FNVPrime;
	}

	// @note: we convert hashed value to 32-bit unsigned integer
	// via logical unsigned shift operator >>>
	const uHash = hash >>> 0;

	// @note: we convert to hexadecimal
	return Number(uHash).toString(16);
};

export const minify = (value: string) => {
	return value.replace(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};
