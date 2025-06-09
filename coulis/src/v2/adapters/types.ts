import type {
	CreateCustomPropertiesInput,
	CreateKeyframesInput,
	RecordLike,
	SetGlobalStylesInput,
} from "../types";
import type { CreateCoulis } from "../createCoulis";

/**
 * Platform adapter interface.
 */
export type Platform<Styles> = {
	createCustomProperties: <const Input extends CreateCustomPropertiesInput>(
		input: Input,
	) => Input; // TODO: CreateCustomPropertiesOutput<Input>?
	createKeyframes: <Input extends CreateKeyframesInput>(
		input: Input,
	) => Styles;
	createStyles: <Input extends RecordLike>(input: Input) => Styles;
	createVariants: <Input extends RecordLike>(
		input: Input,
	) => (query: RecordLike) => Styles; // TODO: update type.
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-type", string>;
		content: string;
	}[];
	getMetadataAsString: () => string;
	setGlobalStyles: <Input extends SetGlobalStylesInput>(input: Input) => void;
};

export type WithPlatform<Styles> = (
	coulisFactory: CreateCoulis,
) => () => Platform<Styles>;
