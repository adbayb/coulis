import { beforeAll, describe, expect, test } from "vitest";

import { atoms, createAtoms, extractStyles, globals, keyframes } from "../src";

describe("coulis", () => {
	beforeAll(() => {
		globals({
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
			html: {
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
		expect(animationName).toBe("c62e63a97");
		expect(classNames).toBe(
			"c3c5816c4 cbb3db274 c571db958 ce9403afc cde6daf3c",
		);
		expect(largerClassNames).toBe(
			"c721688f8 c3d523ba0 cf33f0fbe cec510c6c c3123b398",
		);
	});

	test("should extract styles given object format", () => {
		expect(extractStyles()).toMatchSnapshot();
	});

	test("should extract styles given string format", () => {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		expect(`${extractStyles()}`).toMatchSnapshot();
	});
});

const animationName = keyframes({
	25: {
		transform: "scale(1.25)",
	},
	"50%": {
		transform: "scale(1.5)",
	},
	from: {
		transform: "scale(1)",
	},
	to: {
		transform: "scale(1)",
	},
});

const classNames = atoms({
	backgroundColor: {
		":hover": "lightcyan",
		"[alt]": "lightgray",
		default: "lightcoral",
	},
	color: "lightblue",
	padding: 10,
});

const largerAtoms = createAtoms("@media", "(min-width: 576px)");

const largerClassNames = largerAtoms({
	backgroundColor: {
		":hover": "lightcyan",
		"[alt]": "lightgray",
		default: "lightcoral",
	},
	color: "lightblue",
	padding: 24,
});
