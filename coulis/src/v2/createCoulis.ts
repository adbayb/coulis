/* eslint-disable sort-keys-custom-order/object-keys */
import type {
	ClassName,
	CreateAdapter,
	CustomProperties,
	CustomProperty,
	RecordLike,
	StyleProperties,
	WithNewLeafNodes,
} from "./core/ports/adapter";
import { coulis } from "../entities/coulis";

/**
 * TODO:
 * - Implement getMetadata
 * - Adapt examples and tests
 * - Test if no test/functional regression
 * - Split files more granurarly (core vs. Ports vs. Adapters)
 * - Review API to define globally the style definition via `const coulis = createCoulis(withWebAdapter)({ backgroundColor: theme.color });`.
 * @param createAdapter - TODO.
 * @returns TODO.
 * @example
 * TODO
 */
export const createCoulis = <Output>(createAdapter: CreateAdapter<Output>) => {
	const cache = new Map<
		IntermediateRepresentation["id"],
		IntermediateRepresentation
	>();

	return createAdapter(({ id, payload, type }) => {
		const styles = cache.get(id);

		const output = {
			id,
			isCached: false,
			payload,
			type,
		};

		if (!styles) {
			cache.set(id, output);
		}

		output.isCached = true;

		return output;
	});
};

/**
 * Data structure to represent a style entry.
 * The world of compiling inspires the naming.
 */
type IntermediateRepresentation<Payload extends RecordLike = RecordLike> = {
	id: string;
	isCached: boolean;
	payload: Payload;
	type: StyleType;
};

export type CreateIntermediateRepresentation = <
	Payload extends RecordLike = RecordLike,
>(
	input: Pick<IntermediateRepresentation<Payload>, "id" | "payload" | "type">,
) => IntermediateRepresentation<Payload>;

/**
 * The order is important to enforce the more precise properties take precedence over less precise ones.
 * Global properties has a lesser specificity than (<) shorthand ones:
 * global (e.g div { background-color }) < shorthand (e.g background) < longhand (e.g background-color) < conditional-shorthand (e.g @media { background }) < conditional-longhand (e.g @media { background-color }) properties.
 */
export const STYLE_TYPES = Object.freeze([
	"global",
	"shorthand",
	"longhand",
	"atShorthand",
	"atLonghand",
] as const);

export type StyleType = (typeof STYLE_TYPES)[number];

