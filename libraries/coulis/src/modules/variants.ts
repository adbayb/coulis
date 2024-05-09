import type { ClassName } from "../entities/style";
import { compose } from "../helpers";

import type { createStyles } from "./styles";

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
		let style: Record<string, number | string | undefined> = {};
		const classNames: ClassName[] = [];
		const variantKeys = Object.keys(selectedValueByVariant);

		for (const variant of variantKeys) {
			const selectedVariant = selectedValueByVariant[variant];
			const propertiesByVariant = variants[variant];

			const variantProperties =
				propertiesByVariant?.[selectedVariant as string];

			if (variantProperties === undefined) continue;

			const output = styles(variantProperties); // TODO style merging

			classNames.push(output.className);
			style = {
				...style,
				...output.style,
			};
		}

		return { className: compose(...classNames), style };
	};
};
