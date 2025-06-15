import type { CreateAdapter } from "../ports/adapter";

/**
 * TODO:
 * - Test if no test/functional regression
 * - Split files more granurarly (core vs. Ports vs. Adapters)
 * - Review API to define globally the style definition via `const coulis = createCoulis(withWebAdapter)({ backgroundColor: theme.color });`.
 * - Implement cross-request state pollution prevention in `createWebAdapter`.
 * @param createAdapter - TODO.
 * @returns TODO.
 * @example
 * TODO
 */
export const createCoulis = <Output>(createAdapter: CreateAdapter<Output>) => {
	return createAdapter();
};
