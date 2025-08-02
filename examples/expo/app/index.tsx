import { Pressable, Text, View } from "react-native";
import type { PropsWithChildren, ReactNode } from "react";

import { createStyles } from "../src/styles";

export default function Index() {
	return (
		<Layout>
			<Example title="Button">
				<View
					style={createStyles({
						display: "flex",
						flexDirection: "row",
						gap: 2,
					})}
				>
					<Pressable
						onPress={() => {
							console.log("Pressable");
						}}
						style={({ pressed }) =>
							createStyles({
								alignItems: "center",
								alignSelf: "flex-start",
								backgroundColor: pressed
									? "backgroundPrimaryActive"
									: "backgroundPrimary",
								borderRadius: "md",
								borderStyle: "none",
								color: "neutralWhite",
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
								color: "neutralWhite",
								fontFamily: "sans",
								fontSize: "lg",
								fontWeight: "medium",
							})}
						>
							Hello
						</Text>
					</Pressable>
					<Pressable
						onPress={() => {
							console.log("Pressable");
						}}
						style={({ pressed }) =>
							createStyles({
								alignItems: "center",
								alignSelf: "flex-start",
								backgroundColor: pressed
									? "backgroundPrimaryActive"
									: "backgroundPrimary",
								borderRadius: "md",
								borderStyle: "none",
								color: "neutralWhite",
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
								color: "neutralWhite",
								fontFamily: "sans",
								fontSize: "lg",
								fontWeight: "medium",
							})}
						>
							Hello
						</Text>
					</Pressable>
				</View>
			</Example>
			<Example title="Callout">
				<Text
					style={createStyles({
						backgroundColor: "backgroundDanger",
						borderRadius: "lg",
						boxShadow: "lg",
						color: "foregroundDanger",
						fontSize: "base",
						fontWeight: "normal",
						padding: 1,
					})}
				>
					{TEXT}
				</Text>
			</Example>
		</Layout>
	);
}

const TEXT =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

type ExampleProps = {
	readonly title: string;
	readonly children: ReactNode;
};

const Example = ({ title, children }: ExampleProps) => {
	return (
		<View>
			<Text
				style={createStyles({
					fontSize: "3xl",
					fontWeight: "bold",
					marginBottom: 1,
				})}
			>
				{title}
			</Text>
			<View>{children}</View>
		</View>
	);
};

const Layout = ({ children }: PropsWithChildren) => {
	return (
		<View
			style={createStyles({
				display: "flex",
				flexDirection: "column",
				gap: 6,
				paddingHorizontal: 6,
				paddingVertical: 2,
			})}
		>
			{children}
		</View>
	);
};
