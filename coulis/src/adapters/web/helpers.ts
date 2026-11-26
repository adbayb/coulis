/* oxlint-disable unicorn/prefer-code-point -- UTF-16 code units are enough to hash and fingerprint strings. */
import type { RecordLike, WithNewLeafNodes } from "../../core/entities/primitive";
import { isObject } from "../../core/entities/primitive";

const TEMPLATE_MARKER = /coulis\[(selector|declaration)\]/u;
/**
 * Enough slots to tell apart the class attributes of a typical page, for a negligible allocation (a
 * few kilobytes per search).
 */
const RECENT_CLASS_ATTRIBUTES_LENGTH = 1024;

/**
 * Creates a class name from the djb2 hash of a given string. `Math.imul` keeps the multiplication
 * in 32-bit integers (same hash as `hash * 33`, without floating-point math), and the base-36
 * encoding keeps class names short (up to 7 characters versus 10 in decimal), shrinking HTML class
 * attributes, CSS selectors, and cache metadata.
 *
 * @param input - The string to hash.
 * @returns The class name.
 */
export const createClassName = (input: string) => {
	let hash = 5381;

	for (let index = 0; index < input.length; index++) {
		hash = Math.imul(hash, 33) ^ input.charCodeAt(index);
	}

	// `>>> 0` makes the hash a positive integer.
	return `c${(hash >>> 0).toString(36)}`;
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
 * Creates the CSS custom properties of a theme: each leaf token becomes a property named after its
 * path (e.g. `colors.primary` -> `--colors-primary`).
 *
 * @param theme - The theme tokens.
 * @param onCreateProperty - Called with the name and value of each created property.
 * @param namePrefix - The name prefix of the theme properties (the path of a nested theme).
 * @returns The theme with its leaf tokens replaced by references to their property (`var(--name)`).
 */
export const createCustomProperties = <Theme extends RecordLike>(
	theme: Theme,
	onCreateProperty: (name: string, value: unknown) => void,
	namePrefix = "-",
) => {
	const output: RecordLike = {};

	for (const tokenName of Object.keys(theme)) {
		const value = theme[tokenName];
		// Invalid CSS characters are replaced to generate usable property names (e.g. `spacings-1.5` -> `--spacings-1-5`).
		const name = `${namePrefix}-${tokenName.replaceAll(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/gu, "-")}`;

		if (isObject(value)) {
			output[tokenName] = createCustomProperties(value, onCreateProperty, name);
		} else {
			output[tokenName] = `var(${name})`;
			onCreateProperty(name, value);
		}
	}

	return output as WithNewLeafNodes<Theme, string>;
};

/**
 * Finds the class names used by a given HTML: every word of its class attributes (class names are
 * base-36 hashes, so words are enough to find them).
 *
 * @param html - The HTML to search.
 * @returns The words of the HTML class attributes: its class names, among other words.
 */
export const findClassNames = (html: string) => {
	const classAttributes = new Set<string>();
	/*
	 * Class attributes repeat a lot (lists, tables...) and adding a new string to a set hashes it,
	 * which costs more than comparing it. So an attribute is first compared to the last one seen
	 * with the same fingerprint (its length and two of its last characters, where class names
	 * differ): only the others reach the set.
	 */
	// oxlint-disable-next-line unicorn/no-new-array -- It reserves the slots at once, whereas `Array.from` fills them one by one.
	const recentClassAttributes = new Array<string | undefined>(RECENT_CLASS_ATTRIBUTES_LENGTH);

	for (const classAttribute of html.match(/class="[^"]*/gu) ?? []) {
		const { length } = classAttribute;

		const fingerprint =
			(length * 31 +
				classAttribute.charCodeAt(length - 1) * 7 +
				classAttribute.charCodeAt(length - 3)) %
			RECENT_CLASS_ATTRIBUTES_LENGTH;

		if (recentClassAttributes[fingerprint] !== classAttribute) {
			recentClassAttributes[fingerprint] = classAttribute;
			classAttributes.add(classAttribute);
		}
	}

	return new Set([...classAttributes].join(" ").match(/\w+/gu));
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
