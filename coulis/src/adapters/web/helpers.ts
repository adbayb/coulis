import type { RecordLike, WithNewLeafNodes } from "../../core/entities/primitive";
import { isObject } from "../../core/entities/primitive";
import { UNITLESS_PROPERTIES } from "./constants";

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
	/**
	 * Base-36 encoding keeps class names short (up to 7 chars vs up to 10 in decimal), shrinking
	 * HTML class attributes, generated CSS selectors and cache metadata.
	 */
	return `c${getDjb2Hash(input).toString(36)}`;
};

/**
 * Computes the djb2 hash of a given string.
 *
 * @param input - The input string to hash.
 * @returns The computed hash value.
 */
const getDjb2Hash = (input: string) => {
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
	path: string[] = [],
	output: WithNewLeafNodes<Theme, string> = {} as typeof output,
) => {
	for (const tokenName of Object.keys(theme) as (keyof Theme)[]) {
		const value = theme[tokenName];
		const tokenPath = [...path, String(tokenName)];

		if (isObject(value)) {
			const nestedOutput = ((output as RecordLike)[tokenName as string] ??=
				{}) as typeof output;

			createCustomProperties(value as Theme, onCreateProperty, tokenPath, nestedOutput);

			continue;
		}

		const name = `--${escape(tokenPath.join("-"))}`;

		(output as RecordLike)[tokenName as string] = `var(${name})`;
		onCreateProperty(name, value);
	}

	return output;
};

/**
 * Converts a JS camelCase property name to CSS kebab-case. Runs once per property name at setup
 * (the result is stored on `PropertyInfo`), so no caching is needed here.
 *
 * @param name - The JS property name.
 * @returns The CSS kebab-case name.
 */
export const getKebabName = (name: string) => {
	// From JS camelCase to CSS kebab-case
	return name.replaceAll(/([A-Z])/gu, (matched) => {
		return `-${matched.toLowerCase()}`;
	});
};

export const createDeclaration = (kebabName: string, name: string, value: unknown) => {
	// Format value to follow CSS specs (unitless number)
	const transformedPropertyValue =
		typeof value === "string" || UNITLESS_PROPERTIES.has(name)
			? String(value)
			: `${String(value)}px`;

	return `${kebabName}:${transformedPropertyValue};`;
};

export type CompiledTemplate = {
	/**
	 * Whether the evaluated rule is an at-rule (starts with `@`). Markers always evaluate to
	 * selectors (`.c...`) or declarations (`name:value;`), neither of which starts with `@`, so the
	 * template first character alone determines the outcome.
	 */
	isAtRule: boolean;
	markers: ("declaration" | "selector")[];
	parts: string[];
};

/**
 * Precompiles a state template (e.g. `"coulis[selector]:hover{coulis[declaration]}"`) into static
 * parts and markers so evaluation becomes plain string concatenation without any `replaceAll` calls
 * on the hot path. To run once per state at setup.
 *
 * @param template - The state template with `coulis[selector]`/`coulis[declaration]` markers.
 * @returns The compiled template.
 */
export const createCompiledTemplate = (template: string): CompiledTemplate => {
	const pattern = /coulis\[(selector|declaration)\]/gu;
	const markers: CompiledTemplate["markers"] = [];
	const parts: string[] = [];
	let lastIndex = 0;
	let match: null | RegExpExecArray;

	while ((match = pattern.exec(template)) !== null) {
		parts.push(template.slice(lastIndex, match.index));
		markers.push(match[1] as CompiledTemplate["markers"][number]);
		lastIndex = match.index + match[0].length;
	}

	parts.push(template.slice(lastIndex));

	return {
		isAtRule: template.startsWith("@"),
		markers,
		parts,
	};
};

/**
 * Evaluates a precompiled template by concatenating static parts with the given selector and
 * declaration.
 *
 * @param compiled - The template compiled with `createCompiledTemplate`.
 * @param selector - The value for the `coulis[selector]` marker.
 * @param declaration - The value for the `coulis[declaration]` marker.
 * @returns The evaluated rule.
 */
export const getEvaluatedTemplate = (
	compiled: CompiledTemplate,
	selector: string,
	declaration: string,
) => {
	const { markers, parts } = compiled;
	let output = parts[0] as string;

	for (let index = 0; index < markers.length; index++) {
		output +=
			(markers[index] === "selector" ? selector : declaration) + (parts[index + 1] as string);
	}

	return output;
};

export const minify = (input: string) => {
	return input.replaceAll(/\s{2,}|\s+(?=\{)|\r?\n/gmu, "");
};
