import type { UngreedyString } from "../types";

type TokenName = string;

type TokenSubName = string;

type Token = Record<
	TokenSubName,
	{ description?: string; type?: string; value: string }
>;

type Tokens = Record<TokenName, Token>;

export const createTokens = <T extends Tokens>(
	tokens: T,
	aliasedTokens?: Record<
		TokenName,
		// @ts-expect-error to fix
		Record<TokenSubName, `{${keyof T}.${T[keyof T]}}`>
	>,
) => {
	console.log(tokens, aliasedTokens);

	return tokens;
};

export const createTheme = (
	selectorScope: UngreedyString | ":root",
	tokens: Tokens,
) => {
	console.log(selectorScope, tokens);
};

// TODO: remove
export const tokens = createTokens(
	{
		colors: {
			green: { value: "#0FEE0F" },
			red: { value: "#EE0F0F" },
		},
	},
	{
		colors: {
			plop: "{colors.green}",
		},
	},
);
