import React from "react";
import { renderToString } from "react-dom/server";
import { createCss, css, extractStyles } from "coulis";

const cssMobile = createCss("@media (max-width: 400px)");
const Test = () => {
	return (
		<div
			className={[
				css({ backgroundColor: "red" }),
				cssMobile({ color: "blue" }),
			].join(" ")}
		>
			Plop
		</div>
	);
};

console.log(renderToString(<Test />));
extractStyles();
