import { renderToString } from "react-dom/server";
import { ServerStyleSheet } from "styled-components";
import { bootstrapServerCase } from "../server";
import { StyledComponentsComponent } from "./component";

bootstrapServerCase("styled-components", () => {
	const sheet = new ServerStyleSheet();
	const html = renderToString(sheet.collectStyles(<StyledComponentsComponent />));
	const styles = sheet.getStyleTags();

	sheet.seal();

	return `${styles}${html}`;
});
