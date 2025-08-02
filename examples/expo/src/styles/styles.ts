import { createCoulis } from "coulis/react-native";

/* eslint-disable sort-keys-custom-order/object-keys */
import { spacings } from "./tokens/spacings";
import { boxShadows } from "./tokens/shadows";
import { radii } from "./tokens/radii";
import {
	fontFamilies,
	fontSizes,
	fontWeights,
	lineHeights,
} from "./tokens/fonts";
import { colors } from "./tokens/colors";
import { negateTokens } from "./helpers";

export const { createStyles, setGlobalStyles, getContract, getMetadata } =
	createCoulis({
		properties(theme) {
			const spacingValues = {
				...negateTokens(theme.spacings),
				auto: "auto",
			};

			const borderStyle: ["none", "solid"] = ["none", "solid"];

			return {
				alignItems: ["flex-start", "center", "flex-end", "stretch"],
				alignSelf: true,
				backgroundColor: theme.colors,
				borderBottomStyle: borderStyle,
				borderBottomWidth: true,
				borderColor: theme.colors,
				borderLeftStyle: borderStyle,
				borderLeftWidth: true,
				borderRadius: theme.radii,
				borderRightStyle: borderStyle,
				borderRightWidth: true,
				borderStyle,
				borderTopStyle: borderStyle,
				borderTopWidth: true,
				borderWidth: true,
				bottom: true,
				boxShadow: theme.shadows,
				color: theme.colors,
				cursor: ["none", "default", "pointer"],
				display: true,
				flexDirection: ["column", "row"],
				flex: true,
				fontFamily: theme.fontFamilies,
				fontSize: fontSizes,
				fontWeight: theme.fontWeights,
				gap: spacingValues,
				height: true,
				justifyContent: [
					"flex-start",
					"center",
					"flex-end",
					"space-between",
					"space-around",
				],
				justifySelf: true,
				left: true,
				lineHeight: theme.lineHeights,
				margin: spacingValues,
				marginBottom: spacingValues,
				marginLeft: spacingValues,
				marginRight: spacingValues,
				marginTop: spacingValues,
				maxHeight: true,
				maxWidth: true,
				minHeight: true,
				minWidth: true,
				opacity: [0, 1],
				outline: true,
				overflow: ["auto", "hidden", "scroll", "visible"],
				padding: spacingValues,
				paddingBottom: spacingValues,
				paddingLeft: spacingValues,
				paddingRight: spacingValues,
				paddingTop: spacingValues,
				pointerEvents: ["none", "auto"],
				position: ["absolute", "relative", "fixed", "sticky"],
				right: true,
				textAlign: ["left", "center", "right"],
				top: true,
				transition: {
					fast: "0.15s ease",
					slow: "0.3s ease",
				},
				transitionProperty: (
					input: ("background-color" | "color")[],
				) => {
					return input.join(",");
				},
				userSelect: ["none", "auto"],
				width: true,
				zIndex: true,
			};
		},
		shorthands: {
			marginHorizontal: ["marginLeft", "marginRight"],
			marginVertical: ["marginBottom", "marginTop"],
			paddingHorizontal: ["paddingLeft", "paddingRight"],
			paddingVertical: ["paddingBottom", "paddingTop"],
			size: ["height", "width"],
		},
		states: {
			_active: "coulis[selector]:active{coulis[declaration]}",
			_focus: "coulis[selector]:focus{coulis[declaration]}",
			_hover: "coulis[selector]:hover{coulis[declaration]}",
			large: "@media screen and (min-width: 1024px){coulis[selector]{coulis[declaration]}}",
			medium: "@media screen and (min-width: 768px){coulis[selector]{coulis[declaration]}}",
			small: "@media screen and (min-width: 370px){coulis[selector]{coulis[declaration]}}",
		},
		theme: {
			colors: {
				none: colors.transparent,
				neutralWhite: colors.white,
				neutralBlack: colors.black,
				backgroundPrimary: colors.gray["500"],
				backgroundPrimaryHover: colors.gray["400"],
				backgroundPrimaryActive: colors.gray["600"],
				backgroundSecondary: colors.gray["100"],
				backgroundSecondaryHover: colors.gray["200"],
				backgroundSecondaryActive: colors.gray["300"],
				foregroundPrimary: colors.gray["600"],
				foregroundSecondary: colors.gray["400"],
				borderSecondary: colors.gray["300"],
				borderPrimary: colors.gray["400"],
				backgroundDanger: colors.red["100"],
				borderDanger: colors.red["400"],
				foregroundDanger: colors.red["400"],
				backgroundWarning: colors.yellow["100"],
				borderWarning: colors.yellow["400"],
				foregroundWarning: colors.yellow["400"],
				backgroundSuccess: colors.green["100"],
				borderSuccess: colors.green["400"],
				foregroundSuccess: colors.green["400"],
				backgroundNote: colors.gray["100"],
				borderNote: colors.gray["400"],
				foregroundNote: colors.gray["400"],
			},
			fontFamilies,
			fontSizes,
			fontWeights,
			lineHeights,
			radii,
			shadows: boxShadows,
			spacings,
		},
	});

export type StyleProps = Parameters<typeof createStyles>[0];

export const STYLE_PROPERTY_NAMES = getContract().propertyNames;
