import type CSS from "csstype";

export type Property = string;
export type Value = string | number | undefined;
export type StatefulValue = Record<"default" | string, Value>; // @todo: accepts only pseudo class and pseudo elements (::after:hover)
export type DeclarationBlock = Record<string, Value | StatefulValue>;
