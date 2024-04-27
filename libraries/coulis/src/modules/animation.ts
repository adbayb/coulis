import { SCOPES } from "../entities/scope";
import { isNumber, toManyDeclaration } from "../helpers";
import type { KeyframeStyleObject } from "../types";

/**
 * Create an animation name by defining a `keyframes` style rule set globally.
 * @param styleObject - A style record containing CSS declarations to apply to a given element.
 * @returns The generated animation name (see `animation-name` CSS property).
 * @example
 * 	const animationName = createAnimationName({ from: { opacity: 0 }, to: { opacity: 1 } });
 * 	const className = styles({ animation: `${animationName} 2000ms linear infinite`, });
 * 	document.getElementById("my-element-id").className = className;
 */
export const createAnimationName = (styleObject: KeyframeStyleObject) => {
	return SCOPES.global.commit({
		key: JSON.stringify(styleObject),
		createRules(className) {
			let rule = "";

			const selectors = Object.keys(
				styleObject,
			) as (keyof typeof styleObject)[];

			for (const selector of selectors) {
				const style = styleObject[selector];

				if (!style) continue;

				rule += `${
					isNumber(selector) ? `${selector}%` : selector
				}{${toManyDeclaration(style)}}`;
			}

			return [`@keyframes ${className}{${rule}}`];
		},
	});
};
