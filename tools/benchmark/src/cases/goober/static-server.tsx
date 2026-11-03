import { css, extractCss } from "goober";
import { renderToString } from "react-dom/server";
import { BACKGROUND_COLORS } from "../constants";
import { GooberStaticComponent } from "./static-component";

export const GooberStaticCase = () => {
	// Re-register hoisted styles because extractCss clears Goober's server-side buffer each run.
	for (const backgroundColor of BACKGROUND_COLORS) {
		css({ backgroundColor });
	}

	renderToString(<GooberStaticComponent />);
	extractCss();
};
