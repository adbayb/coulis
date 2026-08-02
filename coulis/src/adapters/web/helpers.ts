import type { RecordLike, WithNewLeafNodes } from "../../core/entities/primitive";
import { isObject } from "../../core/entities/primitive";
import { SHORTHAND_PROPERTIES, UNITLESS_PROPERTIES } from "./constants";

/**
 * Escape invalid CSS characters to generate usable property names.
 *
 * @example
 * 	const safeCssVariable = escape("--spacings-1.5"); // Will generate `--spacings-1-5`
 *
 * @param input - The input to escape with potentially some unsafe characters.
 * @returns The escaped input.
 * @see https://mathiasbynens.be/notes/css-escapes
 */
export const escape = (input: string) => {
	return input.replaceAll(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/gu, "-");
};

export const createClassName = (input: string) => {
	return `c${hashWithDjb2(input)}`;
};

/**
 * Computes the djb2 hash of a given string.
 *
 * @param input - The input string to hash.
 * @returns The computed hash value.
 */
const hashWithDjb2 = (input: string) => {
	let hash = 5381; // Initial hash value

	for (let i = 0; i < input.length; i++) {
		// oxlint-disable-next-line unicorn/prefer-code-point
		hash = (hash * 33) ^ input.charCodeAt(i);
	}

	return hash >>> 0; // Ensure a positive integer
};

export const createCustomProperties = <Theme extends RecordLike>(
	theme: Theme,
	onCreateProperty: (name: string, value: unknown) => void,
	customPropertyNameParts: (keyof Theme)[] = [],
	output: WithNewLeafNodes<Theme, string> = {} as typeof output,
) => {
	const tokenNames = Object.keys(theme) as (keyof typeof output)[];

	for (const tokenName of tokenNames) {
		const value = theme[tokenName];

		customPropertyNameParts.push(tokenName);
		output[tokenName] = {} as (typeof output)[keyof typeof output];

		if (isObject(value)) {
			createCustomProperties(
				value as Theme,
				onCreateProperty,
				customPropertyNameParts,
				output[tokenName] as unknown as typeof output,
			);

			customPropertyNameParts = [];

			continue;
		}

		const name = `--${escape(customPropertyNameParts.join("-"))}`;

		output[tokenName] = `var(${name})` as (typeof output)[keyof typeof output];
		onCreateProperty(name, value);
		customPropertyNameParts.pop();
	}

	return output;
};

export const createDeclaration = ({
	name,
	value,
}: {
	name: keyof RecordLike;
	value: RecordLike[keyof RecordLike];
}) => {
	// From JS camelCase to CSS kebeb-case
	const transformedPropertyName = name.replaceAll(/([A-Z])/gu, (matched) => {
		return `-${matched.toLowerCase()}`;
	});

	// Format value to follow CSS specs (unitless number)
	const transformedPropertyValue =
		typeof value === "string" || UNITLESS_PROPERTIES.has(name)
			? String(value)
			: `${String(value)}px`;

	return `${transformedPropertyName}:${transformedPropertyValue};`;
};

export const createDeclarationBlock = (properties: RecordLike) => {
	let declarationBlock = "";
	const propertyNames = Object.keys(properties);

	for (const propertyName of propertyNames) {
		const value = properties[propertyName];

		if (value === undefined) {
			continue;
		}

		declarationBlock += createDeclaration({
			name: propertyName,
			value,
		});
	}

	return declarationBlock;
};

export const getEvaluatedTemplate = (
	template: string,
	variables: Record<"declaration" | "selector", string>,
) => {
	let output = template;

	for (const [key, value] of Object.entries(variables)) {
		output = output.replaceAll(`coulis[${key}]`, () => {
			return value;
		});
	}

	return output;
};

export const isShorthandProperty = (input: string) => {
	return SHORTHAND_PROPERTIES.has(input);
};

export const minify = (input: string) => {
	return input.replaceAll(/\s{2,}|\s+(?=\{)|\r?\n/gmu, "");
};
