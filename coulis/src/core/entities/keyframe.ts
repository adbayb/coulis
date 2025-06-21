import type { StyleProperties } from "./style";

export type Keyframes = Partial<
	Record<number | "from" | "to" | `${number}%`, StyleProperties>
>;
