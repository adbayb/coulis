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
import { createCoulis } from "coulis";

const { createKeyframes, createStyles, setGlobalStyles } = createCoulis({
	properties(theme) {
		return {
			alignItems: true,
			animation: true,
			backgroundColor: theme.colors,
			boxSizing: true,
			color: theme.colors,
			display: ["flex"],
			fontFamily: true,
			fontSize: true,
			height: theme.sizes,
			justifyContent: true,
			margin: theme.spacings,
			marginLeft: theme.spacings,
			marginRight: theme.spacings,
			padding: theme.spacings,
			paddingLeft: theme.spacings,
			paddingRight: theme.spacings,
			transitionProperty(input: ("background-color" | "color")[]) {
				return input.join(",");
			},
			width: theme.sizes,
		};
	},
	shorthands: {
		marginHorizontal: ["marginLeft", "marginRight"],
		paddingHorizontal: ["paddingLeft", "paddingRight"],
	},
	states: {
		hover: "coulis[selector]:hover{coulis[declaration]}",
	},
	theme: {
		colors: {
			neutralDark: "black",
			neutralLight: "white",
			neutralTransparent: "transparent",
		},
		sizes: {
			full: "100%",
		},
		spacings: {
			none: 0,
			small: 4,
			medium: 8,
			large: 12,
		},
	},
});

setGlobalStyles({
	"*,*::before,*::after": {
		boxSizing: "inherit",
	},
	"@import": "url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap')",
	"html": {
		boxSizing: "border-box",
	},
	"html,body": {
		fontFamily: "Open Sans",
		margin: "none",
		padding: "none",
	},
});

const colorAnimation = createKeyframes({
	from: {
		backgroundColor: "neutralLight",
	},
	to: {
		backgroundColor: "neutralDark",
	},
});

export const App = () => {
	return (
		<main
			className={createStyles({
				alignItems: "center",
				animation: `${colorAnimation} 2000ms linear infinite`,
				display: "flex",
				height: "full",
				justifyContent: "center",
				width: "full",
			})}
		>
			<p
				className={createStyles({
					color: {
						base: "neutralDark",
						hover: "neutralLight",
					},
					fontSize: 26,
					marginHorizontal: "medium",
					paddingHorizontal: "large",
					transitionProperty: ["background-color", "color"],
				})}
			>
				Hello 🤗
			</p>
		</main>
	);
};
```

<br>

## 👨‍🍳 Patterns

### How to implement server-side rendering?

Coulis provides a dedicated method called `getMetadata` that allows collecting style instructions for injecting into the `<head />` section of the web page.  
Its primary use case is server-side rendering. The getter helps prevent the FOUC (Flash Of Unstyled Content) issue, where the user briefly sees the unstyled content before the styles are applied on the browser side.

Here's a vanilla React integration example generating HTML content:

```tsx
import { renderToString } from "react-dom/server";
import { App } from "./App"; // Main component entry point (depending on your project specificities).
import { coulis } from "./helpers/coulis"; // Factory instance created via `createCoulis` (see quickstart guide)

export const renderHtml = () => {
	const bodyContent = renderToString(<App />);
	const headContent = String(coulis.getMetadata()); // Must be get after the `renderToString` traversal to retrieve generated styles.

	return `<html>
		<head>
			${headContent}
		</head>
		<body>
			<div id="root">${bodyContent}</div>
		</body>
	</html>`;
};
```

For more server-side integration recipes, the following examples can be checked:

- **React**
    - [Next.js with the app router](./examples/nextjs-app-router/), more specifically, [this snippet](./examples/nextjs-app-router/src/components/CoulisRegistry.tsx).
    - [Next.js with the pages router](./examples/nextjs-pages-router/), more specifically, [this snippet](./examples/nextjs-pages-router/src/pages/_document.tsx).
    - [Vite.js with server-side rendering](./examples/vite-ssr-react/), more specifically, [this snippet](./examples/vite-ssr-react/src/entry-server.tsx).
- **Angular**
    - Welcome to any contribution.
- **Vue**
    - Welcome to any contribution.
- **...**
    - Welcome to any contribution.

### How to use Coulis with React Native?

Import from the dedicated entry point:

```ts
import { createCoulis } from "coulis/react-native";
```

The API is identical to the web adapter with the following differences:

| Method            | Web                                           | React Native                                       |
| ----------------- | --------------------------------------------- | -------------------------------------------------- |
| `createStyles`    | Returns a CSS class name string               | Returns a style object (`Record<string, unknown>`) |
| `createKeyframes` | Injects `@keyframes` rule, returns class name | ⚠️ Not supported — logs a warning and returns `{}` |
| `setGlobalStyles` | Injects global CSS rules                      | ⚠️ Not supported — logs a warning and does nothing |
| `getMetadata`     | Returns injected style sheets (for SSR)       | ⚠️ Not supported — logs a warning and returns `[]` |

Theme values are passed as-is (raw values, not CSS custom properties).

<br>

## 📊 Benchmarks

### Runtime performance

Single-run results from `pnpm --filter @coulis/benchmark benchmark`, rendering a 1,000-row React table. Higher throughput is better; dynamic styles are created during each render.

| Runtime                       | Coulis |           Emotion |             Goober | styled-components |
| ----------------------------- | -----: | ----------------: | -----------------: | ----------------: |
| Browser (ops/s)               |  1,634 | 799 (2.0x slower) |  440 (3.7x slower) | 433 (3.8x slower) |
| Server-side rendering (ops/s) |    154 | 138 (1.1x slower) | 153 (1.01x slower) |  72 (2.1x slower) |

These results are hardware- and runtime-dependent. The benchmark also reports static-style baselines for context.

### Bundle size

Minified, tree-shaken browser ESM bundles measured with esbuild 0.28.2 (`bundle: true`, `minify: true`, `target: "es2020"`) and Node.js gzip at level 9, with `process.env.NODE_ENV` set to `"production"` and React/React DOM excluded. Sizes include bundled dependencies and use decimal kB (1 kB = 1,000 bytes).

| Library                  | Version   | Minified + gzip |
| ------------------------ | --------- | --------------: |
| Coulis                   | workspace |         2.32 kB |
| Emotion (`@emotion/css`) | 11.13.5   |         6.28 kB |
| Goober                   | 2.1.19    |         1.11 kB |
| styled-components        | 6.6.0     |        10.99 kB |

Each bundle re-exports `createCoulis` (Coulis), `css` (Emotion and Goober), or `styled` (styled-components). Coulis includes its web factory's styling and metadata APIs; these libraries have different feature sets. Application bundles vary with imports, bundler settings, and library versions.

<br>

## 🔭 Examples

Working integrations are available in the [`examples/`](https://github.com/adbayb/coulis/tree/main/examples) directory:

| Example                                                                                        | Description                         |
| ---------------------------------------------------------------------------------------------- | ----------------------------------- |
| [vite-csr-react](https://github.com/adbayb/coulis/tree/main/examples/vite-csr-react)           | Vite + React, client-side rendering |
| [vite-ssr-react](https://github.com/adbayb/coulis/tree/main/examples/vite-ssr-react)           | Vite + React, server-side rendering |
| [nextjs-app-router](https://github.com/adbayb/coulis/tree/main/examples/nextjs-app-router)     | Next.js with the App Router         |
| [nextjs-pages-router](https://github.com/adbayb/coulis/tree/main/examples/nextjs-pages-router) | Next.js with the Pages Router       |
| [expo](https://github.com/adbayb/coulis/tree/main/examples/expo)                               | React Native via Expo               |

<br>
