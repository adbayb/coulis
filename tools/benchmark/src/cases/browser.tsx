/**
 * @file This file is bundled as a self-contained script and injected into a headless browser page
 *   by `browser.spec.ts` via `page.addScriptTag`. Keep it standalone: do not merge it in
 *   `browser.spec.ts` or rely on any module that cannot be bundled into the single
 *   `dist/browser.js` output. Note on interpreting results: dynamic cases create styles during
 *   render and are the ones comparing actual library performance (`fastestCase` / `Slower than
 *   fastest` only rank them). Static vs dynamic: static baselines hoist styles to module scope, so
 *   styles are evaluated once at startup (outside the measured iterations) and each iteration only
 *   re-renders, measuring the theoretical ceiling per library; use `Overhead vs baseline` to read
 *   how far each dynamic case is from its static computation.
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
	{
		name: "coulis (baseline)",
		baseline: true,
		baselineFor: "coulis",
		handler: createHandler(CoulisStaticComponent),
	},
	{
		name: "emotion (baseline)",
		baseline: true,
		baselineFor: "emotion",
		handler: createHandler(EmotionStaticComponent),
	},
	{
		name: "styled-components (baseline)",
		baseline: true,
		baselineFor: "styled-components",
		handler: createHandler(StyledComponentsStaticComponent),
	},
]);

globalThis.__RUN_BENCHMARK__ = benchmark.run.bind(benchmark);
