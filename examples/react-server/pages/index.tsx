import { atoms, createAtoms, globals, keyframes } from "coulis";

const tabletAtoms = createAtoms("@media (min-width: 400px)");

globals(`
	html, body {
		background-color: lightcoral;
	}

	div {
		color: red;
	}
`);

const animationName = keyframes(`
from {
	transform: scale(1);
}

to {
	transform: scale(1.015);
}
`);

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
		</div>
	);
}

export default App;
