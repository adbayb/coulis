import type { JSX } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { measureCases } from "../helpers";

/**
 * Bootstraps a case in its page. Each case folder bundles its own `browser.tsx` entry as a
 * self-contained script, injected by `browser.spec.ts` into a page of its own: a library never
 * shares its document (style sheets, caches) with another one.
 *
 * @param name - The case name.
 * @param Component - The component rendered by the case.
 */
export const bootstrapBrowserCase = (name: string, Component: () => JSX.Element) => {
	const rootElement = document.createElement("div");

	document.body.append(rootElement);

	const root = createRoot(rootElement);

	const handler = () => {
		// `flushSync` completes each render before the next iteration, so pending React tasks never flood the event loop.
		flushSync(() => {
			root.render(<Component />);
		});
	};

	globalThis.__RUN_BENCHMARK__ = async () => {
		const [measure] = await measureCases([{ name, handler }]);

		if (!measure) {
			throw new Error(`Unable to measure: ${name}`);
		}

		return measure;
	};
};
