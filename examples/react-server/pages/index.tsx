import { useEffect, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import {
	createCustomProperties,
	createKeyframes,
	createStyles,
	createVariants,
	setGlobalStyles,
} from "coulis";

const px = (value: number) => `${value}px`;

const tokens = Object.freeze({
	colors: {
		black: "black",
		blue: [
			"rgb(241,244,248)",
			"rgb(226,232,240)",
			"rgb(201,212,227)",
			"rgb(168,186,211)",
			"rgb(119,146,185)",
		],
		transparent: "transparent",
		white: "white",
	},
	fontSizes: [
		px(12),
		px(14),
		px(16),
		px(18),
		px(20),
		px(22),
		px(24),
		px(28),
		px(30),
	],
	fontWeights: ["100", "400", "900"],
	radii: [px(0), px(4), px(8), px(12), px(999)],
	spacings: {
		0: "0px",
		0.5: "0.5rem",
		1: "1rem",
		1.5: "2rem",
	},
} as const);

const theme = createCustomProperties({
	colors: {
		neutralDark: tokens.colors.black,
		neutralLight: tokens.colors.white,
		neutralTransparent: tokens.colors.transparent,
		surfacePrimary: tokens.colors.blue[4],
		surfaceSecondary: tokens.colors.blue[2],
	},
	fontSizes: {
		body: tokens.fontSizes[2],
	},
	fontWeights: {
		body: tokens.fontWeights[1],
	},
	radii: {
		full: tokens.radii[4],
		large: tokens.radii[3],
		medium: tokens.radii[2],
		none: tokens.radii[0],
		small: tokens.radii[1],
	},
	spacings: tokens.spacings,
});

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
		border: "1px solid black",
		borderRadius: 4,
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

const styles = createStyles(
	{
		accentColor: true,
		animation: true,
		backgroundColor: theme.colors,
		borderRadius: theme.radii,
		color: theme.colors,
		colorScheme(input: "black" | "white") {
			return input === "black" ? "dark" : "light";
		},
		display: true,
		flex: true,
		flexDirection: true,
		fontSize: theme.fontSizes,
		fontWeight: theme.fontWeights,
		gap: true,
		height: true,
		margin: theme.spacings,
		marginBottom: theme.spacings,
		marginLeft: theme.spacings,
		marginRight: theme.spacings,
		marginTop: theme.spacings,
		padding: theme.spacings,
		paddingBottom: theme.spacings,
		paddingLeft: theme.spacings,
		paddingRight: theme.spacings,
		paddingTop: theme.spacings,
		transitionProperty(input: ("background-color" | "color")[]) {
			return input.join(",");
		},
		width: [50, 100],
	},
	{
		loose: ["backgroundColor", "borderRadius"],
		shorthands: {
			marginHorizontal: ["marginLeft", "marginRight"],
			marginVertical: ["marginTop", "marginBottom"],
			paddingHorizontal: ["paddingLeft", "paddingRight"],
			paddingVertical: ["paddingTop", "paddingBottom"],
		},
		states: {
			hover: ({ className, declaration }) =>
				`${className}:hover{${declaration}}`,
			large: ({ className, declaration }) =>
				`@media (min-width: 1024px){${className}{${declaration}}}`,
			medium: ({ className, declaration }) =>
				`@media (min-width: 768px){${className}{${declaration}}}`,
			small: ({ className, declaration }) =>
				`@media (min-width: 360px){${className}{${declaration}}}`,
			smallWithHover: ({ className, declaration }) =>
				`@media (min-width: 360px){${className}:hover{${declaration}}}`,
		},
	},
);

const buttonVariants = createVariants(styles, {
	color: {
		accent: { backgroundColor: "surfaceSecondary" },
		brand: { backgroundColor: "surfacePrimary" },
		neutral: { backgroundColor: "neutralDark" },
	},
	size: {
		large: { padding: 1.5 },
		medium: { padding: 1 },
		small: { padding: 0.5 },
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
					className={styles({
						backgroundColor: "surfacePrimary",
						borderRadius: "large",
						color: "neutralLight",
						colorScheme: {
							base: "white",
							hover: "black",
						},
						fontSize: "body",
						fontWeight: "body",
						padding: {
							base: 1,
							hover: 1.5,
						},
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
					className={styles({
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
					className={styles({
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
					className={styles({
						backgroundColor: theme.colors.neutralLight,
						borderRadius: theme.radii.large,
					})}
				>
					{TEXT}
				</p>
			</Example>
			<Example title="With variants">
				<button
					className={buttonVariants({
						color: "brand",
						size: "large",
					})}
					type="button"
				>
					{TEXT.split(" ")[0]}
				</button>
			</Example>
			<Example title="With keyframes">
				<div
					className={styles({
						animation: `${animationName} 2000ms linear infinite`,
						backgroundColor: "surfacePrimary",
						borderRadius: 4,
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
			className={styles({
				display: "flex",
				flexDirection: "column",
				gap: 16,
			})}
		>
			{children}
		</main>
	);
};

export default App;
