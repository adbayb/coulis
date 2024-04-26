import { atoms, createAtoms, globals, keyframes } from "coulis";

globals({
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	".globalClass+.otherGlobalClass": {
		border: "1px solid black",
		borderRadius: 4,
	},
	"@charset": '"utf-8"',
	"@font-face": {
		fontFamily: "'AliasedHelvetica'",
		src: "local(Helvetica)",
	},
	"@import":
		"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
	html: {
		boxSizing: "border-box",
	},
	"html,body": {
		fontFamily: "Open Sans, AliasedHelvetica",
		margin: 0,
		padding: 0,
	},
});

const largerAtoms = createAtoms("@media", "(min-width: 576px)");

const animationName = keyframes({
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

function App() {
	return (
		<div>
			<header
				className={atoms({
					backgroundColor: "lightblue",
					borderRadius: 4,
					padding: 10,
				})}
			>
				<p
					className={atoms({
						color: {
							":hover": "red",
							default: "blue",
						},
					})}
				>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<a
					className={[
						atoms({
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
						largerAtoms({
							color: "blue",
							padding: 24,
						}),
					].join(" ")}
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
				className={atoms({
					padding: 24,
				})}
			>
				<div
					className={atoms({
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
}

export default App;
