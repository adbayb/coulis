import type { ShortandsLike } from "./shorthand";
import type { PropertiesLike, Styles } from "./style";

export type Keyframes<
	Properties extends PropertiesLike,
	Shorthands extends ShortandsLike<Properties> | undefined,
> = Partial<
	Record<
		"from" | "to" | `${number}%` | number,
		Styles<Properties, Shorthands, undefined>
	>
>;
