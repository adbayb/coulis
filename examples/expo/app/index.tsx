import { Text, View } from "react-native";

import { createStyles } from "../src/helpers/coulis";

const styles = createStyles({
	backgroundColor: "neutralDark",
});

export default function Index() {
	return (
		<View
			style={{
				...styles,
				alignItems: "center",
				flex: 1,
				justifyContent: "center",
			}}
		>
			<Text>Edit app/index.tsx to edit this screen.</Text>
		</View>
	);
}
