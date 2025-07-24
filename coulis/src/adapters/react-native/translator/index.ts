import type { PropertyValue } from "./types";
import { fontSize } from "./fontSize";
import { borderRadius } from "./borderRadius";

export const translator: Record<string, PropertyValue<unknown>> = {
	borderRadius,
	fontSize,
};
