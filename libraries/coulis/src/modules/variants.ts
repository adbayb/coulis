import type { ClassName } from "../entities/className";
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
			const selectedValue = selectedValueByVariant[variant];
			const styleObjectByValue = variants[variant];

			const variantStyleObject =
				styleObjectByValue?.[selectedValue as string];

			if (variantStyleObject === undefined) continue;

			classNames.push(styles(variantStyleObject));
		}

		return compose(...classNames);
	};
};
