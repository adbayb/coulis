// @todo: benchmarks
// - if multiple insert of styles per atomic css declaration is more or less efficient than one single style element ?

import type CSS from "csstype";
import { UNITLESS_PROPERTIES, SHORTHAND_PROPERTIES } from "./constants";

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

const hash = (str: string) => {
  // hash content based with FNV-1a algorithm:
  const FNVOffsetBasis = 2166136261;
  const FNVPrime = 16777619;
  let hash = FNVOffsetBasis;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash *= FNVPrime;
  }

  // @note: we convert hashed value to 32-bit unsigned integer
  // via logical unsigned shift operator >>>
  const uHash = hash >>> 0;

  // @note: we convert to hexadecimal
  return Number(uHash).toString(16);
};

type Property = string;
type Value = string | number | undefined;
type DeclarationBlock = Record<Property, Value | Record<Property, Value>>;

const isValidDeclarationBlock = (
  value: DeclarationBlock[number]
): value is Exclude<DeclarationBlock[number], undefined> => {
  return value !== undefined;
};

const toClassName = (property: Property, value: Value) => {
  return "c" + hash(`${property}${value}`);
};

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

const toManyDeclaration = (rules: Record<string, Value>) => {
  const processedRules = [];

  for (const property of Object.keys(rules)) {
    processedRules.push(toDeclaration(property, rules[property]));
  }

  return processedRules.join(";");
};

const toRule = (property: string, declaration: string) => {
  const className = toClassName(property, declaration);

  const formatRule = (selector: string, body: string) => {
    return `${selector}{${body}}`;
  };

  const toClassNameSelector = (className: string) => {
    return `.${className}`;
  };

  switch (true) {
    // @todo: support of multiple pseudo class ":hover, :focus"
    // @todo: check support of pseudo elements
    case property.startsWith(":"):
      return formatRule(
        `${toClassNameSelector(className)}${property}`,
        declaration
      );
    // @todo: @keyframes
    // @todo: nesting of @media > :hover
    case property.startsWith("@media"):
      return formatRule(
        property,
        formatRule(toClassNameSelector(className), declaration)
      );
    default:
      // @note: atomic css with single property
      return formatRule(toClassNameSelector(className), declaration);
  }
};

let styleElementForShorthand: any = null;
let styleElementForMedia: any = null;
let styleElement: any = null;
const CACHE: Record<string, boolean> = {};
const isDevelopment = process.env.NODE_ENV === "development";

const insertRule = (
  className: string,
  rule: string,
  stl: any = styleElement
) => {
  // @note: already inserted (no need to re-add it)
  if (CACHE[className]) {
    return;
  }

  // @note: insert rule
  if (isDevelopment) {
    stl.innerHTML = `${stl.innerHTML}${rule}`;
  } else {
    stl.sheet.insertRule(rule);
  }

  CACHE[className] = true;
};

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

export const css = (cssObject: DeclarationBlock) => {
  // @note: order is important for css overwrite and specificity
  if (styleElementForShorthand === null) {
    styleElementForShorthand = document.createElement("style");
    styleElementForShorthand.id = "shorthand";
    document.head.appendChild(styleElementForShorthand);
  }
  if (styleElement === null) {
    styleElement = document.createElement("style");
    document.head.appendChild(styleElement);
  }
  if (styleElementForMedia === null) {
    styleElementForMedia = document.createElement("style");
    styleElementForMedia.id = "media";
    document.head.appendChild(styleElementForMedia);
  }

  const properties = Object.keys(cssObject);
  const classNames: Array<Property> = [];

  for (const property of properties) {
    const declarationBlock = cssObject[property];
    // @note: filter undefined declarationBlock
    if (isValidDeclarationBlock(declarationBlock)) {
      const cssBody = isObject(declarationBlock)
        ? toManyDeclaration(declarationBlock)
        : toDeclaration(property, declarationBlock);
      const className = toClassName(property, cssBody);

      insertRule(
        className,
        toRule(property, cssBody),
        SHORTHAND_PROPERTIES[property]
          ? styleElementForShorthand
          : property.startsWith("@media")
          ? styleElementForMedia
          : styleElement
      );
      classNames.push(className);
    }
  }

  return classNames.join(" ");
};

const merge = (
  target: DeclarationBlock,
  ...sources: DeclarationBlock[]
): DeclarationBlock => {
  if (sources.length === 0) {
    return target;
  }

  const source = sources[0];

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (isObject(sourceValue) && isObject(targetValue)) {
      target[key] = merge(targetValue, sourceValue) as Record<string, Value>;
    } else {
      target[key] = sourceValue;
    }
  }

  sources.shift();

  return merge(target, ...sources);
};

export const composeCss = (...cssObjects: DeclarationBlock[]) => {
  return css(merge({}, ...cssObjects));
};

type StatefulValue = { default: Value; ":hover": Value }; // @todo: accepts only pseudo class and pseudo elements (::after:hover)
type DeclarationBlock2 = Record<string, Value | StatefulValue>;

const getStyleSheet = () => {
  // @todo: globalStyleElement
  if (styleElementForShorthand === null) {
    styleElementForShorthand = document.createElement("style");
    styleElementForShorthand.id = "shorthand";
    document.head.appendChild(styleElementForShorthand);
  }
  if (styleElement === null) {
    styleElement = document.createElement("style");
    document.head.appendChild(styleElement);
  }
  if (styleElementForMedia === null) {
    styleElementForMedia = document.createElement("style");
    styleElementForMedia.id = "media";
    document.head.appendChild(styleElementForMedia);
  }

  return {
    atomic: styleElement,
    shorthand: styleElementForShorthand,
  };
};

export const css2 = (declarationBlock: DeclarationBlock2) => {
  const styleSheet = getStyleSheet();
  const classNames: Array<Property> = [];

  for (const property in declarationBlock) {
    const value = declarationBlock[property];

    if (value === undefined) {
      break;
    }

    const destinationSheet = SHORTHAND_PROPERTIES[property]
      ? styleSheet.shorthand
      : styleSheet.atomic;

    if (isObject(value)) {
      for (const state in value) {
        // initial value:
        let finalProperty = property;
        const isStateProperty = state.startsWith(":");

        if (isStateProperty) {
          finalProperty = `${property}${state}`;
        }

        const className = toClassName(finalProperty, state);
        const block = toDeclaration(
          property,
          value[state as keyof StatefulValue]
        );
        const ruleSet = `.${className}${
          isStateProperty ? state : ""
        }{${block}}`;

        insertRule(className, ruleSet, destinationSheet);

        classNames.push(className);
      }
    } else {
      const className = toClassName(property, value);
      const block = toDeclaration(property, value);
      const ruleSet = `.${className}{${block}}`;

      insertRule(className, ruleSet, destinationSheet);

      classNames.push(className);
    }
  }

  return classNames.join(" ");
};

// co("@support (display: grid)", { display: "grid" }) // co alias for conditional
// css({ backgroundColor: "red" })
// cx({ backgroundColor: "red" }, { backgroundColor: "purple" })
// <CollectStyles /> for SSR (insert style element in the react root before all elements)

console.log(
  "TO",
  css2({
    color: "purple",
    backgroundColor: {
      default: "purple",
      ":hover": "red",
    },
  })
);
