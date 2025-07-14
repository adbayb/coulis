import { renderToString } from "react-dom/server";
import { StrictMode } from "react";

import { createMetadata } from "./helpers/coulis";
import App from "./App";

export const renderHtml = (_url: string) => {
	const metadata = createMetadata();

	const bodyContent = renderToString(
		<StrictMode>
			<App />
		</StrictMode>,
	);

	return { head: metadata.getAsString(), html: bodyContent };
};
