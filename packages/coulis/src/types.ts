import { PropertiesFallback, SimplePseudos } from "csstype";

// eslint-disable-next-line @typescript-eslint/ban-types
type Property = PropertiesFallback<number | (string & {})>;

export type DeclarationBlock = {
	[Key in keyof Property]:
		| Property[Key]
		// @note: string to allow data attribute selector (eg. [href="https://www.example.com"])
		| Partial<Record<"default" | SimplePseudos | string, Property[Key]>>;
};
