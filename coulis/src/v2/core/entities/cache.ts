import type { Style } from "./style";

type Cache = Map<Style["id"], Style>;

export const createCache = (): Cache => {
	return new Map();
};
