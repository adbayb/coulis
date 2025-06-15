import type {
	GreedyStyleProperty,
	LooseStyleProperties,
	StyleProperties,
} from "../entities/style";
import type {
	Exactify,
	RecordLike,
	UngreedyString,
} from "../entities/primitive";

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
		attributes: Record<"data-coulis-cache" | "data-coulis-type", string>;
		content: string;
	}[];
	getMetadataAsString: () => string;
	setGlobalStyles: (properties: GlobalStyleProperties) => void;
};

export type CreateAdapter<Output> = () => Adapter<Output>;

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
