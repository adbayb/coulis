import type { ThemeLike } from "../entities/theme";
import type { GlobalStyles, Styles } from "../entities/style";
import type { StatesLike } from "../entities/state";
import type { ShortandsLike } from "../entities/shorthand";
import type { PropertiesLike } from "../entities/property";
import type { RecordLike, WithNewLeafNodes } from "../entities/primitive";
import type { Keyframes } from "../entities/keyframe";

export type CreateCoulis<Output> = <
	const Properties extends PropertiesLike, // `const` needed to not widen strict type (for example, to avoid `width: [50, 100]` being inferred as `width: number`).
	Shorthands extends ShortandsLike<Properties> | undefined = undefined,
	States extends StatesLike | undefined = undefined,
	Theme extends ThemeLike | undefined = undefined,
>(contract: {
	properties: (
		theme: Theme extends RecordLike
			? WithNewLeafNodes<Theme, string>
			: undefined,
	) => Properties;
	shorthands?: Shorthands;
	states?: States;
	theme?: Theme;
}) => {
	createKeyframes: (input: Keyframes<Properties>) => Output;
	createStyles: (input: Styles<Properties, Shorthands, States>) => Output;
	getMetadata: () => {
		toString: () => string;
		value: {
			attributes: Record<
				"data-coulis-cache" | "data-coulis-type",
				string
			>;
			content: string;
		}[];
	};
	setGlobalStyles: (input: GlobalStyles<Properties>) => void;
};

const createCoulisFake: CreateCoulis<string> = (_input) => {
	return {
		createKeyframes() {
			return "fake";
		},
		createStyles() {
			return "fake";
		},
		getMetadata() {
			return {
				toString() {
					return "";
				},
				value: [],
			};
		},
		setGlobalStyles() {
			// No op
		},
	};
};

const { createStyles } = createCoulisFake({
	properties() {
		return {
			backgroundColor: {
				blue: "blue",
			},
		};
	},
	shorthands: {
		backgroundColorAlias: ["backgroundColor"],
	},
	states: {
		hover: "coulis[selector]:hover{coulis[declaration]}",
	},
});

createStyles({
	backgroundColor: {
		base: "blue",
	},
	backgroundColorAlias: "blue",
});
