import { HtmlAttributes, PropertiesFallback, Pseudos } from "csstype";

// @note: UngreedyString is a special string type allowing literal enums getting widened to the super type string when specified
// It allows to enable string type with literal enums without loosing autocomplete DX
// eslint-disable-next-line @typescript-eslint/ban-types
type UngreedyString = string & {};

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StyleObjectBySelector<Selector extends keyof any> = {
	[Key in Selector | UngreedyString]?: StyleObject;
};
