import type { RecordLike, WithNewLeafNodes } from "../../core/entities/primitive";
import { isObject } from "../../core/entities/primitive";

const TEMPLATE_MARKER = /coulis\[(selector|declaration)\]/u;

export const createClassName = (input: string) => {
	/**
	 * Base-36 encoding keeps class names short (up to 7 chars vs up to 10 in decimal), shrinking
	 * HTML class attributes, generated CSS selectors and cache metadata.
	 */
	return `c${getDjb2Hash(input).toString(36)}`;
};

/**
 * Wraps a factory so it runs once per key; later calls return the cached result. The factory must
 * never return `undefined`.
 *
 * @param create - The factory computing the value of a given key.
 * @returns The memoized factory.
 */
export const memoize = <Key, Value>(create: (key: Key) => Value) => {
	const cache = new Map<Key, Value>();

	return (key: Key): Value => {
		let value = cache.get(key);

		if (value === undefined) {
			value = create(key);
			cache.set(key, value);
		}

		return value;
	};
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
		const tokenPath = [...path, tokenName as string];

		if (isObject(value)) {
			const nestedOutput = ((output as RecordLike)[tokenName as string] ??=
				{}) as typeof output;

			createCustomProperties(value as Theme, onCreateProperty, tokenPath, nestedOutput);

			continue;
		}

		// Invalid CSS characters are replaced to generate usable property names (e.g. `spacings-1.5` -> `--spacings-1-5`).
		const name = `--${tokenPath.join("-").replaceAll(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/gu, "-")}`;

		(output as RecordLike)[tokenName as string] = `var(${name})`;
		onCreateProperty(name, value);
	}

	return output;
};

export type CompiledTemplate = {
	/**
	 * Whether the evaluated rule is an at-rule (starts with `@`). Markers always evaluate to
	 * selectors (`.c...`) or declarations (`name:value;`), neither of which starts with `@`, so the
	 * template first character alone determines the outcome.
	 */
	isAtRule: boolean;
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
	return {
		isAtRule: template.startsWith("@"),
		parts: template.split(TEMPLATE_MARKER),
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
	const { parts } = compiled;
	let output = parts[0] as string;

	for (let index = 1; index < parts.length; index += 2) {
		output +=
			(parts[index] === "selector" ? selector : declaration) + (parts[index + 1] as string);
	}

	return output;
};
