import { renderToString } from "react-dom/server";
import { StrictMode } from "react";

import { getMetadataAsString } from "./helpers/coulis";
import App from "./App";

export const renderHtml = (_url: string) => {
	const bodyContent = renderToString(
		<StrictMode>
			<App />
		</StrictMode>,
	);

	const headContent = getMetadataAsString();

	return { html: bodyContent, head: headContent };
};
