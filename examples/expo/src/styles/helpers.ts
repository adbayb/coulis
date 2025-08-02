/**
 * Utility type to extract keys.
 */
type ExtractKeys<T> = T extends Record<infer Key, unknown> ? Key : never;

export const negateTokens = <
	Tokens extends Record<number | string, string>,
	Keys extends ExtractKeys<Tokens>,
>(
	tokens: Tokens,
) => {
	return (Object.keys(tokens) as Keys[]).reduce(
		(withNegativeProps, key) => {
			const value = tokens[key] as string;

			withNegativeProps[key] = value;

			if (key === "none") return withNegativeProps; // no-op

			withNegativeProps[`-${key}` as `-${Exclude<Keys, "none">}`] =
				`calc(-${value})`;

			return withNegativeProps;
		},
		{} as Record<Keys | `-${Exclude<Keys, "none">}`, string>,
	);
};
