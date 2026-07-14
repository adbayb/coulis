import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App";

const element = document.querySelector("#root");

if (element) {
	hydrateRoot(
		element,
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
