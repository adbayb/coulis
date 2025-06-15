import type { StyleType } from "./style";
import type { RecordLike } from "./primitive";

/**
 * Data structure to represent a style entry.
 * The world of compiling inspires the naming.
 */
export type IntermediateRepresentation<
	Payload extends RecordLike = RecordLike,
> = {
	id: string;
	isCached: boolean;
	payload: Payload;
	type: StyleType;
};

export type CreateIntermediateRepresentation = <
	Payload extends RecordLike = RecordLike,
>(
	input: Pick<IntermediateRepresentation<Payload>, "id" | "payload" | "type">,
) => IntermediateRepresentation<Payload>;
