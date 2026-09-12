/**
 * @file This file is bundled as a self-contained script and injected into a headless browser page
 *   by `browser.spec.ts` via `page.addScriptTag`. Keep it standalone: do not merge it in
 *   `browser.spec.ts` or rely on any module that cannot be bundled into the single
 *   `dist/browser.js` output. Note on interpreting results: all cases create styles during render
 *   to compare actual library performance.
 */
import type { JSX } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createBenchmark } from "../helpers";
import { CoulisComponent } from "./coulis/Component";
import { EmotionComponent } from "./emotion/Component";
import { StyledComponentsComponent } from "./styled-components/Component";

let sharedRoot: ReturnType<typeof createRoot> | undefined;

const getSharedRoot = () => {
	if (!sharedRoot) {
		document.body.innerHTML = "";

		const rootElement = document.createElement("div");

		document.body.append(rootElement);
		sharedRoot = createRoot(rootElement);
	}

	return sharedRoot;
};

const createHandler = (Component: () => JSX.Element) => {
	return () => {
		/**
		 * All cases render into the same container so only one table lives in the DOM at a time.
		 * FlushSync forces each render to complete synchronously before tinybench proceeds to the
		 * next iteration, preventing pending React tasks from flooding the event loop.
		 */
		flushSync(() => {
			getSharedRoot().render(<Component />);
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
