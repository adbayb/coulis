import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";

import { createStyles } from "../src/helpers/coulis";

export default function Index() {
	const [counter, setCounter] = useState(0);

	useEffect(() => {
		const id = setInterval(() => {
			setCounter((value) => {
				return value + 1;
			});
		}, 1000);

		return () => {
			clearInterval(id);
		};
	});

	return (
		<Layout>
			<Example title="With static styles">
				<Text
					style={createStyles({
						backgroundColor: "surfacePrimary",
						borderRadius: "large",
						boxShadow:
							"0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)", // TODO: parse box shadow to replace non-px value via getDimensionValue.
						color: {
							base: "neutralLight",
							hover: "neutralDark",
						},
						colorScheme: {
							base: "white",
							hover: "black",
						},
						fontSize: "body",
						fontWeight: "body",
						padding: 1,
						transitionProperty: {
							base: ["color", "background-color"],
							hover: ["color"],
						},
					})}
				>
					{TEXT}
				</Text>
			</Example>
			<Example title="With dynamic styles">
				<Text
					style={createStyles({
						color:
							counter % 2 === 0
								? "surfacePrimary"
								: "surfaceSecondary",
					})}
				>
					{TEXT}
				</Text>
			</Example>
			<Example title="With contextual styles">
				<Text
					style={createStyles({
						backgroundColor: {
							base: "surfacePrimary",
							medium: "surfaceSecondary",
							smallWithHover: "neutralLight",
						},
					})}
				>
					Resize and/or hover to test
				</Text>
			</Example>
			<Example title="With custom properties">
				<Text
					style={createStyles({
						borderRadius: "small",
						borderStyle: "solid",
					})}
				>
					{TEXT}
				</Text>
			</Example>
			<Example title="With keyframes">
				<View
					style={createStyles({
						backgroundColor: "surfacePrimary",
						borderRadius: "medium",
						height: 50,
						marginHorizontal: 1.5,
						width: 50,
					})}
				/>
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
					fontSize: "heading",
					fontWeight: "heading",
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
				gap: 16,
				paddingHorizontal: 1.5,
				paddingVertical: 1.5,
			})}
		>
			{children}
		</View>
	);
};
