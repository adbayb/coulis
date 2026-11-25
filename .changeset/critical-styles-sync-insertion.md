---
"coulis": minor
---

Fill gaps found while migrating a design system from Emotion, without increasing the web bundle size (2.34 kB minified + gzip) nor degrading cached style creation.

- `getMetadata(html)` extracts the critical styles of a server render: only the atomic rules whose class names are used in the given HTML are returned (global rules and keyframes are always kept), so pages no longer ship every style generated since the server started.
- Browser rules are inserted synchronously (through `insertRule` for atomic rules), so layout reads made right after `createStyles` (for example, in React layout effects) see the styled layout. Invalid or unsupported rules are ignored instead of throwing.
- `setGlobalStyles` returns a function removing the rules. Calls with the same input are reference counted, so nested callers can safely add and remove the same theme-dependent global styles.
- Instances targeting the same `<style>` elements share their inserted rules, so a rule is never inserted twice.
- No empty `:root{}` rule is generated without a theme.
- Instances share one class name cache across style types, making cached style creation up to ~10% faster.
- Server rules are no longer whitespace-minified (generated rules are already compact).
