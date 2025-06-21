import type { StyleProperties } from "../entities/style";
import type { RecordLike } from "../entities/primitive";
import type { GlobalStyles } from "../entities/globalStyle";

const tokens = Object.freeze({
	colors: {
		black: "black",
		blue: [
			"rgb(241,244,248)",
			"rgb(226,232,240)",
			"rgb(201,212,227)",
			"rgb(168,186,211)",
			"rgb(119,146,185)",
		],
		transparent: "transparent",
		white: "white",
	},
	spacings: {
		0: "0px",
		0.5: "0.5rem",
		1: "1rem",
		1.5: "2rem",
	},
} as const);

type Contract<Properties extends ContractProperties = ContractProperties> = {
	properties: Properties;
	shorthands?: Record<string, (keyof Properties)[]>;
	states?: Record<
		string,
		(input: { className: string; declaration: string }) => string
	> & {
		// The `base` state cannot be overwritten consumer-side
		base?: never;
	};
};

const createCoulis = <
	const C extends Contract,
	Theme extends Record<string, unknown>,
	Output,
>(input: {
	contract: (theme: Theme) => C;
	theme: Theme;
}) => {
	console.log(input);

	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return {} as Adapter<C, Output>;
};

const coulis = createCoulis({
	contract(theme) {
		return {
			properties: {
				backgroundColor: theme.colors,
				colorScheme(input: "black" | "white") {
					return input === "black" ? "dark" : "light";
				},
				display: true,
				width: [50, 100],
			},
			shorthands: {
				marginHorizontal: ["marginLeft", "marginRight"],
				test: ["MozAnimation"],
			},
			states: {
				hover: ({ className, declaration }) =>
					`${className}:hover{${declaration}}`,
			},
		};
	},
	theme: {
		colors: {
			neutralDark: tokens.colors.black,
			neutralLight: tokens.colors.white,
			neutralTransparent: tokens.colors.transparent,
			surfacePrimary: tokens.colors.blue[4],
			surfaceSecondary: tokens.colors.blue[2],
		},
	},
});

coulis.createStyles({
	backgroundColor: "neutralDark",
	display: {
		base: "-ms-flexbox",
	},
	width: {
		base: 100,
	},
});

coulis.createKeyframes({
	from: {
		colorScheme: "black",
		width: 100,
	},
});

export type Adapter<C extends Contract, Output> = {
	createKeyframes: (input: Keyframes<C>) => Output;
	createStyles: (
		input: {
			[PropertyName in keyof C["properties"]]?: PropertyValue<
				C,
				PropertyName
			>;
		} & {
			[PropertyName in keyof C["shorthands"]]?: C["shorthands"][PropertyName] extends unknown[]
				? C["shorthands"][PropertyName][number] extends keyof C["properties"]
					? PropertyValue<C, C["shorthands"][PropertyName][number]>
					: never
				: never;
		},
	) => Output;
	createVariants: <
		Styles extends Adapter<C, Output>["createStyles"],
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

type Keyframes<C extends Contract> = Partial<
	Record<
		number | "from" | "to" | `${number}%`,
		{
			[PropertyName in keyof C["properties"]]?: PropertyValue<
				C,
				PropertyName
			>;
		}
	>
>;

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
	C extends Contract,
	PropertyName extends keyof C["properties"],
> = C["properties"][PropertyName] extends NativePropertyValue | undefined
	? PropertyName extends keyof StyleProperties
		? CreatePropertyValue<
				C["properties"],
				C["states"],
				StyleProperties[PropertyName]
			>
		: never
	: C["properties"][PropertyName] extends CustomPropertyValue<unknown>
		? C["properties"][PropertyName] extends (input: infer Value) => unknown
			? CreatePropertyValue<C["properties"], C["states"], Value>
			: C["properties"][PropertyName] extends
						| (infer Value)[]
						| Record<infer Value, unknown>
				? CreatePropertyValue<C["properties"], C["states"], Value>
				: never
		: never;

type CreatePropertyValue<
	Properties extends ContractProperties,
	States extends Contract<Properties>["states"],
	Value,
> =
	| Value
	| (States extends Record<infer State, unknown>
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
