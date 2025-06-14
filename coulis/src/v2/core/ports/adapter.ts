import type { StyleConfigs, StyleOptions, Styles } from "../entities/style";
import type { Exactify } from "../entities/primitive";
import type { Keyframes } from "../entities/keyframe";
import type { GlobalStyles } from "../entities/globalStyle";
import type { CustomProperties } from "../entities/customProperty";
import type { CreateIntermediateRepresentation } from "../entities/coulis";

/**
 * Platform adapter interface.
 */
export type Adapter<Output> = {
	/**
	 * Create one or several custom properties globally scoped.
	 * A [custom property](https://www.w3.org/TR/css-variables-1/) is any property whose name starts with two dashes.
	 * Its main functional purpose is theming: a theme defines a set of consistent and contextual properties (aka [design tokens](https://www.designtokens.org/glossary/)).
	 * A design token is an indivisible design decision of a design system (such as colors, spacing, typography scale, ...).
	 * @param properties - Record of custom properties .
	 * @returns The platform-adaptee-applicable output exposing transformed custom properties.
	 * @example
	 * const properties = createCustomProperties({ colors: { neutralDark: "black", neutralLight: "white" } });
	 */
	createCustomProperties: <const Input extends CustomProperties>(
		input: Input,
	) => Input;
	/**
	 * Create a `keyframes` rule set globally scoped that describes the animation to apply to an element.
	 * @param properties - A style record containing CSS keyframes-related declarations.
	 * @returns The platform-adaptee-applicable output to identify the keyframe list (e.g., a string web side that can be used as an `animation-name` CSS property).
	 * @example
	 * 	const animationName = createKeyframes({ from: { opacity: 0 }, to: { opacity: 1 } });
	 * 	const adapteeOutput = styles({ animation: `${animationName} 2000ms linear infinite`, });
	 */
	createKeyframes: <Input extends Keyframes>(input: Input) => Output;
	/**
	 * A factory to configure and create type-safe `styles` method.
	 * @param properties - Properties configuration.
	 * @param options - Optional values to decorate and/or modify the provided configuration.
	 * @returns A `styles` method to generate a platform-adaptee-applicable style output (e.g. A class name web side) from a list of type-safe CSS properties.
	 * @example
	 * 	const styles = createStyles({ backgroundColor: ["red"] });
	 * 	const adapteeOutput = styles({ backgroundColor: "red" });
	 */
	createStyles: <
		const Configs extends StyleConfigs,
		const Options extends StyleOptions<Configs>,
	>(
		configs: Exactify<Configs, keyof StyleConfigs>,
		options?: Options,
	) => Styles<Configs, Options, Output>;
	/**
	 * A factory to create one or several styling variants.
	 * @param styles - The style function returned by the `createStyles` factory.
	 * @param variants - The variant definition. The first-level field defines the variant name, the second-level field the variant value, and the third-level field the set of CSS properties applied.
	 * @returns A function to select the appropriate variant.
	 * @example
	 * const styles = createStyles({
	 *   backgroundColor: true,
	 *   padding: true,
	 * });
	 *
	 * const buttonVariants = createVariants(styles, {
	 *   size: {
	 *     large: { padding: 18 },
	 *     medium: { padding: 12 },
	 *     small: { padding: 6 },
	 *   },
	 * });
	 */
	createVariants: <
		Variants extends Record<
			string,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			Record<string, Parameters<Styles<any, any, Output>>[0]>
		>,
	>(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		styles: any,
		variants: Variants,
	) => (input: {
		[Variant in keyof Variants]: keyof Variants[Variant];
	}) => Output;
	/**
	 * TODO.
	 * @returns TODO.
	 */
	getMetadata: () => {
		attributes: Record<"data-coulis-cache" | "data-coulis-type", string>;
		content: string;
	}[];
	/**
	 * TODO.
	 * @returns TODO.
	 */
	getMetadataAsString: () => string;
	/**
	 * Apply style rules globally.
	 * @param properties - A style record containing CSS declarations to apply to a given element.
	 * @example
	 * 	setGlobalStyles({ "html": { "background-color": "red" } });
	 */
	setGlobalStyles: <Input extends GlobalStyles>(input: Input) => void;
};

export type CreateAdapter<Output> = (
	createIntermediateRepresentation: CreateIntermediateRepresentation,
) => Adapter<Output>;
