import { beforeAll, describe, expect, test } from "vitest";

import {
	createKeyframes,
	createStyles,
	createVariants,
	extract,
	globalStyles,
} from "../src";

describe("coulis", () => {
	beforeAll(() => {
		globalStyles({
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
			"cdd299de8 cbb3938 ce31a3799 c18a19c73 cd0c53d28",
		);
	});

	test("should extract styles given object format", () => {
		expect(extract()).toMatchSnapshot();
	});

	test("should extract styles given string format", () => {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		expect(`${extract()}`).toMatchSnapshot();
	});
});

const animationName = createKeyframes({
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

const styles = createStyles({
	backgroundColor: {
		keys: {
			alt({ className, declaration }) {
				return `${className}[alt]{${declaration}}`;
			},
			hover({ className, declaration }) {
				return `${className}{${declaration}}`;
			},
		},
	},
	color: true,
	padding: true,
});

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
	padding: 10,
});
