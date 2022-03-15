import {
	AdvancedPseudos,
	HtmlAttributes,
	PropertiesFallback,
	SimplePseudos,
} from "csstype";

// @note: UngreedyString is a special string type allowing literal enums getting widened to the super type string when specified
// It allows to enable string type with literal enums without loosing autocomplete DX
// eslint-disable-next-line @typescript-eslint/ban-types
type UngreedyString = string & {};

type Property = PropertiesFallback<number | UngreedyString>;

type AttributeSelectors = HtmlAttributes;

type PseudoSelectors = SimplePseudos | AdvancedPseudos;

export type StyleObject = {
	[Key in keyof Property]:
		| Property[Key]
		| Partial<
				Record<
					| "default"
					| PseudoSelectors
					| AttributeSelectors
					| UngreedyString,
					Property[Key]
				>
		  >;
};
