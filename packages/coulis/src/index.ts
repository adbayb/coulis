// @todo: benchmarks
// - if multiple insert of styles per atomic css declaration is more or less efficient than one single style element ?
// @todo: always & to reference parent in selector ? Quid :hover, :focus
// @todo: server side extraction
// @todo: hydrate CACHE client side from data-coulis tag ?
import { UNITLESS_PROPERTIES, SHORTHAND_PROPERTIES } from "./constants";
import { hash } from "./helpers/hash";
import { getStyleSheet } from "./helpers/stylesheet";
import { Value, Property, DeclarationBlock } from "./types";
import { merge } from "./helpers/merge";
import { isObject } from "./helpers/object";

// @todo: atomic stateful selector generation ? Advantages: could be reused same atomic declaration in the
// same media query type in another context of consumption (for example, another component which use the
// same declaration with the same media query rule)
/* @media (min-width: 400px) {
	.c424af343:hover {
		background-color: blue;
	}
	// with c424af343 = hash("@media (min-width: 400px)", ":hover", "background-color", "blue")
	// and only one declaration (atomic declaration) per declaration block 
} 
*/

const toDeclaration = (property: Property, value: Value) => {
	// @todo: check isValidDeclarationBlock(value) here !
	// @section: from JS camelCase to CSS kebeb-case
	const normalizedProperty = property.replace(
		/([A-Z])/g,
		(matched) => `-${matched.toLowerCase()}`
	);
	// @section: format value to follow CSS specs (unitless number)
	const normalizedValue =
		typeof value !== "number" || UNITLESS_PROPERTIES[property]
			? value
			: `${value}px`;

	return `${normalizedProperty}:${normalizedValue}`;
};

const CACHE: Record<string, boolean> = {};
const isDevelopment = process.env.NODE_ENV === "development";

const commitStyle = (rule: string, stl: HTMLStyleElement) => {
	if (isDevelopment) {
		// stl.innerHTML = `${stl.innerHTML}${rule}`;
		// stl.appendChild(document.createTextNode(rule));
		// @note: faster than other insertion alternatives https://jsperf.com/insertadjacenthtml-perf/22 :
		stl.insertAdjacentHTML("beforeend", rule);
	} else {
		stl.sheet!.insertRule(rule);
	}
};

// @note: Anatomy of a css syntax:
// .className { background-color: blue; color: red } = css rule-set
// .className = selector
// { background-color: blue; color: red } = declaration block (contains one or more declarations separated by semicolons)
// background-color: blue = a declaration
// background-color = property (or property name)
// blue = value (or property value)

const toClassName = (...hashInputs: Value[]) => {
	return `c${hash(hashInputs.join(""))}`;
};

const processStyle = (
	property: string,
	value: Value,
	hashInputs: (Property | Value)[],
	ruleSetFormatter: (className: string, declaration: string) => string,
	insertionTarget: any
) => {
	if (value === undefined) {
		return null;
	}

	const className = toClassName(hashInputs.join(""));

	if (CACHE[className]) {
		return className;
	}

	const normalizedDeclaration = toDeclaration(property, value);
	const ruleSet = ruleSetFormatter(className, normalizedDeclaration);

	commitStyle(ruleSet, insertionTarget);
	CACHE[className] = true;

	return className;
};

export const createCss = (groupRule: string) => {
	const styleSheet = getStyleSheet();

	return (...cssBlocks: DeclarationBlock[]) => {
		const cssBlock =
			cssBlocks.length <= 1 ? cssBlocks[0] : merge({}, ...cssBlocks);
		const classNames: Array<Property> = [];

		const formatRuleSetWithScope = (ruleSet: string) => {
			return !groupRule ? ruleSet : `${groupRule}{${ruleSet}}`;
		};

		for (const property in cssBlock) {
			const value = cssBlock[property];

			const destinationSheet = Boolean(groupRule)
				? styleSheet.grouped
				: SHORTHAND_PROPERTIES[property]
				? styleSheet.shorthand
				: styleSheet.longhand;

			if (isObject(value)) {
				for (const state in value) {
					const stateValue = value[state as keyof typeof value];
					const isDefaultProperty = state === "default";
					const className = processStyle(
						property,
						stateValue,
						isDefaultProperty
							? [groupRule, property, stateValue]
							: [groupRule, property, stateValue, state],
						(className, declaration) =>
							formatRuleSetWithScope(
								`.${className}${isDefaultProperty ? "" : state}{${declaration}}`
							),
						destinationSheet
					);

					if (className !== null) {
						classNames.push(className);
					}
				}
			} else {
				const className = processStyle(
					property,
					value,
					[groupRule, property, value],
					(className, declaration) =>
						formatRuleSetWithScope(`.${className}{${declaration}}`),
					destinationSheet
				);

				if (className !== null) {
					classNames.push(className);
				}
			}
		}

		return classNames.join(" ");
	};
};

export const css = createCss("");

export const injectGlobal = () => {
	return undefined;
};

const warn = (message: string) => {
	console.warn(message);
};
