import type { Adapter, CreateAdapter } from "../ports/adapter";
import type { CreateStyle } from "./style";
import { createCache } from "./cache";

export const createCoulis = <AdapterOutput>(
	createAdapter: CreateAdapter<AdapterOutput>,
): Adapter<AdapterOutput> => {
	const cache = createCache();

	const createStyle: CreateStyle = ({ id, payload, type }) => {
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
	};

	return createAdapter({ createStyle });
};
