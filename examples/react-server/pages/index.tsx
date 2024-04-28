import {
	compose,
	createAnimationName,
	createProperty,
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

const colorProperty = createProperty("blue");

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
				<section
					className={styles({
						display: "flex",
						flexDirection: "row",
						gap: 4,
						padding: 24,
					})}
				>
					<div
						className={styles({
							color: colorProperty.value,
						})}
					>
						Property
					</div>
					<div
						className={styles({
							color: colorProperty.value,
						})}
						style={{
							[colorProperty.name]:
								counter % 2 === 0 ? "inherit" : "lightyellow",
						}}
					>
						With local overriding (via inline style)
					</div>
				</section>
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
