---
"coulis": patch
---

Make the web runtime faster on the client and the server, without changing its behavior (same class names, rules, and style sheets).

- `createStyles` caches class names by property, state, and value: repeated values skip value resolution, hashing, and rule lookups. Cached style creation is ~1.2x to ~3x faster (a single property: ~3x on Node.js, ~2x on Chromium; state variants: ~2x on Node.js, ~1.7x on Chromium), and new rules are created ~13% faster.
- `getStyleSheets` reuses its serialization on the server until a rule is inserted or removed (constant time instead of re-serializing every rule on each call).
- Array values no longer add a cache entry on each call.
- Simplify the implementation: unconditional values are the `base` state of a single rule creation path, and theme custom properties are created without path arrays.

The web bundle grows from 2.34 kB to 2.42 kB (minified + gzip).
