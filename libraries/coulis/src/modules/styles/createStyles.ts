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
		importantFlag = false,
		value,
	}: {
		name: keyof StyleProperties;
		importantFlag?: boolean;
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
			importantFlag,
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
	) => {
		const output: {
			classNames: string[];
			styles: Record<string, number | string | undefined>;
		} = {
			classNames: [],
			styles: {},
		};

		const commitStyles = (params: {
			name: keyof StyleProperties;
			value: number | string | undefined;
		}) => {
			const declaration = getDeclaration(params);

			if (!declaration) return output;

			output.styles[name] = declaration.value;

			return output;
		};

		const isNativeShorthandProperty = isShorthandProperty(name);

		if (!isObject(value)) {
			return commitStyles({ name, value });
		}

		const keys = Object.keys(value);

		for (const key of keys) {
			const stateBuilder = options?.states?.[key];
			const inputValue = value[key];
			const isBaseState = key === "base";

			if (isBaseState) {
				commitStyles({ name, value: inputValue });

				continue;
			}

			const declaration = getDeclaration({
				name,
				importantFlag: true,
				value: inputValue,
			});

			if (!declaration || typeof stateBuilder !== "function") continue;

			const stringifiedDeclaration = String(declaration);

			const preComputedRule = stateBuilder({
				className: ".{{className}}",
				declaration: stringifiedDeclaration,
			});

			const isAtRule = preComputedRule.startsWith("@");

			const styleSheet = isNativeShorthandProperty
				? STYLESHEETS[isAtRule ? "atShorthand" : "shorthand"]
				: STYLESHEETS[isAtRule ? "atLonghand" : "longhand"];

			const { className } = styleSheet.commit({
				key: `${key}${stringifiedDeclaration}`,
				createRules(cName) {
					return preComputedRule.replace("{{className}}", cName);
				},
			});

			output.classNames.push(className);
		}

		return output;
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
		let styles: Record<string, number | string | undefined> = {};
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
					const output = createRules(shorthandName, value);

					styles = {
						...styles,
						...output.styles,
					};
					classNames.push(...output.classNames);
				}
			} else {
				const output = createRules(
					propertyName as keyof StyleProperties,
					value,
				);

				styles = {
					...styles,
					...output.styles,
				};
				classNames.push(...output.classNames);
			}
		}

		return {
			className: classNames.join(" "),
			style: styles,
		};
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
