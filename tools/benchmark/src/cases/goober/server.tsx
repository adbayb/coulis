import { extractCss } from "goober";
import { renderToString } from "react-dom/server";
import { bootstrapServerCase } from "../server";
import { GooberComponent } from "./component";

bootstrapServerCase("goober", () => {
	renderToString(<GooberComponent />);
	extractCss();
});
