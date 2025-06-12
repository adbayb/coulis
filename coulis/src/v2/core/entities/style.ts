import type { RecordLike } from "../types";

/**
 * Intermediate representation representing a style entry.
 */
export type Style<Payload extends RecordLike = RecordLike> = {
	id: string;
	isCached: boolean;
	payload: Payload;
	type: (typeof STYLE_TYPES)[number];
};

export type CreateStyle = <Payload extends RecordLike = RecordLike>(
	input: Pick<Style<Payload>, "id" | "payload" | "type">,
) => Style<Payload>;

/**
 * The order is important to enforce the more precise properties take precedence over less precise ones.
 * Global properties has a lesser specificity than (<) shorthand ones:
 * global (e.g div { background-color }) < shorthand (e.g background) < longhand (e.g background-color) < conditional-shorthand (e.g @media { background }) < conditional-longhand (e.g @media { background-color }) properties.
 */
export const STYLE_TYPES = Object.freeze([
	"global",
	"shorthand",
	"longhand",
	"atShorthand",
	"atLonghand",
] as const);
