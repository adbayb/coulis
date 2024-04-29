import { SCOPES } from "../entities/scope";

export type Property = {
	name: string;
	value: string;
};

/**
 * Create a custom CSS property (globally scoped).
 * @param rawValue - The value to initialize the property with.
 * @returns The property object containing ready-to-consume CSS name and value.
 * @example
 * const property = createProperty("red");
 * // Consume the property value:
 * document.getElementById("my-element-id").style = `background-color: ${property.value};`;
 * // Override locally the property value:
 * document.getElementById("my-element-id").style = `${property.name}: black;`;
 */
export const createProperty = (rawValue: number | string): Property => {
	const name = `--${SCOPES.global.commit({
		key: JSON.stringify(rawValue),
		createRules(className) {
			return [`:root{--${className}:${rawValue};}`];
		},
	})}`;

	return { name, value: `var(${name})` };
};

// TODO add createProperties to use internally either in createProperty ([single value]) or in createTheme
