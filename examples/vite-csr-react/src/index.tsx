import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import App from "./App";

const container = document.querySelector("#root");

if (container) {
	const root = createRoot(container);

	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
