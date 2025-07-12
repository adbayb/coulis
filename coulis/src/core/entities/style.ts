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
> =
	/**
	 * A union type is used instead of one with conditional typing
	 * since we're using a string index signature (via Ungreedy string) and, by design, TypeScript
	 * enforces all members within an interface/type to conform to the index signature value.
	 * However, here, we need to have a different value for AtTextualRule keys (string vs StyleProperties).
	 * To prevent index signature, we're separating the two divergent value typing needs.
	 * @see https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures
	 * @see https://stackoverflow.com/a/63430341
	 *
	 * Why are we using union (|) instead of intersection (&)?
	 * Well, the union `A | B` means this type is either a or b. But intersection `A & B` means a combination of A and B so that
	 * the new type has to satisfy every constraint in both types (including enforcing all members to match the index signature value).
	 * Hopefully, in a union type, TypeScript currently doesn't operate exclusive union (ie. for A | B either A or B strictly)
	 * helping us to omit index signature constraint while still having the ability to specify either property from A and/or B without type error
	 * (even for object literal, TypeScript will complain only about properties that don't appear on any of both A & B (without union, excess property checking is done))
	 * @see https://stackoverflow.com/a/46370791 and https://github.com/Microsoft/TypeScript/issues/14094#issuecomment-280129798
	 */
	{
		[Selector in
			| AtGroupingRule
			| AtTextualRule
			| UngreedyString
			| keyof HTMLElementTagNameMap]?: Selector extends AtTextualRule
			? string
			: Selector extends AtGroupingRule | keyof HTMLElementTagNameMap
				? Styles<P, Shorthands, undefined>
				: Styles<P, Shorthands, undefined> | string;
	};

type AtTextualRule = "@charset" | "@import" | "@layer" | "@namespace";

type AtGroupingRule =
	| "@color-profile"
	| "@counter-style"
	| "@font-face"
	| "@font-feature-values"
	| "@font-palette-values"
	| "@page"
	| "@property"
	| "@scroll-timeline"
	| "@viewport";

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
