import React from "react";
import { css, createCss } from "coulis";

const cssTablet = createCss("@media (min-width: 400px)");

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
						css(
							{
								color: {
									default: "yellow",
									"[target=_blank]": "green",
								},
							},
							{
								backgroundColor: {
									default: "purple",
									"[data-plop=true]": "red",
								},
							},
							{
								color: {
									":hover": "purple",
									default: "red",
									"[target=_blank]": undefined,
								},
							},
							{
								color: "yellow",
							}
						),
						cssTablet(
							{
								color: "red",
							},
							{
								color: "blue",
							}
						),
					].join(" ")}
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
					data-plop={false}
				>
					Learn React
				</a>
			</header>
		</div>
	);
}

export default App;
