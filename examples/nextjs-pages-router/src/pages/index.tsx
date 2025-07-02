import { useEffect, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";

import {
	createKeyframes,
	createStyles,
	setGlobalStyles,
} from "../helpers/coulis";

setGlobalStyles({
	"@import":
		"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
	"@font-face": {
		fontFamily: "'AliasedHelvetica'",
		src: "local(Helvetica)",
	},
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	".globalClass": {
		borderRadius: "large",
	},
	"html": {
		boxSizing: "border-box",
	},
	"html,body": {
		fontFamily: "Open Sans, AliasedHelvetica",
		margin: 0,
		padding: 0,
	},
});

const animationName = createKeyframes({
	50: {
		transform: "scale(1.5)",
	},
	from: {
		transform: "scale(1)",
	},
	to: {
		transform: "scale(1)",
	},
});

const App = () => {
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
			<Example title="With global styles">
				<p className="globalClass">{TEXT}</p>
			</Example>
			<Example title="With static styles">
				<p
					className={createStyles({
						backgroundColor: "surfacePrimary",
						borderRadius: "large",
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
				</p>
			</Example>
			<Example title="With dynamic styles">
				<p
					className={createStyles({
						color:
							counter % 2 === 0
								? "surfacePrimary"
								: "surfaceSecondary",
					})}
				>
					{TEXT}
				</p>
			</Example>
			<Example title="With contextual styles">
				<p
					className={createStyles({
						backgroundColor: {
							base: "surfacePrimary",
							medium: "surfaceSecondary",
							smallWithHover: "neutralLight",
						},
					})}
				>
					Resize and/or hover to test
				</p>
			</Example>
			<Example title="With custom properties">
				<p
					className={createStyles({
						borderRadius: "small",
						borderStyle: "solid",
					})}
				>
					{TEXT}
				</p>
			</Example>
			<Example title="With keyframes">
				<div
					className={createStyles({
						animation: `${animationName} 2000ms linear infinite`,
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
};

const TEXT =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

type ExampleProps = {
	readonly title: string;
	readonly children: ReactNode;
};

const Example = ({ title, children }: ExampleProps) => {
	return (
		<section>
			<h3>{title}</h3>
			<div>{children}</div>
		</section>
	);
};

const Layout = ({ children }: PropsWithChildren) => {
	return (
		<main
			className={createStyles({
				display: "flex",
				flexDirection: "column",
				gap: 16,
				paddingHorizontal: 1.5,
				paddingVertical: 1.5,
			})}
		>
			{children}
		</main>
	);
};

export default App;
