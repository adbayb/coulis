import { View } from "react-native";

import { createStyles } from "../styles";
import type { StyleProps } from "../styles";
import type { CreateComponentProps, ReactElementLike } from "./types";

export type StackProps = CreateComponentProps<
	Omit<StyleProps, "children" | "display" | "flexDirection"> & {
		orientation?: "horizontal" | "vertical";
	},
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
