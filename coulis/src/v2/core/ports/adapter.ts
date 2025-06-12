import type {
	CreateCustomPropertiesInput,
	CreateKeyframesInput,
	RecordLike,
	SetGlobalStylesInput,
} from "../types";
import type { CreateStyle } from "../entities/style";

/**
 * Platform adapter interface.
 */
export type Adapter<Output> = {
	createCustomProperties: <const Input extends CreateCustomPropertiesInput>(
		input: Input,
	) => Input; // TODO: CreateCustomPropertiesOutput<Input>?
	createKeyframes: <Input extends CreateKeyframesInput>(
		input: Input,
	) => Output;
	createStyles: <Input extends RecordLike>(input: Input) => Output; // TODO: update type.
	createVariants: <Input extends RecordLike>(
		input: Input,
	) => (query: RecordLike) => Output;
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-type", string>;
		content: string;
	}[];
	getMetadataAsString: () => string;
	setGlobalStyles: <Input extends SetGlobalStylesInput>(input: Input) => void;
};

export type CreateAdapter<Output> = (input: {
	createStyle: CreateStyle;
}) => Adapter<Output>;
