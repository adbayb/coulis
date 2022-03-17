import { expect, test } from "vitest";
import { atoms, createAtoms, extractStyles, globals, keyframes } from "../src";

test("should extract styles", () => {
	const mediumAtoms = createAtoms("@media (min-width: 400px)");

	globals({
		html: {
			boxSizing: "border-box",
		},
		"html,body": {
			padding: 0,
			margin: 0,
			backgroundColor: "lightcoral",
			fontFamily: "Open Sans",
		},
		"*,*::before,*::after": {
			boxSizing: "inherit",
		},
		".globalClass+.otherGlobalClass": {
			border: "1px solid black",
			borderRadius: 4,
		},
		"@font-face": {
			fontFamily: "'Open Sans'",
			src: "local(Helvetica)",
		},
	});

	const animationName = keyframes({
		from: {
			transform: "scale(1)",
		},
		to: {
			transform: "scale(1.015)",
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

	expect(animationName).toBe("cfd697f57");
	expect(classNames).toBe(
		"c3c5816c4 cbb3db274 c571db958 ce9403afc cde6daf3c"
	);
	expect(mediaClassNames).toBe(
		"cfdaa40cc c83a26eac c8da3c910 c1225fd44 c9cc8640"
	);
	expect(extractStyles()).toMatchSnapshot();
});