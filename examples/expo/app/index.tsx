import { ScrollView, View } from "react-native";

import { colors, createStyles } from "../src/styles";
import { Typography } from "../src/components/Typography";
import { Stack } from "../src/components/Stack";
import { Separator } from "../src/components/Separator";
import { Section } from "../src/components/Section";
import { Callout } from "../src/components/Callout";
import { Button } from "../src/components/Button";
import { Badge } from "../src/components/Badge";
import { Avatar } from "../src/components/Avatar";

export default function Index() {
	return (
		<ScrollView>
			<Stack
				gap={8}
				paddingHorizontal={6}
				paddingVertical={2}
			>
				<Section title="Avatar">
					<Stack
						gap={2}
						orientation="horizontal"
					>
						<Avatar
							accessibilityLabel="Avatar"
							size="small"
							source="https://github.com/adbayb.png"
						/>
						<Avatar
							accessibilityLabel="Avatar"
							size="medium"
							source="https://github.com/adbayb.png"
						/>
						<Avatar
							accessibilityLabel="Avatar"
							size="large"
							source="https://github.com/adbayb.png"
						/>
					</Stack>
				</Section>
				<Section title="Badge">
					<Stack
						gap={2}
						orientation="horizontal"
					>
						<Badge variant="danger">Danger</Badge>
						<Badge variant="note">Note</Badge>
						<Badge variant="success">Success</Badge>
						<Badge variant="warning">Warning</Badge>
					</Stack>
				</Section>
				<Section title="Button">
					<View
						style={createStyles({
							display: "flex",
							flexDirection: "row",
							gap: 2,
						})}
					>
						<Button
							onPress={() => {
								console.log("Primary");
							}}
						>
							Primary
						</Button>
						<Button
							onPress={() => {
								console.log("Secondary");
							}}
							variant="secondary"
						>
							Secondary
						</Button>
					</View>
				</Section>
				<Section title="Callout">
					<Callout title="Visually important content">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit,
						sed do eiusmod tempor incididunt ut labore et dolore
						magna aliqua. Ut enim ad minim veniam, quis nostrud
						exercitation ullamco laboris nisi ut aliquip ex ea
						commodo consequat. Duis aute irure dolor in
						reprehenderit in voluptate velit esse cillum dolore eu
						fugiat nulla pariatur. Excepteur sint occaecat cupidatat
						non proident, sunt in culpa qui officia deserunt mollit
						anim id est laborum.
					</Callout>
				</Section>
				<Section title="Color Tokens">
					{Object.entries(colors)
						.filter(
							([, colorValues]) =>
								typeof colorValues === "object",
						)
						.map(([colorName, colorsValues]) => (
							<Stack
								gap={4}
								key={colorName}
								marginVertical={2}
								orientation="vertical"
							>
								<Typography variant="caption">
									{colorName.toUpperCase()}
								</Typography>
								<Stack orientation="horizontal">
									{Object.entries(colorsValues).map(
										([key, value]) => (
											<View
												key={key}
												style={{
													backgroundColor: value,
													height: 50,
													width: 50,
												}}
											/>
										),
									)}
								</Stack>
							</Stack>
						))}
				</Section>
				<Section title="Separator">
					<Stack
						gap={2}
						orientation="horizontal"
					>
						<Separator
							orientation="horizontal"
							size={100}
						/>
						<Separator
							orientation="vertical"
							size={100}
						/>
					</Stack>
				</Section>
			</Stack>
		</ScrollView>
	);
}
