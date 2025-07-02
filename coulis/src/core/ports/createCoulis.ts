import type { ThemeLike } from "../entities/theme";
import type { StatesLike } from "../entities/state";
import type { ShortandsLike } from "../entities/shorthand";
import type { PropertiesLike, PropertyValue } from "../entities/property";
import type {
	EmptyRecord,
	RecordLike,
	WithNewLeafNodes,
} from "../entities/primitive";
import type { Keyframes } from "../entities/keyframe";
import type { GlobalStyles } from "../entities/globalStyle";

// TODO: createCoulis.test.ts (type tests)
export type CreateCoulis<Output> = <
	// `const` needed to not widen strict type (for example, to avoid `width: [50, 100]` being inferred as `width: number`).
	const Properties extends PropertiesLike,
	States extends StatesLike, // TODO: fix States extends StatesLike = undefined (to avoid accepting { base: value } if no states are defined
	Shorthands extends ShortandsLike<Properties> = undefined,
	Theme extends ThemeLike = undefined,
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
	createStyles: (
		input: (Shorthands extends undefined
			? EmptyRecord
			: {
					[PropertyName in keyof Shorthands]?: Shorthands[PropertyName] extends (keyof Properties)[]
						? PropertyValue<
								Shorthands[PropertyName][number],
								Properties,
								States
							>
						: never;
				}) & {
			[PropertyName in keyof Properties]?: PropertyValue<
				PropertyName,
				Properties,
				States
			>;
		},
	) => Output;
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

const createCoulisWeb: CreateCoulis<string> = (_input) => {
	return {
		createKeyframes() {
			return "todo";
		},
		createStyles() {
			return "todo";
		},
		createVariants() {
			return () => {
				return "todo";
			};
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

const createCoulisNative: CreateCoulis<Record<string, unknown>> = (_input) => {
	return {
		createKeyframes() {
			return {};
		},
		createStyles() {
			return {};
		},
		createVariants() {
			return () => {
				return {};
			};
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

const createCoulis =
	// eslint-disable-next-line unicorn/prefer-global-this
	typeof window === "undefined" ? createCoulisNative : createCoulisWeb;

const coulis = createCoulis({
	properties(theme) {
		return {
			backgroundColor: theme.colors,
		};
	},
	shorthands: {
		test: ["backgroundColor"],
	},
	theme: {
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
	},
});

coulis.createStyles({
	backgroundColor: {
		base: "blue",
	},
});

coulis.createKeyframes({
	from: {
		backgroundColor: "black",
		/*
		 * TODO: add shorthands support
		 * TODO: rename shorthands to aliases to avoid confusion with CSS shorthands?
		 */
	},
});
