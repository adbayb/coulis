export type RecordLike = Record<string, unknown>;

export type UngreedyString = Ungreedify<string>;

/**
 * A utility type to transform a primitive type (string, number, ...) to prevent literal enums getting widened to the primitive type when specified.
 * It allows, for example, to enable string type with literal enums without loosing autocomplete experience.
 * Credits to https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939.
 * @see For more details, https://github.com/Microsoft/TypeScript/issues/29729.
 */
type Ungreedify<U extends number | string> = Record<never, never> & U;

export const compose = (...input: string[]) => {
	return input.join(" ");
};

export const isNumber = (input: unknown): input is number => {
	return typeof input === "number" || !Number.isNaN(Number(input));
};

export const isObject = (input: unknown): input is Record<string, unknown> => {
	return typeof input === "object" && input !== null && !Array.isArray(input);
};
