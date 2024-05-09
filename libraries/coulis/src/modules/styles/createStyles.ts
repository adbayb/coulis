import { createDeclaration, isShorthandProperty } from "../../entities/style";
import type { StyleProperties } from "../../entities/style";
import { STYLESHEETS } from "../../entities/stylesheet";
import { isObject } from "../../helpers";
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
	type ShorthandProperties = Options["shorthandProperties"];

	const configuredShorthandNames = Object.keys(
		options?.shorthandProperties ?? {},
	);

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

		if (!propConfig) return;

		const mappedValue =
			typeof propConfig === "boolean" || !isObject(propConfig)
				? value
				: propConfig[value];

		if (mappedValue === undefined) return;

		return createDeclaration({
			name,
			value: mappedValue,
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

			const stateBuilder = options?.states?.[key];
			const isBaseState = key === "base";

			const preComputedRule =
				isBaseState || typeof stateBuilder !== "function"
					? `.{{className}}{${declaration}}`
					: stateBuilder({
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

	return (
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
				const shorthandConfig = (
					options?.shorthandProperties as NonNullable<ShorthandProperties>
				)[propertyName] as (keyof StyleProperties)[];

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
				StyleProperties[PropertyName]
			>
		: never
	: Properties[PropertyName] extends CustomPropertyValue<unknown>
		? Properties[PropertyName] extends (infer Value)[]
			? CreatePropertyValue<Properties, Options, PropertyName, Value>
			: Properties[PropertyName] extends Record<infer Value, unknown>
				? CreatePropertyValue<Properties, Options, PropertyName, Value>
				: never
		: never;

// TODO test generic extends Value | Record<string, Value> (one at a given time)
type CreatePropertyValue<
	Properties extends CreateStylesProperties,
	Options extends CreateStylesOptions<Properties>,
	PropertyName extends keyof Properties,
	Value,
> =
	// By default, `csstype` includes `(string | number) & {}` hacky values on some CSS properties to allow preserving the autocomplete for literal enums.
	// However it comes with a tradeoff: string prototype keys are included if the property value is unioned with a record.
	// It lead to key pollution with undesired keys if the property is stateful.
	// To prevent such issue, the `csstype` hack is disabled via `Greedify` and let the primitive type widen the literal enum.
	// For more details, check the `Greedify` utility type JSDoc.
	| Greedify<WithLooseValue<Properties, Options, PropertyName, Value>>
	| (Options["states"] extends Record<infer State, unknown>
			? Greedify<
					Partial<
						Record<
							State,
							WithLooseValue<
								Properties,
								Options,
								PropertyName,
								Value
							>
						>
					> & {
						base: WithLooseValue<
							Properties,
							Options,
							PropertyName,
							Value
						>;
					}
				>
			: never)
	| undefined;

type WithLooseValue<
	Properties extends CreateStylesProperties,
	Options extends CreateStylesOptions<Properties>,
	PropertyName extends keyof Properties,
	Value,
> = Options["looseProperties"] extends unknown[]
	? PropertyName extends Options["looseProperties"][number]
		? PropertyName extends keyof StyleProperties
			? StyleProperties[PropertyName] | Value
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
	looseProperties?: (keyof Properties)[];
	shorthandProperties?: Record<string, (keyof Properties)[]>;
	states?: Record<
		string,
		(input: { className: string; declaration: string }) => string
	> & {
		// The `base` state cannot be overwritten consumer side
		base?: never;
	};
};
