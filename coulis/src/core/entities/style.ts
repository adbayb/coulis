import type { AtRule, Properties as CSSProperties } from "csstype";

import type { StatesLike } from "./state";
import type { ShortandsLike } from "./shorthand";
import type { EmptyRecord, UngreedyString } from "./primitive";

/**
 * The order is important to enforce the more precise properties take precedence over less precise ones.
 * Global properties has a lesser specificity than (<) shorthand ones:
 * global (e.g div { background-color }) < shorthand (e.g background) < longhand (e.g background-color) < conditional-shorthand (e.g @media { background }) < conditional-longhand (e.g @media { background-color }) properties.
 */
export const STYLE_TYPES = Object.freeze([
	"global",
	"shorthand",
	"longhand",
	"atShorthand",
	"atLonghand",
] as const);

export type StyleType = (typeof STYLE_TYPES)[number];

export type PropertiesLike = {
	[K in keyof NativeProperties]?:
		| CustomPropertyValue<NativeProperties[K]>
		| NativePropertyValue;
};

export type Styles<
	P extends PropertiesLike,
	Shorthands extends ShortandsLike<P> | undefined,
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

export type GlobalStyles<
	P extends PropertiesLike,
	Shorthands extends ShortandsLike<P> | undefined,
> = Record<
	string,
	| Record<string, string>
	| WithUngreedyString<Styles<P, Shorthands, undefined>>
	| string
>;

type WithUngreedyString<Properties extends Record<string, unknown>> = {
	[Key in keyof Properties]: Properties[Key] | UngreedyString;
};

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
			: P[PropertyName] extends
						| (infer Value)[]
						| Record<infer Value, unknown>
				? CreatePropertyValue<Value, S>
				: never
		: never;

type CreatePropertyValue<Value, S extends StatesLike | undefined> =
	| Value
	| (S extends Record<infer State, unknown>
			? Partial<Record<State, Value>> & Record<"base", Value>
			: never)
	| undefined;

type CustomPropertyValue<Value> =
	| Record<string, Value>
	| Value[]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| ((input: any) => Value);

type NativePropertyValue = true;

type NativeProperties = AtRule.FontFace &
	CSSProperties<UngreedyString | number>;
