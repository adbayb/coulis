import { Text } from "react-native";
import { useMemo } from "react";

import { createStyles } from "../styles";
import type { StyleProps } from "../styles";
import type { CreateComponentProps, TextLikeChildren } from "./types";

export type TypographyProps = CreateComponentProps<
	{
		color?: Extract<StyleProps["color"], `foreground${string}`>;
		variant?: Variant;
	},
	TextLikeChildren
>;

export const Typography = ({
	children,
	color,
	variant = "body",
	...marginProps
}: TypographyProps) => {
	const { color: defaultColor, ...mappedProps } = useMemo(
		() => PROPS_BY_VARIANT[variant],
		[variant],
	);

	return (
		<Text
			style={createStyles({
				...marginProps,
				...mappedProps,
				color: color ?? defaultColor,
				margin: "none",
				padding: "none",
			})}
		>
			{children}
		</Text>
	);
};

type Variant = "body" | "caption" | "subTitle" | "title";

const PROPS_BY_VARIANT: Record<Variant, StyleProps> = {
	title: {
		color: "foregroundPrimary",
		fontSize: "3xl",
		fontWeight: "bold",
		// lineHeight: "relaxed", // TODO: to fix on coulis react native adapter
	},
	body: {
		color: "foregroundSecondary",
		fontSize: "base",
		fontWeight: "normal",
		// lineHeight: "normal",
	},
	caption: {
		color: "foregroundSecondary",
		fontSize: "sm",
		fontWeight: "normal",
		// lineHeight: "normal",
	},
	subTitle: {
		color: "foregroundPrimary",
		fontSize: "xl",
		fontWeight: "semibold",
		// lineHeight: "relaxed",
	},
};
