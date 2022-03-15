import { createCss, css, keyframes, raw } from "coulis";

const cssTablet = createCss("@media (min-width: 400px)");

raw(`
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
				className={css({
					padding: 10,
					backgroundColor: "lightblue",
					borderRadius: 4,
				})}
			>
				<p
					className={css({
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
						css({
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
						cssTablet({
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
					className={css({
						animation: `${animationName} 500ms ease alternate infinite`,
					})}
				>
					Some heartbeat effect
				</div>
				<div
					className={css({
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
