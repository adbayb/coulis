import { renderToString } from "react-dom/server";
import { extractStyles } from "coulis";

import { CoulisComponent } from "./Component";

export const CoulisCase = () => {
	renderToString(<CoulisComponent />);

	return extractStyles();
};
