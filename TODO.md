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

-   [ ] Make `globals` API consistent with `keyframes` one:

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
