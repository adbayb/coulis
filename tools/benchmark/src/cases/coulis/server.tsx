import { renderToString } from "react-dom/server";
import { bootstrapServerCase } from "../server";
import { CoulisComponent } from "./component";
import { getCriticalStyleSheets } from "./helpers";

bootstrapServerCase("coulis", () => {
	const html = renderToString(<CoulisComponent />);

	return `${String(getCriticalStyleSheets(html))}${html}`;
});
