import { renderToString } from "react-dom/server";
import { ServerStyleSheet } from "styled-components";
import { StyledComponentsStaticComponent } from "./static-component";

export const StyledComponentsStaticCase = () => {
	const sheet = new ServerStyleSheet();

	renderToString(sheet.collectStyles(<StyledComponentsStaticComponent />));
	sheet.getStyleTags();
	sheet.seal();
};
