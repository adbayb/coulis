import {
	createCustomProperties,
	createKeyframes,
	createStyles,
	createVariants,
	globalStyles,
} from "coulis";
import { useEffect, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";

/**
 * TODO:
 * - Benchmark and improve performance before release: manage cache only
 * - Only include allowNativeValues if values is set (make sense only in this case).
 * - Add changelog.
 */

const STYLE_KEYS_FACTORIES: Record<
	"hover" | "large" | "medium" | "small" | "smallWithHover",
	(params: { className: string; declaration: string }) => string
> = {
	hover: ({ className, declaration }) => `${className}:hover{${declaration}}`,
	large: ({ className, declaration }) =>
		`@media (min-width: 1024px){${className}{${declaration}}}`,
	medium: ({ className, declaration }) =>
		`@media (min-width: 768px){${className}{${declaration}}}`,
	small: ({ className, declaration }) =>
		`@media (min-width: 360px){${className}{${declaration}}}`,
	smallWithHover: ({ className, declaration }) =>
		`@media (min-width: 360px){${className}:hover{${declaration}}}`,
};

const px = (value: number) => `${value}px`;

const tokens = {
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
} as const;

const theme = createCustomProperties({
	colors: {
		neutralDark: tokens.colors.black,
		neutralLight: tokens.colors.white,
		neutralTransparent: tokens.colors.transparent,
		surfacePrimary: tokens.colors.blue[4],
		surfaceSecondary: tokens.colors.blue[2],
	},
	radii: {
		full: tokens.radii[4],
		large: tokens.radii[3],
		medium: tokens.radii[2],
		none: tokens.radii[0],
		small: tokens.radii[1],
	},
	typographies: {
		fontSizes: {
			body: tokens.fontSizes[2],
		},
		fontWeights: {
			body: tokens.fontWeights[1],
		},
	},
});

globalStyles({
	"@import":
		"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
	// eslint-disable-next-line sort-keys-custom-order/object-keys
	"@font-face": {
		fontFamily: "'AliasedHelvetica'",
		src: "local(Helvetica)",
	},
	// eslint-disable-next-line sort-keys-custom-order/object-keys
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	".globalClass+.otherGlobalClass": {
		border: "1px solid black",
		borderRadius: 4,
	},
	html: {
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
		backgroundColor: {
			allowNativeValues: true,
			keys: STYLE_KEYS_FACTORIES,
			values: theme.colors,
		},
		borderRadius: {
			allowNativeValues: true,
			values: theme.radii,
		},
		color: {
			values: theme.colors,
		},
		display: true,
		flex: true,
		flexDirection: true,
		fontSize: {
			values: theme.typographies.fontSizes,
		},
		fontWeight: {
			values: theme.typographies.fontWeights,
		},
		gap: true,
		height: true,
		margin: true,
		marginBottom: true,
		marginLeft: true,
		marginRight: true,
		marginTop: true,
		padding: true,
		paddingBottom: true,
		paddingLeft: true,
		paddingRight: true,
		paddingTop: true,
		width: true,
	},
	{
		shorthands: {
			marginHorizontal: ["marginLeft", "marginRight"],
			marginVertical: ["marginTop", "marginBottom"],
			paddingHorizontal: ["paddingLeft", "paddingRight"],
			paddingVertical: ["paddingTop", "paddingBottom"],
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
		large: { padding: 18 },
		medium: { padding: 12 },
		small: { padding: 6 },
	},
});

const App = () => {
	const [counter, setCounter] = useState(0);

	useEffect(() => {
		const id = setInterval(() => {
			setCounter((value) => ++value);
		}, 1000);

		return () => {
			clearInterval(id);
		};
	});

	return (
		<Layout>
			<Example title="With global styles">
				<span className="globalClass">GlobalClass</span>
				<span className="otherGlobalClass">OtherGlobalClass</span>
			</Example>
			<Example title="With static styles">
				<p
					className={styles({
						backgroundColor: "surfacePrimary",
						color: "neutralLight",
						fontSize: "body",
						fontWeight: "body",
						padding: 24,
					})}
				>
					Hello 👋
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
					Hello 👋
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
					Hello 👋
				</p>
			</Example>
			<Example title="With variants">
				<button
					className={buttonVariants({
						color: "brand",
						size: "large",
					})}
				>
					Hello 👋
				</button>
			</Example>
			<Example title="With keyframes">
				<div
					className={styles({
						animation: `${animationName} 2000ms linear infinite`,
						backgroundColor: "surfacePrimary",
						borderRadius: 4,
						height: 50,
						marginHorizontal: 24,
						width: 50,
					})}
				/>
			</Example>
		</Layout>
	);
};

type ExampleProps = {
	title: string;
	children: ReactNode;
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
