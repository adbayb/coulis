import type { Adapter, CreateAdapter } from "../ports/adapter";
import type { StyleType } from "./style";
import type { RecordLike } from "./primitive";

export const createCoulis = <AdapterOutput>(
	createAdapter: CreateAdapter<AdapterOutput>,
): Adapter<AdapterOutput> => {
	const cache = new Map<
		IntermediateRepresentation["id"],
		IntermediateRepresentation
	>();

	const createIntermediateRepresentation: CreateIntermediateRepresentation =
		({ id, payload, type }) => {
			const styles = cache.get(id);

			const output = {
				id,
				isCached: false,
				payload,
				type,
			};

			if (!styles) {
				cache.set(id, output);
			}

			output.isCached = true;

			return output;
		};

	return createAdapter(createIntermediateRepresentation);
};

/**
 * Data structure to represent a style entry.
 * The world of compiling inspires the naming.
 */
type IntermediateRepresentation<Payload extends RecordLike = RecordLike> = {
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
