import { atoms, createAtoms, extractStyles, globals, keyframes } from "../src";

test("should extract styles", () => {
	const mediumAtoms = createAtoms("@media (min-width: 400px)");

	globals(`html, body {
		background-color: lightcoral;
	}

	div {
		color: red;
	}`);

	const animationName = keyframes(`
from {
	transform: scale(1);
}

to {
	transform: scale(1.015);
}
`);

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

	expect(animationName).toBe("c68c11a40");
	expect(classNames).toBe(
		"c3c5816c4 cbb3db274 c571db958 ce9403afc cde6daf3c"
	);
	expect(mediaClassNames).toBe(
		"cfdaa40cc c83a26eac c8da3c910 c1225fd44 c9cc8640"
	);
	expect(extractStyles()).toMatchSnapshot();
});
