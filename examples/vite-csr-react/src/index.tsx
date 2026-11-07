import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";

const container = document.querySelector("#root");

if (container) {
	const root = createRoot(container);

	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
