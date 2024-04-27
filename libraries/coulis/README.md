<div align="center">
    <h1>🍩 Coulis</h1>
    <strong>Atomic CSS-in-JS library with a tiny runtime</strong>
</div>
<br>
<br>

## 🤔 Motivation

With the emergence of design systems, style reusability is key. Atomic CSS is a CSS approach that considers each class name as a single CSS rule: the more the same rule is used across different components, the more the atomic rule is reused and the more the CSS filesize is reduced in contrast to other non-atomic approaches. You can find a great talk about this approach [here](https://www.youtube.com/watch?v=tFFn39lLO-U).

In parallel, CSS-in-JS libraries enable (but not only) huge developer experience improvements by integrating transparently into the JavaScript ecosystem and letting a developer share/consume CSS-in-JS dependencies without extra specific CSS bundle steps.

Coulis leverages these two approaches to create a great developer experience while maximizing the reusability of your styles.

## 🚀 Quickstart

1️⃣ Install

```bash
# Npm
npm install coulis
# Pnpm
pnpm add coulis
# Yarn
yarn add coulis
```

2️⃣ Play ✌️

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
	styles,
	createStyles,
	globalStyles,
	createAnimationName,
} from "coulis";

globalStyles({
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

const tabletStyles = createStyles("@media", "(min-width: 576px)");

const zoomIn = createAnimationName({
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
			className={styles({
				animation: `${zoomIn} 2000ms linear infinite`,
				display: "flex",
				width: "100%",
				height: "100%",
				alignItems: "center",
				justifyContent: "center",
			})}
		>
			<p
				className={compose(
					styles({
						color: {
							default: "black",
							":hover": "lightcoral",
						},
						fontSize: 26,
						textAlign: "center",
					}),
					tabletStyles({ fontSize: 20 }),
				)}
			>
				Hello 🤗
			</p>
		</div>
	);
};

const container = document.getElementById("root");

if (container) {
	const root = createRoot(container);

	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
```
