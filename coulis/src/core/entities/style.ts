import type { AtRule, Properties as CSSProperties } from "csstype";

import type { UngreedyString } from "./primitive";

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

export type StyleProperties = AtRule.FontFace &
	CSSProperties<UngreedyString | number>;
