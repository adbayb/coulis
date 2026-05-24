import { renderToString } from "react-dom/server";

import { CoulisComponent } from "./Component";
import { getMetadata } from "./helpers";

export const CoulisCase = () => {
	renderToString(<CoulisComponent />);

	return String(getMetadata());
};
