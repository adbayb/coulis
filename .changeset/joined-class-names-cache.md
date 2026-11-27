---
"coulis": patch
---

Make `createStyles` faster on the web for style objects with several properties, with the same class names and rules.

- Joined class names are kept by their parts: a repeated style input gets the very same string back instead of a new concatenation on each call. Server rendering of components calling `createStyles` during render is ~4% to ~10% faster (the returned string is already flattened when React escapes the `class` attribute), single-property inputs are unchanged.
- The cache is bounded (8,192 class name prefixes): beyond, class names are concatenated as before.
- Bundle size: +70 bytes (minified + gzip).
