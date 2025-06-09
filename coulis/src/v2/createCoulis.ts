import type { RecordLike } from "./types";

export type Coulis = {
	createIntermediateRepresentation: <Input extends RecordLike>(
		type: Type,
		input: Input,
	) => IntermediateRepresentation<Input>;
	getCache: () => Cache;
};

export type CreateCoulis = (createId: (input: RecordLike) => string) => Coulis;

export const createCoulis: CreateCoulis = (createId) => {
	const cache = TYPES.reduce((output, type) => {
		output[type] = new Map<
			IntermediateRepresentationId,
			IntermediateRepresentation<RecordLike>
		>();

		return output;
	}, {} as Cache);

	return {
		createIntermediateRepresentation<Input extends RecordLike>(
			type: Type,
			input: Input,
		) {
			const id = createId(input);
			const styles = cache[type].get(id);

			const output: IntermediateRepresentation<Input> = {
				id,
				isCached: false,
				payload: input,
			};

			if (!styles) {
				cache[type].set(id, output);
			}

			output.isCached = true;

			return output;
		},
		getCache() {
			return cache;
		},
	};
};

/**
 * The order is important to enforce the more precise properties take precedence over less precise ones.
 * Global properties has a lesser specificity than (<) shorthand ones:
 * global (e.g div { background-color }) < shorthand (e.g background) < longhand (e.g background-color) < conditional-shorthand (e.g @media { background }) < conditional-longhand (e.g @media { background-color }) properties.
 */
export const TYPES = Object.freeze([
	"global",
	"shorthand",
	"longhand",
	"atShorthand",
	"atLonghand",
] as const);

type IntermediateRepresentationId = string;

type IntermediateRepresentation<Payload extends RecordLike> = {
	id: IntermediateRepresentationId;
	isCached: boolean;
	payload: Payload;
};

export type Type = (typeof TYPES)[number];

type Cache = Record<
	Type,
	Map<IntermediateRepresentationId, IntermediateRepresentation<RecordLike>>
>;
