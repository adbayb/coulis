import { renderToString } from "react-dom/server";

import { createMetadata } from "./helpers";
import { CoulisComponent } from "./Component";

export const CoulisCase = () => {
	const metadata = createMetadata();

	renderToString(<CoulisComponent />);

	return metadata.getAsString();
};
