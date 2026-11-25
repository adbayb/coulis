import type { StyleType } from "../../core/entities/style";

const IS_SERVER_ENVIRONMENT = typeof window === "undefined";

export type ClassName = string;
export type Rule = string;

export type StyleSheet = {
	/** Removes a rule. Only supported for the `global` sheet: atomic rules are never removed. */
	removeRule: (className: ClassName, rule: Rule) => void;
	/**
	 * Returns the comma-separated class names (`cache`) and CSS text (`content`) of the rules
	 * inserted by this runtime (rules hydrated from server metadata are excluded).
	 *
	 * @param usedClassNames - If set, only keeps the rules of these class names (critical styles).
	 *   Ignored by the `global` sheet, whose rules are always kept.
	 */
	serialize: (usedClassNames?: Set<ClassName>) => SerializedRules;
	/** Inserts a rule unless its class name is already in the sheet. */
	setRule: (className: ClassName, createRule: (className: ClassName) => Rule) => void;
};

type CoulisStyleElement = HTMLStyleElement & {
	/**
	 * Rules of the element (an empty rule for a hydrated class name), shared by every instance
	 * targeting it so that a rule is never inserted twice.
	 */
	coulisRules?: Map<ClassName, Rule>;
};

type SerializedRules = {
	cache: string;
	content: string;
};

/**
 * Creates a style sheet of a given type: a `<style>` element in the browser, an in-memory one on
 * the server.
 *
 * Global rules are few, may group several rules (`a{}b{}`), may start with `@import`, and can be
 * removed: they are kept as text. Atomic rules are always a single rule each and are never removed:
 * they go through the CSSOM (`insertRule` parses only the new rule, whereas appending text
 * re-parses the whole sheet).
 *
 * Rules are inserted synchronously so that styles apply as soon as `createStyles` returns: layout
 * reads made right after (for example, in React layout effects) see the styled layout.
 *
 * @param type - The style type.
 * @returns The style sheet.
 */
export const createStyleSheet = (type: StyleType): StyleSheet => {
	let element: CoulisStyleElement | undefined;
	let ruleByClassName = new Map<ClassName, Rule>();
	// Serialization of every rule, reused until a rule is inserted or removed.
	let serializedRules: SerializedRules | undefined;

	if (!IS_SERVER_ENVIRONMENT) {
		// `appendChild` returns the appended element (unlike `append`), keeping the code short.
		element =
			document.querySelector<CoulisStyleElement>(`style[data-coulis-type="${type}"]`) ??
			// oxlint-disable-next-line unicorn/prefer-dom-node-append
			document.head.appendChild(document.createElement("style"));

		element.dataset.coulisType = type;

		element.coulisRules ??= new Map(
			element.dataset.coulisCache?.split(",").map((className) => {
				return [className, ""];
			}),
		);

		ruleByClassName = element.coulisRules;
	}

	return {
		removeRule(className, rule) {
			ruleByClassName.delete(className);
			serializedRules = undefined;

			if (element) {
				// Hydrated and client-inserted global rules share the same serialization.
				element.textContent = element.textContent.replace(serializeRule(rule), "");
			}
		},
		serialize(usedClassNames) {
			const keptClassNames = type === "global" ? undefined : usedClassNames;

			if (!keptClassNames && serializedRules) {
				return serializedRules;
			}

			let cache = "";
			let content = "";

			for (const [className, rule] of ruleByClassName) {
				if (rule && (!keptClassNames || keptClassNames.has(className))) {
					cache += cache ? `,${className}` : className;
					content += rule;
				}
			}

			const output = { cache, content };

			// An element shares its rules with other instances, which change them without notice: only in-memory rules are reused.
			if (!keptClassNames && !element) {
				serializedRules = output;
			}

			return output;
		},
		setRule(className, createRule) {
			if (ruleByClassName.has(className)) {
				return;
			}

			let rule = createRule(className);

			if (!element || type === "global") {
				rule = serializeRule(rule);
				/**
				 * `insertAdjacentText` is the most performant API for appending text.
				 *
				 * @see {@link https://esbench.com/bench/680c1080545f8900a4de2ce6 Benchmark}
				 */
				// oxlint-disable-next-line unicorn/prefer-modern-dom-apis
				element?.insertAdjacentText("beforeend", rule);
			} else {
				const { sheet } = element;

				try {
					sheet?.insertRule(rule, sheet.cssRules.length);
				} catch {
					// Invalid or unsupported rules (e.g. a vendor-specific selector) are ignored, as browsers do when parsing text.
				}
			}

			ruleByClassName.set(className, rule);
			serializedRules = undefined;
		},
	};
};

/**
 * Serializes a rule as text: `</` is escaped so the CSS text cannot close its `<style>` element.
 * Any other `<` is kept: escaped, it would no longer be a comparison in range queries (e.g. `@media
 * (width < 600px)`).
 *
 * @param rule - The rule to serialize.
 * @returns The serialized rule.
 */
const serializeRule = (rule: string) => {
	return rule.replaceAll("</", String.raw`\3C /`);
};
