import { View } from "react-native";

import type { CreateComponentProps, TextLikeChildren } from "./types";

import { createStyles } from "../styles";
import { Typography } from "./Typography";

export type CalloutProps = CreateComponentProps<
	{
		title: TextLikeChildren;
	},
	TextLikeChildren
>;

export const Callout = ({ children, title }: CalloutProps) => {
	return (
		<View
			style={createStyles({
				backgroundColor: "backgroundSecondary",
				borderColor: "borderSecondary",
				borderRadius: "lg",
				borderStyle: "solid",
				borderWidth: 1,
				paddingBottom: 6,
				paddingHorizontal: 6,
				paddingTop: 3,
				width: "100%",
			})}
		>
			<Typography
				color="foregroundSecondary"
				variant="subTitle"
			>
				{title}
			</Typography>
			<Typography color="foregroundSecondary">{children}</Typography>
		</View>
	);
};
