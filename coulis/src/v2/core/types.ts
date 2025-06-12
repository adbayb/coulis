import type { Properties as CSSProperties } from "csstype";

/**
 * A utility type to transform a primitive type (string, number, ...) to prevent literal enums getting widened to the primitive type when specified.
 * It allows, for example, to enable string type with literal enums without loosing autocomplete experience.
 * Credits to https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939.
 * @see For more details, https://github.com/Microsoft/TypeScript/issues/29729.
 */
export type Ungreedify<U extends number | string> = Record<never, never> & U;

type UngreedyString = Ungreedify<string>;

export type StyleProperties = CSSProperties<UngreedyString | number>;

export type CreateKeyframesInput = Partial<
	Record<number | "from" | "to" | `${number}%`, StyleProperties>
>;

export type SetGlobalStylesInput =
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
				? LooseStyleProperties
				: LooseStyleProperties | string;
	};

type LooseStyleProperties = Record<
	UngreedyString,
	number | string | undefined
> &
	StyleProperties;

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

export type CreateCustomPropertiesInput = {
	[key: string]: CreateCustomPropertiesInput | PropertyValue;
};

export type CreateCustomPropertiesOutput<
	P extends CreateCustomPropertiesInput,
> = WithNewLeafNodes<P, PropertyValue>;

type CustomProperty = {
	name: string;
	value: string;
};

/**
 * Allow only string-based value to prevent type checking issues with property that doesn't accept `number` values (e.g. `color`, ...).
 * It'll also reduce the logic complexity: by enforcing string values, the unitless logic can be delegated and controlled consumer side.
 */
type PropertyValue = CustomProperty["value"];

/**
 * A utility type to preserve the record data structure except for leaf nodes that are mutated to match the `LeafType`.
 */
type WithNewLeafNodes<Object_ extends RecordLike, LeafType> = {
	[Key in keyof Object_]: Object_[Key] extends PropertyValue
		? LeafType
		: Object_[Key] extends RecordLike
			? WithNewLeafNodes<Object_[Key], LeafType>
			: never;
};

export type RecordLike = Record<number | string | symbol, unknown>;
