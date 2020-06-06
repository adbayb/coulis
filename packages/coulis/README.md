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
				className={css({
					textAlign: "center",
					color: { default: "black", hover: "lightcoral" },
				})}
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

## Principles

<!-- TODO -->