// eslint-disable-next-line sonarjs/max-lines-per-function
export const createWebAdapter: CreateAdapter<ClassName> = () => {
	return {
		createCustomProperties(properties) {
			const { collectedProperties, nodes } =
				createCustomPropertiesWithoutSideEffects(properties);

			coulis
				.getStyleSheet("global")
				.commit(JSON.stringify(collectedProperties), () => {
					const variables = collectedProperties.reduce(
						(output, property) =>
							`${output}--${property.name}:${property.value};`,
						"",
					);

					return `:root{${variables}}`;
				});

			return nodes;
		},
		createKeyframes(properties) {
			return coulis
				.getStyleSheet("global")
				.commit(JSON.stringify(properties), (className) => {
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

					return `@keyframes ${className}{${rule}}`;
				});
		},
		createStyles(properties, options) {
			type ShorthandProperties = NonNullable<
				typeof options
			>["shorthands"];

			const shorthands = options?.shorthands ?? {};
			const states = options?.states ?? {};
			const configuredShorthandNames = Object.keys(shorthands);

			const isShorthandKey = (
				key: string,
			): key is Extract<keyof ShorthandProperties, string> => {
				return configuredShorthandNames.includes(key);
			};

			const getDeclaration = ({
				name,
				value,
			}: {
				name: keyof StyleProperties;
				value: number | string | undefined;
			}) => {
				if (value === undefined) return;

				const propertyConfig = properties[name];

				if (!propertyConfig) {
					throw new Error(
						createError({
							api: "styles",
							cause: `No configuration found for property \`${name}\``,
							solution:
								"Review the corresponding `createStyles` factory to include the needed property configuration",
						}),
					);
				}

				const mappedValue =
					typeof propertyConfig === "function"
						? propertyConfig(value)
						: isObject(propertyConfig)
							? propertyConfig[value]
							: value;

				return createDeclaration({
					name,
					value: mappedValue ?? value,
				});
			};

			const createClassNames = (
				name: keyof StyleProperties,
				value:
					| Record<string, number | string | undefined>
					| number
					| string
					| undefined,
				// eslint-disable-next-line sonarjs/cognitive-complexity, sonarjs/cyclomatic-complexity
			) => {
				const classNames: string[] = [];
				const isNativeShorthandProperty = isShorthandProperty(name);

				let styleSheet = isNativeShorthandProperty
					? coulis.getStyleSheet("shorthand")
					: coulis.getStyleSheet("longhand");

				if (!isObject(value)) {
					const declaration = getDeclaration({
						name,
						value,
					});

					if (!declaration) return classNames;

					classNames.push(
						styleSheet.commit(declaration, (className) => {
							return `.${className}{${declaration}}`;
						}),
					);

					return classNames;
				}

				const keys = Object.keys(value);

				for (const key of keys) {
					const inputValue = value[key];

					const declaration = getDeclaration({
						name,
						value: inputValue,
					});

					if (!declaration) continue;

					const isBaseState = key === "base";

					const stateBuilder = isBaseState
						? () => `.{{className}}{${declaration}}`
						: states[key];

					if (typeof stateBuilder !== "function") {
						throw new TypeError(
							createError({
								api: "styles",
								cause: `No configuration found for state \`${key}\``,
								solution:
									"Review the corresponding `createStyles` factory to include the needed `states` configuration",
							}),
						);
					}

					const preComputedRule = stateBuilder({
						className: ".{{className}}",
						declaration,
					});

					if (preComputedRule.startsWith("@")) {
						styleSheet = isNativeShorthandProperty
							? coulis.getStyleSheet("atShorthand")
							: coulis.getStyleSheet("atLonghand");
					}

					classNames.push(
						styleSheet.commit(
							/*
							 * The key is not included to compute the className when `key` equals to "base" as base is equivalent to an unconditional value.
							 * This exclusion will allow to recycle cache if the style value has been already defined unconditionally.
							 */
							isBaseState ? declaration : `${key}${declaration}`,
							(className) => {
								return preComputedRule.replace(
									"{{className}}",
									className,
								);
							},
						),
					);
				}

				return classNames;
			};

			return (input) => {
				const classNames: string[] = [];

				for (const propertyName of Object.keys(input)) {
					const value = (
						input as Record<
							string,
							Parameters<typeof createClassNames>[1]
						>
					)[propertyName];

					if (isShorthandKey(propertyName)) {
						const shorthandConfig = shorthands[
							propertyName
						] as (keyof StyleProperties)[];

						for (const shorthandName of shorthandConfig) {
							classNames.push(
								...createClassNames(shorthandName, value),
							);
						}
					} else {
						classNames.push(
							...createClassNames(
								propertyName as keyof StyleProperties,
								value,
							),
						);
					}
				}

				return classNames.join(" ");
			};
		},
		createVariants(styles, variants) {
			return (selectedValueByVariant) => {
				const classNames: ClassName[] = [];
				const variantKeys = Object.keys(selectedValueByVariant);

				for (const variant of variantKeys) {
					const selectedVariant = selectedValueByVariant[variant];
					const propertiesByVariant = variants[variant];

					const variantProperties =
						propertiesByVariant?.[selectedVariant as string];

					if (variantProperties === undefined) continue;

					classNames.push(styles(variantProperties));
				}

				return compose(...classNames);
			};
		},
		getMetadata() {
			return [];
		},
		getMetadataAsString() {
			return "";
		},
		setGlobalStyles(properties) {
			coulis
				.getStyleSheet("global")
				.commit(JSON.stringify(properties), () => {
					let rule = "";
					const selectors = Object.keys(properties);

					for (const selector of selectors) {
						const style = properties[selector];

						if (style === undefined) continue;

						rule +=
							typeof style === "string"
								? `${selector} ${style};`
								: `${selector}{${createDeclarations(style)}}`;
					}

					return rule;
				});
		},
	};
};

const createCustomPropertiesWithoutSideEffects = <
	const P extends CustomProperties,
>(
	properties: P,
	propertyNameParts: CustomProperty["name"][] = [],
	collectedProperties: CustomProperty[] = [],
) => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const nodes = {} as WithNewLeafNodes<P, CustomProperty["value"]>;
	const tokenNames = Object.keys(properties) as (keyof P)[];

	for (const tokenName of tokenNames) {
		const value = properties[tokenName];

		propertyNameParts.push(tokenName as string);

		if (isObject(value)) {
			const output = createCustomPropertiesWithoutSideEffects(
				value,
				propertyNameParts,
				collectedProperties,
			);

			propertyNameParts = [];
			nodes[tokenName] = output.nodes as (typeof nodes)[keyof P];
		} else {
			const property: CustomProperty = {
				name: escape(propertyNameParts.join("-")),
				value: value as string,
			};

			nodes[tokenName] =
				`var(--${property.name})` as (typeof nodes)[keyof P];
			collectedProperties.push(property);
			propertyNameParts.pop();
		}
	}

	return { collectedProperties, nodes };
};

/**
 * Escape invalid CSS characters to generate usable property names.
 * @param name - The property name to escape with potentially some unsafe characters.
 * @returns The escaped property name.
 * @see https://mathiasbynens.be/notes/css-escapes
 * @example
 * const safeCssVariable = escape("--spacings-1.5"); // Will generate `--spacings-1\5`
 */
const escape = (name: string) => {
	return name.replaceAll(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/g, "\\");
};

