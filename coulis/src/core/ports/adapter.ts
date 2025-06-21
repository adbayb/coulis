import type { StyleProperties } from "../entities/style";
import type { Exactify, RecordLike } from "../entities/primitive";
import type { Keyframes } from "../entities/keyframe";
import type { GlobalStyles } from "../entities/globalStyle";

export type Adapter<Output> = {
	createCustomProperties: <const P extends CustomProperties>(
		input: P,
	) => WithNewLeafNodes<P, string>;
	createKeyframes: (input: Keyframes) => Output;
	createStyles: <
		const Properties extends ContractProperties,
		const Options extends ContractOptions<Properties>,
	>(
		input: Exactify<Properties, keyof ContractProperties>,
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
	setGlobalStyles: (input: GlobalStyles) => void;
};

export type CreateAdapter<Output> = () => Adapter<Output>;

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
	Properties extends ContractProperties,
	PropertyName extends keyof Properties,
	Options extends ContractOptions<Properties>,
> = Properties[PropertyName] extends NativePropertyValue | undefined
	? PropertyName extends keyof StyleProperties
		? CreatePropertyValue<
				Properties,
				Options,
				StyleProperties[PropertyName]
			>
		: never
	: Properties[PropertyName] extends CustomPropertyValue<unknown>
		? Properties[PropertyName] extends (input: infer Value) => unknown
			? CreatePropertyValue<Properties, Options, Value>
			: Properties[PropertyName] extends
						| (infer Value)[]
						| Record<infer Value, unknown>
				? CreatePropertyValue<Properties, Options, Value>
				: never
		: never;

type CreatePropertyValue<
	Properties extends ContractProperties,
	Options extends ContractOptions<Properties>,
	Value,
> =
	| Value
	| (Options["states"] extends Record<infer State, unknown>
			? Partial<Record<State, Value>> & Record<"base", Value>
			: never)
	| undefined;

type CustomPropertyValue<Value> =
	| Record<string, Value>
	| Value[]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| ((input: any) => Value);

type NativePropertyValue = true;

type ContractProperties = {
	[K in keyof StyleProperties]?:
		| CustomPropertyValue<StyleProperties[K]>
		| NativePropertyValue;
};

type ContractOptions<Properties extends ContractProperties> = {
	shorthands?: Record<string, (keyof Properties)[]>;
	states?: Record<
		string,
		(input: { className: string; declaration: string }) => string
	> & {
		// The `base` state cannot be overwritten consumer-side
		base?: never;
	};
};
