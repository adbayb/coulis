import type { ClassName } from "../entities/style";
import { compose } from "../helpers";

import type { createStyles } from "./styles";

export const createVariants = <
	Styles extends ReturnType<typeof createStyles>,
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
