import { renderToString } from "react-dom/server";
import { createServerContext } from "coulis";

import { CoulisComponent } from "./Component";

export const CoulisCase = () => {
	const { createRenderer, getMetadata } = createServerContext();
	const render = createRenderer(renderToString);

	render(<CoulisComponent />);

	return getMetadata();
};
