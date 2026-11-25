---
"coulis": patch
---

Make the web runtime faster on the client and the server, with the same class names and rules.

- `createStyles` caches class names by property, state, and value: repeated values skip value resolution, hashing, and rule lookups. Cached style creation is ~1.2x to ~3x faster (a single property: ~3x on Node.js, ~2x on Chromium; state variants: ~2x on Node.js, ~1.7x on Chromium), and new rules are created ~13% faster.
- `getStyleSheets` reuses its serialization on the server until a rule is inserted or removed (constant time instead of re-serializing every rule on each call).
- Array values no longer add a cache entry on each call.
- Fix range queries (e.g. `@media (width < 600px)`) in server-rendered and global rules: only `</` is escaped in CSS text (it is enough to prevent closing the `<style>` element), whereas every `<` was escaped before, turning comparisons into invalid queries.
- Simplify the implementation: unconditional values are the `base` state of a single rule creation path, and theme custom properties are created without path arrays.

The web bundle grows from 2.34 kB to 2.42 kB (minified + gzip).
