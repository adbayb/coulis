import { HtmlAttributes, PropertiesFallback, Pseudos } from "csstype";

// @note: UngreedyString is a special string type allowing literal enums getting widened to the super type string when specified
// It allows to enable string type with literal enums without loosing autocomplete DX
// @see: For more details, https://github.com/Microsoft/TypeScript/issues/29729#issuecomment-567871939
// @credits: https://github.com/sindresorhus/type-fest/blob/716b8b2e9419fb4a2fa6e3bfdf05f8be252e59e2/source/literal-union.d.ts
export type UngreedyString = string & Record<never, never>;

type Property = PropertiesFallback<number | UngreedyString>;

export type AtomicStyleObject = StyleObject<true>;

type PropertyValue<
	Property,
	Key extends keyof Property | UngreedyString
> = Key extends keyof Property ? Property[Key] : UngreedyString | number;

export type StyleObject<HasAtomicValue = false> = {
	[Key in keyof Property | UngreedyString]?: HasAtomicValue extends false
		? PropertyValue<Property, Key>
		:
				| PropertyValue<Property, Key>
				| Partial<
						Record<
							| "default"
							| Pseudos
							| HtmlAttributes
							| UngreedyString,
							PropertyValue<Property, Key>
						>
				  >;
};

export type AtGroupingRule =
	| "@color-profile"
	| "@counter-style"
	| "@font-face"
	| "@page"
	| "@property"
	| "@scroll-timeline"
	| "@viewport";

export type AtConditionalGroupingRule =
	| "@document"
	| "@layer"
	| "@media"
	| "@supports";

export type AtTextualRule = "@charset" | "@import" | "@namespace";
