import { describe, expectTypeOf, test } from "vitest";

import type { ShortandsLike } from "../entities/shorthand";
import type { WithNewLeafNodes } from "../entities/primitive";
import type { CreateCoulis } from "./createCoulis";

describe("createCoulis (port)", () => {
	test("should type `createCoulis`", () => {
		expectTypeOf(
			createCoulisFake<
				{
					readonly backgroundColor: true;
					readonly color: true;
				},
				Record<
					"hover",
					(input: {
						className: string;
						declaration: string;
					}) => string
				>,
				ShortandsLike<{
					readonly color: true;
				}>,
				{
					color: {
						neutralDark: string;
					};
				}
			>,
		)
			.parameter(0)
			.toEqualTypeOf<{
				properties: (
					theme: WithNewLeafNodes<
						{ color: { neutralDark: string } },
						string
					>,
				) => {
					readonly backgroundColor: true;
					readonly color: true;
				};
				shorthands?: Record<string, "color"[]>;
				states?: Record<
					"hover",
					(input: {
						className: string;
						declaration: string;
					}) => string
				>;
				theme?: { color: { neutralDark: string } };
			}>();

		expectTypeOf(
			createCoulisFake<
				{
					readonly backgroundColor: true;
				},
				undefined,
				undefined,
				undefined
			>,
		)
			.parameter(0)
			.toEqualTypeOf<{
				properties: (theme: undefined) => {
					readonly backgroundColor: true;
				};
				shorthands?: undefined;
				states?: undefined;
				theme?: undefined;
			}>();
	});

	test("should type `createStyles`", () => {
		coulis.createStyles({
			backgroundColor: "neutralDark",
			backgroundColorAlias: "surfacePrimary",
			display: "initial",
		});

		coulis.createStyles({
			backgroundColor: {
				base: "neutralDark",
			},
			backgroundColorAlias: {
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
			backgroundColorAlias: "unknownValue",
			// @ts-expect-error Should not accept unknown value for native property
			display: new Date(),
		});

		coulis.createStyles({
			backgroundColor: "neutralDark",
			backgroundColorAlias: "neutralTransparent",
			// @ts-expect-error Should not accept unknown property
			unknownProperty: "blue",
		});

		coulis.createStyles({
			backgroundColor: {
				base: "neutralDark",
				// @ts-expect-error Should not accept unknown property
				unknownProperty: "blue",
			},
			backgroundColorAlias: {
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
			// TODO: @ts-expect-error Should not accept stateful definition given no `states` contract defined
			backgroundColor: {
				base: "ActiveBorder",
			},
			color: "mistyrose",
			display: "initial",
		});

		lightCoulis.createStyles({
			// @ts-expect-error Should not accept unknown property
			backgroundColorAlias: "lightcoral",
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
				backgroundColorAlias: "lightcoral",
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
		backgroundColorAlias: ["backgroundColor"],
	},
	states: {
		hover({ className, declaration }) {
			return `.${className}{${declaration}}`;
		},
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
