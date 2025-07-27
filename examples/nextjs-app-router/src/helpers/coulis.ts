import { createCoulis } from "coulis";

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
} as const);

export const { createKeyframes, createStyles, getMetadata, setGlobalStyles } =
	createCoulis({
		properties(theme) {
			return {
				backgroundColor: theme.colors,
				boxSizing: true,
				color: theme.colors,
				fontFamily: true,
				fontSize: true,
				margin: true,
				padding: true,
			};
		},
		theme: {
			colors: {
				neutralDark: tokens.colors.black,
				neutralLight: tokens.colors.white,
				neutralTransparent: tokens.colors.transparent,
				surfacePrimary: tokens.colors.blue[4],
				surfaceSecondary: tokens.colors.blue[2],
			},
		},
	});
