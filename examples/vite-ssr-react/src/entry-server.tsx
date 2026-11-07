import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./app";
import { getMetadata } from "./helpers/coulis";

export const renderHtml = (_url: string) => {
	const bodyContent = renderToString(
		<StrictMode>
			<App />
		</StrictMode>,
	);

	return { head: String(getMetadata()), html: bodyContent };
};
