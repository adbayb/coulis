import type { Properties as CSSProperties } from "csstype";

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

/**
 * A utility type to transform a primitive type (string, number, ...) to prevent literal enums getting widened to the primitive type when specified.
 * It allows, for example, to enable string type with literal enums without loosing autocomplete experience.
 * Credits to https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939.
 * @see For more details, https://github.com/Microsoft/TypeScript/issues/29729.
 */
type Ungreedify<U extends number | string> = Record<never, never> & U;

export type UngreedyString = Ungreedify<string>;

export type StyleProperties = CSSProperties<UngreedyString | number>;
