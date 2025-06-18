import type { Adapter, CreateAdapter } from "../ports/adapter";

/**
 * - Split files more granurarly (core vs. Ports vs. Adapters)
 * - Review API to define globally the style definition via `const coulis = createCoulis(withWebAdapter)({ backgroundColor: theme.color });`.
 * - Implement cross-request state pollution prevention in `createWebAdapter`.
 * - Update README and JSDoc.
 * @param createAdapter - TODO.
 * @returns TODO.
 * @example
 * TODO
 */
export const createCoulis = <Output>(createAdapter: CreateAdapter<Output>) => {
	const {
		createCustomProperties,
		createKeyframes,
		createStyles,
		createVariants,
		getMetadata,
		getMetadataAsString,
		setGlobalStyles,
	} = createAdapter();

	return {
		createCustomProperties: withMemoization(createCustomProperties),
		createKeyframes: withMemoization(createKeyframes),
		createStyles: withMemoization(createStyles),
		createVariants: withMemoization(createVariants),
		getMetadata,
		getMetadataAsString,
		setGlobalStyles: withMemoization(setGlobalStyles),
	} satisfies Adapter<Output>;
};

const withMemoization = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Function_ extends (...arguments_: any[]) => unknown,
	Inputs extends Parameters<Function_>,
	Output extends ReturnType<Function_>,
>(
	function_: Function_,
) => {
	let cache:
		| {
				inputs: Inputs;
				output: Output;
		  }
		| undefined = undefined;

	return ((...inputs: Inputs) => {
		if (cache && isDeepEqual(inputs, cache.inputs)) {
			return cache.output;
		}

		const output = function_(...inputs) as Output;

		cache = {
			inputs,
			output,
		};

		return output;
	}) as Function_;
};

const isDeepEqual = (inputA: unknown, inputB: unknown) => {
	if (Object.is(inputA, inputB)) return true;

	if (isObject(inputA) && isObject(inputB)) {
		const objectKeysA = Object.keys(inputA);

		if (objectKeysA.length !== Object.keys(inputB).length) return false;

		for (const key of objectKeysA) {
			const isValueEqual = isDeepEqual(inputA[key], inputB[key]);

			if (!isValueEqual) return false;
		}

		return true;
	}

	return false;
};

const isObject = (input: unknown): input is Record<string, unknown> => {
	return input !== null && typeof input === "object";
};
