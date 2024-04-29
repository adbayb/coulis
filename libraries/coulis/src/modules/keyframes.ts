import { SCOPES } from "../entities/scope";
import { isNumber, toManyDeclaration } from "../helpers";
import type { KeyframeStyleObject } from "../types";

/**
 * Create a `keyframes` rule set globally scoped that describes the animation to apply to an element.
 * @param styleObject - A style record containing CSS keyframes-related declarations.
 * @returns The name identifying the keyframe list (e.g. In the `animation-name` CSS property).
 * @example
 * 	const animationName = createKeyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
 * 	const className = styles({ animation: `${animationName} 2000ms linear infinite`, });
 * 	document.getElementById("my-element-id").className = className;
 */
export const createKeyframes = (styleObject: KeyframeStyleObject) => {
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
