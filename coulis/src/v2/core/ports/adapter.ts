import type { Properties as CSSProperties } from "csstype";

export type Adapter<Output> = {
	createCustomProperties: <const P extends CustomProperties>(
		properties: P,
	) => WithNewLeafNodes<P, string>;
	createKeyframes: (properties: KeyframesStyleProperties) => Output;
	createStyles: <
		const Properties extends CreateStylesProperties,
		const Options extends CreateStylesOptions<Properties>,
	>(
		properties: Exactify<Properties, keyof CreateStylesProperties>,
		options?: Options,
	) => (
		input: {
			[PropertyName in keyof Options["shorthands"]]?: Options["shorthands"][PropertyName] extends unknown[]
				? Options["shorthands"][PropertyName][number] extends keyof Properties
					? PropertyValue<
							Properties,
							Options["shorthands"][PropertyName][number],
							Options
						>
					: never
				: never;
		} & {
			[PropertyName in keyof Properties]?: PropertyValue<
				Properties,
				PropertyName,
				Options
			>;
		},
	) => Output;
	createVariants: <
		Styles extends ReturnType<Adapter<Output>["createStyles"]>,
		Variants extends Record<string, Record<string, Parameters<Styles>[0]>>,
	>(
		styles: Styles,
		variants: Variants,
	) => (selectedValueByVariant: {
		[Variant in keyof Variants]: keyof Variants[Variant];
	}) => string;
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-id", string>;
		content: string;
	}[];
	getMetadataAsString: () => string;
	setGlobalStyles: (properties: GlobalStyleProperties) => void;
};

export type CreateAdapter<Output> = (
	input: CreateIntermediateRepresentation,
) => Adapter<Output>;

/**
 * Data structure to represent a style entry.
 * The world of compiling inspires the naming.
 */
type IntermediateRepresentation<Payload extends RecordLike = RecordLike> = {
	id: string;
	isCached: boolean;
	payload: Payload;
	type: StyleType;
};

type CreateIntermediateRepresentation = <
	Payload extends RecordLike = RecordLike,
>(
	input: Pick<IntermediateRepresentation<Payload>, "id" | "payload" | "type">,
) => IntermediateRepresentation<Payload>;

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

type StyleType = (typeof STYLE_TYPES)[number];

type KeyframesStyleProperties = Partial<
	Record<number | "from" | "to" | `${number}%`, StyleProperties>
>;

type GlobalStyleProperties =
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

/**
 * Allow only string-based value to prevent type checking issues with property that doesn't accept `number` values (e.g. `color`, ...).
 * It'll also reduce the logic complexity: by enforcing string values, the unitless logic can be delegated and controlled consumer side.
 */
export type CustomProperty = {
	name: string;
	value: string;
};

/**
 * A utility type to preserve the record data structure except for leaf nodes that are mutated to match the `LeafType`.
 */
export type WithNewLeafNodes<Object_ extends RecordLike, LeafType> = {
	[Key in keyof Object_]: Object_[Key] extends CustomProperty["value"]
		? LeafType
		: Object_[Key] extends RecordLike
			? WithNewLeafNodes<Object_[Key], LeafType>
			: never;
};

export type CustomProperties = {
	[key: string]: CustomProperties | CustomProperty["value"];
};

type PropertyValue<
	Properties extends CreateStylesProperties,
	PropertyName extends keyof Properties,
	Options extends CreateStylesOptions<Properties>,
> = Properties[PropertyName] extends NativePropertyValue | undefined
	? PropertyName extends keyof StyleProperties
		? CreatePropertyValue<
				Properties,
				Options,
				PropertyName,
				GreedyStyleProperty<PropertyName>
			>
		: never
	: Properties[PropertyName] extends CustomPropertyValue<unknown>
		? Properties[PropertyName] extends (input: infer Value) => unknown
			? CreatePropertyValue<Properties, Options, PropertyName, Value>
			: Properties[PropertyName] extends
						| (infer Value)[]
						| Record<infer Value, unknown>
				? CreatePropertyValue<Properties, Options, PropertyName, Value>
				: never
		: never;

