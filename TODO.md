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

-   [ ] Update `createAtoms` to check if the argument starts with `@media|@supports` (throw a runtime warning otherwise) + use TS template string to force type starting with `@media|@supports `${string}``

-   [ ] Update `keyframes` to accept and handle number as percentage + update type to enforce percentage via TS template string `${number}%`

- [ ] Update README.md before release

- [ ] Check `extractStyles` API with multiple server side case
