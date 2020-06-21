import { renderToString } from "react-dom/server";
import { extractCritical } from "emotion";
import { Component } from "./Component";

export default function BenchmarkCase() {
	return extractCritical(renderToString(Component));
}
