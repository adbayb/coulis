import type { Property } from "./property";

type Primitive = number | string;

type RecordLike = Record<number | string | symbol, unknown>;

/**
 * A utility type to preserve the record data structure except for leaf nodes that are mutated to match the `LeafType`.
 */
type WithMutatedLeaves<Obj extends RecordLike, LeafType> = {
	[Key in keyof Obj]: Obj[Key] extends Primitive
		? LeafType
		: Obj[Key] extends RecordLike
			? WithMutatedLeaves<Obj[Key], LeafType>
			: never;
};

type Tokens = {
	[key: string]: Primitive | Tokens;
};

/**
 * Default theme that maps core tokens to semantic ones in order to enable contextual specificities (such as platform (web vs mobile), brand, white labels ones).
 * This theme is used for web purposes (mobile first).
 * Each token value are persisted through CSS variables.
 * @param tokens - Record of tokens (a design token is an indivisible design decision of a design system (such as colors, spacing, typography scale, ...). @see https://www.designtokens.org/glossary/).
 * @returns The created theme.
 * @example
 * const theme = createTheme({}); // TODO
 */
export const createTheme = <T extends Tokens>(
	tokens: T,
): WithMutatedLeaves<T, Property> => {
	console.log(tokens);

	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return {} as WithMutatedLeaves<T, Property>;
};

/*
// To use in examples: 
export const tokens = {
	colors: {
		black: "black",
		blue: [
			"rgb(241,244,248)",
			"rgb(226,232,240)",
			"rgb(201,212,227)",
			"rgb(168,186,211)",
			"rgb(119,146,185)",
		],
		transparent: "transparent",
		white: "white",
	},

	fontSizes: [12, 14, 16, 18, 20, 22, 24, 28, 30],
	fontWeights: ["100", "400", "900"],
	radii: [0, 4, 8, 12, 999],
} as const;

export const theme = createTheme({
	colors: {
		neutralDark: tokens.colors.black,
		neutralLight: tokens.colors.white,
		neutralTransparent: tokens.colors.transparent,
		surfacePrimary: tokens.colors.blue[4],
		surfaceSecondary: tokens.colors.blue[2],
	},
	radii: {
		full: tokens.radii[4],
		large: tokens.radii[3],
		medium: tokens.radii[2],
		none: tokens.radii[0],
		small: tokens.radii[1],
	},
	typographies: {
		body: {
			fontSize: tokens.fontSizes[2],
			fontWeight: tokens.fontWeights[1],
		},
	},
});
*/
