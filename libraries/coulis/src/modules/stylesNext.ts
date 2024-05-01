/* eslint-disable @typescript-eslint/ban-types */
import type { StyleObject } from "../types";

import { createCustomProperties } from "./properties";

type CustomProperty = {
	extendValues?: boolean;
	states?: Record<
		string /* Custom selector name */,
		string[] | string /* List of states (including conditional at-rules) */
	>;
	type: "custom";
	values?: (number | string)[] | Record<string, number | string>;
};

type NativeProperty = true;

type ShorthandProperty = {
	type: "shorthand";
	values: string[];
};

type PropertyConfiguration = Partial<
	Record<
		keyof StyleObject,
		CustomProperty | NativeProperty | ShorthandProperty
	>
>;

type PropertyOutput<Value> = Value | undefined;

type CustomPropertyOutput<
	Property extends CustomProperty,
	Value,
> = PropertyOutput<
	Property["states"] extends Record<string, unknown>
		? Partial<Record<keyof Property["states"], Value>> | Value
		: Value
>;

type StyleProps<Config extends PropertyConfiguration> = {
	[PropertyName in keyof Config]?: Config[PropertyName] extends ShorthandProperty
		? Config[Config[PropertyName]["values"][number]] extends infer ReferencedProperty
			? ReferencedProperty extends CustomProperty
				? CustomPropertyOutput<
						ReferencedProperty,
						ReferencedProperty["values"] extends unknown[]
							? ReferencedProperty["values"][number]
							: ReferencedProperty["values"] extends Record<
										string,
										unknown
								  >
								? keyof ReferencedProperty["values"]
								: Config[PropertyName]["values"][number] extends keyof StyleObject
									? PropertyOutput<
											StyleObject[Config[PropertyName]["values"][number]]
										>
									: never
					>
				: ReferencedProperty extends NativeProperty
					? Config[PropertyName]["values"][number] extends keyof StyleObject
						? PropertyOutput<
								StyleObject[Config[PropertyName]["values"][number]]
							>
						: never
					: never
			: never
		: Config[PropertyName] extends CustomProperty
			? CustomPropertyOutput<
					Config[PropertyName],
					| (Config[PropertyName]["extendValues"] extends true
							? PropertyName extends keyof StyleObject
								? StyleObject[PropertyName]
								: never
							: never)
					| (Config[PropertyName]["values"] extends unknown[]
							? Config[PropertyName]["values"][number]
							: Config[PropertyName]["values"] extends Record<
										string,
										unknown
								  >
								? keyof Config[PropertyName]["values"]
								: PropertyName extends keyof StyleObject
									? PropertyOutput<StyleObject[PropertyName]>
									: never)
				>
			: Config[PropertyName] extends NativeProperty
				? PropertyName extends keyof StyleObject
					? PropertyOutput<StyleObject[PropertyName]>
					: never
				: never;
};

type Exactify<T, X extends T> = T & {
	[K in keyof X]: K extends keyof T ? X[K] : never;
};

declare function createStyles<const Config extends PropertyConfiguration>(
	config: Exactify<PropertyConfiguration, Config>,
): (props: StyleProps<Config>) => string;

const createStateSelectors = () => {
	const smallState = "@media (min-width: 360px)";
	const hoverState = ":hover";

	return {
		base: "@media (min-width: 0px)",
		hover: hoverState,
		large: "@media (min-width: 1340px)",
		medium: "@media (min-width: 720px)",
		small: smallState,
		smallWithHover: [smallState, hoverState],
	};
};

const STATE_SELECTORS = createStateSelectors();
const px = (value: number) => `${value}px`;

const tokens = {
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
	fontSizes: [
		px(12),
		px(14),
		px(16),
		px(18),
		px(20),
		px(22),
		px(24),
		px(28),
		px(30),
	],
	fontWeights: ["100", "400", "900"],
	radii: [px(0), px(4), px(8), px(12), px(999)],
} as const;

const theme = createCustomProperties({
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

// eslint-disable-next-line sonarjs/no-use-of-empty-return-value
const styles = createStyles({
	accentColor: true,
	borderRadius: {
		extendValues: true,
		type: "custom",
		values: theme.radii,
	},
	color: {
		states: STATE_SELECTORS,
		type: "custom",
		values: theme.colors,
	},
	paddingHorizontal: {
		type: "shorthand",
		values: ["paddingRight", "paddingLeft"],
	},
	paddingLeft: {
		states: STATE_SELECTORS,
		type: "custom",
		values: [1, 2],
	},
	paddingRight: {
		extendValues: true,
		type: "custom",
		values: [0, 1],
	},
	surface: {
		type: "shorthand",
		values: ["color"],
	},
});

styles({
	accentColor: "ActiveCaption",
	borderRadius: "small",
	paddingHorizontal: 1,
	paddingLeft: {
		base: 2,
		large: 1,
		medium: 2,
		small: 1,
	},
	paddingRight: 0,
	surface: "neutralDark",
});
