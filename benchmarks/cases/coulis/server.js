import { renderToString } from "react-dom/server";
import { extractStyles } from "coulis";
import { Component } from "./Component";

export default function BenchmarkCase() {
	renderToString(Component);

	return extractStyles();
}
