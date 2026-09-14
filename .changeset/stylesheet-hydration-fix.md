---
"coulis": patch
---

Fix client-side hydration tracking: the DOM stylesheet now records inserted class names in `data-coulis-cache`, so later instances on the same page reuse them instead of re-inserting duplicate rules. Also collapse the React Native `transformers` barrel into `dimension.ts` and move the web adapter test setup into `beforeAll`.
