import type { StyleProperties } from "../entities/style";
import type { GlobalStyles } from "../entities/globalStyle";

type CoulisProperties = {
	[K in keyof StyleProperties]?:
		| CustomPropertyValue<StyleProperties[K]>
		| NativePropertyValue;
};

type CoulisShorthands<Properties extends CoulisProperties> = Record<
	string,
	(keyof Properties)[]
>;

type CoulisStates = Record<
	string,
	(input: { className: string; declaration: string }) => string
> & {
	// The `base` state cannot be overwritten consumer-side
	base?: never;
};

type CoulisTheme = Record<string, unknown>;

type CreateCoulisPort<Output> = <
	// `const` needed to not widen strict type (for example, to avoid `width: [50, 100]` being inferred as `width: number`).
	const Properties extends CoulisProperties,
	Shorthands extends CoulisShorthands<Properties>,
	States extends CoulisStates,
	Theme extends CoulisTheme,
>(input: {
	properties: (theme: Theme) => Properties;
	shorthands?: Shorthands;
	states?: States;
	theme: Theme;
}) => {
	createKeyframes: (input: Keyframes<Properties>) => Output;
	createStyles: (
		input: {
			[PropertyName in keyof Properties]?: PropertyValue<
				PropertyName,
				Properties,
				States
			>;
		} & {
			[PropertyName in keyof Shorthands]?: Shorthands[PropertyName] extends unknown[]
				? Shorthands[PropertyName][number] extends keyof Properties
					? PropertyValue<
							Shorthands[PropertyName][number],
							Properties,
							States
						>
					: never
				: never;
		},
	) => Output;
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-type", string>;
		content: string;
	}[];
	getMetadataAsString: () => string;
	setGlobalStyles: (input: GlobalStyles) => void;
};

const createCoulisWeb: CreateCoulisPort<string> = (_input) => {
	return {
		createKeyframes() {
			return "todo";
		},
		createStyles() {
			return "todo";
		},
		createVariants() {
			return () => {
				return "todo";
			};
		},
		getMetadata() {
			return [];
		},
		getMetadataAsString() {
			return "todo";
		},
		setGlobalStyles() {
			// No op
		},
	};
};

const createCoulisNative: CreateCoulisPort<Record<string, unknown>> = (
	_input,
) => {
	return {
		createKeyframes() {
			return {};
		},
		createStyles() {
			return {};
		},
		createVariants() {
			return () => {
				return {};
			};
		},
		getMetadata() {
			return [];
		},
		getMetadataAsString() {
			return "todo";
		},
		setGlobalStyles() {
			// No op
		},
	};
};

const createCoulis =
	// eslint-disable-next-line unicorn/prefer-global-this
	typeof window === "undefined" ? createCoulisNative : createCoulisWeb;

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

const coulis = createCoulis({
	properties(theme) {
		return {
			backgroundColor: theme.colors,
			colorScheme(input: "black" | "white") {
				return input === "black" ? "dark" : "light";
			},
			display: true,
			margin: theme.spacings,
			marginBottom: theme.spacings,
			marginLeft: theme.spacings,
			marginRight: theme.spacings,
			marginTop: theme.spacings,
			width: [50, 100],
		};
	},
	shorthands: {
		marginHorizontal: ["marginLeft", "marginRight"],
		marginVertical: ["marginTop", "marginBottom"],
	},
	states: {
		hover: ({ className, declaration }) =>
			`${className}:hover{${declaration}}`,
	},
	theme: {
		colors: {
			neutralDark: tokens.colors.black,
			neutralLight: tokens.colors.white,
			neutralTransparent: tokens.colors.transparent,
			surfacePrimary: tokens.colors.blue[4],
			surfaceSecondary: tokens.colors.blue[2],
		},
		spacings: tokens.spacings,
	},
});

coulis.createStyles({
	backgroundColor: "neutralDark",
	display: {
		base: "-ms-flexbox",
	},
	marginHorizontal: 1,
	width: {
		base: 100,
		hover: 50,
	},
});

coulis.createKeyframes({
	from: {
		colorScheme: "black",
		width: 100,
	},
	to: {
		colorScheme: "black",
	},
});

type Keyframes<Properties extends CoulisProperties> = Partial<
	Record<
		number | "from" | "to" | `${number}%`,
		{
			[PropertyName in keyof Properties]?: PropertyValue<
				PropertyName,
				Properties
			>;
		}
	>
>;

type PropertyValue<
	PropertyName extends keyof Properties,
	Properties extends CoulisProperties,
	States extends CoulisStates | undefined = undefined,
> = Properties[PropertyName] extends NativePropertyValue | undefined
	? PropertyName extends keyof StyleProperties
		? CreatePropertyValue<StyleProperties[PropertyName], States>
		: never
	: Properties[PropertyName] extends CustomPropertyValue<unknown>
		? Properties[PropertyName] extends (input: infer Value) => unknown
			? CreatePropertyValue<Value, States>
			: Properties[PropertyName] extends
						| (infer Value)[]
						| Record<infer Value, unknown>
				? CreatePropertyValue<Value, States>
				: never
		: never;

type CreatePropertyValue<
	Value,
	States extends CoulisStates | undefined = undefined,
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
