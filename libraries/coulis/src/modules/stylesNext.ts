/* eslint-disable @typescript-eslint/ban-types */
import { SHORTHAND_PROPERTIES } from "../constants";
import { createClassName } from "../entities/className";
import { isObject, toDeclaration } from "../helpers";
import type { StyleObject } from "../types";

import { createCustomProperties } from "./properties";

type CustomProperty = {
	allowNativeValues?: boolean;
	states?: Record<
		string /* Custom selector name */,
		{
			"@container"?: string;
			"@media"?: string;
			"@supports"?: string;
			selector?: `:${string}`;
		}
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
				| (Properties[PropertyName]["allowNativeValues"] extends true
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

const createStyles = <
	const Properties extends PropertyDefinition,
	const Shorthands extends ShorthandsDefinition<Properties>,
>(
	properties: Exactify<PropertyDefinition, Properties>,
	options: { shorthands: Shorthands },
) => {
	// const configuredPropertyNames = Object.keys(
	// 	properties,
	// ) as (keyof typeof properties)[];

	const configuredShorthandNames = Object.keys(
		options.shorthands,
	) as (keyof typeof options.shorthands)[];

	// TODO: cache to speed up multiple transversal transformations (such as for states)

	return (input: StyleProps<Properties, Shorthands>) => {
		const classNames: string[] = [];
		const propertyNames = Object.keys(input);

		const process = (name: string, value: (typeof input)[string]) => {
			const propertyConfigurationValue = properties[name];
			const isShorthandProperty = SHORTHAND_PROPERTIES[name];
			let output = "";

			if (isObject(value)) {
				const stateNames = Object.keys(value);

				// TODO: media query must be set at the root for wider compatibility (CSS nesting is quite new):
				// For nesting, update type to enforce allowed conditional at rules: { states: { "@media": "", selector: ":hover" } }
				// For possible combination, check Tailwind https://tailwindcss.com/docs/hover-focus-and-other-states and vanilla extract https://github.com/vanilla-extract-css/vanilla-extract/discussions/322#discussioncomment-1350779 for inspirations
				for (const stateName of stateNames) {
					if (
						!isObject(propertyConfigurationValue) ||
						!isObject(propertyConfigurationValue.states) ||
						!propertyConfigurationValue.states[stateName]
					) {
						throw new Error(
							`Missing or misconfigured \`states\` for \`${name}\` property. Verify the \`createStyles\` factory setup.`,
						);
					}

					const stateValue = value[stateName];

					const stateConfig =
						propertyConfigurationValue.states[stateName] ?? {};

					const stateConfigNames = Object.keys(
						stateConfig,
					) as (keyof typeof stateConfig)[];

					const declaration = toDeclaration({
						name,
						value: stateValue,
					});

					for (const stateConfigName of stateConfigNames) {
						const stateConfigValue = stateConfig[stateConfigName];

						const className = createClassName(
							`${stateConfigName}${name}${String(stateValue)}`,
						);

						classNames.push(className);

						if (stateConfigName === "selector") {
							output += `.${className}${stateConfigValue}{${declaration}}`;
						} else {
							output += `${stateConfigName} ${stateConfigValue}{.${className}{${declaration}}}`;
						}
					}
				}
			} else {
				const mappedValue =
					propertyConfigurationValue.values?.[value] ?? value;

				const className = createClassName(`${name}${mappedValue}`);

				classNames.push(className);

				output += toDeclaration({
					name,
					value: mappedValue as number | string, // TODO undefined value
				});
			}

			return output;
		};

		for (const propertyName of propertyNames) {
			const isShorthandProperty =
				configuredShorthandNames.includes(propertyName);

			if (isShorthandProperty) {
				const shorthandConfigurationValue =
					options.shorthands[propertyName];

				if (!shorthandConfigurationValue) continue;

				for (const shorthand of shorthandConfigurationValue) {
					console.log(
						shorthand,
						process(shorthand as string, input[propertyName]),
					);
				}
			} else {
				console.log(
					propertyName,
					process(propertyName, input[propertyName]),
				);
			}
		}

		return classNames.join(" ");
	};
};

const createStateSelectors = () => {
	const smallState = {
		"@media": "(min-width: 360px)",
	};

	const hoverState = { selector: ":hover" as const };

	return {
		base: {
			"@media": "(min-width: 0px)",
		},
		hover: hoverState,
		large: {
			"@media": "(min-width: 1024px)",
		},
		medium: {
			"@media": "(min-width: 768px)",
		},
		small: smallState,
		smallWithHover: {
			...smallState,
			...hoverState,
		},
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
			allowNativeValues: true,
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
			allowNativeValues: true,
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
		smallWithHover: 2,
	},
	paddingRight: 0,
	surface: "neutralDark",
});

export const TEST = "TODO: remove";
