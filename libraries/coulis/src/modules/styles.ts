/* eslint-disable @typescript-eslint/ban-types */
import { SHORTHAND_PROPERTIES } from "../constants";
import type { ClassName } from "../entities/className";
import { SCOPES } from "../entities/scope";
import { isObject, toDeclaration, toManyDeclaration } from "../helpers";
import type {
	AtConditionalGroupingRule,
	AtTextualRule,
	AtomicStyleObject,
	GlobalStyleObject,
} from "../types";

/**
 * Create a class name to apply a style rule to an element.
 * @param styleObject - A style record containing CSS declarations to apply to a given element.
 * @returns The generated class name.
 * @example
 * 	const className = styles({ backgroundColor: "red" });
 * 	document.getElementById("my-element-id").className = className;
 */
export const styles = (styleObject: AtomicStyleObject) => {
	return createClassName()(styleObject);
};

/**
 * Create a contextual `styles` tied to a [CSSGroupingRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSGroupingRule)
 * (ie. An at-rule that contains other rules nested within it (such as @media, @supports conditional rules...)).
 * @param atRule - The styling rule instruction (such as `@media (min-width: 0px)`).
 * @param condition - The rule condition.
 * @returns The contextual `atoms` helper.
 * @example
 * 	createStyles("@media", "(min-width: 576px)")
 */
export const createStyles = (
	atRule: AtConditionalGroupingRule,
	condition: string,
) => {
	return createClassName(`${atRule} ${condition}`);
};

/**
 * Apply style rules globally.
 * @param styleObject - A style record containing CSS declarations to apply to a given element.
 * @example
 * 	globalStyles({ "html": { "background-color": "red" } });
 */
export const globalStyles = (styleObject: GlobalStyleObject) => {
	SCOPES.global.commit({
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

const createClassName = (groupingRule = "") => {
	const wrapRule = (rule: string) => {
		return !groupingRule ? rule : `${groupingRule}{${rule}}`;
	};

	// eslint-disable-next-line sonarjs/cognitive-complexity
	return (styleObject: AtomicStyleObject): ClassName => {
		const classNames: string[] = [];

		for (const propertyName of Object.keys(styleObject)) {
			const value = styleObject[propertyName];
			const isShorthandProperty = SHORTHAND_PROPERTIES[propertyName];

			const scope = groupingRule
				? isShorthandProperty
					? SCOPES.conditionalShorthand
					: SCOPES.conditionalLonghand
				: isShorthandProperty
					? SCOPES.shorthand
					: SCOPES.longhand;

			if (value === undefined) continue;

			if (isObject(value)) {
				for (const selectorProperty of Object.keys(value)) {
					const selectorValue = value[selectorProperty];
					const isDefaultProperty = selectorProperty === "default";

					if (selectorValue === undefined) continue;

					classNames.push(
						scope.commit({
							key: `${groupingRule}${propertyName}${selectorValue}${
								isDefaultProperty ? "" : selectorProperty
							}`,
							createRules(className) {
								return [
									wrapRule(
										`.${className}${
											isDefaultProperty
												? ""
												: selectorProperty
										}{${toDeclaration({ name: propertyName, value: selectorValue })}}`,
									),
								];
							},
						}),
					);
				}
			} else {
				classNames.push(
					scope.commit({
						key: `${groupingRule}${propertyName}${value}`,
						createRules(className) {
							return [
								wrapRule(
									`.${className}{${toDeclaration({ name: propertyName, value })}}`,
								),
							];
						},
					}),
				);
			}
		}

		return classNames.join(" ");
	};
};
