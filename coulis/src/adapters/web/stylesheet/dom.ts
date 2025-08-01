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

	return {
		getContent() {
			/**
			 * `textContent` is more performant than `innerText` (no layout reflow).
			 * @see {@link https://esbench.com/bench/680c1f4e545f8900a4de2cf7 Benchmark}
			 */
			return element.textContent;
		},
		getHydratedClassNames() {
			const source = element.dataset.coulisCache;

			if (!source) return [];

			return source.split(",");
		},
		insert(_, rule) {
			/**
			 * `insertAdjacentText` is the most performant API for appending text.
			 * @see {@link https://esbench.com/bench/680c1080545f8900a4de2ce6 Benchmark}
			 */
			// eslint-disable-next-line unicorn/prefer-modern-dom-apis
			element.insertAdjacentText("beforeend", rule);
		},
		remove() {
			element.remove();
		},
	};
};
