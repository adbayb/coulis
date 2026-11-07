import { Image } from "react-native";
import type { StyleProps } from "../styles";
import { createStyles } from "../styles";
import type { CreateComponentProps } from "./types";

export type AvatarProps = CreateComponentProps<{
	accessibilityLabel: string;
	size?: Size;
	source: string;
}>;

type Size = "large" | "medium" | "small";

export const Avatar = ({
	accessibilityLabel,
	size = DEFAULT_SIZE,
	source,
	...marginProps
}: AvatarProps) => {
	return (
		<Image
			accessibilityLabel={accessibilityLabel}
			src={source}
			style={createStyles({
				...marginProps,
				borderRadius: "full",
				overflow: "hidden",
				size: VALUE_BY_SIZE[size],
			})}
		/>
	);
};

const DEFAULT_SIZE: Size = "medium";

const VALUE_BY_SIZE: Record<Size, StyleProps["size"]> = {
	large: "4.5rem",
	medium: "3rem",
	small: "2rem",
};
