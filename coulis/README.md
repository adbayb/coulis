<div align="center">
    <h1>🍩 Coulis</h1>
    <strong>Atomic CSS-in-JS library with a tiny runtime</strong>
	<p><img src="https://deno.bundlejs.com/?q=coulis&badge" alt="Package size" /></p>
</div>
<br>
<br>

## 🤔 Motivation

With the emergence of design systems, style reusability is key. Atomic CSS is a CSS approach that considers each class name as a single CSS rule: the more the same rule is used across different components, the more the atomic rule is reused and the more the CSS filesize is reduced in contrast to other non-atomic approaches. You can find a great talk about this approach [here](https://www.youtube.com/watch?v=tFFn39lLO-U).

In parallel, CSS-in-JS libraries enable (but not only) huge developer experience improvements by integrating transparently into the JavaScript ecosystem and letting a developer share/consume CSS-in-JS dependencies without extra specific CSS bundle steps.

Coulis leverages these two approaches to create a great developer experience while maximizing the reusability of your styles.

<br>

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
import { createStyles, setGlobalStyles } from "coulis";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

setGlobalStyles({
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	"@import":
		"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
	"html": {
		boxSizing: "border-box",
	},
	"html,body": {
		fontFamily: "Open Sans",
		margin: 0,
		padding: 0,
	},
});

const styles = createStyles(
	{
		alignItems: true,
		color: ["black", "lightcoral"],
		display: ["flex"],
		fontSize: true,
		height: {
			full: "100%",
		},
		justifyContent: true,
		marginLeft: [0, 4, 8, 16],
		marginRight: [0, 4, 8, 16],
		paddingLeft: [0, 4, 8, 16],
		paddingRight: [0, 4, 8, 16],
		transitionProperty(input: ("color" | "background-color")[]) {
			return input.join(",");
		},
		width: {
			full: "100%",
		},
	},
	{
		loose: ["marginLeft", "marginRight"],
		shorthands: {
			marginHorizontal: ["marginLeft", "marginRight"],
			paddingHorizontal: ["paddingLeft", "paddingRight"],
		},
		states: {
			hover({ className, declaration }) {
				return `${className}:hover{${declaration}}`;
			},
		},
	},
);

const App = () => {
	return (
		<main
			className={styles({
				alignItems: "center",
				display: "flex",
				height: "full",
				justifyContent: "center",
				width: "full",
			})}
		>
			<p
				className={styles({
					color: {
						base: "black",
						hover: "lightcoral",
					},
					fontSize: 26,
					marginHorizontal: "auto",
					paddingHorizontal: 16,
					transitionProperty: ["color"],
				})}
			>
				Hello 🤗
			</p>
		</main>
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

<br>

## 👨‍💻 Usage

This section aims to deep dive into each interface with code examples:

### createStyles

A factory to configure and create type-safe `styles` method.
It returns a `styles` method to generate a class name from a list of type-safe CSS properties:

```tsx
import { createStyles } from "coulis";

const styles = createStyles(
	{
		alignItems: true,
		color: true,
		display: true,
		fontSize: true,
		height: true,
		justifyContent: true,
		textAlign: true,
		width: true,
	},
	{
		states: {
			hover({ className, declaration }) {
				return `${className}:hover{${declaration}}`;
			},
		},
	},
);

export const App = () => {
	return (
		<main
			className={styles({
				alignItems: "center",
				display: "flex",
				height: "100%",
				justifyContent: "center",
				width: "100%",
			})}
		>
			<p
				className={styles({
					color: {
						base: "black",
						hover: "lightcoral",
					},
					fontSize: 26,
					textAlign: "center",
				})}
			>
				Hello 🤗
			</p>
		</main>
	);
};
```

### createKeyframes

A factory to create a `keyframes` rule set globally scoped that describes the animation to apply to an element:

```tsx
import { createKeyframes, createStyles } from "coulis";

const zoomIn = createKeyframes({
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

const styles = createStyles({
	animation: true,
	backgroundColor: true,
	borderRadius: true,
	height: true,
	margin: true,
	width: true,
});

export const App = () => {
	return (
		<div
			className={styles({
				animation: `${zoomIn} 2000ms linear infinite`,
				backgroundColor: "gray",
				borderRadius: 4,
				height: "50px",
				margin: 16,
				width: "50px",
			})}
		/>
	);
};
```

### createVariants

A factory to create one or several styling variants. The first-level field defines the variant name, the second-level field the variant value, and the third-level field the set of CSS properties applied.
It returns a function to select the appropriate variant:

```tsx
import { createStyles, createVariants } from "coulis";

const styles = createStyles({
	backgroundColor: true,
	padding: true,
});

const buttonVariants = createVariants(styles, {
	color: {
		accent: { backgroundColor: "lightcoral" },
		brand: { backgroundColor: "lightseagreen" },
		neutral: { backgroundColor: "lightgrey" },
	},
	size: {
		large: { padding: 18 },
		medium: { padding: 12 },
		small: { padding: 6 },
	},
});

export const App = () => {
	return (
		<button
			className={buttonVariants({
				color: "brand",
				size: "large",
			})}
		>
			Click me!
		</button>
	);
};
```

### createCustomProperties

A factory to create one or several custom properties globally scoped.  
A [custom property](https://www.w3.org/TR/css-variables-1/) is any property whose name starts with two dashes. Its main functional purpose is theming: a theme defines a set of consistent and contextual properties (aka [design tokens](https://www.designtokens.org/glossary/)):

```tsx
import { createCustomProperties, createStyles } from "coulis";

const px = (value: number) => `${value}px`;

const tokens = Object.freeze({
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
});

const theme = createCustomProperties({
	colors: {
		neutralDark: tokens.colors.black,
		neutralLight: tokens.colors.white,
		neutralTransparent: tokens.colors.transparent,
		surfacePrimary: tokens.colors.blue[4],
		surfaceSecondary: tokens.colors.blue[2],
	},
	fontSizes: { body: tokens.fontSizes[2] },
	fontWeights: { body: tokens.fontWeights[1] },
	radii: {
		full: tokens.radii[4],
		large: tokens.radii[3],
		medium: tokens.radii[2],
		none: tokens.radii[0],
		small: tokens.radii[1],
	},
});

const styles = createStyles({
	backgroundColor: theme.colors,
	borderRadius: theme.radii,
	color: theme.colors,
	fontSize: theme.fontSizes,
	fontWeight: theme.fontWeights,
});

export const App = () => {
	return (
		<p
			className={styles({
				backgroundColor: "surfacePrimary",
				borderRadius: "large",
				color: "neutralLight",
				fontSize: "body",
				fontWeight: "body",
			})}
		>
			Hello 👋
		</p>
	);
};
```

### setGlobalStyles

A helper to apply some style rules globally:

```tsx
import { setGlobalStyles } from "coulis";

setGlobalStyles({
	"@import":
		"url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
	"html": {
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
	".text": {
		color: "blue",
		fontSize: 16,
	},
});

export const App = () => {
	return <span className="text">Hello 🤗</span>;
};
```

### createServerContext

A factory to initialize a server context and expose helpers to enable server-side rendering. It helps prevent what is known as FOUC (Flash Of Unstyled Content) on the browser side.

Here's a vanilla React integration example generating HTML content:

```tsx
import { renderToString } from "react-dom/server";
import { createServerContext } from "coulis";
import { App } from "./App"; // Main component entry point (depending on your project specificities).

export const renderHtml = () => {
	const serverContext = createServerContext(); // Must be called before `renderToString` to initialize the server context beforehand.
	const bodyContent = renderToString(<App />);
	const headContent = serverContext.getMetadataAsString(); // Must be called after initial rendering to retrieve generated styles after the `renderToString` traversal.

	return `<html>
		<head>
			${headContent}
		</head>
		<body>
			<div id="root>${bodyContent}</div>
		</body>
	</html>`;
};
```

For more server-side integration recipes, the following examples can be checked:

- **React**
    - [Next.js with the app router](./examples/nextjs-app-router/), more specifically, [this snippet](./examples/nextjs-app-router/src/components/CoulisRegistry.tsx).
    - [Next.js with the pages router](./examples/nextjs-pages-router/), more specifically, [this snippet](examples/nextjs-pages-router/src/pages/_document.tsx).
    - [Vite.js with server-side rendering](./examples/vite-ssr-react/), more specifically, [this snippet](examples/vite-ssr-react/src/entry-server.tsx).
- **Angular**
    - Welcome to any contribution.
- **Vue**
    - Welcome to any contribution.
- **...**
    - Welcome to any contribution.

<br>

## Road to v2

```tsx
import { createCoulis } from "coulis";
import { webAdapter } from "coulis/web";

const coulis = createCoulis({
	adapter: webAdapter,
	contract(theme) {
		return {
			properties: {
				animation: true,
				backgroundColor: theme.colors,
				colorScheme(input: "black" | "white") {
					return input === "black" ? "dark" : "light";
				},
				width: [50, 100],
			},
			shorthands: {
				marginHorizontal: ["marginLeft", "marginRight"],
				marginVertical: ["marginTop", "marginBottom"],
				paddingHorizontal: ["paddingLeft", "paddingRight"],
				paddingVertical: ["paddingTop", "paddingBottom"],
			},
			states: {
				hover: ({ className, declaration }) =>
					`${className}:hover{${declaration}}`,
				large: ({ className, declaration }) =>
					`@media (min-width: 1024px){${className}{${declaration}}}`,
				medium: ({ className, declaration }) =>
					`@media (min-width: 768px){${className}{${declaration}}}`,
				small: ({ className, declaration }) =>
					`@media (min-width: 360px){${className}{${declaration}}}`,
				smallWithHover: ({ className, declaration }) =>
					`@media (min-width: 360px){${className}:hover{${declaration}}}`,
			},
		};
	},
	theme: {
		colors: {
			neutralDark: tokens.colors.black,
			neutralLight: tokens.colors.white,
			neutralTransparent: tokens.colors.transparent,
			surfacePrimary: tokens.colors.blue[4],
			surfaceSecondary: tokens.colors.blue[2],
		},
		fontSizes: {
			body: tokens.fontSizes[2],
		},
	},
});

coulis.styles();
coulis.keyframes();
coulis.globalStyles();
coulis.customProperties(); // Allow setting global variables (same logic is used inside the createCoulis factory in case value are passed (a variable is automatically created))
coulis.metadata(); // object + toString();
```
