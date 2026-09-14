import type { PropertiesLike } from "./style";

export type ShorthandsLike<Properties extends PropertiesLike> = Record<
	string,
	(keyof Properties)[]
>;
