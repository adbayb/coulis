import type { JSX } from "react";

import { createRoot } from "react-dom/client";

import { createBenchmark } from "../helpers";
import { CoulisComponent } from "./coulis/Component";
import { EmotionComponent } from "./emotion/Component";
import { StyledComponentsComponent } from "./styled-components/Component";

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
		handler: createHandler(CoulisComponent),
		name: "coulis",
	},
	{
		handler: createHandler(EmotionComponent),
		name: "emotion",
	},
	{
		handler: createHandler(StyledComponentsComponent),
		name: "styled-components",
	},
]);

benchmark.run();
