import { Text, View } from "react-native";

import { createStyles } from "../src/helpers/coulis";

export default function Index() {
	return (
		<View
			style={createStyles({
				alignItems: "center",
				display: "flex",
				flex: 1,
				justifyContent: "center",
			})}
		>
			<Text
				style={createStyles({
					backgroundColor: "surfaceSecondary",
					borderRadius: "small",
					color: "surfacePrimary",
				})}
			>
				Edit app/index.tsx to edit this screen.
			</Text>
		</View>
	);
}
