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

/**
 * Utility type to create a greedy style property value type.
 * By default, `csstype` includes `(string | number) & {}` hacky values on some CSS properties to allow preserving the autocomplete for literal enums.
 * However it comes with a tradeoff: string prototype keys are included if the property value is unioned with a record.
 * It lead to key pollution with undesired keys if the property is stateful.
 * To prevent such issue, the `csstype` hack is disabled via `Greedify` and let the primitive type widen the literal enum.
 * For more details, check the `Greedify` utility type JSDoc.
 */
export type GreedyStyleProperty<PropertyName extends keyof StyleProperties> =
	Greedify<StyleProperties[PropertyName]>;

export type LooseStyleProperties = Record<
	UngreedyString,
	number | string | undefined
> &
	StyleProperties;
