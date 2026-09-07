/**
 * @file This file is bundled as a self-contained script and injected into a headless browser page
 *   by `browser.spec.ts` via `page.addScriptTag`. Keep it standalone: do not merge it in
 *   `browser.spec.ts` or rely on any module that cannot be bundled into the single
 *   `dist/browser.js` output. Note on interpreting results: the static cases hoist all styles to
 *   module scope, so each iteration only re-renders and measures React — zero styling-library code
 *   runs (which is why coulis and emotion tie there). The `-dynamic` cases create styles during
 *   render and are the ones comparing actual library performance.
 */
import type { JSX } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createBenchmark } from "../helpers";
import { CoulisComponent } from "./coulis/Component";
import { CoulisStaticComponent } from "./coulis/StaticComponent";
import { EmotionComponent } from "./emotion/Component";
import { EmotionStaticComponent } from "./emotion/StaticComponent";
import { StyledComponentsComponent } from "./styled-components/Component";
import { StyledComponentsStaticComponent } from "./styled-components/StaticComponent";

const createHandler = (Component: () => JSX.Element) => {
	const rootElement = document.createElement("div");

	document.body.append(rootElement);

	const root = createRoot(rootElement);

	return () => {
		/**
		 * FlushSync wraps root.render() to force each render to complete synchronously before
		 * tinybench proceeds to the next iteration, preventing thousands of pending React
		 * MessageChannel tasks from flooding the event loop and crashing the browser.
		 */
		flushSync(() => {
			root.render(<Component />);
		});
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
	{
		name: "coulis (static)",
		handler: createHandler(CoulisStaticComponent),
	},
	{
		name: "emotion (static)",
		handler: createHandler(EmotionStaticComponent),
	},
	{
		name: "styled-components (static)",
		handler: createHandler(StyledComponentsStaticComponent),
	},
]);

globalThis.__RUN_BENCHMARK__ = benchmark.run.bind(benchmark);
