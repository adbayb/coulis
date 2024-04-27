-   [x] Update `keyframes` API to be autocomplete friendly (by replacing template string with object driven API):

```ts
keyframes({
	from: {
		color: "blue",
	},
	to: {
		color: "red",
	},
});
```

-   [x] Make `globals` API consistent with `keyframes` one:

```ts
globals({
	"html,body": {
		margin: 0,
		padding: 0,
	},
	"#app": {
		display: "flex",
	},
});
```

-   [x] Update `createAtoms` to be more TS friendly:

```ts
const tabletAtoms = createAtoms("@media", "(min-width: 0px)");
```

-   [x] Update `keyframes` to accept and handle number as percentage + update type to enforce percentage via TS template string `${number}%`

-   [x] Update `globals` to support non conditional at rules such as `@import|@charset...` by introducing a dedicated key to inject rules:

```ts
globals({
	"@import":
		"url(http://fonts.googleapis.com/css?family=Open+Sans:300,400,700)",
	"@charset": "UTF-8",
});
```

-   [x] Add `conditional-shorthand/conditional-longhand` to manage conditional specificities

-   [x] Make `extractStyles` API hydration works with multiple server side case

-   [x] Update dependencies and migrate to `@adbayb/stack` (including PNPM migration)

-   [x] Rename `atoms` and `createAtoms`` to `styles`and`createStyles`

-   [x] Prevent memory leaks server side

-   [ ] Add `variables` API to define variable(s) (useful for reusable tokens)

-   [ ] Add `createVariants` API (ala [cva-like](https://cva.style/docs) or [vanilla extract](https://vanilla-extract.style/documentation/packages/recipes/))

-   [ ] Improve overall performance

-   [ ] Update README.md before release (add features and principles (especially, specificity management))

-   [ ] Create homepage (low priority)
