-   [ ] Rename `css` and `createCss` to `styles` and `createStyles` API

-   [ ] Update `keyframes` API to be autocomplete friendly (by replacing template string with object driven API):

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

-   [ ] Rename `raw` API to `globals` and make it consistent with `keyframes` API:

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
