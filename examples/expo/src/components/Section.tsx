import { View } from "react-native";

import type { CreateComponentProps, ReactElementLike } from "./types";
import { Typography } from "./Typography";
import { Stack } from "./Stack";

export type SectionProps = CreateComponentProps<
	{
		title: string;
	},
	ReactElementLike
>;

export const Section = ({ title, children }: SectionProps) => {
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
