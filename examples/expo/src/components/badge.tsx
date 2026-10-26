import { Text } from "react-native";
import type { StyleProps } from "../styles";
import { createStyles } from "../styles";
import type { CreateComponentProps, TextLikeChildren } from "./types";

export type BadgeProps = CreateComponentProps<
	{
		variant?: Variant;
	},
	TextLikeChildren
>;

type Variant = "danger" | "note" | "success" | "warning";

export const Badge = ({ children, variant = "note", ...marginProps }: BadgeProps) => {
	return (
		<Text
			style={createStyles({
				...marginProps,
				...PROPS_BY_VARIANT[variant],
				borderRadius: "md",
				fontSize: "xs",
				fontWeight: "medium",
				// LineHeight: "normal", // TODO: to fix
				paddingHorizontal: 1.5,
				paddingVertical: 0.5,
			})}
		>
			{children}
		</Text>
	);
};

const PROPS_BY_VARIANT: Record<Variant, StyleProps> = {
	danger: {
		backgroundColor: "backgroundDanger",
		borderColor: "borderDanger",
		color: "foregroundDanger",
	},
	note: {
		backgroundColor: "backgroundNote",
		borderColor: "borderNote",
		color: "foregroundNote",
	},
	success: {
		backgroundColor: "backgroundSuccess",
		borderColor: "borderSuccess",
		color: "foregroundSuccess",
	},
	warning: {
		backgroundColor: "backgroundWarning",
		borderColor: "borderWarning",
		color: "foregroundWarning",
	},
};
