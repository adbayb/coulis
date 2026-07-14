/**
 * @file This file is bundled as a self-contained script and injected into a headless browser page
 *   by `browser.spec.ts` via `page.addScriptTag`. Keep it standalone: do not merge it in
 *   `browser.spec.ts` or rely on any module that cannot be bundled into the single
 *   `dist/browser.js` output.
 */
import type { JSX } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createBenchmark } from "../helpers";
import { CoulisComponent } from "./coulis/Component";
import { EmotionComponent } from "./emotion/Component";
import { StyledComponentsComponent } from "./styled-components/Component";

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
]);

globalThis.__RUN_BENCHMARK__ = benchmark.run.bind(benchmark);
