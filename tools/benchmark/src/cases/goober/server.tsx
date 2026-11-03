import { extractCss } from "goober";
import { renderToString } from "react-dom/server";
import { GooberComponent } from "./component";

export const GooberCase = () => {
	renderToString(<GooberComponent />);
	extractCss();
};
