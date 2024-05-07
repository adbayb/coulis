import { createDeclaration } from "../../entities/style";
import type { StyleProperties } from "../../entities/style";
import { STYLESHEETS } from "../../entities/stylesheet";
import { isObject } from "../../helpers";

/**
 * A factory to configure and create type-safe `styles` method.
 * @param configuration - Properties configuration.
 * @param options - Optional values to decorate and/or modify the provided configuration.
 * @param options.shorthands - The shorthand aliases configuration.
 * @returns The `styles` method to generate a class name from a list of type-safe CSS properties.
 * @example
 * 	const styles = createStyles({ backgroundColor: { values: ["red"] }});
 * 	const className = styles({ backgroundColor: "red" });
 */
export const createStyles = <
	const Properties extends PropertyConfiguration,
	const Shorthands extends ShorthandConfiguration<Properties>,
>(
	configuration: Exactify<PropertyConfiguration, Properties>,
	options: { shorthands?: Shorthands } = {},
) => {
	const configuredShorthandNames = Object.keys(options.shorthands ?? {});

	const isShorthandProperty = (
		key: string,
	): key is Extract<keyof Shorthands, string> => {
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

		const propConfig = configuration[name as keyof typeof configuration];

		if (!propConfig) return;

		const mappedValue =
			typeof propConfig === "boolean" || !isObject(propConfig.values)
				? value
				: propConfig.values[value];

		if (mappedValue === undefined) return;

		return createDeclaration({
			name,
			value: mappedValue,
		});
	};

	const createRules = (
		name: keyof StyleProperties,
		value: StyleInputValue,
		// eslint-disable-next-line sonarjs/cognitive-complexity
	) => {
		const classNames: string[] = [];
		const propConfig = configuration[name as keyof typeof configuration];
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

		if (!isObject(propConfig) || !propConfig.keys) {
			throw new Error(
				`Missing \`keys\` configuration for property ${name}. It must be set up to define contextual style values.`,
			);
		}

		for (const key of keys) {
			const inputValue = value[key];

			const declaration = getDeclaration({
				name,
				value: inputValue,
			});

			if (!declaration) continue;

			const preComputedRule =
				propConfig.keys[key]?.({
					className: ".{{className}}",
					declaration,
				}) ?? `.{{className}}{${declaration}}`;

			if (preComputedRule.startsWith("@")) {
				styleSheet = isNativeShorthandProperty
					? STYLESHEETS.conditionalShorthand
					: STYLESHEETS.conditionalLonghand;
			}

			classNames.push(
				styleSheet.commit({
					key:
						// The key is not included to compute the className when `key` equals to "base" as base is equivalent to an unconditional value.
						// This exclusion will allow to recycle cache if the style value has been already defined unconditionally.
						key === "base" ? declaration : `${key}${declaration}`,
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

	return (input: StylesInput<Properties, Shorthands>) => {
		const classNames: string[] = [];

		for (const propertyName of Object.keys(input)) {
			const value = input[propertyName] as StyleInputValue;

			if (isShorthandProperty(propertyName)) {
				const shorthandConfig = (
					options.shorthands as NonNullable<Shorthands>
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

type StylesInput<
	Properties extends PropertyConfiguration,
	Shorthands extends ShorthandConfiguration<Properties>,
> = {
	[PropertyName in keyof Properties]?: Properties[PropertyName] extends CustomProperty
		? CustomStylesOutput<
				Properties[PropertyName],
				| (Properties[PropertyName]["allowNativeValues"] extends true
						? PropertyName extends keyof StyleProperties
							? StyleProperties[PropertyName]
							: never
						: never)
				| (Properties[PropertyName]["values"] extends unknown[]
						? Properties[PropertyName]["values"][number]
						: Properties[PropertyName]["values"] extends Record<
									string,
									unknown
							  >
							? keyof Properties[PropertyName]["values"]
							: PropertyName extends keyof StyleProperties
								? StylesOutput<StyleProperties[PropertyName]>
								: never)
			>
		: Properties[PropertyName] extends NativeProperty
			? PropertyName extends keyof StyleProperties
				? StylesOutput<StyleProperties[PropertyName]>
				: never
			: never;
} & {
	[PropertyName in keyof Shorthands]?: Shorthands[PropertyName] extends unknown[]
		? Properties[Shorthands[PropertyName][number]] extends infer ReferencedProperty
			? ReferencedProperty extends CustomProperty
				? CustomStylesOutput<
						ReferencedProperty,
						ReferencedProperty["values"] extends unknown[]
							? ReferencedProperty["values"][number]
							: ReferencedProperty["values"] extends Record<
										string,
										unknown
								  >
								? keyof ReferencedProperty["values"]
								: Shorthands[PropertyName][number] extends keyof StyleProperties
									? StylesOutput<
											StyleProperties[Shorthands[PropertyName][number]]
										>
									: never
					>
				: ReferencedProperty extends NativeProperty
					? Shorthands[PropertyName][number] extends keyof StyleProperties
						? StylesOutput<
								StyleProperties[Shorthands[PropertyName][number]]
							>
						: never
					: never
			: never
		: never;
};

type StyleInputValue =
	| Record<string, number | string | undefined>
	| number
	| string
	| undefined;

type CustomProperty = {
	/**
	 * Option to enable extending configured values with vanilla allowed values.
	 * @default false
	 */
	allowNativeValues?: boolean;
	keys?: Record<
		string,
		(input: { className: string; declaration: string }) => string
	> & {
		// The `base` state cannot be overwritten consumer side
		base?: never;
	};
	values?: (number | string)[] | Record<string, number | string>;
};

type NativeProperty = true;

type PropertyConfiguration = Partial<
	Record<keyof StyleProperties, CustomProperty | NativeProperty>
>;

type ShorthandConfiguration<Properties extends PropertyConfiguration> = Record<
	string,
	(keyof Properties)[]
>;

type StylesOutput<Value> = Value | undefined;

type CustomStylesOutput<Property extends CustomProperty, Value> = StylesOutput<
	Property["keys"] extends Record<
		infer Key,
		NonNullable<Property["keys"]>[string]
	>
		?
				| Value
				| (Partial<Record<Key, Value>> & {
						base: Value;
				  })
		: Value
>;

type Exactify<T, X extends T> = T & {
	[K in keyof X]: K extends keyof T ? X[K] : never;
};
