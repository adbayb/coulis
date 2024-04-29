import {
	compose,
	createAnimationName,
	createCustomProperties,
	createStyles,
	createVariants,
	globalStyles,
	styles,
} from "coulis";
import { useEffect, useState } from "react";

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

const largerStyles = createStyles("@media", "(min-width: 576px)");

const animationName = createAnimationName({
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

const buttonVariants = createVariants({
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
		body: {
			fontSize: tokens.fontSizes[2],
			fontWeight: tokens.fontWeights[1],
		},
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
					backgroundColor: "lightblue",
					borderRadius: 4,
					padding: 10,
				})}
			>
				<p
					className={styles({
						color: {
							":hover": "red",
							default: counter % 2 === 0 ? "blue" : "red",
						},
					})}
				>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<section>
					<h1>createCustomProperties</h1>
					<p
						className={styles({
							backgroundColor: "lightcoral",
							borderRadius: theme.radii.large,
							color: theme.colors.neutralLight,
							fontSize: theme.typographies.body.fontSize,
							fontWeight: theme.typographies.body.fontWeight,
							padding: 24,
						})}
					>
						Hello 👋
					</p>
				</section>
				<button
					className={compose(
						styles({ marginBottom: 16 }),
						buttonVariants({
							color: "brand",
							size: "large",
						}),
					)}
				>
					Variants
				</button>
				<a
					className={compose(
						styles({
							backgroundColor: {
								"[data-plop=true]": "red",
								default: "lightcoral",
							},
							color: {
								":hover": "purple",
								"[target=_blank]": undefined,
								default: "yellow",
							},
							display: "flex",
						}),
						largerStyles({
							color: "blue",
							padding: 24,
						}),
					)}
					data-plop={false}
					href="https://reactjs.org"
					rel="noopener noreferrer"
					target="_blank"
				>
					Learn React
				</a>
			</header>
			<span className="globalClass">GlobalClass</span>
			<span className="otherGlobalClass">OtherGlobalClass</span>
			<div
				className={styles({
					padding: 24,
				})}
			>
				<div
					className={styles({
						animation: `${animationName} 2000ms linear infinite`,
						backgroundColor: "lightgray",
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
