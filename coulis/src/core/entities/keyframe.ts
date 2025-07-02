import type { PropertiesLike, PropertyValue } from "./property";

export type Keyframes<P extends PropertiesLike> = Partial<
	Record<
		number | "from" | "to" | `${number}%`,
		{
			[PropertyName in keyof P]?: PropertyValue<
				PropertyName,
				P,
				undefined
			>;
		}
	>
>;
