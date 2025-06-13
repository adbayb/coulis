import type { StyleProperties } from "../../core/entities/style";

/* eslint-disable sort-keys-custom-order/object-keys, unicorn/prefer-global-this */
export const IS_SERVER_ENVIRONMENT = typeof window === "undefined";

// Taken from https://raw.githubusercontent.com/facebook/react/b98adb648a27640db8467064e537b238b8c306ce/packages/react-dom/src/shared/CSSProperty.js
export const UNITLESS_PROPERTIES: Partial<
	Record<keyof StyleProperties, boolean>
> = {
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