export const createClassName = (input: string) => {
	// hash content based with FNV-1a algorithm:
	const FNVOffsetBasis = 2166136261;
	const FNVPrime = 16777619;
	let hashedValue = FNVOffsetBasis;

	for (let index = 0; index < input.length; index++) {
		const characterUnicodeValue = input.codePointAt(index);

		if (!characterUnicodeValue) continue;

		hashedValue ^= characterUnicodeValue;
		hashedValue *= FNVPrime;
	}

	/*
	 * We convert hashed value to 32-bit unsigned integer
	 * via logical unsigned shift operator >>>
	 */
	const uHash = hashedValue >>> 0;

	/*
	 * A coulis className is generated by prefixing with "c"
	 * and converting generated hash to hexadecimal
	 */
	return `c${Number(uHash).toString(16)}`;
};

export const createDeclaration = ({
	name,
	value,
}: {
	name: keyof StyleProperties;
	value: StyleProperties[keyof StyleProperties];
}) => {
	// From JS camelCase to CSS kebeb-case
	const transformedPropertyName = name.replaceAll(
		/([A-Z])/g,
		(matched) => `-${matched.toLowerCase()}`,
	);

	// Format value to follow CSS specs (unitless number)
	const transformedPropertyValue =
		typeof value === "string" || UNITLESS_PROPERTIES[name]
			? String(value)
			: `${String(value)}px`;

	return `${transformedPropertyName}:${transformedPropertyValue};`;
};

export const createDeclarations = <Properties extends StyleProperties>(
	properties: Properties,
) => {
	let declarationBlock = "";
	const propertyNames = Object.keys(properties) as (keyof StyleProperties)[];

	for (const propertyName of propertyNames) {
		const value = properties[propertyName];

		if (value) {
			declarationBlock += createDeclaration({
				name: propertyName,
				value,
			});
		}
	}

	return declarationBlock;
};

export const isShorthandProperty = (name: keyof StyleProperties) => {
	return Boolean(SHORTHAND_PROPERTIES[name]);
};

type Indexable = Partial<Record<keyof StyleProperties, boolean>>;

// Taken from https://raw.githubusercontent.com/facebook/react/b98adb648a27640db8467064e537b238b8c306ce/packages/react-dom/src/shared/CSSProperty.js
const UNITLESS_PROPERTIES: Indexable = {
	animationIterationCount: true,
	borderImageOutset: true,
	borderImageSlice: true,
	borderImageWidth: true,
	boxFlex: true,
	boxFlexGroup: true,
	boxOrdinalGroup: true,
	columnCount: true,
	columns: true,
	flex: true,
	flexGrow: true,
	flexShrink: true,
	gridArea: true,
	gridRow: true,
	gridRowEnd: true,
	gridRowStart: true,
	gridColumn: true,
	gridColumnEnd: true,
	gridColumnStart: true,
	fontWeight: true,
	lineClamp: true,
	lineHeight: true,
	opacity: true,
	order: true,
	orphans: true,
	tabSize: true,
	widows: true,
	zIndex: true,
	zoom: true,
	// SVG properties
	fillOpacity: true,
	floodOpacity: true,
	stopOpacity: true,
	strokeDasharray: true,
	strokeDashoffset: true,
	strokeMiterlimit: true,
	strokeOpacity: true,
	strokeWidth: true,
	// Property prefixes
	WebkitLineClamp: true,
};

/*
 * From PREACT:
 * export const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
 */
const SHORTHAND_PROPERTIES: Indexable = {
	animation: true,
	background: true,
	border: true,
	borderBottom: true,
	borderColor: true,
	borderLeft: true,
	borderRadius: true,
	borderRight: true,
	borderStyle: true,
	borderTop: true,
	borderWidth: true,
	columnRule: true,
	columns: true,
	flex: true,
	flexFlow: true,
	font: true,
	grid: true,
	gridArea: true,
	gridColumn: true,
	gridRow: true,
	gridTemplate: true,
	listStyle: true,
	margin: true,
	offset: true,
	outline: true,
	overflow: true,
	padding: true,
	placeContent: true,
	placeItems: true,
	placeSelf: true,
	textDecoration: true,
	transition: true,
};

/**
 * Compose multiple class names together.
 * @param classNames - A collection of string-based class names.
 * @returns The composed class names.
 * @example
 * const classNames = compose(styles({ backgroundColor: "red" }), styles({ color: "red" }));
 * document.getElementById("my-element-id").className = classNames;
 */
export const compose = (...classNames: string[]) => {
	return classNames.join(" ");
};

export const isNumber = (value: unknown): value is number => {
	return typeof value === "number" || !Number.isNaN(Number(value));
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const minify = (value: string) => {
	return value.replaceAll(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};

export const createError = (parameters: {
	api: string;
	cause: string;
	solution: string;
}) => {
	return `\`${parameters.api}\`: ${parameters.cause}. ${parameters.solution}.`;
};
