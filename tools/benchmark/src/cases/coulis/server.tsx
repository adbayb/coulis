import { renderToString } from "react-dom/server";
import { bootstrapServerCase } from "../server";
import { CoulisComponent } from "./component";
import { getCriticalStyleSheets } from "./helpers";

bootstrapServerCase("coulis", () => {
	String(getCriticalStyleSheets(renderToString(<CoulisComponent />)));
});
