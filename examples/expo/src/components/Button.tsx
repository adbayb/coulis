import { Pressable, Text } from "react-native";

import { createStyles } from "../styles";
import type { StyleProps } from "../styles";
import type { CreateComponentProps, TextLikeChildren } from "./types";

export type ButtonProps = CreateComponentProps<
	{
		onPress?: () => void;
		variant?: Variant;
	},
	TextLikeChildren
>;

export const Button = ({
	children,
	onPress,
	variant = "primary",
	...marginProps
}: ButtonProps) => {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) =>
				createStyles({
					...marginProps,
					...getContainerStyleProps(variant, pressed),
					alignItems: "center",
					alignSelf: "flex-start",
					borderRadius: "md",
					cursor: "pointer",
					display: "flex",
					height: 40,
					justifyContent: "center",
					lineHeight: "normal",
					paddingHorizontal: 4,
				})
			}
		>
			<Text
				style={createStyles({
					...getContentStyleProps(variant),
					fontSize: "lg",
					fontWeight: "medium",
				})}
			>
				{children}
			</Text>
		</Pressable>
	);
};

type Variant = "primary" | "secondary";

const getContainerStyleProps = (
	variant: Variant,
	pressed: boolean,
): StyleProps => {
	if (variant === "primary") {
		return {
			backgroundColor: pressed
				? "backgroundPrimaryActive"
				: "backgroundPrimary",
			borderStyle: "none",
		};
	}

	return {
		backgroundColor: pressed
			? "backgroundSecondaryActive"
			: "backgroundSecondary",
		borderColor: "backgroundPrimary",
		borderStyle: "solid",
		borderWidth: 2,
	};
};

const getContentStyleProps = (variant: Variant): StyleProps => {
	if (variant === "primary") {
		return {
			color: "neutralWhite",
		};
	}

	return {
		color: "neutralBlack",
	};
};
