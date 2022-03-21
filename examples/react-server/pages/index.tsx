import { atoms, createAtoms, globals, keyframes } from "coulis";

globals({
	"@charset": '"utf-8"',
	"@import":
		"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
	html: {
		boxSizing: "border-box",
	},
	"html,body": {
		padding: 0,
		margin: 0,
		fontFamily: "Open Sans, AliasedHelvetica",
	},
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	".globalClass+.otherGlobalClass": {
		border: "1px solid black",
		borderRadius: 4,
	},
	"@font-face": {
		fontFamily: "'AliasedHelvetica'",
		src: "local(Helvetica)",
	},
});

const largerAtoms = createAtoms("@media", "(min-width: 576px)");

const animationName = keyframes({
	from: {
		transform: "scale(1)",
	},
	50: {
		transform: "scale(1.5)",
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
						largerAtoms({
							color: "blue",
							padding: 24,
						}),
					].join(" ")}
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
					data-plop={false}
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
						width: 50,
						height: 50,
						backgroundColor: "lightgray",
						borderRadius: 4,
					})}
				/>
			</div>
		</div>
	);
}

export default App;
