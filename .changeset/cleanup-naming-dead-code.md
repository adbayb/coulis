---
"coulis": patch
---

Simplify internals without changing the public API: align internal naming on `get`/`set`/`create`/`delete` conventions (cache, stylesheets, template helpers), remove dead code (`compose`, unused declaration/template helpers), fix the `ShorthandsLike` type typo (keeping a deprecated `ShortandsLike` alias), fix nested theme sibling tokens in `createCustomProperties`, fix `vmax`/`vmin` conversion and unknown theme value fallback on React Native, and flatten the web `createStyles` hot path. Also clean up tests (renamed APIs, new coverage for compiled templates, deep themes, and viewport units), fix README links, and make the benchmark more realistic and maintainable (shared table fixture, hoisted row data, single shared browser container, styled-components server parity, warmup, failure detection, relative-delta reporting, and corrected `ms` latency units).
