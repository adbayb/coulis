import { useMemo } from "react";
import { Text } from "react-native";
import type { StyleProps } from "../styles";
import { createStyles } from "../styles";
import type { CreateComponentProps, TextLikeChildren } from "./types";

export type TypographyProps = CreateComponentProps<
	{
		color?: Extract<StyleProps["color"], `foreground${string}`>;
		variant?: Variant;
	},
	TextLikeChildren
>;

type Variant = "body" | "caption" | "subTitle" | "title";

export const Typography = ({
	children,
	color,
	variant = "body",
	...marginProps
}: TypographyProps) => {
	const { color: defaultColor, ...mappedProps } = useMemo(() => {
		return PROPS_BY_VARIANT[variant];
	}, [variant]);

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

const PROPS_BY_VARIANT: Record<Variant, StyleProps> = {
	title: {
		color: "foregroundPrimary",
		fontSize: "3xl",
		fontWeight: "bold",
		// LineHeight: "relaxed", // TODO: to fix on coulis react native adapter
	},
	body: {
		color: "foregroundSecondary",
		fontSize: "base",
		fontWeight: "normal",
		// LineHeight: "normal",
	},
	caption: {
		color: "foregroundSecondary",
		fontSize: "sm",
		fontWeight: "normal",
		// LineHeight: "normal",
	},
	subTitle: {
		color: "foregroundPrimary",
		fontSize: "xl",
		fontWeight: "semibold",
		// LineHeight: "relaxed",
	},
};
