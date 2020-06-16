// @todo: benchmarks
// - if multiple insert of styles per atomic css declaration is more or less efficient than one single style element ?
// @todo: always & to reference parent in selector ? Quid :hover, :focus
// @todo: server side extraction
// @todo: hydrate createProcessor cache client side from data-coulis tag ?
import { SHORTHAND_PROPERTIES, UNITLESS_PROPERTIES } from "./constants";
import { hash } from "./helpers/hash";
import {
	StyleSheetAdapter,
	StyleSheetKey,
	createStyleSheets,
	stringifyStyle,
} from "./helpers/stylesheet";
import { DeclarationBlock, Property, Value } from "./types";
import { merge } from "./helpers/merge";
import { isObject } from "./helpers/object";

const toDeclaration = (property: Property, value: Value) => {
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

// @note: Anatomy of a css syntax:
// .className { background-color: blue; color: red } = css rule-set
// .className = selector
// { background-color: blue; color: red } = declaration block (contains one or more declarations separated by semicolons)
// background-color: blue = a declaration
// background-color = property (or property name)
// blue = value (or property value)

const toClassName = (hashInput: string, prefix = "c") => {
	return `${prefix}${hash(hashInput)}`;
};

const createProcessor = () => {
	// for memoization purposes:
	const cache: Record<string, string | null> = {};

	return (
		key: string,
		property: string,
		value: Value,
		ruleSetFormatter: (className: string, declaration: string) => string,
		styleSheet: StyleSheetAdapter
	) => {
		const cacheValue = cache[key];

		if (cacheValue) {
			return cacheValue;
		}

		if (value === undefined) {
			return null;
		}

		const className = toClassName(key);
		const normalizedDeclaration = toDeclaration(property, value);
		const ruleSet = ruleSetFormatter(className, normalizedDeclaration);

		// @todo: do not commit if rule already exists inside dom (hydratation + rerendering purposes :))
		styleSheet.commit(ruleSet);
		cache[key] = className;

		return className;
	};
};

const processStyle = createProcessor();
const styleSheets = createStyleSheets();

export const createCss = (groupRule: string) => {
	const formatRuleSetWithScope = (ruleSet: string) => {
		return !groupRule ? ruleSet : `${groupRule}{${ruleSet}}`;
	};

	return (...cssBlocks: DeclarationBlock[]) => {
		const cssBlock =
			cssBlocks.length <= 1 ? cssBlocks[0] : merge({}, ...cssBlocks);
		let classNames = "";

		for (const property in cssBlock) {
			const value = cssBlock[property];
			const styleSheet = groupRule
				? styleSheets.conditional
				: SHORTHAND_PROPERTIES[property]
				? styleSheets.shorthand
				: styleSheets.longhand;

			if (isObject(value)) {
				for (const selectorProperty in value) {
					const selectorValue =
						value[selectorProperty as keyof typeof value];
					const isDefaultProperty = selectorProperty === "default";
					const className = processStyle(
						isDefaultProperty
							? `${groupRule}${property}${selectorValue}`
							: `${groupRule}${property}${selectorValue}${selectorProperty}`,
						property,
						selectorValue,
						(className, declaration) =>
							formatRuleSetWithScope(
								`.${className}${
									isDefaultProperty ? "" : selectorProperty
								}{${declaration}}`
							),
						styleSheet
					);

					if (className !== null) {
						classNames = `${classNames} ${className}`;
					}
				}
			} else {
				const className = processStyle(
					`${groupRule}${property}${value}`,
					property,
					value,
					(className, declaration) =>
						formatRuleSetWithScope(`.${className}{${declaration}}`),
					styleSheet
				);

				if (className !== null) {
					classNames = `${classNames} ${className}`;
				}
			}
		}

		return classNames.trim();
	};
};

export const css = createCss("");

export const keyframes = (value: string) => {
	const className = `${toClassName(value, "a")}`;
	const declarationBlock = `@keyframes ${className}{${value}}`;

	styleSheets.global.commit(declarationBlock);

	return className;
};

export const extractStyles = () => {
	let style = "";

	Object.keys(styleSheets).map((key) => {
		const declarationBlock = styleSheets[
			key as StyleSheetKey
		].getDeclarationBlock();

		if (declarationBlock) {
			style = `${style}${stringifyStyle(
				key as StyleSheetKey,
				declarationBlock
			)}`;
		}
	});

	// @todo: stringified <style></style><style></style><style></style>
	return style;
};

export const raw = (value: string) => {
	styleSheets.global.commit(value);
};
