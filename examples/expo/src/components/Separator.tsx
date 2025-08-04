import { View } from "react-native";

import { createStyles } from "../styles";
import type { StyleProps } from "../styles";
import type { CreateComponentProps } from "./types";

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
				width: !isHorizontal ? 1 : size,
			})}
		/>
	);
};
