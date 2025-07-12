import type { PropertiesLike, Styles } from "./style";
import type { ShortandsLike } from "./shorthand";

export type Keyframes<
	Properties extends PropertiesLike,
	Shorthands extends ShortandsLike<Properties> | undefined,
> = Partial<
	Record<
		number | "from" | "to" | `${number}%`,
		Styles<Properties, Shorthands, undefined>
	>
>;
