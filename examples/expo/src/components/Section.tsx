import { View } from "react-native";
import { Stack } from "./Stack";
import type { CreateComponentProps, ReactElementLike } from "./types";
import { Typography } from "./Typography";

export type SectionProps = CreateComponentProps<
	{
		title: string;
	},
	ReactElementLike
>;

export const Section = ({ children, title }: SectionProps) => {
	return (
		<Stack
			gap={2}
			orientation="vertical"
		>
			<Typography variant="title">{title}</Typography>
			<View>{children}</View>
		</Stack>
	);
};
