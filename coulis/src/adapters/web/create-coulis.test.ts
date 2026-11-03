import { beforeAll, describe, expect, test, vi } from "vitest";
import { createCoulis } from "./create-coulis";

describe("createCoulis (web adapter)", () => {
	beforeAll(() => {
		setGlobalStyles({
			"*,*::before,*::after": {
				boxSizing: "inherit",
			},
			".globalClass+.otherGlobalClass": {
				colorScheme: "black",
			},
			"@charset": '"utf-8"',
			"@font-face": {
				fontFamily: "'AliasedHelvetica'",
				src: "local(Helvetica)",
			},
			"@import": "url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
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
	});

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
		).toBe("c8vmqaf");
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
		).toBe("c1uv4w8k ctbttxu c1lmv6o7 c1j2r6jb cvjbi4e");
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

	test("should not reuse class names for ambiguous state and declaration pairs", () => {
		const { createStyles, getMetadata } = createCoulis({
			properties() {
				return {
					transform: true,
					WebkitTransform: true,
				};
			},
			states: {
				"h": "coulis[selector]:hover{coulis[declaration]}",
				"h-webkit-": "coulis[selector]:focus{coulis[declaration]}",
			},
		});

		const hoverClassNames = createStyles({
			WebkitTransform: { base: "rotate(0deg)", h: "rotate(1deg)" },
		}).split(" ");

		const focusClassNames = createStyles({
			transform: { "base": "rotate(0deg)", "h-webkit-": "rotate(1deg)" },
		}).split(" ");

		const cssContent = getMetadata()
			.map(({ content }) => {
				return content;
			})
			.join("");

		expect(focusClassNames[1]).not.toBe(hoverClassNames[1]);

		expect(cssContent).toContain(
			`.${hoverClassNames[1]}:hover{-webkit-transform:rotate(1deg);}`,
		);

		expect(cssContent).toContain(`.${focusClassNames[1]}:focus{transform:rotate(1deg);}`);
	});

	test("should retry style creation after a property resolver throws", () => {
		const resolveColor = vi
			.fn((value: string) => {
				return value;
			})
			.mockImplementationOnce(() => {
				throw new Error("Transient resolver failure");
			});

		const { createStyles, getMetadata } = createCoulis({
			properties() {
				return {
					color: resolveColor,
				};
			},
		});

		const input = { color: "red" };

		expect(() => {
			return createStyles(input);
		}).toThrow("Transient resolver failure");

		const className = createStyles(input);

		const metadataContent = getMetadata()
			.map(({ content: stylesheetContent }) => {
				return stylesheetContent;
			})
			.join("");

		expect(createStyles(input)).toBe(className);
		expect(metadataContent).toContain(`.${className}{color:red;}`);
	});

	test("should escape style text in metadata and its HTML string", () => {
		const { createStyles, getMetadata } = createCoulis({
			properties() {
				return { color: true };
			},
		});

		createStyles({ color: "red</style><script>globalThis.auditXss=1</script>" });

		const metadata = getMetadata();

		const metadataContent = metadata
			.map(({ content: stylesheetContent }) => {
				return stylesheetContent;
			})
			.join("");

		const serializedMetadata = String(metadata);
		const escapedStyleText = String.raw`red\3C /style>\3C script>globalThis.auditXss=1\3C /script>`;

		expect(metadataContent).toContain(escapedStyleText);
		expect(metadataContent).not.toContain("<script>");
		expect(serializedMetadata).toContain(escapedStyleText);
		expect(serializedMetadata).not.toContain("<script>");
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

const { createKeyframes, createStyles, getContract, getMetadata, setGlobalStyles } = createCoulis({
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
