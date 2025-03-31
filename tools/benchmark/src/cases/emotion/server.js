import { renderToString } from "react-dom/server";
import React from "react";
import { extractCritical } from "@emotion/server";

import { Component } from "./Component";

export default function BenchmarkCase() {
	return extractCritical(renderToString(<Component />));
}
