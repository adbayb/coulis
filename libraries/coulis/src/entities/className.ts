export type ClassName = string;

export const createClassName = (value: string) => {
	// hash content based with FNV-1a algorithm:
	const FNVOffsetBasis = 2166136261;
	const FNVPrime = 16777619;
	let hashedValue = FNVOffsetBasis;

	for (let i = 0; i < value.length; i++) {
		hashedValue ^= value.charCodeAt(i);
		hashedValue *= FNVPrime;
	}

	// We convert hashed value to 32-bit unsigned integer
	// via logical unsigned shift operator >>>
	const uHash = hashedValue >>> 0;

	// A coulis className is generated by prefixing with "c"
	// and converting generated hash to hexadecimal
	return `c${Number(uHash).toString(16)}`;
};
