import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import App from "./App";

hydrateRoot(
	document.querySelector("#root") as HTMLElement,
	<StrictMode>
		<App />
	</StrictMode>,
);
