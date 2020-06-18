import React from "react";
import { renderToString } from "react-dom/server";
import { createCss, css, extractCss, keyframes, raw } from "coulis";

raw(`
	html, body {
		background-color: lightcoral;
	}
`);

const animationName = keyframes(`
from {
	transform: scale(1);
}

to {
	transform: scale(1.015);
}
`);

const cssMobile = createCss("@media (max-width: 400px)");
const Child = () => {
	return (
		<p className={css({ backgroundColor: "red", fontSize: 24 })}>Titi</p>
	);
};
const App = () => {
	return (
		<div
			className={[
				css({
					backgroundColor: "red",
					animation: `${animationName} 500ms ease alternate infinite`,
				}),
				cssMobile({ color: "blue" }),
			].join(" ")}
		>
			Plop
			<Child />
		</div>
	);
};

console.log(renderToString(<App />));
console.log(extractCss());
