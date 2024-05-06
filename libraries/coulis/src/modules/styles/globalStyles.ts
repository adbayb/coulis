import { STYLESHEETS } from "../../entities/stylesheet";
import { toManyDeclaration } from "../../helpers";
import type { AtTextualRule, GlobalStyleObject } from "../../types";

/**
 * Apply style rules globally.
 * @param styleObject - A style record containing CSS declarations to apply to a given element.
 * @example
 * 	globalStyles({ "html": { "background-color": "red" } });
 */
export const globalStyles = (styleObject: GlobalStyleObject) => {
	STYLESHEETS.global.commit({
		key: JSON.stringify(styleObject),
		createRules() {
			const rules: string[] = [];

			for (const selector of Object.keys(styleObject)) {
				const style = styleObject[selector as AtTextualRule];

				if (!style) continue;

				if (typeof style === "string") {
					rules.push(`${selector} ${style};`);
				} else {
					rules.push(`${selector}{${toManyDeclaration(style)}}`);
				}
			}

			return rules;
		},
	});
};
