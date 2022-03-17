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
	"html, body": {
		margin: 0,
		padding: 0,
	},
	"#app": {
		display: "flex",
	},
});
```

-   [ ] Update `createAtoms` to check if the argument starts with `@media|@supports|@layer|@page...` (throw a runtime warning otherwise) + use TS template string to force type starting with `@media|@supports `${string}``

-   [ ] Update `keyframes` to accept and handle number as percentage + update type to enforce percentage via TS template string `${number}%`

-   [ ] Update `globals` to support non conditional at rules such as `@import|@charset...` by introducing a dedicated key to inject rules:

```ts
globals({
	"@": {
		import: "url(http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,700italic,300,400,700)",
		charset: "UTF-8",
	},
});
```

-   [ ] Update README.md before release

-   [ ] Check `extractStyles` API with multiple server side case
