import { createCoulis } from "coulis/react-native";

const px = (value: number) => `${value}px`;

const tokens = Object.freeze({
	colors: {
		black: "black",
		blue: [
			"rgb(241,244,248)",
			"rgb(226,232,240)",
			"rgb(201,212,227)",
			"rgb(168,186,211)",
			"rgb(119,146,185)",
		],
		transparent: "transparent",
		white: "white",
	},
	fontSizes: [
		px(12),
		px(14),
		px(16),
		px(18),
		px(20),
		px(22),
		px(24),
		px(28),
		px(30),
	],
	fontWeights: ["100", "400", "900"],
	radii: [px(0), px(4), px(8), px(12), px(999)],
	spacings: {
		0: "0px",
		0.5: "0.5rem",
		1: "1rem",
		1.5: "2rem",
	},
} as const);

const { createKeyframes, createMetadata, createStyles, setGlobalStyles } =
	createCoulis({
		properties(theme) {
			return {
				accentColor: true,
				animation: true,
				backgroundColor: theme.colors,
				borderRadius: theme.radii,
				borderStyle: true,
				boxSizing: true,
				color: theme.colors,
				colorScheme(input: "black" | "white") {
					return input === "black" ? "dark" : "light";
				},
				display: true,
				flex: true,
				flexDirection: true,
				fontFamily: true,
				fontSize: theme.fontSizes,
				fontWeight: theme.fontWeights,
				gap: true,
				height: true,
				margin: theme.spacings,
				marginBottom: theme.spacings,
				marginLeft: theme.spacings,
				marginRight: theme.spacings,
				marginTop: theme.spacings,
				padding: theme.spacings,
				paddingBottom: theme.spacings,
				paddingLeft: theme.spacings,
				paddingRight: theme.spacings,
				paddingTop: theme.spacings,
				src: true,
				transform: true,
				transitionProperty(input: ("background-color" | "color")[]) {
					return input.join(",");
				},
				width: [50, 100],
			};
		},
		shorthands: {
			marginHorizontal: ["marginLeft", "marginRight"],
			marginVertical: ["marginTop", "marginBottom"],
			paddingHorizontal: ["paddingLeft", "paddingRight"],
			paddingVertical: ["paddingTop", "paddingBottom"],
		},
		states: {
			hover: "coulis[selector]:hover{coulis[declaration]}",
			large: "@media (min-width: 1024px){coulis[selector]{coulis[declaration]}}",
			medium: "@media (min-width: 768px){coulis[selector]{coulis[declaration]}}",
			small: "@media (min-width: 360px){coulis[selector]{coulis[declaration]}}",
			smallWithHover:
				"@media (min-width: 360px){coulis[selector]:hover{coulis[declaration]}}",
		},
		theme: {
			colors: {
				neutralDark: tokens.colors.black,
				neutralLight: tokens.colors.white,
				neutralTransparent: tokens.colors.transparent,
				surfacePrimary: tokens.colors.blue[4],
				surfaceSecondary: tokens.colors.blue[2],
			},
			fontSizes: {
				body: tokens.fontSizes[2],
			},
			fontWeights: {
				body: tokens.fontWeights[1],
			},
			radii: {
				full: tokens.radii[4],
				large: tokens.radii[3],
				medium: tokens.radii[2],
				none: tokens.radii[0],
				small: tokens.radii[1],
			},
			spacings: tokens.spacings,
		},
	});

export { createKeyframes, createMetadata, createStyles, setGlobalStyles };
