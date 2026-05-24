import { View } from "react-native";

import type { StyleProps } from "../styles";
import type { CreateComponentProps, ReactElementLike } from "./types";

import { createStyles } from "../styles";

export type StackProps = CreateComponentProps<
	{
		orientation?: "horizontal" | "vertical";
	} & Omit<StyleProps, "children" | "display" | "flexDirection">,
	ReactElementLike
>;

export const Stack = ({
	alignItems = "flex-start",
	children,
	gap = "none",
	orientation = "vertical",
	...marginProps
}: StackProps) => {
	const isHorizontal = orientation === "horizontal";

	return (
		<View
			style={createStyles({
				...marginProps,
				alignItems,
				display: "flex",
				flexDirection: isHorizontal ? "row" : "column",
				gap,
			})}
		>
			{children}
		</View>
	);
};
