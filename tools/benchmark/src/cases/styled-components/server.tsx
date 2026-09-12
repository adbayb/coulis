import { renderToString } from "react-dom/server";
import { ServerStyleSheet } from "styled-components";
import { StyledComponentsComponent } from "./Component";

export const StyledComponentsCase = () => {
	const sheet = new ServerStyleSheet();

	renderToString(sheet.collectStyles(<StyledComponentsComponent />));
	sheet.getStyleTags();
	sheet.seal();
};
