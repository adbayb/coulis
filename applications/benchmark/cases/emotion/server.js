import { extractCritical } from "@emotion/server";
import React from "react";
import { renderToString } from "react-dom/server";

import { Component } from "./Component";

export default function BenchmarkCase() {
	return extractCritical(renderToString(<Component />));
}
