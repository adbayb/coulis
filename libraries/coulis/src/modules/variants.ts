import type { ClassName } from "../entities/className";
import type { AtomicStyleObject } from "../types";

import { styles } from "./styles";
import { compose } from "./tools";

export const createVariants = <
	Variants extends Record<string, Record<string, AtomicStyleObject>>,
>(
	variants: Variants,
) => {
	return (selectedValueByVariant: {
		[Variant in keyof Variants]: keyof Variants[Variant];
	}) => {
		const classNames: ClassName[] = [];

		const variantKeys = Object.keys(
			selectedValueByVariant,
		) as (keyof Variants)[];

		for (const variant of variantKeys) {
			const selectedValue = selectedValueByVariant[variant];
			const styleObjectByValue = variants[variant];

			const variantStyleObject =
				styleObjectByValue?.[selectedValue as string];

			if (variantStyleObject) classNames.push(styles(variantStyleObject));
		}

		return compose(...classNames);
	};
};
