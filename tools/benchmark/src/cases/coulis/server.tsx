import { renderToString } from "react-dom/server";

import { getMetadata } from "./helpers";
import { CoulisComponent } from "./Component";

export const CoulisCase = () => {
	renderToString(<CoulisComponent />);

	return getMetadata().toString();
};
