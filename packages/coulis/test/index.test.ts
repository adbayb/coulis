import { expect, test } from "vitest";
import { atoms, createAtoms, extractStyles, globals, keyframes } from "../src";

test("should extract styles", () => {
	const mediumAtoms = createAtoms("@media (min-width: 400px)");

	globals({
		"@charset": '"utf-8"',
		"@import":
			"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
		html: {
			boxSizing: "border-box",
		},
		"html,body": {
			padding: 0,
			margin: 0,
			backgroundColor: "lightcoral",
			fontFamily: "Open Sans, AliasedHelvetica",
		},
		"*,*::before,*::after": {
			boxSizing: "inherit",
		},
		".globalClass+.otherGlobalClass": {
			border: "1px solid black",
			borderRadius: 4,
		},
		"@font-face": {
			fontFamily: "'AliasedHelvetica'",
			src: "local(Helvetica)",
		},
	});

	const animationName = keyframes({
		from: {
			transform: "scale(1)",
		},
		25: {
			transform: "scale(1.25)",
		},
		"50%": {
			transform: "scale(1.5)",
		},
		to: {
			transform: "scale(1)",
		},
	});

	const classNames = atoms({
		color: "lightblue",
		backgroundColor: {
			default: "lightcoral",
			":hover": "lightcyan",
			"[alt]": "lightgray",
		},
		padding: 10,
	});

	const mediaClassNames = mediumAtoms({
		color: "lightblue",
		backgroundColor: {
			default: "lightcoral",
			":hover": "lightcyan",
			"[alt]": "lightgray",
		},
		padding: 10,
	});

	expect(animationName).toBe("c62e63a97");
	expect(classNames).toBe(
		"c3c5816c4 cbb3db274 c571db958 ce9403afc cde6daf3c"
	);
	expect(mediaClassNames).toBe(
		"cfdaa40cc c83a26eac c8da3c910 c1225fd44 c9cc8640"
	);
	expect(extractStyles()).toMatchSnapshot();
});
