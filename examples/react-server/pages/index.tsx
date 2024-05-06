import {
	createCustomProperties,
	createKeyframes,
	createStyles,
	createVariants,
	globalStyles,
} from "coulis";
import { useEffect, useState } from "react";

const createKeys = ({
	className,
	declaration,
}: {
	className: string;
	declaration: string;
}) => {
	return {
		base: `${className}{${declaration}}`,
		hover: `${className}:hover{${declaration}}`,
		large: `@media (min-width: 1024px){${className}{${declaration}}}`,
		medium: `@media (min-width: 768px){${className}{${declaration}}}`,
		small: `@media (min-width: 360px){${className}{${declaration}}}`,
		smallWithHover: `@media (min-width: 360px){${className}:hover{${declaration}}}`,
	};
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

const styles = createStyles({
	accentColor: true,
	animation: true,
	backgroundColor: {
		keys: createKeys,
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
	padding: true,
	width: true,
});

const buttonVariants = createVariants(styles, {
	color: {
		accent: { backgroundColor: "lightsalmon" },
		brand: { backgroundColor: "lightseagreen" },
		neutral: { backgroundColor: "lightskyblue" },
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
		<div>
			<header
				className={styles({
					borderRadius: 4,
					display: "flex",
					flexDirection: "column",
					gap: 16,
					padding: 10,
				})}
			>
				<section>
					<h1
						className={styles({
							color:
								counter % 2 === 0
									? "surfacePrimary"
									: "surfaceSecondary",
						})}
					>
						createCustomProperties
					</h1>
					<p
						className={styles({
							backgroundColor: "surfacePrimary",
							borderRadius: theme.radii.large,
							color: "neutralLight",
							fontSize: "body",
							fontWeight: "body",
							padding: 24,
						})}
					>
						Hello 👋
					</p>
				</section>
				<button
					className={buttonVariants({
						color: "brand",
						size: "large",
					})}
				>
					Variants
				</button>
			</header>
			<span className="globalClass">GlobalClass</span>
			<span className="otherGlobalClass">OtherGlobalClass</span>
			<section>
				<h1>With contextual styles</h1>
				<p
					className={styles({
						backgroundColor: {
							base: "surfacePrimary",
							medium: "surfaceSecondary",
						},
						borderRadius: theme.radii.large,
						color: "neutralLight",
						fontSize: "body",
						fontWeight: "body",
						padding: 24,
					})}
				>
					Hello 👋
				</p>
			</section>
			<div
				className={styles({
					padding: 24,
				})}
			>
				<div
					className={styles({
						animation: `${animationName} 2000ms linear infinite`,
						backgroundColor: "neutralLight",
						borderRadius: 4,
						height: 50,
						width: 50,
					})}
				/>
			</div>
		</div>
	);
};

export default App;
