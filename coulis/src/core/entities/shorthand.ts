import type { PropertiesLike } from "./style";

/** @deprecated Use `ShorthandsLike` instead (fixed typo). */
export type ShortandsLike<Properties extends PropertiesLike> = ShorthandsLike<Properties>;

export type ShorthandsLike<Properties extends PropertiesLike> = Record<
	string,
	(keyof Properties)[]
>;
