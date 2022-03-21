<div align="center">
    <h1>🍩 Coulis</h1>
    <strong>Atomic CSS-in-JS library with a tiny runtime</strong>
</div>
<br>
<br>

## Motivation

With the emergence of design system / component library, the style reusability is key. Atomic CSS is a CSS approach which considers each classname as a single CSS rule: more the same rule is used across different components, more the atomic rule is reused and more the CSS filesize is reduced in contrast to other non atomic approach. You can find a great talk about this approach [here](https://www.youtube.com/watch?v=tFFn39lLO-U).

In parallel, CSS-in-JS libraries enable (but not only) huge developer experience improvements by integrating transparently in the JavaScript ecosystem and letting a developer share/consume CSS-in-JS dependencies without extra specific CSS bundle step.

Coulis leverages these two approaches to create a great developer experience while maximazing the reusability of your styles.

## Usage

1️⃣ Install

```bash
# NPM
npm install coulis
# Yarn
yarn add coulis
```

2️⃣ Play with the API ✌️

```tsx
import ReactDOM from "react-dom";
import { atoms, createAtoms, globals, keyframes } from "coulis";

globals({
	"@import":
		"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
	html: {
		boxSizing: "border-box",
	},
	"html,body": {
		padding: 0,
		margin: 0,
		fontFamily: "Open Sans",
	},
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
});

const tabletAtoms = createAtoms("@media", "(min-width: 576px)");

const zoomIn = keyframes({
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

const App = () => {
	return (
		<div
			className={atoms({
				animation: `${zoomIn} 2000ms linear infinite`,
				display: "flex",
				width: "100%",
				height: "100%",
				alignItems: "center",
				justifyContent: "center",
			})}
		>
			<p
				className={[
					atoms({
						color: {
							default: "black",
							":hover": "lightcoral",
						},
						fontSize: 26,
						textAlign: "center",
					}),
					tabletAtoms({ fontSize: 20 }),
				].join(" ")}
			>
				Hello 🤗
			</p>
		</div>
	);
};

ReactDOM.render(<App />, document.getElementById("root"));
```
