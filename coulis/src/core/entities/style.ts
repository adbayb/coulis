import type { AtRule, Properties as CSSProperties } from "csstype";
import type { EmptyRecord, UngreedyString } from "./primitive";
import { isObject } from "./primitive";

export type GlobalStyles<
	P extends PropertiesLike,
	Shorthands extends ShorthandsLike<P> | undefined,
> = Record<
	string,
	Record<string, string> | string | WithUngreedyString<Styles<P, Shorthands, undefined>>
>;

export type Keyframes<
	P extends PropertiesLike,
	Shorthands extends ShorthandsLike<P> | undefined,
> = Partial<Record<"from" | "to" | `${number}%` | number, Styles<P, Shorthands, undefined>>>;

export type PropertiesLike = {
	[K in keyof NativeProperties]?: CustomPropertyValue<NativeProperties[K]> | NativePropertyValue;
};

export type ShorthandsLike<P extends PropertiesLike> = Record<string, (keyof P)[]>;
export type StatesLike = Record<string, string>;

export type Styles<
	P extends PropertiesLike,
	Shorthands extends ShorthandsLike<P> | undefined,
	States extends StatesLike | undefined,
> = (Shorthands extends undefined
	? EmptyRecord
	: {
			[PropertyName in keyof Shorthands]?: Shorthands[PropertyName] extends (keyof P)[]
				? PropertyValue<Shorthands[PropertyName][number], P, States>
				: never;
		}) & {
	[PropertyName in keyof P]?: PropertyValue<PropertyName, P, States>;
};

/**
 * Resolves a style value against its contract property definition: functions are invoked, records
 * act as lookup maps (falling back to the raw value), anything else (`true`, arrays) passes the
 * value through.
 *
 * @param definition - The property definition from the contract `properties`.
 * @param value - The raw style value.
 * @returns The resolved value.
 */
export const resolvePropertyValue = (definition: unknown, value: unknown): unknown => {
	if (typeof definition === "function") {
		return (definition as (input: unknown) => unknown)(value);
	}

	if (isObject(definition)) {
		return definition[value as string] ?? value;
	}

	return value;
};

type CreatePropertyValue<Value, S extends StatesLike | undefined> =
	| (S extends Record<infer State, unknown>
			? Partial<Record<State, Value>> & Record<"base", Value>
			: never)
	| undefined
	| Value;

type CustomPropertyValue<Value> =
	// oxlint-disable-next-line typescript/no-explicit-any
	((input: any) => Value) | Record<string, Value> | Value[];

type NativeProperties = AtRule.FontFace & CSSProperties<number | UngreedyString>;

type NativePropertyValue = true;

type PropertyValue<
	PropertyName extends keyof P,
	P extends PropertiesLike,
	S extends StatesLike | undefined,
> = P[PropertyName] extends NativePropertyValue | undefined
	? PropertyName extends keyof NativeProperties
		? CreatePropertyValue<NativeProperties[PropertyName], S>
		: never
	: P[PropertyName] extends CustomPropertyValue<unknown>
		? P[PropertyName] extends (input: infer Value) => unknown
			? CreatePropertyValue<Value, S>
			: // oxlint-disable-next-line no-redeclare
				P[PropertyName] extends (infer Value)[] | Record<infer Value, unknown>
				? CreatePropertyValue<Value, S>
				: never
		: never;

type WithUngreedyString<Properties extends Record<string, unknown>> = {
	[Key in keyof Properties]: Properties[Key] | UngreedyString;
};
