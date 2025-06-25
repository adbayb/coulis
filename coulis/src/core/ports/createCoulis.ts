import type { StatesLike } from "../entities/state";
import type { ShortandsLike } from "../entities/shorthand";
import type { PropertiesLike, PropertyValue } from "../entities/property";
import type { RecordLike } from "../entities/primitive";
import type { Keyframes } from "../entities/keyframe";
import type { GlobalStyles } from "../entities/globalStyle";

export type CreateCoulis<Output> = <
	// `const` needed to not widen strict type (for example, to avoid `width: [50, 100]` being inferred as `width: number`).
	const Properties extends PropertiesLike,
	Shorthands extends ShortandsLike<Properties>,
	States extends StatesLike,
	Theme extends RecordLike,
>(contract: {
	properties: (theme: Theme) => Properties;
	shorthands?: Shorthands;
	states?: States;
	theme?: Theme;
}) => {
	createKeyframes: (input: Keyframes<Properties>) => Output;
	createStyles: (
		input: {
			[PropertyName in keyof Properties]?: PropertyValue<
				PropertyName,
				Properties,
				States
			>;
		} & {
			[PropertyName in keyof Shorthands]?: Shorthands[PropertyName] extends unknown[]
				? Shorthands[PropertyName][number] extends keyof Properties
					? PropertyValue<
							Shorthands[PropertyName][number],
							Properties,
							States
						>
					: never
				: never;
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

const tokens = Object.freeze({
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
	spacings: {
		0: "0px",
		0.5: "0.5rem",
		1: "1rem",
		1.5: "2rem",
	},
} as const);

const coulis = createCoulis({
	properties(theme) {
		return {
			backgroundColor: theme.colors,
			colorScheme(input: "black" | "white") {
				return input === "black" ? "dark" : "light";
			},
			display: true,
			margin: theme.spacings,
			marginBottom: theme.spacings,
			marginLeft: theme.spacings,
			marginRight: theme.spacings,
			marginTop: theme.spacings,
			width: [50, 100],
		};
	},
	shorthands: {
		marginHorizontal: ["marginLeft", "marginRight"],
		marginVertical: ["marginTop", "marginBottom"],
	},
	states: {
		hover: ({ className, declaration }) =>
			`${className}:hover{${declaration}}`,
	},
	theme: {
		colors: {
			neutralDark: tokens.colors.black,
			neutralLight: tokens.colors.white,
			neutralTransparent: tokens.colors.transparent,
			surfacePrimary: tokens.colors.blue[4],
			surfaceSecondary: tokens.colors.blue[2],
		},
		spacings: tokens.spacings,
	},
});

coulis.createStyles({
	backgroundColor: "neutralDark",
	display: {
		base: "block",
	},
	marginHorizontal: 1,
	width: {
		base: 100,
		hover: 50,
	},
});

coulis.createKeyframes({
	from: {
		colorScheme: "black",
		width: 100,
	},
	to: {
		colorScheme: "black",
	},
});

coulis.setGlobalStyles({
	html: {
		backgroundColor: "neutralDark",
	},
});
