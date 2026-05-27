import type { CreateStyleSheet } from "../types";

export const createDomStyleSheet: CreateStyleSheet = (type) => {
	let element = document.querySelector<HTMLStyleElement>(
		`style[data-coulis-type="${type}"]`,
	);

	if (!element) {
		element = document.createElement("style");
		element.dataset.coulisCache = "";
		element.dataset.coulisType = type;
		document.head.append(element);
	}

	let pendingRules = "";
	let flushScheduled = false;

	const flush = () => {
		if (!pendingRules) return;

		/**
		 * `insertAdjacentText` is the most performant API for appending text.
		 * @see {@link https://esbench.com/bench/680c1080545f8900a4de2ce6 Benchmark}
		 */
		// eslint-disable-next-line unicorn/prefer-modern-dom-apis
		element.insertAdjacentText("beforeend", pendingRules);
		pendingRules = "";
		flushScheduled = false;
	};

	return {
		getContent() {
			/**
			 * `textContent` is more performant than `innerText` (no layout reflow).
			 * @see {@link https://esbench.com/bench/680c1f4e545f8900a4de2cf7 Benchmark}
			 */
			return element.textContent + pendingRules;
		},
		getHydratedClassNames() {
			const source = element.dataset.coulisCache;

			if (!source) return [];

			return source.split(",");
		},
		insert(_, rule) {
			pendingRules += rule;

			if (!flushScheduled) {
				flushScheduled = true;

				/**
				 * Batch all insertions within a single synchronous execution context
				 * into one `insertAdjacentText` call via a microtask. Styles are still
				 * applied before the first paint because browsers flush microtasks
				 * before rendering.
				 */
				queueMicrotask(flush);
			}
		},
		remove() {
			pendingRules = "";
			flushScheduled = false;
			element.remove();
		},
	};
};
