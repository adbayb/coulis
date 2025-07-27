import { renderToString } from "react-dom/server";
import { StrictMode } from "react";

import { getMetadata } from "./helpers/coulis";
import App from "./App";

export const renderHtml = (_url: string) => {
	const bodyContent = renderToString(
		<StrictMode>
			<App />
		</StrictMode>,
	);

	return { head: String(getMetadata()), html: bodyContent };
};
