import type { CreateAdapter } from "../ports/adapter";
import type { IntermediateRepresentation } from "./intermediateRepresentation";

/**
 * TODO:
 * - Implement getMetadata
 * - Adapt examples and tests
 * - Test if no test/functional regression
 * - Split files more granurarly (core vs. Ports vs. Adapters)
 * - Review API to define globally the style definition via `const coulis = createCoulis(withWebAdapter)({ backgroundColor: theme.color });`.
 * @param createAdapter - TODO.
 * @returns TODO.
 * @example
 * TODO
 */
export const createCoulis = <Output>(createAdapter: CreateAdapter<Output>) => {
	const cache = new Map<
		IntermediateRepresentation["id"],
		IntermediateRepresentation
	>();

	return createAdapter(({ id, payload, type }) => {
		const styles = cache.get(id);

		const output = {
			id,
			isCached: false,
			payload,
			type,
		};

		if (!styles) {
			cache.set(id, output);
		}

		output.isCached = true;

		return output;
	});
};
