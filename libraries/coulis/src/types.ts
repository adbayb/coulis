import type { HtmlAttributes, PropertiesFallback, Pseudos } from "csstype";

export type RecordLike = Record<number | string | symbol, unknown>;

export type ScopeKey =
	| "conditionalLonghand"
	| "conditionalShorthand"
	| "global"
	| "longhand"
	| "shorthand";

export type AtomicStyleObject = StyleObject<true>;

export type GlobalStyleObject =
	/**
	 * A union type is used instead of one with conditional typing
	 * since we're using a string index signature (via Ungreedy string) and, by design, TypeScript
	 * enforces all members within an interface/type to conform to the index signature value.
	 * However, here, we need to have a different value for AtTextualRule keys (string vs StyleObject).
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
	| {
			[Selector in
				| AtGroupingRule
				| UngreedyString
				| keyof HTMLElementTagNameMap]?: StyleObject;
	  }
	| {
			[Selector in AtTextualRule]?: string;
	  };

export type KeyframeStyleObject = {
	[Selector in number | "from" | "to" | `${number}%`]?: StyleObject;
};

export type StyleObject<HasAtomicValue = false> = {
	[Key in UngreedyString | keyof StyleProperty]?: HasAtomicValue extends false
		? StylePropertyValue<Key>
		:
				| Partial<
						Record<
							| HtmlAttributes
							| Pseudos
							| UngreedyString
							| "default",
							StylePropertyValue<Key>
						>
				  >
				| StylePropertyValue<Key>;
};

export type AtTextualRule = "@charset" | "@import" | "@layer" | "@namespace";

export type AtConditionalGroupingRule =
	| "@container"
	| "@document"
	| "@layer"
	| "@media"
	| "@scope"
	| "@starting-style"
	| "@supports";

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

/**
 * UngreedyString is a special string type allowing literal enums getting widened to the super type string when specified.
 * It allows to enable string type with literal enums without loosing autocomplete DX.
 * Credits to https://github.com/sindresorhus/type-fest/blob/716b8b2e9419fb4a2fa6e3bfdf05f8be252e59e2/source/literal-union.d.ts.
 * @see For more details, https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939
 */
export type UngreedyString = Record<never, never> & string;

type StyleProperty = PropertiesFallback<UngreedyString | number>;

type StylePropertyValue<Key extends UngreedyString | keyof StyleProperty> =
	Key extends keyof StyleProperty
		? StyleProperty[Key]
		: UngreedyString | number;
