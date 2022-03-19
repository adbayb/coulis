export const isNumber = (value: unknown): value is number => {
	return typeof value === "number" || !Number.isNaN(Number(value));
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
	return value !== null && typeof value === "object";
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
