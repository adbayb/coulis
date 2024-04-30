/* eslint-disable @typescript-eslint/ban-types */
import { SHORTHAND_PROPERTIES } from "../constants";
import { SCOPES } from "../entities/scope";
import { isObject, toDeclaration, toManyDeclaration } from "../helpers";
import type {
	AtConditionalGroupingRule,
	AtTextualRule,
	AtomicStyleObject,
	ClassName,
	GlobalStyleObject,
	StyleObject,
} from "../types";

import { createCustomProperties } from "./properties";

/**
 * Create a class name to apply a style rule to an element.
 * @param styleObject - A style record containing CSS declarations to apply to a given element.
 * @returns The generated class name.
 * @example
 * 	const className = styles({ backgroundColor: "red" });
 * 	document.getElementById("my-element-id").className = className;
 */
export const styles = (styleObject: AtomicStyleObject) => {
	return createClassName()(styleObject);
};

/**
 * Create a contextual `styles` tied to a [CSSGroupingRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSGroupingRule)
 * (ie. An at-rule that contains other rules nested within it (such as @media, @supports conditional rules...)).
 * @param atRule - The styling rule instruction (such as `@media (min-width: 0px)`).
 * @param condition - The rule condition.
 * @returns The contextual `atoms` helper.
 * @example
 * 	createStyles("@media", "(min-width: 576px)")
 */
export const createStyles = (
	atRule: AtConditionalGroupingRule,
	condition: string,
) => {
	return createClassName(`${atRule} ${condition}`);
};

/**
 * Apply style rules globally.
 * @param styleObject - A style record containing CSS declarations to apply to a given element.
 * @example
 * 	globalStyles({ "html": { "background-color": "red" } });
 */
export const globalStyles = (styleObject: GlobalStyleObject) => {
	SCOPES.global.commit({
		key: JSON.stringify(styleObject),
		createRules() {
			const rules: string[] = [];

			for (const selector of Object.keys(styleObject)) {
				const style = styleObject[selector as AtTextualRule];

				if (!style) continue;

				if (typeof style === "string") {
					rules.push(`${selector} ${style};`);
				} else {
					rules.push(`${selector}{${toManyDeclaration(style)}}`);
				}
			}

			return rules;
		},
	});
};

const createClassName = (groupingRule = "") => {
	const wrapRule = (rule: string) => {
		return !groupingRule ? rule : `${groupingRule}{${rule}}`;
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	return (styleObject: AtomicStyleObject): ClassName => {
		const classNames: string[] = [];

		for (const propertyName of Object.keys(styleObject)) {
			const value = styleObject[propertyName];
			const isShorthandProperty = SHORTHAND_PROPERTIES[propertyName];

			const scope = groupingRule
				? isShorthandProperty
					? SCOPES.conditionalShorthand
					: SCOPES.conditionalLonghand
				: isShorthandProperty
					? SCOPES.shorthand
					: SCOPES.longhand;

			if (value === undefined) continue;

			if (isObject(value)) {
				for (const selectorProperty of Object.keys(value)) {
					const selectorValue = value[selectorProperty];
					const isDefaultProperty = selectorProperty === "default";

					if (selectorValue === undefined) continue;

					classNames.push(
						scope.commit({
							key: `${groupingRule}${propertyName}${selectorValue}${
								isDefaultProperty ? "" : selectorProperty
							}`,
							createRules(className) {
								return [
									wrapRule(
										`.${className}${
											isDefaultProperty
												? ""
												: selectorProperty
										}{${toDeclaration({ name: propertyName, value: selectorValue })}}`,
									),
								];
							},
						}),
					);
				}
			} else {
				classNames.push(
					scope.commit({
						key: `${groupingRule}${propertyName}${value}`,
						createRules(className) {
							return [
								wrapRule(
									`.${className}{${toDeclaration({ name: propertyName, value })}}`,
								),
							];
						},
					}),
				);
			}
		}

		return classNames.join(" ");
	};
};

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

const createNewStyles = <
	const StyleProperties extends
		| Partial<
				Record<
					keyof StyleObject,
					Record<string, string> | unknown[] | true
				>
		  >
		| StyleObject = StyleObject,
	Shorthands extends Record<string, (keyof StyleProperties)[]> = {},
>(contract: {
	properties?: StyleProperties; // or conditions
	shorthands?: Shorthands;
	states: Record<string | "base", `@media ${string}`>;
}) => {
	console.log(contract);

	type ProcessedProperties = StyleProperties extends StyleObject
		? StyleObject
		: {
				[Key in keyof StyleProperties]: StyleProperties[Key] extends (infer Value)[]
					? Value
					: StyleProperties[Key] extends Record<
								infer CustomPropertyValue,
								string
						  >
						? CustomPropertyValue
						: StyleProperties[Key] extends true
							? Key extends keyof StyleObject
								? StyleObject[Key]
								: never
							: never;
			};

	type ProcessedShorthands = Shorthands extends undefined
		? {}
		: {
				[K in keyof Shorthands]: Shorthands[K] extends (infer Properties)[]
					? Properties extends keyof ProcessedProperties
						? ProcessedProperties[Properties]
						: never
					: never;
			};

	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return {} as ProcessedProperties & ProcessedShorthands;
};

const test = createNewStyles({
	properties: {
		backgroundColor: theme.colors,
		boxShadow: true,
		color: theme.colors,
		paddingLeft: [0, 1, 2],
		paddingRight: [2, 3],
	},
	shorthands: {
		paddingHorizontal: ["paddingLeft", "paddingRight"],
		surface: ["color", "backgroundColor"],
	},
	states: {
		base: "@media (min-width: 0px)",
	},
});

console.log(test);
