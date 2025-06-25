import type { PropertiesLike } from "./property";

export type ShortandsLike<Properties extends PropertiesLike> = Record<
	string,
	(keyof Properties)[]
>;
