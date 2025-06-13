import type { RecordLike } from "../entities/primitive";
import type { Keyframes } from "../entities/keyframe";
import type { GlobalStyles } from "../entities/globalStyle";
import type { CustomProperties } from "../entities/customProperty";
import type { CreateIntermediateRepresentation } from "../entities/coulis";

/**
 * Platform adapter interface.
 */
export type Adapter<Output> = {
	createCustomProperties: <const Input extends CustomProperties>(
		input: Input,
	) => Input;
	createKeyframes: <Input extends Keyframes>(input: Input) => Output;
	createStyles: <Input extends RecordLike>(input: Input) => Output;
	createVariants: <Input extends RecordLike>(
		input: Input,
	) => (query: RecordLike) => Output;
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-type", string>;
		content: string;
	}[];
	getMetadataAsString: () => string;
	setGlobalStyles: <Input extends GlobalStyles>(input: Input) => void;
};

export type CreateAdapter<Output> = (
	createIntermediateRepresentation: CreateIntermediateRepresentation,
) => Adapter<Output>;
