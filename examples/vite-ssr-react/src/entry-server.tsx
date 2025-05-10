import { renderToString } from "react-dom/server";
import { StrictMode } from "react";
import { createServerContext } from "coulis";

import App from "./App";

export const renderHtml = (_url: string) => {
	const { createRenderer, getMetadata } = createServerContext();
	const render = createRenderer(renderToString);

	const bodyContent = render(
		<StrictMode>
			<App />
		</StrictMode>,
	);

	const headContent = getMetadata();

	return { html: bodyContent, head: headContent };
};
