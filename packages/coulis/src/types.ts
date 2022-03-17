import { HtmlAttributes, PropertiesFallback, Pseudos } from "csstype";

// @note: UngreedyString is a special string type allowing literal enums getting widened to the super type string when specified
// It allows to enable string type with literal enums without loosing autocomplete DX
// eslint-disable-next-line @typescript-eslint/ban-types
type UngreedyString = string & {};

type Property = PropertiesFallback<number | UngreedyString>;

export type AtomicStyleObject = StyleObject<true>;

export type StyleObject<HasAtomicValue = false> = {
	[Key in keyof Property]: HasAtomicValue extends false
		? Property[Key]
		:
				| Property[Key]
				| Partial<
						Record<
							| "default"
							| Pseudos
							| HtmlAttributes
							| UngreedyString,
							Property[Key]
						>
				  >;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StyleObjectBySelector<Selector extends keyof any> = {
	[Key in Selector | UngreedyString]?: StyleObject;
};
