import type { UngreedyString } from "../../types";
import { STYLESHEETS } from "../../entities/stylesheet";
import { createDeclarations } from "../../entities/style";
import type { LooseStyleProperties } from "../../entities/style";

/**
 * Apply style rules globally.
 * @param properties - A style record containing CSS declarations to apply to a given element.
 * @example
 * 	setGlobalStyles({ "html": { "background-color": "red" } });
 */
export const setGlobalStyles = (properties: GlobalStyleProperties) => {
	STYLESHEETS.global.commit({
		key: JSON.stringify(properties),
		createRules() {
			const rules: string[] = [];
			const selectors = Object.keys(properties);

			for (const selector of selectors) {
				const style = properties[selector];

				if (style === undefined) continue;

				if (typeof style === "string") {
					rules.push(`${selector} ${style};`);
				} else {
					rules.push(`${selector}{${createDeclarations(style)}}`);
				}
			}

			return rules;
		},
	});
};

type GlobalStyleProperties =
	/**
	 * A union type is used instead of one with conditional typing
	 * since we're using a string index signature (via Ungreedy string) and, by design, TypeScript
	 * enforces all members within an interface/type to conform to the index signature value.
	 * However, here, we need to have a different value for AtTextualRule keys (string vs StyleProperties).
	 * To prevent index signature, we're separating the two divergent value typing needs.
	 * @see https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures
	 * @see https://stackoverflow.com/a/63430341
	 *
	 * Why are we using union (|) instead of intersection (&)?
	 * Well, the union `A | B` means this type is either a or b. But intersection `A & B` means a combination of A and B so that
	 * the new type has to satisfy every constraint in both types (including enforcing all members to match the index signature value).
	 * Hopefully, in a union type, TypeScript currently doesn't operate exclusive union (ie. for A | B either A or B strictly)
	 * helping us to omit index signature constraint while still having the ability to specify either property from A and/or B without type error
	 * (even for object literal, TypeScript will complain only about properties that don't appear on any of both A & B (without union, excess property checking is done))
	 * @see https://stackoverflow.com/a/46370791 and https://github.com/Microsoft/TypeScript/issues/14094#issuecomment-280129798
	 */
	{
		[Selector in
			| AtGroupingRule
			| AtTextualRule
			| UngreedyString
			| keyof HTMLElementTagNameMap]?: Selector extends AtTextualRule
			? string
			: Selector extends AtGroupingRule | keyof HTMLElementTagNameMap
				? LooseStyleProperties
				: LooseStyleProperties | string;
	};

type AtTextualRule = "@charset" | "@import" | "@layer" | "@namespace";

type AtGroupingRule =
	| "@color-profile"
	| "@counter-style"
	| "@font-face"
	| "@font-feature-values"
	| "@font-palette-values"
	| "@page"
	| "@property"
	| "@scroll-timeline"
	| "@viewport";
