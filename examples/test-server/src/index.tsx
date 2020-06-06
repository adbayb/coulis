import React from "react";
import { renderToString } from "react-dom/server";
import { css } from "coulis";

console.log(css);

const Test = () => {
	return <div>Plop</div>;
};

console.log(renderToString(<Test />));
