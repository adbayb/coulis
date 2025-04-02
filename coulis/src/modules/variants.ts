import { compose } from "../helpers";
import type { ClassName } from "../entities/style";
import type { createStyles } from "./styles";

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
export const createVariants = <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Styles extends ReturnType<typeof createStyles<any, any>>,
	Variants extends Record<string, Record<string, Parameters<Styles>[0]>>,
>(
	styles: Styles,
	variants: Variants,
) => {
	return (selectedValueByVariant: {
		[Variant in keyof Variants]: keyof Variants[Variant];
	}) => {
		const classNames: ClassName[] = [];
		const variantKeys = Object.keys(selectedValueByVariant);

		for (const variant of variantKeys) {
			const selectedVariant = selectedValueByVariant[variant];
			const propertiesByVariant = variants[variant];

			const variantProperties =
				propertiesByVariant?.[selectedVariant as string];

			if (variantProperties === undefined) continue;

			classNames.push(styles(variantProperties));
		}

		return compose(...classNames);
	};
};
