/* eslint-disable @typescript-eslint/ban-types */
import type { StyleObject } from "../types";

import { createCustomProperties } from "./properties";

type CustomProperty = {
	extendValues?: boolean;
	states?: Record<
		string /* Custom selector name */,
		string[] | string /* List of states (including conditional at-rules) */
	>;
	values?: (number | string)[] | Record<string, number | string>;
};

type NativeProperty = true;

type PropertyDefinition = Partial<
	Record<keyof StyleObject, CustomProperty | NativeProperty>
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

type StyleProps<
	Properties extends PropertyDefinition,
	Shorthands extends ShorthandsDefinition<Properties>,
> = {
	[PropertyName in keyof Properties]?: Properties[PropertyName] extends CustomProperty
		? CustomPropertyOutput<
				Properties[PropertyName],
				| (Properties[PropertyName]["extendValues"] extends true
						? PropertyName extends keyof StyleObject
							? StyleObject[PropertyName]
							: never
						: never)
				| (Properties[PropertyName]["values"] extends unknown[]
						? Properties[PropertyName]["values"][number]
						: Properties[PropertyName]["values"] extends Record<
									string,
									unknown
							  >
							? keyof Properties[PropertyName]["values"]
							: PropertyName extends keyof StyleObject
								? PropertyOutput<StyleObject[PropertyName]>
								: never)
			>
		: Properties[PropertyName] extends NativeProperty
			? PropertyName extends keyof StyleObject
				? PropertyOutput<StyleObject[PropertyName]>
				: never
			: never;
} & {
	[PropertyName in keyof Shorthands]?: Shorthands[PropertyName] extends unknown[]
		? Properties[Shorthands[PropertyName][number]] extends infer ReferencedProperty
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
								: Shorthands[PropertyName][number] extends keyof StyleObject
									? PropertyOutput<
											StyleObject[Shorthands[PropertyName][number]]
										>
									: never
					>
				: ReferencedProperty extends NativeProperty
					? Shorthands[PropertyName][number] extends keyof StyleObject
						? PropertyOutput<
								StyleObject[Shorthands[PropertyName][number]]
							>
						: never
					: never
			: never
		: never;
};

type ShorthandsDefinition<Properties extends PropertyDefinition> = Record<
	string,
	(keyof Properties)[]
>;

type Exactify<T, X extends T> = T & {
	[K in keyof X]: K extends keyof T ? X[K] : never;
};

declare function createStyles<
	const Properties extends PropertyDefinition,
	const Shorthands extends ShorthandsDefinition<Properties>,
>(
	properties: Exactify<PropertyDefinition, Properties>,
	options: { shorthands: Shorthands },
): (props: StyleProps<Properties, Shorthands>) => string;

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
const styles = createStyles(
	{
		accentColor: true,
		borderRadius: {
			extendValues: true,
			values: theme.radii,
		},
		color: {
			states: STATE_SELECTORS,
			values: theme.colors,
		},
		paddingLeft: {
			states: STATE_SELECTORS,
			values: [1, 2],
		},
		paddingRight: {
			extendValues: true,
			values: [0, 1],
		},
	},
	{
		shorthands: {
			paddingHorizontal: ["paddingLeft", "paddingRight"],
			surface: ["color"],
		},
	},
);

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
