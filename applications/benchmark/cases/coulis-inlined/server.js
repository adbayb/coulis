import { extractStyles } from "coulis";
import { renderToString } from "react-dom/server";

import { Component } from "./Component";

export default function BenchmarkCase() {
	renderToString(Component);

	return extractStyles();
}
