import { renderToString } from "react-dom/server";
import { createServerContext } from "coulis";

import { CoulisComponent } from "./Component";

export const CoulisCase = () => {
	const { getMetadataAsString } = createServerContext();

	renderToString(<CoulisComponent />);

	return getMetadataAsString();
};
