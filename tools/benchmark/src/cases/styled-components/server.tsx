import { renderToString } from "react-dom/server";
import { ServerStyleSheet } from "styled-components";
import { bootstrapServerCase } from "../server";
import { StyledComponentsComponent } from "./component";

bootstrapServerCase("styled-components", () => {
	const sheet = new ServerStyleSheet();

	renderToString(sheet.collectStyles(<StyledComponentsComponent />));
	sheet.getStyleTags();
	sheet.seal();
});
