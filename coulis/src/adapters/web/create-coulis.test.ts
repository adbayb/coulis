import { beforeAll, describe, expect, test, vi } from "vitest";
import { createCoulis } from "./create-coulis";

describe("createCoulis (web adapter)", () => {
	beforeAll(() => {
		setFixtureGlobalStyles();
		createFixtureKeyframes();
		createFixtureStyles();
	});

	test("should create keyframes", () => {
		expect(createFixtureKeyframes()).toBe("c8vmqaf");
	});

	test("should create styles", () => {
		expect(createFixtureStyles()).toBe("c1uv4w8k ctbttxu c1lmv6o7 c1j2r6jb cvjbi4e");
	});

	test("should extract styles", () => {
		expect(getStyleSheets()).toMatchSnapshot();
	});

	test("should extract styles given stringified styles", () => {
		expect(String(getStyleSheets())).toMatchSnapshot();
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
		const { createStyles, getStyleSheets } = createCoulis({
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

		const cssContent = getContent(getStyleSheets());

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

		const { createStyles, getStyleSheets } = createCoulis({
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

		expect(createStyles(input)).toBe(className);
		expect(getContent(getStyleSheets())).toContain(`.${className}{color:red;}`);
	});

	test("should only extract the atomic rules used in a given HTML", () => {
		const {
			createKeyframes,
			createStyles,
			getCriticalStyleSheets,
			getStyleSheets,
			setGlobalStyles,
		} = createCoulis({
			properties() {
				return { animation: true, color: true, display: true };
			},
			states: {
				hover: "coulis[selector]:hover{coulis[declaration]}",
			},
		});

		setGlobalStyles({ body: { display: "block" } });

		const animationName = createKeyframes({ to: { color: "red" } });
		const usedClassName = createStyles({ color: { base: "red", hover: "blue" } });
		const unusedClassName = createStyles({ display: "flex" });
		const styleSheets = getCriticalStyleSheets(`<div class="other ${usedClassName}"></div>`);
		const content = getContent(styleSheets);

		const cachedClassNames = styleSheets.flatMap(({ attributes }) => {
			return attributes["data-coulis-cache"].split(",");
		});

		expect(content).toContain("body{display:block;}");
		expect(content).toContain(`@keyframes ${animationName}`);
		expect(content).toContain(":hover{color:blue;}");
		expect(content).not.toContain("display:flex");
		expect(cachedClassNames).toStrictEqual(expect.arrayContaining(usedClassName.split(" ")));
		expect(cachedClassNames).not.toContain(unusedClassName);
		expect(String(getStyleSheets())).toContain("display:flex");
	});

	test("should remove global styles once every caller has removed them", () => {
		const { getStyleSheets, setGlobalStyles } = createCoulis({
			properties() {
				return { color: true };
			},
		});

		const input = { body: { color: "red" } };
		const removeFirst = setGlobalStyles(input);
		const removeSecond = setGlobalStyles(input);

		removeFirst();
		expect(getContent(getStyleSheets())).toBe("body{color:red;}");
		removeSecond();
		expect(getContent(getStyleSheets())).toBe("");
		setGlobalStyles(input);
		expect(getContent(getStyleSheets())).toBe("body{color:red;}");
	});

	test.each([
		["kebab-cases property names", { backgroundColor: "red" }, "background-color:red;"],
		["adds px to numbers", { width: 10 }, "width:10px;"],
		["keeps unitless numbers", { opacity: 0.5 }, "opacity:0.5;"],
		["keeps strings", { width: "10%" }, "width:10%;"],
		["applies property maps", { padding: "small" }, "padding:4px;"],
		["applies property functions", { margin: 2 }, "margin:2rem;"],
	])("should create declarations that %s", (_, input, declaration) => {
		const { createStyles, getStyleSheets } = createCoulis({
			properties() {
				return {
					backgroundColor: true,
					margin(value: number) {
						return `${value}rem`;
					},
					opacity: true,
					padding: { small: "4px" },
					width: true,
				};
			},
		});

		createStyles(input as Parameters<typeof createStyles>[0]);
		expect(String(getStyleSheets())).toContain(`{${declaration}}`);
	});

	test("should not create a :root rule without theme", () => {
		const { getStyleSheets } = createCoulis({
			properties() {
				return { color: true };
			},
		});

		expect(String(getStyleSheets())).not.toContain(":root");
	});

	test("should prefix properties declared as shorthands", () => {
		const { createStyles, getStyleSheets, setGlobalStyles } = createCoulis({
			properties() {
				return {
					textSizeAdjust: true,
					userSelect: true,
					WebkitTextSizeAdjust: true,
					WebkitUserSelect: true,
				};
			},
			shorthands: {
				textSizeAdjust: ["WebkitTextSizeAdjust", "textSizeAdjust"],
				userSelect: ["WebkitUserSelect", "userSelect"],
			},
		});

		setGlobalStyles({ html: { textSizeAdjust: "100%" } });
		createStyles({ userSelect: "none" });

		const content = String(getStyleSheets());

		expect(content).toContain("html{-webkit-text-size-adjust:100%;text-size-adjust:100%;}");
		expect(content).toContain("{-webkit-user-select:none;user-select:none;}");
	});

	test("should create one class name per shorthand and state", () => {
		const { createStyles, getStyleSheets } = createCoulis({
			properties() {
				return { paddingLeft: true, paddingRight: true };
			},
			shorthands: {
				paddingHorizontal: ["paddingLeft", "paddingRight"],
			},
			states: {
				hover: "coulis[selector]:hover{coulis[declaration]}",
			},
		});

		const classNames = createStyles({ paddingHorizontal: { base: 1, hover: 2 } }).split(" ");
		const content = String(getStyleSheets());

		expect(classNames).toHaveLength(2);
		expect(content).toContain(`.${classNames[0]}{padding-left:1px;padding-right:1px;}`);
		expect(content).toContain(`.${classNames[1]}:hover{padding-left:2px;padding-right:2px;}`);
	});

	test("should share class names between unconditional and base state values", () => {
		const { createStyles, getStyleSheets } = createCoulis({
			properties() {
				return { color: true };
			},
			states: {
				// `base` is reserved: a contract state cannot make it conditional.
				base: "coulis[selector]:hover{coulis[declaration]}",
			},
		});

		const className = createStyles({ color: "red" });

		expect(createStyles({ color: { base: "red" } })).toBe(className);
		expect(String(getStyleSheets())).toContain(`>.${className}{color:red;}</style>`);
	});

	test("should create the same class name for equal array values", () => {
		const { createStyles, getStyleSheets } = createCoulis({
			properties() {
				return {
					margin(values: number[]) {
						return values.join("px ");
					},
				};
			},
		});

		const className = createStyles({ margin: [1, 2] });

		expect(createStyles({ margin: [1, 2] })).toBe(className);
		expect(String(getStyleSheets())).toContain(`>.${className}{margin:1px 2;}</style>`);
	});

	test("should extract the styles created after a previous extraction", () => {
		const { createStyles, getStyleSheets } = createCoulis({
			properties() {
				return { color: true };
			},
		});

		createStyles({ color: "red" });
		expect(String(getStyleSheets())).not.toContain("color:blue;");
		createStyles({ color: "blue" });
		expect(String(getStyleSheets())).toContain("color:red;");
		expect(String(getStyleSheets())).toContain("color:blue;");
	});

	test("should skip unset values", () => {
		const { createStyles, getStyleSheets } = createCoulis({
			properties() {
				return { color: true, width: true };
			},
			states: {
				hover: "coulis[selector]:hover{coulis[declaration]}",
			},
		});

		const className = createStyles({
			color: { base: "red", hover: undefined },
			width: undefined,
		});

		expect(className.split(" ")).toHaveLength(1);
		expect(String(getStyleSheets())).not.toContain("undefined");
	});

	test("should escape closing tags in style sheets and their HTML string", () => {
		const { createStyles, getStyleSheets } = createCoulis({
			properties() {
				return { color: true };
			},
		});

		createStyles({ color: "red</style><script>globalThis.auditXss=1</script>" });

		const styleSheets = getStyleSheets();
		const styleSheetsContent = getContent(styleSheets);
		// Without a closing tag, the `<style>` element keeps `<script>` as inert text.
		const escapedStyleText = String.raw`red\3C /style><script>globalThis.auditXss=1\3C /script>`;

		expect(styleSheetsContent).toContain(escapedStyleText);
		expect(styleSheetsContent).not.toContain("</");
		expect(String(styleSheets)).toContain(escapedStyleText);
		// The only closing tags are the ones of the `<style>` elements.
		expect(String(styleSheets).match(/<\//gu)).toHaveLength(styleSheets.length);
	});

	test("should keep range comparisons in style sheets", () => {
		const { createStyles, getStyleSheets } = createCoulis({
			properties() {
				return { color: true };
			},
			states: {
				narrow: "@media (width < 600px){coulis[selector]{coulis[declaration]}}",
			},
		});

		const [, className] = createStyles({ color: { base: "red", narrow: "blue" } }).split(" ");

		expect(String(getStyleSheets())).toContain(
			`>@media (width < 600px){.${className}{color:blue;}}</style>`,
		);
	});
});

const getContent = (styleSheets: { content: string }[]) => {
	return styleSheets
		.map(({ content }) => {
			return content;
		})
		.join("");
};

const { createKeyframes, createStyles, getContract, getStyleSheets, setGlobalStyles } =
	createCoulis({
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
				neutralDark: "black",
				neutralLight: "white",
				neutralTransparent: "transparent",
				surfacePrimary: "rgb(119,146,185)",
				surfaceSecondary: "rgb(201,212,227)",
			},
			spacings: {
				0: "0px",
				0.5: "0.5rem",
				1: "1rem",
				1.5: "2rem",
			},
		},
	});

const setFixtureGlobalStyles = () => {
	return setGlobalStyles({
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
};

const createFixtureKeyframes = () => {
	return createKeyframes({
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
};

const createFixtureStyles = () => {
	return createStyles({
		backgroundColor: {
			alt: "surfacePrimary",
			base: "surfaceSecondary",
			hover: "neutralTransparent",
		},
		color: "neutralDark",
		padding: {
			base: 0,
		},
	});
};
