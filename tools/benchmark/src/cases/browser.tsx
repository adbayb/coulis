import { createRoot } from "react-dom/client";
import type { JSX } from "react";

import { StyledComponentsComponent } from "./styled-components/Component";
import { EmotionComponent } from "./emotion/Component";
import { CoulisComponent } from "./coulis/Component";
import { createBenchmark } from "../helpers";

const createHandler = (Component: () => JSX.Element) => {
	return () => {
		const rootElement = document.createElement("div");

		rootElement.id = "root";
		document.body.append(rootElement);

		const root = createRoot(rootElement);

		root.render(<Component />);
	};
};

const benchmark = createBenchmark([
	{
		name: "coulis",
		handler: createHandler(CoulisComponent),
	},
	{
		name: "emotion",
		handler: createHandler(EmotionComponent),
	},
	{
		name: "styled-components",
		handler: createHandler(StyledComponentsComponent),
	},
]);

benchmark.run();
