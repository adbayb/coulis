import { renderToString } from "react-dom/server";
import { CoulisComponent } from "./component";
import { getCriticalStyleSheets } from "./helpers";

export const CoulisCase = () => {
	String(getCriticalStyleSheets(renderToString(<CoulisComponent />)));
};
