export type RecordLike = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyRecord = {};

export type UngreedyString = Ungreedify<string>;

export type Exactify<Value, AllowedKeys extends number | string | symbol> = {
	[K in keyof Value]: K extends AllowedKeys ? Value[K] : never;
};

/**
 * A utility type to preserve the record data structure except for leaf nodes that are mutated to match the `LeafType`.
 */
export type WithNewLeafNodes<Object_ extends RecordLike, LeafType> = {
	[Key in keyof Object_]: Object_[Key] extends RecordLike
		? WithNewLeafNodes<Object_[Key], LeafType>
		: LeafType;
};

/**
 * A utility type to transform a primitive type (string, number, ...) to prevent literal enums getting widened to the primitive type when specified.
 * It allows, for example, to enable string type with literal enums without loosing autocomplete experience.
 * Credits to https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939.
 * @see For more details, https://github.com/Microsoft/TypeScript/issues/29729.
 */
type Ungreedify<U extends number | string> = Record<never, never> & U;

export const compose = <Value>(
	startingFunction: (input: Value) => Value,
	...restFunctions: ((input: Value) => Value)[]
) => {
	return restFunctions.reduce(
		(previousFunction, nextFunction) => (value) =>
			previousFunction(nextFunction(value)),
		startingFunction,
	);
};
export const isNumber = (input: unknown): input is number => {
	return typeof input === "number" || !Number.isNaN(Number(input));
};

export const isObject = (input: unknown): input is Record<string, unknown> => {
	return typeof input === "object" && input !== null && !Array.isArray(input);
};
