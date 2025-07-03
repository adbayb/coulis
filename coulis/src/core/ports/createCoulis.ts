import type { ThemeLike } from "../entities/theme";
import type { StatesLike } from "../entities/state";
import type { ShortandsLike } from "../entities/shorthand";
import type { PropertiesLike, PropertyValue } from "../entities/property";
import type {
	EmptyRecord,
	RecordLike,
	WithNewLeafNodes,
} from "../entities/primitive";
import type { Keyframes } from "../entities/keyframe";
import type { GlobalStyles } from "../entities/globalStyle";

export type CreateCoulis<Output> = <
	// `const` needed to not widen strict type (for example, to avoid `width: [50, 100]` being inferred as `width: number`).
	const Properties extends PropertiesLike,
	States extends StatesLike, // TODO: fix States extends StatesLike = undefined (to avoid accepting { base: value } if no states are defined
	Shorthands extends ShortandsLike<Properties> = undefined,
	Theme extends ThemeLike = undefined,
>(contract: {
	properties: (
		theme: Theme extends RecordLike
			? WithNewLeafNodes<Theme, string>
			: undefined,
	) => Properties;
	shorthands?: Shorthands;
	states?: States;
	theme?: Theme;
}) => {
	createKeyframes: (input: Keyframes<Properties>) => Output;
	createStyles: (
		input: (Shorthands extends undefined
			? EmptyRecord
			: {
					[PropertyName in keyof Shorthands]?: Shorthands[PropertyName] extends (keyof Properties)[]
						? PropertyValue<
								Shorthands[PropertyName][number],
								Properties,
								States
							>
						: never;
				}) & {
			[PropertyName in keyof Properties]?: PropertyValue<
				PropertyName,
				Properties,
				States
			>;
		},
	) => Output;
	getMetadata: () => {
		toString: () => string;
		value: {
			attributes: Record<
				"data-coulis-cache" | "data-coulis-type",
				string
			>;
			content: string;
		}[];
	};
	setGlobalStyles: (input: GlobalStyles<Properties>) => void;
};
