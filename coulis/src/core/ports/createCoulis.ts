import type { Keyframes } from "../entities/keyframe";
import type { RecordLike, WithNewLeafNodes } from "../entities/primitive";
import type { ShortandsLike } from "../entities/shorthand";
import type { StatesLike } from "../entities/state";
import type { GlobalStyles, PropertiesLike, Styles } from "../entities/style";
import type { ThemeLike } from "../entities/theme";

export type CreateCoulis<
	CreateCoulisGeneric extends {
		/**
		 * Controls how theme values are exposed to the `properties` callback.
		 * - `true` (web adapter): leaf values in the theme are transformed into
		 * CSS custom property references (`var(--token-name)`). The adapter
		 * injects a `:root { --token-name: value }` rule automatically.
		 * - `false` (react-native adapter): theme values are passed through as-is
		 * (raw strings/numbers), since CSS variables are not supported on native platforms.
		 */
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
	createStyles: (
		input: Styles<Properties, Shorthands, States>,
	) => CreateCoulisGeneric["Output"];
	getContract: () => {
		propertyNames: (keyof Properties | keyof Shorthands)[];
	};
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-type", string>;
		content: string;
	}[] & { toString: () => string };
	setGlobalStyles: (input: GlobalStyles<Properties, Shorthands>) => void;
};
