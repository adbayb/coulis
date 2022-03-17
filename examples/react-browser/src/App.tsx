import { atoms, createAtoms, globals, keyframes } from "coulis";

globals({
	html: {
		boxSizing: "border-box",
	},
	"html, body": {
		padding: 0,
		margin: 0,
		backgroundColor: "lightcoral",
		fontFamily: "Open Sans",
	},
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	".globalClass+.otherGlobalClass": {
		border: "1px solid black",
		borderRadius: 4,
	},
	"@font-face": {
		fontFamily: '"Open Sans"',
		color: "blue",
		src: 'url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"), url("/fonts/OpenSans-Regular-webfont.woff") format("woff")',
	},
});

const tabletAtoms = createAtoms("@media (min-width: 400px)");

const animationName = keyframes({
	from: {
		transform: "scale(1)",
	},
	to: {
		transform: "scale(1.015)",
	},
});

function App() {
	return (
		<div>
			<header
				className={atoms({
					padding: 10,
					backgroundColor: "lightblue",
					borderRadius: 4,
				})}
			>
				<p
					className={atoms({
						color: {
							default: "blue",
							":hover": "red",
						},
					})}
				>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<a
					className={[
						atoms({
							display: "flex",
							backgroundColor: {
								default: "lightcoral",
								"[data-plop=true]": "red",
							},
							color: {
								default: "yellow",
								":hover": "purple",
								"[target=_blank]": undefined,
							},
						}),
						tabletAtoms({
							color: "blue",
						}),
					].join(" ")}
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
					data-plop={false}
				>
					Learn React
				</a>
				<div
					className={atoms({
						animation: `${animationName} 500ms ease alternate infinite`,
					})}
				>
					Some heartbeat effect
				</div>
				<div
					className={atoms({
						animation: `${animationName} 500ms ease alternate infinite`,
					})}
				>
					Some heartbeat effect
				</div>
			</header>
			<span className="globalClass">GlobalClass</span>
			<span className="otherGlobalClass">OtherGlobalClass</span>
		</div>
	);
}

export default App;
