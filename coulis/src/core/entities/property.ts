import type { AtRule, Properties as CSSProperties } from "csstype";

import type { StatesLike } from "./state";
import type { UngreedyString } from "./primitive";

export type PropertiesLike = {
	[K in keyof NativeProperties]?:
		| CustomPropertyValue<NativeProperties[K]>
		| NativePropertyValue;
};

export type PropertyValue<
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
