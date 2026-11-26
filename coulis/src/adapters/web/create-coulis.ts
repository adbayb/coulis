import type { RecordLike } from "../../core/entities/primitive";
import { isObject } from "../../core/entities/primitive";
import type { StatesLike } from "../../core/entities/style";
import { resolvePropertyValue } from "../../core/entities/style";
import type { CreateCoulis } from "../../core/ports/create-coulis";
import { SHORTHAND_PROPERTIES, UNITLESS_PROPERTIES } from "./constants";
import type { CompiledTemplate } from "./helpers";
import {
	createClassName,
	createCompiledTemplate,
	createCustomProperties,
	findClassNames,
	getEvaluatedTemplate,
	memoize,
} from "./helpers";
import type { ClassName, Rule, StyleSheet, StyleType } from "./stylesheet";
import { createStyleSheet, getStyleType, STYLE_TYPES } from "./stylesheet";

/**
 * Creates a web instance that generates atomic CSS rules for browser injection and server-side
 * rendering.
 *
 * @param contract - Style properties, theme, states, and shorthand definitions.
 * @returns Web styling methods for the configured contract.
 */
export const createCoulis: CreateCoulis<{
	Input: {
		WithCSSVariables: true;
	};
	Output: ClassName;
}> = (contract) => {
	const sheets = Object.fromEntries(
		STYLE_TYPES.map((type) => {
			return [type, createStyleSheet(type)];
		}),
	) as Record<StyleType, StyleSheet>;

	let rootDeclarations = "";

	const properties = contract.properties(
		(contract.theme &&
			createCustomProperties(contract.theme, (name, value) => {
				rootDeclarations += `${name}:${value as string};`;
			})) as Parameters<typeof contract.properties>[0],
	);

	const shorthands = (contract.shorthands ?? {}) as Record<string, readonly string[] | undefined>;
	const states: StatesLike = contract.states ?? {};
	const compiledStateByName = new Map<string, CompiledTemplate>();

	for (const [name, template] of Object.entries(states)) {
		if (!template.includes("coulis[selector]") || !template.includes("coulis[declaration]")) {
			throw new Error(
				`The \`${name}\` state must include \`coulis[selector]\` and \`coulis[declaration]\` markers.`,
			);
		}

		compiledStateByName.set(name, createCompiledTemplate(template));
	}

	// Set last: `base` always applies unconditional values, whatever the contract states.
	compiledStateByName.set(BASE_STATE_NAME, BASE_COMPILED_STATE);

	/**
	 * Resolves a style property name to the declarations it applies: a custom shorthand applies all
	 * its properties at once (one declaration block, so one class name), any other name applies
	 * itself.
	 */
	const getStyleProperty = memoize((name: string): Property => {
		const names = Object.hasOwn(shorthands, name) ? (shorthands[name] ?? []) : [name];

		/*
		 * Per property: its definition, its CSS kebab-case name, and the unit added to numbers
		 * (none for unitless properties, as per CSS specs).
		 */
		const entries = names.map((propertyName) => {
			return [
				(properties as RecordLike)[propertyName],
				propertyName.replaceAll(/[A-Z]/gu, "-$&").toLowerCase(),
				UNITLESS_PROPERTIES.has(propertyName) ? "" : "px",
			] as const;
		});

		return {
			baseClassNameByValue: new Map(),
			createDeclaration(value) {
				let declaration = "";

				if (value === undefined) {
					return declaration; // Skip unset values.
				}

				for (const [definition, kebabName, numberUnit] of entries) {
					const resolvedValue = resolvePropertyValue(definition, value);
					const unit = typeof resolvedValue === "string" ? "" : numberUnit;

					declaration += `${kebabName}:${resolvedValue as string}${unit};`;
				}

				return declaration;
			},
			getClassNameByValue: memoize(() => {
				return new Map();
			}),
			// A block mixing CSS shorthands and longhands goes with shorthands, so it never overrides longhands set by other class names.
			isCSSShorthand: names.some((propertyName) => {
				return SHORTHAND_PROPERTIES.has(propertyName);
			}),
		};
	});

	const createAtomicClassName = (
		property: Property,
		stateName: string,
		value: unknown,
	): ClassName => {
		const declaration = property.createDeclaration(value);
		const compiledState = compiledStateByName.get(stateName);

		if (!declaration || !compiledState) {
			return "";
		}

		/*
		 * The base state hashes the declaration alone: `{ base: value }` and `value` share their class name.
		 * Other state names are length-prefixed so that a name and its declaration never collide with another pair.
		 */
		const className = createClassName(
			stateName === BASE_STATE_NAME
				? declaration
				: `${stateName.length}:${stateName}${declaration}`,
		);

		sheets[getStyleType(property.isCSSShorthand, compiledState.isAtRule)].setRule(
			className,
			() => {
				return getEvaluatedTemplate(compiledState, `.${className}`, declaration);
			},
		);

		return className;
	};

	const getAtomicClassName = (
		property: Property,
		stateName: string,
		value: unknown,
	): ClassName => {
		const classNameByValue =
			stateName === BASE_STATE_NAME
				? property.baseClassNameByValue
				: property.getClassNameByValue(stateName);

		let className = classNameByValue.get(value);

		if (className === undefined) {
			className = createAtomicClassName(property, stateName, value);

			// Arrays are not cached: kept by reference, each call with a new array would add an entry.
			if (typeof value !== "object") {
				classNameByValue.set(value, className);
			}
		}

		return className;
	};

	const createDeclarationBlock = (input: RecordLike) => {
		let declarationBlock = "";

		for (const name of Object.keys(input)) {
			declarationBlock += getStyleProperty(name).createDeclaration(input[name]);
		}

		return declarationBlock;
	};

	// Serialized global inputs are long: looking them up is cheaper than hashing them on each call.
	const globalClassNameByInput = new Map<string, ClassName>();

	const getGlobalClassName = (input: string, createRule: (className: ClassName) => Rule) => {
		let className = globalClassNameByInput.get(input);

		if (className === undefined) {
			className = createClassName(input);
			sheets.global.setRule(className, createRule);
			globalClassNameByInput.set(input, className);
		}

		return className;
	};

	if (rootDeclarations) {
		getGlobalClassName(rootDeclarations, () => {
			return `:root{${rootDeclarations}}`;
		});
	}

	const globalReferenceCounts = new Map<ClassName, number>();
	/*
	 * The class names of the last HTML are kept: a page rendered again with the same content skips
	 * their search (comparing two HTML is far cheaper than searching one).
	 */
	let lastHtml: string | undefined;
	let lastClassNames: Set<ClassName> | undefined;

	const serializeStyleSheets = (usedClassNames?: Set<ClassName>) => {
		let styleElements = "";

		const styleSheets = STYLE_TYPES.map((type) => {
			const { cache, content } = sheets[type].serialize(usedClassNames);

			styleElements += `<style data-coulis-cache="${cache}" data-coulis-type="${type}">${content}</style>`;

			return {
				attributes: {
					"data-coulis-cache": cache,
					"data-coulis-type": type,
				},
				content,
			};
		});

		styleSheets.toString = () => {
			return styleElements;
		};

		return styleSheets;
	};

	return {
		createKeyframes(input) {
			return getGlobalClassName(JSON.stringify(input), (className) => {
				let rule = "";

				for (const selector of Object.keys(input) as (keyof typeof input)[]) {
					const style = input[selector];

					if (!style) {
						continue;
					}

					const ruleSelector = Number.isNaN(Number(selector)) ? selector : `${selector}%`;

					rule += `${ruleSelector}{${createDeclarationBlock(style)}}`;
				}

				return `@keyframes ${className}{${rule}}`;
			});
		},
		createStyles(input) {
			let classNames = "";

			/*
			 * `for...in` guarded by `hasOwnProperty` visits the same names as `Object.keys`, without
			 * creating their array: engines also read the values straight from the object layout.
			 */
			for (const name in input) {
				if (!hasOwnProperty(input, name)) {
					continue;
				}

				const value: unknown = input[name as keyof typeof input];
				const property = getStyleProperty(name);

				if (isObject(value)) {
					for (const stateName in value) {
						if (hasOwnProperty(value, stateName)) {
							classNames = joinClassNames(
								classNames,
								getAtomicClassName(property, stateName, value[stateName]),
							);
						}
					}
				} else {
					classNames = joinClassNames(
						classNames,
						getAtomicClassName(property, BASE_STATE_NAME, value),
					);
				}
			}

			return classNames;
		},
		getContract() {
			return {
				propertyNames: [
					...Object.keys(shorthands),
					...Object.keys(properties),
				] as ReturnType<typeof this.getContract>["propertyNames"],
			};
		},
		getCriticalStyleSheets(html) {
			if (html !== lastHtml) {
				lastClassNames = findClassNames(html);
				lastHtml = html;
			}

			return serializeStyleSheets(lastClassNames);
		},
		getStyleSheets: serializeStyleSheets,
		setGlobalStyles(input) {
			const serializedInput = JSON.stringify(input);

			const createRule = () => {
				let rule = "";

				for (const selector of Object.keys(input)) {
					const style = input[selector];

					if (style === undefined) {
						continue; // Skip unset values.
					}

					rule +=
						typeof style === "string"
							? `${selector} ${style};`
							: `${selector}{${createDeclarationBlock(style)}}`;
				}

				return rule;
			};

			const className = getGlobalClassName(serializedInput, createRule);

			globalReferenceCounts.set(className, (globalReferenceCounts.get(className) ?? 0) + 1);

			return () => {
				const count = (globalReferenceCounts.get(className) ?? 1) - 1;

				globalReferenceCounts.set(className, count);

				if (count === 0) {
					globalClassNameByInput.delete(serializedInput);
					sheets.global.removeRule(className, createRule());
				}
			};
		},
	};
};

type Property = {
	/**
	 * Class names by raw value for the base state, the most used one: it skips the state lookup of
	 * `getClassNameByValue`.
	 */
	baseClassNameByValue: Map<unknown, ClassName>;
	createDeclaration: (value: unknown) => string;
	/**
	 * Class names by raw value for a given state name: repeated values skip value resolution,
	 * hashing, and rule creation entirely.
	 */
	getClassNameByValue: (stateName: string) => Map<unknown, ClassName>;
	isCSSShorthand: boolean;
};

const BASE_STATE_NAME = "base";
const BASE_COMPILED_STATE = createCompiledTemplate("coulis[selector]{coulis[declaration]}");

/*
 * `Object.prototype.hasOwnProperty` is preferred over `Object.hasOwn`: within a `for...in` loop over
 * the same object, engines know its outcome without looking the property up.
 */
const hasOwnProperty = (input: object, name: string) => {
	// oxlint-disable-next-line e18e/prefer-object-has-own
	return Object.prototype.hasOwnProperty.call(input, name);
};

const joinClassNames = (classNames: string, className: ClassName) => {
	// An empty class name (unset value) is skipped.
	return classNames && className ? `${classNames} ${className}` : classNames || className;
};
