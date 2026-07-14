import { Pressable, Text } from "react-native";
import type { StyleProps } from "../styles";
import { createStyles } from "../styles";
import type { CreateComponentProps, TextLikeChildren } from "./types";

export type ButtonProps = CreateComponentProps<
	{
		onPress?: () => void;
		variant?: Variant;
	},
	TextLikeChildren
>;

type Variant = "primary" | "secondary";

export const Button = ({ children, onPress, variant = "primary", ...marginProps }: ButtonProps) => {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => {
				return createStyles({
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
				});
			}}
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

const getContainerStyleProps = (variant: Variant, isPressed: boolean): StyleProps => {
	if (variant === "primary") {
		return {
			backgroundColor: isPressed ? "backgroundPrimaryActive" : "backgroundPrimary",
			borderStyle: "none",
		};
	}

	return {
		backgroundColor: isPressed ? "backgroundSecondaryActive" : "backgroundSecondary",
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