type CreatePropertyValue<
	Properties extends CreateStylesProperties,
	Options extends CreateStylesOptions<Properties>,
	PropertyName extends keyof Properties,
	Value,
> =
	| WithLooseValue<Properties, Options, PropertyName, Value>
	| (Options["states"] extends Record<infer State, unknown>
			? Partial<
					Record<
						State,
						WithLooseValue<Properties, Options, PropertyName, Value>
					>
				> &
					Record<
						"base",
						WithLooseValue<Properties, Options, PropertyName, Value>
					>
			: never)
	| undefined;

type WithLooseValue<
	Properties extends CreateStylesProperties,
	Options extends CreateStylesOptions<Properties>,
	PropertyName extends keyof Properties,
	Value,
> = Options["loose"] extends unknown[]
	? PropertyName extends Options["loose"][number]
		? PropertyName extends keyof StyleProperties
			? GreedyStyleProperty<PropertyName> | Value
			: Value
		: Value
	: Value;

type CustomPropertyValue<Value> =
	| Record<string, Value>
	| Value[]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| ((input: any) => Value);

type NativePropertyValue = true;

type CreateStylesProperties = {
	[K in keyof StyleProperties]?:
		| CustomPropertyValue<StyleProperties[K]>
		| NativePropertyValue;
};

type CreateStylesOptions<Properties extends CreateStylesProperties> = {
	loose?: (keyof Properties)[];
	shorthands?: Record<string, (keyof Properties)[]>;
	states?: Record<
		string,
		(input: { className: string; declaration: string }) => string
	> & {
		// The `base` state cannot be overwritten consumer-side
		base?: never;
	};
};

/**
 * Utility type to create a greedy style property value type.
 * By default, `csstype` includes `(string | number) & {}` hacky values on some CSS properties to allow preserving the autocomplete for literal enums.
 * However it comes with a tradeoff: string prototype keys are included if the property value is unioned with a record.
 * It lead to key pollution with undesired keys if the property is stateful.
 * To prevent such issue, the `csstype` hack is disabled via `Greedify` and let the primitive type widen the literal enum.
 * For more details, check the `Greedify` utility type JSDoc.
 */
type GreedyStyleProperty<PropertyName extends keyof StyleProperties> = Greedify<
	StyleProperties[PropertyName]
>;

type LooseStyleProperties = Record<
	UngreedyString,
	number | string | undefined
> &
	StyleProperties;

export type StyleProperties = CSSProperties<UngreedyString | number>;

export type ClassName = string;

export type RecordLike = Record<number | string | symbol, unknown>;

type UngreedyString = Ungreedify<string>;

/**
 * A utility type to transform a primitive type (string, number, ...) to prevent literal enums getting widened to the primitive type when specified.
 * It allows, for example, to enable string type with literal enums without loosing autocomplete experience.
 * Credits to https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939.
 * @see For more details, https://github.com/Microsoft/TypeScript/issues/29729.
 */
type Ungreedify<U extends number | string> = Record<never, never> & U;

/**
 * Utility type to revert back `Ungreedify` hack.
 * As documented above, it will lead to a degraded autocomplete experience (e.g. `string` type will absorb literal enum types) but can be necessary to prevent type pollution due to the `{}` intersection.
 * The pollution can be mitigated with this workaround https://github.com/microsoft/TypeScript/issues/29729#issuecomment-700527227
 * but it cannot be done with types not controlled on our side (such as `csstype` which doesn't provide a way to get literal enums without primitive types).
 */
type Greedify<Value> = Value extends (infer AValue)[]
	? (AValue extends infer UnpackedValue & Record<never, never>
			? UnpackedValue
			: AValue)[]
	: Value extends infer UnpackedValue & Record<never, never>
		? UnpackedValue
		: Value;

type Exactify<Value, AllowedKeys extends number | string | symbol> = {
	[K in keyof Value]: K extends AllowedKeys ? Value[K] : never;
};
