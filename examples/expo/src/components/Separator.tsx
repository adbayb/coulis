import { View } from "react-native";

import type { StyleProps } from "../styles";
import type { CreateComponentProps } from "./types";

import { createStyles } from "../styles";

export type SeparatorProps = CreateComponentProps<{
	orientation?: "horizontal" | "vertical";
	size?: StyleProps["size"];
}>;

export const Separator = ({
	orientation = "horizontal",
	size = "100%",
	...marginProps
}: SeparatorProps) => {
	const isHorizontal = orientation === "horizontal";

	return (
		<View
			aria-orientation={orientation}
			role="separator"
			style={createStyles({
				...marginProps,
				backgroundColor: "borderSecondary",
				height: isHorizontal ? 1 : size,
				width: isHorizontal ? size : 1,
			})}
		/>
	);
};
