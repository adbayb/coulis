import { createDeclaration, isShorthandProperty } from "../../entities/style";
import type { StyleProperties } from "../../entities/style";
import { STYLESHEETS } from "../../entities/stylesheet";
import { createError, isObject } from "../../helpers";
import type { Exactify, Greedify } from "../../types";

/**
 * A factory to configure and create type-safe `styles` method.
 * @param properties - Properties configuration.
 * @param options - Optional values to decorate and/or modify the provided configuration.
 * @returns The `styles` method to generate a class name from a list of type-safe CSS properties.
 * @example
 * 	const styles = createStyles({ backgroundColor: ["red"] });
 * 	const className = styles({ backgroundColor: "red" });
 */
export const createStyles = <
	const Properties extends CreateStylesProperties,
	const Options extends CreateStylesOptions<Properties>,
>(
	properties: Exactify<Properties, keyof CreateStylesProperties>,
	options?: Options,
) => {
	type ShorthandProperties = Options["shorthands"];

	const shorthands = options?.shorthands ?? {};
	const states = options?.states ?? {};
	const configuredShorthandNames = Object.keys(shorthands);

	const isShorthandKey = (
		key: string,
	): key is Extract<keyof ShorthandProperties, string> => {
		return configuredShorthandNames.includes(key);
	};

	const getDeclaration = ({
		name,
		value,
	}: {
		name: keyof StyleProperties;
		value: number | string | undefined;
	}) => {
		if (value === undefined) return;

		const propConfig = properties[name];

		if (!propConfig) {
			throw new Error(
				createError({
					api: "styles",
					cause: `No configuration found for property \`${name}\``,
					solution:
						"Review the corresponding `createStyles` factory to include the needed property configuration",
				}),
			);
		}

		const mappedValue =
			typeof propConfig === "boolean" || !isObject(propConfig)
				? value
				: propConfig[value];

		return createDeclaration({
			name,
			value: mappedValue ?? value,
		});
	};

	const createRules = (
		name: keyof StyleProperties,
		value:
			| Record<string, number | string | undefined>
			| number
			| string
			| undefined,
		// eslint-disable-next-line sonarjs/cognitive-complexity
	) => {
		const classNames: string[] = [];
		const isNativeShorthandProperty = isShorthandProperty(name);

		let styleSheet = isNativeShorthandProperty
			? STYLESHEETS.shorthand
			: STYLESHEETS.longhand;

		if (!isObject(value)) {
			const declaration = getDeclaration({
				name,
				value,
			});

			if (!declaration) return classNames;

			classNames.push(
				styleSheet.commit({
					key: declaration,
					createRules(className) {
						return `.${className}{${declaration}}`;
					},
				}),
			);

			return classNames;
		}

		const keys = Object.keys(value);

		for (const key of keys) {
			const inputValue = value[key];

			const declaration = getDeclaration({
				name,
				value: inputValue,
			});

			if (!declaration) continue;

			const isBaseState = key === "base";

			const stateBuilder = isBaseState
				? () => `.{{className}}{${declaration}}`
				: states[key];

			if (typeof stateBuilder !== "function") {
				throw new Error(
					createError({
						api: "styles",
						cause: `No configuration found for state \`${key}\``,
						solution:
							"Review the corresponding `createStyles` factory to include the needed `states` configuration",
					}),
				);
			}

			const preComputedRule = stateBuilder({
				className: ".{{className}}",
				declaration,
			});

			if (preComputedRule.startsWith("@")) {
				styleSheet = isNativeShorthandProperty
					? STYLESHEETS.atShorthand
					: STYLESHEETS.atLonghand;
			}

			classNames.push(
				styleSheet.commit({
					key:
						// The key is not included to compute the className when `key` equals to "base" as base is equivalent to an unconditional value.
						// This exclusion will allow to recycle cache if the style value has been already defined unconditionally.
						isBaseState ? declaration : `${key}${declaration}`,
					createRules(className) {
						return preComputedRule.replace(
							"{{className}}",
							className,
						);
					},
				}),
			);
		}

		return classNames;
	};

	const styles = (
		input: {
			[PropertyName in keyof Properties]?: PropertyValue<
				Properties,
				PropertyName,
				Options
			>;
		} & {
			[PropertyName in keyof ShorthandProperties]?: ShorthandProperties[PropertyName] extends unknown[]
				? ShorthandProperties[PropertyName][number] extends keyof Properties
					? PropertyValue<
							Properties,
							ShorthandProperties[PropertyName][number],
							Options
						>
					: never
				: never;
		},
	) => {
		const classNames: string[] = [];

		for (const propertyName of Object.keys(input)) {
			const value = (
				input as Record<string, Parameters<typeof createRules>[1]>
			)[propertyName];

			if (isShorthandKey(propertyName)) {
				const shorthandConfig = shorthands[
					propertyName
				] as (keyof StyleProperties)[];

				for (const shorthandName of shorthandConfig) {
					classNames.push(...createRules(shorthandName, value));
				}
			} else {
				classNames.push(
					...createRules(
						propertyName as keyof StyleProperties,
						value,
					),
				);
			}
		}

		return classNames.join(" ");
	};

	return Object.assign(styles, {
		getPropertyNames() {
			const nativeNames = Object.keys(properties) as (keyof Properties)[];

			const shorthandNames = Object.keys(
				shorthands,
			) as (keyof Options["shorthands"])[];

			return [...nativeNames, ...shorthandNames];
		},
	});
};

