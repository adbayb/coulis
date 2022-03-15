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

-   `npm i coulis --save` or `yarn add coulis`
-   Play with the API

<details>
<summary><b>React</b></summary>
<p>

```typescript
import ReactDOM from "react-dom";
import { css } from "coulis";

const cssSmallScreen = createCss("@media (max-width: 400px)");

const App = () => {
	return (
		<div
			className={css({
				display: "flex",
				width: "100%",
				height: "100%",
				alignItems: "center",
				justifyContent: "center",
			})}
		>
			<p
				className={[
					css({
						color: {
							default: "black",
							":hover": "lightcoral",
						},
						fontSize: 26,
						textAlign: "center",
					}),
					cssSmallScreen({ fontSize: 20 }),
				].join(" ")}
			>
				Hello 🤗
			</p>
		</div>
	);
};

ReactDOM.render(<App />, document.getElementById("root"));
```

</p>
</details>

## TODO

-   [x] Atomic API
-   [x] Conditional at rule API
-   [x] Client side support
-   [x] keyframes API
-   [x] Global css API (api naming to be reviewed)
-   [x] Server side support
-   [x] CSS type support
-   [ ] Documentation (principles, homepage, ...)
