import { describe, expect, expectTypeOf, test } from "vitest";

import type { CreateCoulis } from "./createCoulis";

describe("createCoulis (port)", () => {
	test("should type `createCoulis`", () => {
		createCoulisFake({
			properties(theme) {
				theme satisfies {
					colors: {
						neutralDark: string;
						neutralTransparent: string;
						neutralWhite: string;
						surfacePrimary: string;
					};
				};

				return {
					backgroundColor: theme.colors,
					color: theme.colors,
					display: true,
				};
			},
			shorthands: {
				// @ts-expect-error Should only allow '"backgroundColor" | "color" | "display"'
				backgroundColorShorthand: ["flex"],
			},
			states: {
				hover: "coulis[selector]:hover{coulis[declaration]}",
			},
			theme: {
				colors: {
					neutralDark: "black",
					neutralTransparent: "transparent",
					neutralWhite: "white",
					surfacePrimary: "rgb(119,146,185)",
				},
			},
		});

		createCoulisFake({
			properties(theme) {
				theme satisfies undefined;

				return {
					display: true,
				};
			},
		});

		expect(true).toBe(true);
	});

	test("should type `createStyles`", () => {
		coulis.createStyles({
			backgroundColor: "neutralDark",
			backgroundColorShorthand: "surfacePrimary",
			display: "initial",
		});

		coulis.createStyles({
			backgroundColor: {
				base: "neutralDark",
			},
			backgroundColorShorthand: {
				base: "neutralDark",
				hover: "neutralWhite",
			},
			display: {
				base: "block",
				hover: "flex",
			},
		});

		coulis.createStyles({
			// @ts-expect-error Should not accept unknown value
			backgroundColor: "unknownValue",
			// @ts-expect-error Should not accept unknown value
			backgroundColorShorthand: "unknownValue",
			// @ts-expect-error Should not accept unknown value for native property
			display: new Date(),
		});

		coulis.createStyles({
			backgroundColor: "neutralDark",
			backgroundColorShorthand: "neutralTransparent",
			// @ts-expect-error Should not accept unknown property
			unknownProperty: "blue",
		});

		coulis.createStyles({
			backgroundColor: {
				base: "neutralDark",
				// @ts-expect-error Should not accept unknown property
				unknownProperty: "blue",
			},
			backgroundColorShorthand: {
				base: "neutralDark",
				// @ts-expect-error Should not accept unknown value
				hover: "blue",
			},
			// @ts-expect-error Should have a `base` state defined
			display: {
				hover: "flex",
			},
		});

		expectTypeOf(coulis.createStyles).returns.toEqualTypeOf<string>();
	});

	test("should type `createStyles` given lighter contract", () => {
		const lightCoulis = createCoulisFake({
			properties() {
				return {
					backgroundColor: true,
					color: true,
					display: true,
				};
			},
		});

		lightCoulis.createStyles({
			backgroundColor: "lightcoral",
			color: "mistyrose",
			display: "initial",
		});

		lightCoulis.createStyles({
			// @ts-expect-error Should not accept stateful definition given no `states` contract defined
			backgroundColor: {
				base: "ActiveBorder",
			},
			color: "mistyrose",
			display: "initial",
		});

		lightCoulis.createStyles({
			// @ts-expect-error Should not accept unknown property
			backgroundColorShorthand: "lightcoral",
			color: "mistyrose",
			display: "initial",
		});

		expectTypeOf(lightCoulis.createStyles).returns.toEqualTypeOf<string>();
	});

	test.todo("should type `createKeyframes`", () => {
		coulis.createKeyframes({
			25: {
				backgroundColor: "surfacePrimary",
				color: "neutralWhite",
				display: "flex",
			},
			"50%": {
				backgroundColor: "surfacePrimary",
				color: "neutralWhite",
				display: "flex",
			},
			"from": {
				backgroundColor: "neutralDark",
				color: "neutralTransparent",
				display: "initial",
			},
			"to": {
				backgroundColor: "surfacePrimary",
				color: "neutralWhite",
				display: "flex",
			},
		});

		coulis.createKeyframes({
			from: {
				backgroundColor: "neutralDark",
				// @ts-expect-error Should not accept unknown property // TODO: support shorthands
				backgroundColorShorthand: "lightcoral",
				color: "neutralTransparent",
			},
		});

		coulis.createKeyframes({
			from: {
				backgroundColor: "neutralDark",
				color: "neutralTransparent",
				// @ts-expect-error Should not allow stateful definition
				display: {
					base: "initial",
				},
			},
		});

		expectTypeOf(coulis.createKeyframes).returns.toEqualTypeOf<string>();
	});

	test.todo("should type `getMetadata`", () => {
		expectTypeOf(coulis.getMetadata).returns.toEqualTypeOf<{
			toString: () => string;
			value: {
				attributes: Record<
					"data-coulis-cache" | "data-coulis-type",
					string
				>;
				content: string;
			}[];
		}>();
	});

	test("should type `setGlobalStyles`", () => {
		// TODO: support shorthands
		expectTypeOf(coulis.setGlobalStyles).returns.toBeVoid();
	});
});

const createCoulisFake: CreateCoulis<string> = (_input) => {
	return {
		createKeyframes() {
			return "fake";
		},
		createStyles() {
			return "fake";
		},
		getMetadata() {
			return {
				toString() {
					return "";
				},
				value: [],
			};
		},
		setGlobalStyles() {
			// No op
		},
	};
};

const coulis = createCoulisFake({
	properties(theme) {
		return {
			backgroundColor: theme.colors,
			color: theme.colors,
			display: true,
		};
	},
	shorthands: {
		backgroundColorShorthand: ["backgroundColor"],
	},
	states: {
		hover: "coulis[selector]:hover{coulis[declaration]}",
	},
	theme: {
		colors: {
			neutralDark: "black",
			neutralTransparent: "transparent",
			neutralWhite: "white",
			surfacePrimary: "rgb(119,146,185)",
		},
	},
});
