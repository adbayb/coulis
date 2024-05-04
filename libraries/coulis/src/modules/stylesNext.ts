// import { SHORTHAND_PROPERTIES } from "../constants";
import { SHORTHAND_PROPERTIES } from "../constants";
import { createClassName } from "../entities/className";
import { SCOPES } from "../entities/scope";
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
			selector?: string;
		}
	>;
	values?: (number | string)[] | Record<string, number | string>;
};

type NativeProperty = true;

type PropertyConfiguration = Partial<
	Record<keyof StyleObject, CustomProperty | NativeProperty>
>;

type ShorthandConfiguration<Properties extends PropertyConfiguration> = Record<
	string,
	(keyof Properties)[]
>;

type StylePropsOutput<Value> = Value | undefined;

type CustomStylePropsOutput<
	Property extends CustomProperty,
	Value,
> = StylePropsOutput<
	Property["states"] extends Record<string, unknown>
		? Partial<Record<keyof Property["states"], Value>> | Value
		: Value
>;

type StyleProps<
	Properties extends PropertyConfiguration,
	Shorthands extends ShorthandConfiguration<Properties>,
> = {
	[PropertyName in keyof Properties]?: Properties[PropertyName] extends CustomProperty
		? CustomStylePropsOutput<
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
								? StylePropsOutput<StyleObject[PropertyName]>
								: never)
			>
		: Properties[PropertyName] extends NativeProperty
			? PropertyName extends keyof StyleObject
				? StylePropsOutput<StyleObject[PropertyName]>
				: never
			: never;
} & {
	[PropertyName in keyof Shorthands]?: Shorthands[PropertyName] extends unknown[]
		? Properties[Shorthands[PropertyName][number]] extends infer ReferencedProperty
			? ReferencedProperty extends CustomProperty
				? CustomStylePropsOutput<
						ReferencedProperty,
						ReferencedProperty["values"] extends unknown[]
							? ReferencedProperty["values"][number]
							: ReferencedProperty["values"] extends Record<
										string,
										unknown
								  >
								? keyof ReferencedProperty["values"]
								: Shorthands[PropertyName][number] extends keyof StyleObject
									? StylePropsOutput<
											StyleObject[Shorthands[PropertyName][number]]
										>
									: never
					>
				: ReferencedProperty extends NativeProperty
					? Shorthands[PropertyName][number] extends keyof StyleObject
						? StylePropsOutput<
								StyleObject[Shorthands[PropertyName][number]]
							>
						: never
					: never
			: never
		: never;
};

type Exactify<T, X extends T> = T & {
	[K in keyof X]: K extends keyof T ? X[K] : never;
};

type StyleInputValue =
	| Record<string, number | string | undefined>
	| number
	| string
	| undefined;

const createStyles = <
	const Properties extends PropertyConfiguration,
	const Shorthands extends ShorthandConfiguration<Properties>,
>(
	configuration: Exactify<PropertyConfiguration, Properties>,
	options: { shorthands: Shorthands },
) => {
	const configuredShorthandNames = Object.keys(options.shorthands);

	const isShorthandProperty = (
		key: string,
	): key is Extract<keyof Shorthands, string> => {
		return configuredShorthandNames.includes(key);
	};

	const createDeclaration = ({
		name,
		value,
	}: {
		name: string;
		value: number | string;
	}) => {
		const propConfig = configuration[name];

		if (!propConfig) return;

		const mappedValue =
			typeof propConfig === "boolean" || !isObject(propConfig.values)
				? value
				: propConfig.values[value];

		if (mappedValue === undefined) return;

		return toDeclaration({
			name,
			value: mappedValue,
		});
	};

	const createRules = (name: string, value: StyleInputValue) => {
		const classNames: string[] = [];
		const propConfig = configuration[name];
		const isNativeShorthandProperty = SHORTHAND_PROPERTIES[name];

		let scope = isNativeShorthandProperty
			? SCOPES.shorthand
			: SCOPES.longhand;

		if (value === undefined) return classNames;

		if (!isObject(value)) {
			const declaration = createDeclaration({
				name,
				value,
			});

			if (!declaration) return classNames;

			const className = createClassName(declaration);
			const rule = `.${className}{${declaration}}`;

			classNames.push(className);
			scope.styleSheet.commit(className, rule);

			return classNames;
		}

		const stateNames = Object.keys(value);

		for (const stateName of stateNames) {
			const inputValue = value[stateName];

			if (inputValue === undefined || !isObject(propConfig)) continue;

			const declaration = createDeclaration({
				name,
				value: inputValue,
			});

			if (!declaration) continue;

			const stateConfig = propConfig.states?.[stateName] ?? {};

			const stateConfigSelectors = Object.keys(
				propConfig.states?.[stateName] ?? {},
			);

			if (stateConfigSelectors.length === 0) {
				const className = createClassName(declaration);
				const rule = `.${className}{${declaration}}`;

				classNames.push(className);
				scope.styleSheet.commit(className, rule);

				continue;
			}

			scope = isNativeShorthandProperty
				? SCOPES.conditionalShorthand
				: SCOPES.conditionalLonghand;

			for (const stateSelector of stateConfigSelectors) {
				const stateSelectorValue =
					stateConfig[stateSelector as keyof typeof stateConfig];

				// TODO: review state shape from { "@media": "...", @scope: "...", selector: "..." } to { "condition": "@media|scope ...", selecor: "..." } to enforce one condition at a time
				// Manage scope target here (if no condition is provided, the scope should target unconditional stylesheet)
				// TODO: remove previous createStyles API and update examples
				// TODO: benchmark and optimize with cache
				const className = createClassName(
					`${stateSelector}${stateSelectorValue}${declaration}`,
				);

				classNames.push(className);

				const rule =
					stateSelector === "selector"
						? `.${className}${stateSelectorValue}{${declaration}}`
						: `${stateSelector} ${stateSelectorValue}{.${className}{${declaration}}}`;

				scope.styleSheet.commit(className, rule);
			}
		}

		return classNames;
	};

	return (input: StyleProps<Properties, Shorthands>) => {
		const classNames: string[] = [];

		for (const propertyName of Object.keys(input)) {
			const value = input[propertyName] as StyleInputValue;

			if (isShorthandProperty(propertyName)) {
				const shorthandConfig = options.shorthands[
					propertyName
				] as string[];

				for (const shorthandName of shorthandConfig) {
					classNames.push(...createRules(shorthandName, value));
				}
			} else {
				classNames.push(...createRules(propertyName, value));
			}
		}

		return classNames.join(" ");
	};
};

const createStateSelectors = () => {
	const smallState = {
		"@media": "(min-width: 360px)",
	};

	const hoverState = { selector: ":hover" };

	return {
		base: {
			"@media": "(min-width: 0px)", // TODO: allow empty object (or undefined/null?) for base/default state to not include uneeded min-width 0px media query
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
			allowNativeValues: true,
			states: STATE_SELECTORS,
			values: theme.colors,
		},
		paddingLeft: {
			states: STATE_SELECTORS,
			values: [1, 2],
		},
		paddingRight: {
			values: [3, 4],
		},
	},
	{
		shorthands: {
			paddingHorizontal: ["paddingLeft", "paddingRight"],
			surface: ["color"],
		},
	},
);

console.warn(
	styles({
		accentColor: "ActiveCaption",
		borderRadius: "small",
		paddingHorizontal: 3,
		paddingLeft: {
			base: 2,
			large: 1,
			smallWithHover: 2,
		},
		paddingRight: 4,
		surface: "neutralDark",
	}),
);

export const TODO = "TO REMOVE";
