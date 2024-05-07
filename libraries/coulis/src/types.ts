export type RecordLike = Record<number | string | symbol, unknown>;

/**
 * UngreedyString is a special string type allowing literal enums getting widened to the super type string when specified.
 * It allows to enable string type with literal enums without loosing autocomplete DX.
 * Credits to https://github.com/sindresorhus/type-fest/blob/716b8b2e9419fb4a2fa6e3bfdf05f8be252e59e2/source/literal-union.d.ts.
 * @see For more details, https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939
 */
export type UngreedyString = Record<never, never> & string;

export type Exactify<Value, AllowedKeys extends number | string | symbol> = {
	[K in keyof Value]: K extends AllowedKeys ? Value[K] : never;
};
