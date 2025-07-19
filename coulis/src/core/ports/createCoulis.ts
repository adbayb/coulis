import type { ThemeLike } from "../entities/theme";
import type { GlobalStyles, PropertiesLike, Styles } from "../entities/style";
import type { StatesLike } from "../entities/state";
import type { ShortandsLike } from "../entities/shorthand";
import type { RecordLike, WithNewLeafNodes } from "../entities/primitive";
import type { Keyframes } from "../entities/keyframe";

export type CreateCoulis<
	CreateCoulisGeneric extends {
		Input: { WithCSSVariables: boolean };
		Output: unknown;
	},
> = <
	const Properties extends PropertiesLike, // `const` needed to not widen strict type (for example, to avoid `width: [50, 100]` being inferred as `width: number`).
	Shorthands extends ShortandsLike<Properties> | undefined = undefined,
	States extends StatesLike | undefined = undefined,
	Theme extends ThemeLike | undefined = undefined,
>(contract: {
	properties: (
		theme: CreateCoulisGeneric["Input"]["WithCSSVariables"] extends false
			? Theme extends RecordLike
				? Theme
				: undefined
			: Theme extends RecordLike
				? WithNewLeafNodes<Theme, string>
				: undefined,
	) => Properties;
	shorthands?: Shorthands;
	states?: States;
	theme?: Theme;
}) => {
	createKeyframes: (
		input: Keyframes<Properties, Shorthands>,
	) => CreateCoulisGeneric["Output"];
	createMetadata: () => {
		get: () => {
			attributes: Record<
				"data-coulis-cache" | "data-coulis-type",
				string
			>;
			content: string;
		}[];
		getAsString: () => string;
	};
	createStyles: (
		input: Styles<Properties, Shorthands, States>,
	) => CreateCoulisGeneric["Output"];
	getContract: () => {
		propertyNames: (keyof Properties | keyof Shorthands)[];
	};
	setGlobalStyles: (input: GlobalStyles<Properties, Shorthands>) => void;
};
