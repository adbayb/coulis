import { SHORTHAND_PROPERTIES } from "../constants";
import { createClassName } from "../entities/className";
import { SCOPES } from "../entities/scope";
import { isObject, toDeclaration } from "../helpers";
import type { StyleObject } from "../types";

type CustomProperty = {
	allowNativeValues?: boolean;
	keys?: (input: { className: string; declaration: string }) => Record<
		string,
		string
	> & {
		base?: never;
	};
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
	Property["keys"] extends (
		...params: Parameters<NonNullable<Property["keys"]>>
	) => Record<infer Key, string>
		?
				| Value
				| (Partial<Record<Key, Value>> & {
						base: Value;
				  })
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

	// eslint-disable-next-line sonarjs/cognitive-complexity
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

		const keys = Object.keys(value);

		if (!isObject(propConfig) || !propConfig.keys) {
			throw new Error(
				`Missing \`keys\` configuration for property ${name}. It must be set up to define contextual style values.`,
			);
		}

		for (const key of keys) {
			const inputValue = value[key];

			if (inputValue === undefined) continue;

			const declaration = createDeclaration({
				name,
				value: inputValue,
			});

			if (!declaration) continue;

			const className = createClassName(
				// The key is not included to compute the className when `key` equals to "base" as base is equivalent to an unconditional value.
				// This exclusion will allow to recycle cache if the style value has been already defined unconditionally.
				key === "base" ? declaration : `${key}${declaration}`,
			);

			const rule =
				propConfig.keys({
					className: `.${className}`,
					declaration,
				})[key] ?? `.${className}{${declaration}}`;

			if (rule.startsWith("@")) {
				scope = isNativeShorthandProperty
					? SCOPES.conditionalShorthand
					: SCOPES.conditionalLonghand;
			}

			classNames.push(className);
			scope.styleSheet.commit(className, rule);
		}

		return classNames;
	};

	return (input: StyleProps<Properties, Shorthands>) => {
		const classNames: string[] = [];

		for (const propertyName of Object.keys(input)) {
			const value = input[propertyName] as StyleInputValue;

			if (isShorthandProperty(propertyName)) {
				const shorthandConfig = (
					options.shorthands as NonNullable<Shorthands>
				)[propertyName] as string[];

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
