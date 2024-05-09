import { createDeclarations } from "../entities/style";
import type { StyleProperties } from "../entities/style";
import { STYLESHEETS } from "../entities/stylesheet";
import { isNumber } from "../helpers";

/**
 * Create a `keyframes` rule set globally scoped that describes the animation to apply to an element.
 * @param properties - A style record containing CSS keyframes-related declarations.
 * @returns The name identifying the keyframe list (e.g. In the `animation-name` CSS property).
 * @example
 * 	const animationName = createKeyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
 * 	const className = styles({ animation: `${animationName} 2000ms linear infinite`, });
 * 	document.getElementById("my-element-id").className = className;
 */
export const createKeyframes = (properties: KeyframesStyleProperties) => {
	const { className } = STYLESHEETS.global.commit({
		key: JSON.stringify(properties),
		createRules(cName) {
			let rule = "";

			const selectors = Object.keys(
				properties,
			) as (keyof typeof properties)[];

			for (const selector of selectors) {
				const style = properties[selector];

				if (!style) continue;

				rule += `${
					isNumber(selector) ? `${selector}%` : selector
				}{${createDeclarations(style)}}`;
			}

			return `@keyframes ${cName}{${rule}}`;
		},
	});

	return className;
};

type KeyframesStyleProperties = {
	[Selector in number | "from" | "to" | `${number}%`]?: StyleProperties;
};
