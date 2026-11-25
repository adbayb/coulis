---
"coulis": minor
---

Fill gaps found while migrating a design system from Emotion, without increasing the web bundle size (2.34 kB minified + gzip) nor degrading cached style creation.

- **Breaking:** `getMetadata` is replaced by two methods with the same output (`{ attributes, content }` style sheets, `String()` giving the `<style>` tags):
    - `getCriticalStyleSheets(html)` returns the style sheets a rendered HTML needs (its atomic rules, plus every global rule and keyframes), so pages no longer ship every style generated since the server started.
    - `getStyleSheets()` returns every style sheet generated so far, as `getMetadata()` did (e.g. for streaming rendering, where the HTML is not available).
- Browser rules are inserted synchronously (through `insertRule` for atomic rules), so layout reads made right after `createStyles` (for example, in React layout effects) see the styled layout. Invalid or unsupported rules are ignored instead of throwing.
- `setGlobalStyles` returns a function removing the rules. Calls with the same input are reference counted, so nested callers can safely add and remove the same theme-dependent global styles.
- Instances targeting the same `<style>` elements share their inserted rules, so a rule is never inserted twice.
- A custom shorthand creates one class name holding all its declarations (instead of one class name per expanded property), shrinking HTML class attributes and making shorthand-heavy styles faster. It also makes vendor prefixes declared as same-name shorthands (`userSelect: ["WebkitUserSelect", "userSelect"]`) a single rule.
- Unset (`undefined`) style values, including state values, are skipped instead of generating `undefined` declarations.
- No empty `:root{}` rule is generated without a theme.
- Server rules are no longer whitespace-minified (generated rules are already compact).
