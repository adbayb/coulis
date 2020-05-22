// @todo: benchmarks
// - if multiple insert of styles per atomic css declaration is more or less efficient than one single style element ?

import type CSS from "csstype";
import { UNITLESS_PROPERTIES, SHORTHAND_PROPERTIES } from "./constants";
import { hash } from "./helpers/hash";
import { getStyleSheet } from "./helpers/stylesheet";

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

type Property = string;
type Value = string | number | undefined;

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

const applyStyle = (rule: string, stl: any = getStyleSheet().atomic) => {
	// @note: insert rule
	if (isDevelopment) {
		stl.innerHTML = `${stl.innerHTML}${rule}`;
	} else {
		stl.sheet.insertRule(rule);
	}
};

// const processStyle = (
// 	property: Property,
// 	value: Value,
// 	formatter: (className: string, atomicDeclaration: string) => string
// ) => {
// 	const normalizedDeclaration = toDeclaration(property, value);
// 	const hashInput = formatter("", normalizedDeclaration);
// 	const className = `c${hash(`${hashInput}`)}`;
// 	const ruleSet = formatter(className, normalizedDeclaration);

// 	return { className, ruleSet };
// };

const isObject = (value: any): value is object => {
	return value !== null && typeof value === "object";
};

// @note: Anatomy of a css syntax:
// .className { background-color: blue; color: red } = css rule-set
// .className = selector
// { background-color: blue; color: red } = declaration block (contains one or more declarations separated by semicolons)
// background-color: blue = a declaration
// background-color = property (or property name)
// blue = value (or property value)

type StatefulValue = { default: Value; ":hover": Value }; // @todo: accepts only pseudo class and pseudo elements (::after:hover)
type DeclarationBlock = Record<string, Value | StatefulValue>;

const toClassName = (...hashInputs: Value[]) => {
	return `c${hash(hashInputs.join(""))}`;
};

export const css = (declarationBlock: DeclarationBlock) => {
	const styleSheet = getStyleSheet();
	const classNames: Array<Property> = [];

	for (const property in declarationBlock) {
		const value = declarationBlock[property];

		const destinationSheet = SHORTHAND_PROPERTIES[property]
			? styleSheet.shorthand
			: styleSheet.atomic;

		if (isObject(value)) {
			for (const state in value) {
				const stateValue = value[state as keyof typeof value];

				if (stateValue === undefined) {
					break;
				}

				const isDefaultProperty = state === "default";
				const className = toClassName(
					(isDefaultProperty
						? [property, stateValue]
						: [property, stateValue, state]
					).join("")
				);

				if (CACHE[className]) {
					// @note: exit early to avoid extra uneeded work
					classNames.push(className);
					break; // @todo: return inside function
				}

				const normalizedDeclaration = toDeclaration(property, stateValue);
				const ruleSet = `.${className}${
					isDefaultProperty ? "" : state
				}{${normalizedDeclaration}}`;

				applyStyle(ruleSet);
				classNames.push(className);
				CACHE[className] = true;
			}
		} else {
			if (value === undefined) {
				break;
			}

			const className = toClassName(property, value);

			if (CACHE[className]) {
				classNames.push(className);
				break;
			}

			const normalizedDeclaration = toDeclaration(property, value);
			const ruleSet = `.${className}{${normalizedDeclaration}}`;

			applyStyle(ruleSet);
			classNames.push(className);
			CACHE[className] = true;
		}
	}

	return classNames.join(" ");
};

export const injectGlobal = () => {
	return undefined;
};

const warn = (message: string) => {
	console.warn(message);
};

// export const media = (
// 	condition: string,
// 	declarationBlocks: DeclarationBlock2[]
// ) => {
// 	const styleSheet = getStyleSheet();
// };

// cssIfAt("@support (display: grid)", { display: "grid" }) // co alias for conditional // atomic ready
// Or better for explicitness:
// media("(min-width: 50px)", { backgroundColor: "red" })
// supports("(display: grid)", { display: "grid" })

// css({ backgroundColor: "red" }) // atomic ready
// cssCompose({ backgroundColor: "red" }, { backgroundColor: "purple" }) // atomic ready
// keyframes({ from: { transform: translateX(0) }, to: { transform: translateY(0) } }) TODO Template string since it's global and not atomic ready !
// cssGlobal`html { fontSize: 10px }` // no atomic management :)
// <CollectStyles /> or extractStyle api for SSR (insert style element in the react root before all elements)

// const merge = (
// 	target: DeclarationBlock,
// 	...sources: DeclarationBlock[]
// ): DeclarationBlock => {
// 	if (sources.length === 0) {
// 		return target;
// 	}

// 	const source = sources[0];

// 	for (const key of Object.keys(source)) {
// 		const sourceValue = source[key];
// 		const targetValue = target[key];

// 		if (isObject(sourceValue) && isObject(targetValue)) {
// 			target[key] = merge(targetValue, sourceValue) as Record<string, Value>;
// 		} else {
// 			target[key] = sourceValue;
// 		}
// 	}

// 	sources.shift();

// 	return merge(target, ...sources);
// };

// export const cssCompose = (...cssObjects: DeclarationBlock[]) => {
// 	return css2(merge({}, ...cssObjects));
// };
