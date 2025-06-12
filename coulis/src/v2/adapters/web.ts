/* eslint-disable sort-keys-custom-order/object-keys */
import type { RecordLike, StyleProperties } from "../core/types";
import type { CreateAdapter } from "../core/ports/adapter";
import { STYLE_TYPES } from "../core/entities/style";
import type { Style } from "../core/entities/style";

type ClassName = string;

type Rule = string;

const createId = (input: RecordLike) => {
	return createClassName(JSON.stringify(input));
};

export const createWebAdapter: CreateAdapter<ClassName> = ({ createStyle }) => {
	const createStyleSheet = IS_SERVER_ENVIRONMENT
		? createVirtualStyleSheet
		: createDomStyleSheet;

	const styleSheetByTypeAdaptee = STYLE_TYPES.reduce(
		(output, type) => {
			output[type] = createStyleSheet(type);

			return output;
		},
		{} as Record<Style["type"], StyleSheet>,
	);

	const hydratedClassNames = new Set(
		Object.values(styleSheetByTypeAdaptee).flatMap((styleSheet) =>
			styleSheet.getHydratedClassNames(),
		),
	);

	return {
		createCustomProperties(input) {
			return input;
		},
		createKeyframes(input) {
			const { id, payload, isCached } = createStyle({
				id: createId(input),
				type: "global",
				payload: input,
			});

			if (isCached || hydratedClassNames.has(id)) return id;

			let rule = "";
			const selectors = Object.keys(payload) as (keyof typeof payload)[];

			for (const selector of selectors) {
				const style = payload[selector];

				if (!style) continue;

				const ruleSelector = isNumber(selector)
					? `${selector}%`
					: String(selector);

				rule += `${ruleSelector}{${createDeclarations(style)}}`;
			}

			styleSheetByTypeAdaptee.global.insert(id, rule);

			return id;
		},
		createStyles() {
			return "todo";
		},
		setGlobalStyles(input) {
			const { id, payload, isCached } = createStyle({
				id: createId(input),
				type: "global",
				payload: input,
			});

			if (isCached || hydratedClassNames.has(id)) return;

			let rule = "";
			const selectors = Object.keys(payload);

			for (const selector of selectors) {
				const style = payload[selector];

				if (style === undefined) continue;

				rule +=
					typeof style === "string"
						? `${selector} ${style};`
						: `${selector}{${createDeclarations(style)}}`;
			}

			styleSheetByTypeAdaptee.global.insert(id, rule);
		},
		createVariants() {
			return () => {
				return "todo";
			};
		},
		getMetadataAsString() {
			return "todo";
		},
		getMetadata() {
			return [
				{
					attributes: {
						"data-coulis-cache": "todo",
						"data-coulis-type": "todo",
					},
					content: "todo",
				},
			];
		},
	};
};

type StyleSheet = {
	getContent: () => string;
	getHydratedClassNames: () => ClassName[];
	insert: (className: ClassName, rule: Rule) => void;
	remove: () => void;
};

type CreateStyleSheet = (type: Style["type"]) => StyleSheet;

const createVirtualStyleSheet: CreateStyleSheet = () => {
	const ruleCache = new Map<ClassName, Rule>();

	return {
		getContent() {
			return minify([...ruleCache.values()].join(""));
		},
		getHydratedClassNames() {
			return [];
		},
		insert(key, rule) {
			ruleCache.set(key, rule);
		},
		remove() {
			ruleCache.clear();
		},
	};
};

const createDomStyleSheet: CreateStyleSheet = (type) => {
	let element = document.querySelector<HTMLStyleElement>(
		`style[data-coulis-type="${type}"]`,
	);

	if (!element) {
		element = document.createElement("style");
		element.dataset.coulisCache = "";
		element.dataset.coulisType = type;
		document.head.append(element);
	}

	return {
		getContent() {
			/**
			 * `textContent` is more performant than `innerText` (no layout reflow).
			 * @see {@link https://esbench.com/bench/680c1f4e545f8900a4de2cf7 Benchmark}
			 */
			return element.textContent ?? "";
		},
		getHydratedClassNames() {
			const source = element.dataset.coulisCache;

			if (!source) return [];

			return source.split(",");
		},
		insert(_, rule) {
			/**
			 * `insertAdjacentText` is the most performant API for appending text.
			 * @see {@link https://esbench.com/bench/680c1080545f8900a4de2ce6 Benchmark}
			 */
			// eslint-disable-next-line unicorn/prefer-modern-dom-apis
			element.insertAdjacentText("beforeend", rule);
		},
		remove() {
			element.remove();
		},
	};
};

// eslint-disable-next-line unicorn/prefer-global-this
const IS_SERVER_ENVIRONMENT = typeof window === "undefined";

const minify = (value: string) => {
	return value.replaceAll(/\s{2,}|\s+(?={)|\r?\n/gm, "");
};

const isNumber = (value: unknown): value is number => {
	return typeof value === "number" || !Number.isNaN(Number(value));
};

const createClassName = (value: string) => {
	// hash content based with FNV-1a algorithm:
	const FNVOffsetBasis = 2166136261;
	const FNVPrime = 16777619;
	let hashedValue = FNVOffsetBasis;

	for (let index = 0; index < value.length; index++) {
		const characterUnicodeValue = value.codePointAt(index);

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

const createDeclaration = ({
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

const createDeclarations = <Properties extends StyleProperties>(
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
