<div align="center">
    <h1>🍩 Coulis</h1>
    <strong>Atomic CSS-in-JS library with a tiny runtime and no build setup</strong>
	<p><img src="https://deno.bundlejs.com/?q=coulis&badge" alt="Package size" /></p>
</div>
<br>
<br>

## ✨ Features

`Coulis` styles web and React Native applications from JavaScript, with:

- **No build setup**: styles are created at runtime, so there is no compiler, bundler plugin, or CSS extraction step to install, configure, and keep in sync with your toolchain. Install the package, import it, and style: it works the same way whatever the bundler (see the [examples](#-examples) with Vite, Next.js, and Expo, none of which configures anything for Coulis), and a library styled with Coulis is consumed like any other JavaScript dependency.
- Atomic CSS: each property and value pair creates one rule and one class name, reused by every component setting it, so the style sheet grows with the number of distinct values instead of the number of components.
- A typed contract: the properties, theme tokens (exposed as CSS custom properties on the web), custom shorthands, and states (pseudo-classes, media or container queries, ...) accepted by your styles are declared once and checked by TypeScript.
- Global styles and keyframes with the same contract (`setGlobalStyles` and `createKeyframes`).
- [Server-side rendering](#how-to-implement-server-side-rendering), with either the critical styles of a rendered HTML or every style created so far (for streaming).
- [React Native support](#how-to-use-coulis-with-react-native) through a dedicated entry point sharing the same contract.
- A tiny runtime without any dependency, measured against other CSS-in-JS libraries in the [benchmarks](#-benchmarks) (runtime performance and bundle size).

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

Rendering style sheets on the server prevents FOUC (Flash Of Unstyled Content), where the user briefly sees unstyled content before styles apply in the browser. Coulis provides two methods returning the style sheets to render in the `<head />`, as `{ attributes, content }` objects (`String()` on the result gives the `<style>` tags):

| Method                         | Returns                                                                                        | Use when                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `getCriticalStyleSheets(html)` | The style sheets a rendered HTML needs: its atomic rules, plus every global rule and keyframes | The rendered HTML is available (e.g. `renderToString`)        |
| `getStyleSheets()`             | Every style sheet generated so far by the instance                                             | The rendered HTML is not available (e.g. streaming rendering) |

Styles are cached for the instance lifetime, so a server instance shares them across requests: prefer `getCriticalStyleSheets` so each page only ships its own CSS.

With the rendered HTML (critical styles):

```tsx
import { renderToString } from "react-dom/server";
import { App } from "./App"; // Main component entry point (depending on your project specificities).
import { coulis } from "./helpers/coulis"; // Factory instance created via `createCoulis` (see quickstart guide)

export const renderHtml = () => {
	const bodyContent = renderToString(<App />);
	const headContent = String(coulis.getCriticalStyleSheets(bodyContent));

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

With streaming rendering (here, the Next.js app router), call `getStyleSheets` once the styles are generated:

```tsx
useServerInsertedHTML(() => {
	return getStyleSheets().map(({ attributes, content }) => {
		return (
			<style
				{...attributes}
				key={attributes["data-coulis-type"]}
				dangerouslySetInnerHTML={{ __html: content }}
			/>
		);
	});
});
```

In the browser, rules are inserted synchronously: styles apply as soon as `createStyles` returns, so layout reads made right after (for example, in React layout effects) see the styled layout.

For more server-side integration recipes, the following examples can be checked:

- **React**
    - [Next.js with the app router](https://github.com/adbayb/coulis/tree/main/examples/nextjs-app-router), more specifically, [this snippet](https://github.com/adbayb/coulis/tree/main/examples/nextjs-app-router/src/components/coulis-registry.tsx).
    - [Next.js with the pages router](https://github.com/adbayb/coulis/tree/main/examples/nextjs-pages-router), more specifically, [this snippet](https://github.com/adbayb/coulis/tree/main/examples/nextjs-pages-router/src/pages/_document.tsx).
    - [Vite.js with server-side rendering](https://github.com/adbayb/coulis/tree/main/examples/vite-ssr-react), more specifically, [this snippet](https://github.com/adbayb/coulis/tree/main/examples/vite-ssr-react/src/entry-server.tsx).
- **Other frameworks** (Angular, Vue, ...)
    - Welcome to any contribution.

### How to update or remove global styles?

`setGlobalStyles` returns a function that removes the rules. Calls with the same input are reference counted: rules are removed once every caller has removed them. It allows, for example, theme-dependent global styles set by nested providers:

```tsx
useInsertionEffect(() => {
	return setGlobalStyles({
		body: { backgroundColor: theme.surface, color: theme.text },
	});
}, [theme]);
```

### How to add vendor prefixes?

Coulis outputs only the declarations you write, so prefixes follow your own browser targets instead of a built-in list. Declare prefixed properties and expand them with a shorthand of the same name (a shorthand creates one class name holding all its declarations):

```ts
const { createStyles } = createCoulis({
	properties() {
		return { userSelect: true, WebkitUserSelect: true };
	},
	shorthands: {
		userSelect: ["WebkitUserSelect", "userSelect"], // `userSelect: "none"` outputs `.c1{-webkit-user-select:none;user-select:none;}`
	},
});
```

### How to speed up rendering with styles created once?

`createStyles` can be called during render: class names are cached, so a repeated value only costs cache lookups (its property, then its value) instead of creating a rule. This cost still grows with the number of values and of rendered elements. For styles that do not depend on props or state, call `createStyles` in the module scope: the class names are created once, when the module is evaluated, and a render only reads a string.

```tsx
const itemClassName = createStyles({
	alignItems: "center",
	display: "flex",
	paddingHorizontal: "large",
});

const evenItemClassName = createStyles({ backgroundColor: "neutralLight" });
const oddItemClassName = createStyles({ backgroundColor: "neutralTransparent" });

export const List = ({ items }: { items: string[] }) => {
	return (
		<ul>
			{items.map((item, index) => {
				const backgroundClassName = index % 2 === 0 ? evenItemClassName : oddItemClassName;

				return (
					<li
						key={item}
						className={`${itemClassName} ${backgroundClassName}`}
					>
						{item}
					</li>
				);
			})}
		</ul>
	);
};
```

It brings the rendering time down to the one of a build-time CSS-in-JS library such as [StyleX](https://stylexjs.com), whose compiler leaves static class names in the bundle. Mounting then unmounting a list of 6,000 elements, each setting nine properties (one with a media query state) and alternating between two background colors:

| Styles                                                 |   Time |
| ------------------------------------------------------ | -----: |
| StyleX, styles compiled at build time                  | 4.9 ms |
| Coulis, `createStyles` called once in the module scope | 4.9 ms |
| Coulis, `createStyles` called during render            | 7.4 ms |

Median of three runs in headless Chromium with React production builds. These results are hardware- and runtime-dependent.

A value only known during render keeps its own call, next to the class names created once:

```tsx
<li className={`${itemClassName} ${createStyles({ color })}`}>{item}</li>
```

Set each property in a single call: class names from separate calls are not merged, so two rules setting the same property apply in the order they were created, whatever the order of the class names.

Rules created in the module scope are part of the instance like any other: `getCriticalStyleSheets(html)` returns them for the pages using their class names.

### How to use Coulis with React Native?

Import from the dedicated entry point:

```ts
import { createCoulis } from "coulis/react-native";
```

The API is identical to the web adapter with the following differences:

| Method                                     | Web                                           | React Native                                       |
| ------------------------------------------ | --------------------------------------------- | -------------------------------------------------- |
| `createStyles`                             | Returns a CSS class name string               | Returns a style object (`Record<string, unknown>`) |
| `createKeyframes`                          | Injects `@keyframes` rule, returns class name | ⚠️ Not supported — logs a warning and returns `{}` |
| `setGlobalStyles`                          | Injects global CSS rules                      | ⚠️ Not supported — logs a warning and does nothing |
| `getStyleSheets`, `getCriticalStyleSheets` | Return style sheets to render (for SSR)       | ⚠️ Not supported — logs a warning and returns `[]` |

Theme values are passed as-is (raw values, not CSS custom properties).

<br>

## 📊 Benchmarks

### Runtime performance

Median of three runs of `pnpm --filter @coulis/benchmark benchmark`, rendering a 1,000-row React table with React production builds (each library runs in a page of its own in the browser, and in a process of its own on the server). Higher throughput is better; dynamic styles are created during each render, except for StyleX whose styles are compiled at build time (one per value, selected during render with `props`). The server case renders to a string and extracts its styles (critical styles for Coulis with `getCriticalStyleSheets(html)` and for Emotion with `extractCritical`; none for StyleX, whose styles are a build-time style sheet).

| Runtime         | Coulis |           Emotion |              Goober | styled-components |              StyleX |
| --------------- | -----: | ----------------: | ------------------: | ----------------: | ------------------: |
| Browser (ops/s) |  1,843 | 815 (2.3x slower) |   878 (2.1x slower) | 469 (3.9x slower) | 1,685 (1.1x slower) |
| Server (ops/s)  |  1,183 | 602 (2.0x slower) | 1,032 (1.1x slower) | 249 (4.8x slower) | 1,360 (1.1x faster) |

These results are hardware- and runtime-dependent.

### Bundle size

Minified, tree-shaken browser ESM bundles measured with esbuild 0.28.2 (`bundle: true`, `minify: true`, `target: "es2020"`) and Node.js gzip at level 9, with `process.env.NODE_ENV` set to `"production"` and React/React DOM excluded. Sizes include bundled dependencies and use decimal kB (1 kB = 1,000 bytes).

| Library                     | Version   | Minified + gzip |
| --------------------------- | --------- | --------------: |
| Coulis                      | workspace |         2.58 kB |
| Emotion (`@emotion/css`)    | 11.13.5   |         6.28 kB |
| Goober                      | 2.1.19    |         1.11 kB |
| styled-components           | 6.6.0     |        10.99 kB |
| StyleX (`@stylexjs/stylex`) | 0.19.2    |         0.85 kB |

Each bundle re-exports `createCoulis` (Coulis), `css` (Emotion and Goober), `styled` (styled-components), or `props` (StyleX, whose compiled styles ship in a separate style sheet). Coulis includes its web factory's styling and style sheet APIs; these libraries have different feature sets. Application bundles vary with imports, bundler settings, and library versions.

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
