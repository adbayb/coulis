import { renderToString } from "react-dom/server";
import { StrictMode } from "react";
import { createServerContext } from "coulis";

import App from "./App";

export const renderHtml = (_url: string) => {
	const { getMetadata } = createServerContext();

	const bodyContent = renderToString(
		<StrictMode>
			<App />
		</StrictMode>,
	);

	const headContent = getMetadata();

	return { html: bodyContent, head: headContent };
};
