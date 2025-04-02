import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { extract } from "coulis";

import { Component } from "./Component";

export default function BenchmarkCase() {
	renderToString(createElement(Component));

	return extract();
}
