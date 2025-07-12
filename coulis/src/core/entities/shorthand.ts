import type { PropertiesLike } from "./style";

export type ShortandsLike<Properties extends PropertiesLike> = Record<
	string,
	(keyof Properties)[]
>;
