// oxlint-disable-next-line typescript/no-empty-object-type
export type EmptyRecord = {};
export type RecordLike = Record<string, unknown>;
export type UngreedyString = Ungreedify<string>;

/**
 * A utility type to preserve the record data structure except for leaf nodes that are mutated to
 * match the `LeafType`.
 */
export type WithNewLeafNodes<Object_ extends RecordLike, LeafType> = {
	[Key in keyof Object_]: Object_[Key] extends RecordLike
		? WithNewLeafNodes<Object_[Key], LeafType>
		: LeafType;
};

/**
 * A utility type to transform a primitive type (string, number, ...) to prevent literal enums
 * getting widened to the primitive type when specified. It allows, for example, to enable string
 * type with literal enums without loosing autocomplete experience. Credits to
 * https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939.
 *
 * @see For more details, https://github.com/Microsoft/TypeScript/issues/29729.
 */
type Ungreedify<U extends number | string> = Record<never, never> & U;

export const isNumeric = (input: unknown): boolean => {
	if (typeof input === "number") {
		return true;
	}

	return typeof input === "string" && input.trim() !== "" && !Number.isNaN(Number(input));
};

export const isObject = (input: unknown): input is Record<string, unknown> => {
	return typeof input === "object" && input !== null && !Array.isArray(input);
};
