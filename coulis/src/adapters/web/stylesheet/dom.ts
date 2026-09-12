import type { ClassName, CreateStyleSheet } from "../types";

export const createDomStyleSheet: CreateStyleSheet = (type) => {
	let element = document.querySelector<HTMLStyleElement>(`style[data-coulis-type="${type}"]`);

	if (!element) {
		element = document.createElement("style");
		element.dataset.coulisCache = "";
		element.dataset.coulisType = type;
		document.head.append(element);
	}

	let pendingRules = "";
	let pendingClassNames: ClassName[] = [];
	let isFlushScheduled = false;

	const flush = () => {
		if (!pendingRules) {
			return;
		}

		/**
		 * `insertAdjacentText` is the most performant API for appending text.
		 *
		 * @see {@link https://esbench.com/bench/680c1080545f8900a4de2ce6 Benchmark}
		 */
		// oxlint-disable-next-line unicorn/prefer-modern-dom-apis
		element.insertAdjacentText("beforeend", pendingRules);

		// Keep the hydration cache in sync so later instances can reuse these class names.
		const cachedClassNames = element.dataset.coulisCache;

		element.dataset.coulisCache = cachedClassNames
			? `${cachedClassNames},${pendingClassNames.join(",")}`
			: pendingClassNames.join(",");

		pendingRules = "";
		pendingClassNames = [];
		isFlushScheduled = false;
	};

	return {
		clear() {
			pendingRules = "";
			pendingClassNames = [];
			isFlushScheduled = false;
			element.remove();
		},
		getContent() {
			/**
			 * `textContent` is more performant than `innerText` (no layout reflow).
			 *
			 * @see {@link https://esbench.com/bench/680c1f4e545f8900a4de2cf7 Benchmark}
			 */
			return element.textContent + pendingRules;
		},
		getHydratedClassNames() {
			const source = element.dataset.coulisCache;

			if (!source) {
				return [];
			}

			return source.split(",");
		},
		setRule(className, rule) {
			pendingRules += rule;
			pendingClassNames.push(className);

			if (!isFlushScheduled) {
				isFlushScheduled = true;
				/**
				 * Batch all insertions within a single synchronous execution context into one
				 * `insertAdjacentText` call via a microtask. Styles are still applied before the
				 * first paint because browsers flush microtasks before rendering.
				 */
				queueMicrotask(flush);
			}
		},
	};
};