type PropertyValue<
	Properties extends CreateStylesProperties,
	PropertyName extends keyof Properties,
	Options extends CreateStylesOptions<Properties>,
> = Properties[PropertyName] extends NativePropertyValue | undefined
	? PropertyName extends keyof StyleProperties
		? CreatePropertyValue<
				Properties,
				Options,
				PropertyName,
				GreedyStyleProperty<PropertyName>
			>
		: never
	: Properties[PropertyName] extends CustomPropertyValue<unknown>
		? Properties[PropertyName] extends (infer Value)[]
			? CreatePropertyValue<Properties, Options, PropertyName, Value>
			: Properties[PropertyName] extends Record<infer Value, unknown>
				? CreatePropertyValue<Properties, Options, PropertyName, Value>
				: never
		: never;

type CreatePropertyValue<
	Properties extends CreateStylesProperties,
	Options extends CreateStylesOptions<Properties>,
	PropertyName extends keyof Properties,
	Value,
> =
	| WithLooseValue<Properties, Options, PropertyName, Value>
	| (Options["states"] extends Record<infer State, unknown>
			? Partial<
					Record<
						State,
						WithLooseValue<Properties, Options, PropertyName, Value>
					>
				> &
					Record<
						"base",
						WithLooseValue<Properties, Options, PropertyName, Value>
					>
			: never)
	| undefined;

type WithLooseValue<
	Properties extends CreateStylesProperties,
	Options extends CreateStylesOptions<Properties>,
	PropertyName extends keyof Properties,
	Value,
> = Options["loose"] extends unknown[]
	? PropertyName extends Options["loose"][number]
		? PropertyName extends keyof StyleProperties
			? GreedyStyleProperty<PropertyName> | Value
			: Value
		: Value
	: Value;

type CustomPropertyValue<Value> = Record<string, Value> | Value[];

type NativePropertyValue = true;

type CreateStylesProperties = {
	[K in keyof StyleProperties]?:
		| CustomPropertyValue<StyleProperties[K]>
		| NativePropertyValue;
};

type CreateStylesOptions<Properties extends CreateStylesProperties> = {
	loose?: (keyof Properties)[];
	shorthands?: Record<string, (keyof Properties)[]>;
	states?: Record<
		string,
		(input: { className: string; declaration: string }) => string
	> & {
		// The `base` state cannot be overwritten consumer-side
		base?: never;
	};
};

/**
 * Utility type to create a greedy style property value type.
 * By default, `csstype` includes `(string | number) & {}` hacky values on some CSS properties to allow preserving the autocomplete for literal enums.
 * However it comes with a tradeoff: string prototype keys are included if the property value is unioned with a record.
 * It lead to key pollution with undesired keys if the property is stateful.
 * To prevent such issue, the `csstype` hack is disabled via `Greedify` and let the primitive type widen the literal enum.
 * For more details, check the `Greedify` utility type JSDoc.
 */
type GreedyStyleProperty<PropertyName extends keyof StyleProperties> = Greedify<
	StyleProperties[PropertyName]
>;
