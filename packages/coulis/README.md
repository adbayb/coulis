<div align="center">
    <h1>🍩 Coulis</h1>
    <strong>Yet another atomic CSS-in-JS library</strong>
</div>
<p></p>

## Usage

-   `npm i coulis --save` or `yarn add coulis`
-   Play with the API

<details>
<summary><b>React</b></summary>
<p>

```typescript
import React from "react";
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
-   [ ] keyframes API
-   [ ] Global css API
-   [ ] Compose (cx) API ?
-   [ ] Server side support
-   [ ] Documentation (principles, homepage, ...)
