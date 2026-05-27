---
"coulis": patch
---

Performance improvements:

- **Web / DOM stylesheet**: CSS rules are now batched and flushed in a single `textContent` write instead of one `insertAdjacentText` call per rule, reducing style recalculations during initial render.
- **Web / virtual stylesheet (SSR)**: the minified CSS string returned by `getMetadata` is cached after the first computation instead of being recomputed on every call.
- **React Native**: `Dimensions.get("window")` is now memoized inside dimension transformers instead of being called on every `vh`/`vw` conversion.
