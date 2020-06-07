import React from "react";
import { renderToString } from "react-dom/server";
import { createCss, css, extractStyles } from "coulis";

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
				css({ backgroundColor: "red" }),
				cssMobile({ color: "blue" }),
			].join(" ")}
		>
			Plop
			<Child />
		</div>
	);
};

console.log(renderToString(<App />));
console.log(extractStyles());
