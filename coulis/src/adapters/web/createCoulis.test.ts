import { describe, expect, test } from "vitest";

import { createCoulis } from "./createCoulis";

describe("createCoulis (web adapter)", () => {
	test("should create keyframes", () => {
		expect(
			createKeyframes({
				25: {
					transform: "scale(1.25)",
				},
				"50%": {
					transform: "scale(1.5)",
				},
				"from": {
					transform: "scale(1)",
				},
				"to": {
					transform: "scale(1)",
				},
			}),
		).toBe("c3feb3671");
	});

	test("should create styles", () => {
		expect(
			createStyles({
				backgroundColor: {
					alt: "surfacePrimary",
					base: "surfaceSecondary",
					hover: "neutralTransparent",
				},
				color: "neutralDark",
				padding: {
					base: 0,
				},
			}),
		).toBe("c9420ae5f ced44f712 c9b11817e c35ef7535 c6c43fc52");
	});

	test("should extract styles", () => {
		expect(getMetadata()).toMatchSnapshot();
	});

	test("should extract styles given stringified styles", () => {
		expect(String(getMetadata())).toMatchSnapshot();
	});

	test("should get contract", () => {
		expect(getContract()).toStrictEqual({
			propertyNames: [
				"size",
				"backgroundColor",
				"boxSizing",
				"color",
				"colorScheme",
				"fontFamily",
				"height",
				"margin",
				"padding",
				"src",
				"transform",
				"width",
			],
		});
	});
});

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
	spacings: {
		0: "0px",
		0.5: "0.5rem",
		1: "1rem",
		1.5: "2rem",
	},
} as const);

const {
	createKeyframes,
	createStyles,
	getContract,
	getMetadata,
	setGlobalStyles,
} = createCoulis({
	properties(theme) {
		return {
			backgroundColor: theme.colors,
			boxSizing: true,
			color: theme.colors,
			colorScheme(input: "black" | "white") {
				return input === "black" ? "dark" : "light";
			},
			fontFamily: true,
			height: true,
			margin: theme.spacings,
			padding: theme.spacings,
			src: true,
			transform: true,
			width: [50, 100],
		};
	},
	shorthands: {
		size: ["width"],
	},
	states: {
		alt: "coulis[selector][alt]{coulis[declaration]}",
		hover: "coulis[selector]{coulis[declaration]}",
	},
	theme: {
		colors: {
			neutralDark: tokens.colors.black,
			neutralLight: tokens.colors.white,
			neutralTransparent: tokens.colors.transparent,
			surfacePrimary: tokens.colors.blue[4],
			surfaceSecondary: tokens.colors.blue[2],
		},
		spacings: tokens.spacings,
	},
});

// eslint-disable-next-line vitest/require-hook
setGlobalStyles({
	".globalClass+.otherGlobalClass": {
		colorScheme: "black",
	},
	"@charset": '"utf-8"',
	"@font-face": {
		fontFamily: "'AliasedHelvetica'",
		src: "local(Helvetica)",
	},
	"@import":
		"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	"div": {
		backgroundColor: "red", // Non-theme-based value to check if set properly by `setGlobalStyles`
	},
	"html": {
		boxSizing: "border-box",
	},
	"html,body": {
		backgroundColor: "surfacePrimary",
		fontFamily: "Open Sans, AliasedHelvetica",
		margin: 0,
		padding: 0,
	},
});
