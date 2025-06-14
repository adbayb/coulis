export type RecordLike = Record<number | string | symbol, unknown>;

export type UngreedyString = Ungreedify<string>;

/**
 * A utility type to transform a primitive type (string, number, ...) to prevent literal enums getting widened to the primitive type when specified.
 * It allows, for example, to enable string type with literal enums without loosing autocomplete experience.
 * Credits to https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939.
 * @see For more details, https://github.com/Microsoft/TypeScript/issues/29729.
 */
export type Ungreedify<U extends number | string> = Record<never, never> & U;

/**
 * Utility type to revert back `Ungreedify` hack.
 * As documented above, it will lead to a degraded autocomplete experience (e.g. `string` type will absorb literal enum types) but can be necessary to prevent type pollution due to the `{}` intersection.
 * The pollution can be mitigated with this workaround https://github.com/microsoft/TypeScript/issues/29729#issuecomment-700527227
 * but it cannot be done with types not controlled on our side (such as `csstype` which doesn't provide a way to get literal enums without primitive types).
 */
export type Greedify<Value> = Value extends (infer AValue)[]
	? (AValue extends infer UnpackedValue & Record<never, never>
			? UnpackedValue
			: AValue)[]
	: Value extends infer UnpackedValue & Record<never, never>
		? UnpackedValue
		: Value;

export type Exactify<Value, AllowedKeys extends number | string | symbol> = {
	[K in keyof Value]: K extends AllowedKeys ? Value[K] : never;
};
