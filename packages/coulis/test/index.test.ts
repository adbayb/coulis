import { createCss, css, extractStyles, keyframes, raw } from "../src";

test("should extract styles", () => {
	const cssMedia = createCss("@media (min-width: 400px)");

	raw(`html, body {
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

	const classNames = css({
		color: "lightblue",
		backgroundColor: {
			default: "lightcoral",
			":hover": "lightcyan",
			"[alt]": "lightgray",
		},
		padding: 10,
	});

	const mediaClassNames = cssMedia({
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
