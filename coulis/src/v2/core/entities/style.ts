import type { Properties as CSSProperties } from "csstype";

import type { Greedify, UngreedyString } from "./primitive";

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

export type StyleProperties = CSSProperties<UngreedyString | number>;

export type Styles<
	Configs extends StyleConfigs,
	Options extends StyleOptions<Configs>,
	Output,
> = (
	input: {
		[Config in keyof Configs]?: PropertyValue<Configs, Config, Options>;
	} & {
		[Config in keyof Options["shorthands"]]?: Options["shorthands"][Config] extends unknown[]
			? Options["shorthands"][Config][number] extends keyof Configs
				? PropertyValue<
						Configs,
						Options["shorthands"][Config][number],
						Options
					>
				: never
			: never;
	},
) => Output;

export type StyleConfigs = {
	[K in keyof StyleProperties]?:
		| CustomPropertyValue<StyleProperties[K]>
		| NativePropertyValue;
};

export type StyleOptions<Properties extends StyleConfigs> = {
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

type PropertyValue<
	Configs extends StyleConfigs,
	PropertyName extends keyof Configs,
	Options extends StyleOptions<Configs>,
> = Configs[PropertyName] extends NativePropertyValue | undefined
	? PropertyName extends keyof StyleProperties
		? CreatePropertyValue<
				Configs,
				Options,
				PropertyName,
				GreedyStyleProperty<PropertyName>
			>
		: never
	: Configs[PropertyName] extends CustomPropertyValue<unknown>
		? Configs[PropertyName] extends (input: infer Value) => unknown
			? CreatePropertyValue<Configs, Options, PropertyName, Value>
			: Configs[PropertyName] extends
						| (infer Value)[]
						| Record<infer Value, unknown>
				? CreatePropertyValue<Configs, Options, PropertyName, Value>
				: never
		: never;

type CreatePropertyValue<
	Configs extends StyleConfigs,
	Options extends StyleOptions<Configs>,
	PropertyName extends keyof Configs,
	Value,
> =
	| WithLooseValue<Configs, Options, PropertyName, Value>
	| (Options["states"] extends Record<infer State, unknown>
			? Partial<
					Record<
						State,
						WithLooseValue<Configs, Options, PropertyName, Value>
					>
				> &
					Record<
						"base",
						WithLooseValue<Configs, Options, PropertyName, Value>
					>
			: never)
	| undefined;

type WithLooseValue<
	Configs extends StyleConfigs,
	Options extends StyleOptions<Configs>,
	PropertyName extends keyof Configs,
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
