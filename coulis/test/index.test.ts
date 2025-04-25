import { beforeAll, describe, expect, test } from "vitest";

import {
	createKeyframes,
	createStyles,
	createVariants,
	extractStyles,
	setGlobalStyles,
} from "../src";

describe("coulis", () => {
	beforeAll(() => {
		setGlobalStyles({
			"*,*::before,*::after": {
				boxSizing: "inherit",
			},
			".globalClass+.otherGlobalClass": {
				border: "1px solid black",
				borderRadius: 4,
			},
			"@charset": '"utf-8"',
			"@font-face": {
				fontFamily: "'AliasedHelvetica'",
				src: "local(Helvetica)",
			},
			"@import":
				"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
			"html": {
				boxSizing: "border-box",
			},
			"html,body": {
				backgroundColor: "lightcoral",
				fontFamily: "Open Sans, AliasedHelvetica",
				margin: 0,
				padding: 0,
			},
		});
	});

	test("should generate classNames", () => {
		expect(animationName).toBe("c77e20e50");
		expect(buttonVariants({ color: "brand", size: "large" })).toBe(
			"c72f7daf8 c6a0088d1",
		);
		expect(buttonVariants({ color: "brand", size: "medium" })).toBe(
			"c72f7daf8 ccadc8a20",
		);
		expect(buttonVariants({ color: "neutral", size: "medium" })).toBe(
			"c5ea183e8 ccadc8a20",
		);
		expect(buttonVariants({ color: "accent", size: "small" })).toBe(
			"cbb3938 c2a100aa4",
		);
		expect(classNames).toBe(
			"cdd299de8 cbb3938 ce31a3799 c18a19c73 c2a100aa4",
		);
	});

	test("should extract styles given object format", () => {
		expect(extractStyles()).toMatchSnapshot();
	});

	test("should extract styles given string format", () => {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		expect(`${extractStyles()}`).toMatchSnapshot();
	});

	test("should type `createStyles` in a safe manner", () => {
		const styles = createStyles(
			{
				backgroundColor: ["red", "blue"],
				color: {
					danger: "red",
					warning: "yellow",
				},
				height: ["100%"],
				transitionProperty(input: ("background-color" | "color")[]) {
					return input.join(" ");
				},
				width: true,
			},
			{
				loose: ["color"],
				shorthands: {
					size: ["width"],
				},
				states: {
					hover: ({ className, declaration }) =>
						`${className}:hover{${declaration}}`,
				},
			},
		);

		expect(
			styles({
				// @ts-expect-error property value does not exist (custom value)
				backgroundColor: "blue2",
				transitionProperty: ["color", "background-color"],
			}),
		).toBeTypeOf("string");

		expect(
			styles({
				backgroundColor: {
					// @ts-expect-error stateful property value does not exist (custom value)
					base: "blue3",
				},
			}),
		).toBeTypeOf("string");

		expect(() =>
			styles({
				backgroundColor: {
					// @ts-expect-error state key does not exist
					toto: "red",
				},
			}),
		).toThrow(/No configuration found for state `toto`/);

		expect(
			styles({
				// @ts-expect-error base state key is missing
				backgroundColor: {
					hover: "red",
				},
			}),
		).toBeTypeOf("string");

		expect(
			styles({
				// @ts-expect-error property value does not exist (native value)
				width: new Date(),
			}),
		).toBeTypeOf("string");

		expect(() =>
			styles({
				// @ts-expect-error property key does not exist
				nonExistingProperty: "unknownValue",
			}),
		).toThrow(/No configuration found for property `nonExistingProperty`/);

		expect(
			createVariants(styles, {
				color: {
					accent: { color: "warning" },
					// @ts-expect-error property value does not exist
					brand: { backgroundColor: "surfacePrimary" },
					neutral: { backgroundColor: "red", color: "lightgrey" },
				},
				size: {
					// @ts-expect-error property key does not exist
					medium: { height: 12 },
					small: { size: "auto", width: 100 },
				},
			}),
		).toBeTypeOf("function");

		expect(
			styles({
				color: "red",
				height: "100%",
				size: {
					base: "auto",
					hover: "100%",
				},
				width: "auto",
			}),
		).toBeTypeOf("string");
	});
});

const animationName = createKeyframes({
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
});

const styles = createStyles(
	{
		backgroundColor: true,
		color: true,
		padding: [6, 12, 18],
	},
	{
		states: {
			alt({ className, declaration }) {
				return `${className}[alt]{${declaration}}`;
			},
			hover({ className, declaration }) {
				return `${className}{${declaration}}`;
			},
		},
	},
);

const buttonVariants = createVariants(styles, {
	color: {
		accent: { backgroundColor: "lightcoral" },
		brand: { backgroundColor: "lightseagreen" },
		neutral: { backgroundColor: "lightgrey" },
	},
	size: {
		large: { padding: 18 },
		medium: { padding: 12 },
		small: { padding: 6 },
	},
});

const classNames = styles({
	backgroundColor: {
		alt: "lightgray",
		base: "lightcoral",
		hover: "lightcyan",
	},
	color: "lightblue",
	padding: {
		base: 6,
	},
});
