---
"coulis": patch
---

Cache `createStyles` output in the React Native adapter. Identical style inputs now return the same object reference on subsequent calls instead of recomputing the style object every time.
