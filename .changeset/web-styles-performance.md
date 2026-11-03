---
"coulis": minor
---

Improve web style generation and simplify the implementation without changing the public API.

Measured gains: cached style creation ~5x faster, state variants ~6x faster, repeated dynamic styles ~3x faster, and SSR HTML shrinks ~12% (120KB to 106KB for a 1000-row table thanks to base-36 encoding).

- Cache property metadata, declarations, expanded shorthands, and class names, and precompile state templates to avoid repeated value resolution, hashing, and string processing.
- Shorten class names with base-36 hashes to reduce HTML, CSS, and hydration metadata size.
- Share property-value resolution across web and React Native, consolidate memoization, and simplify stylesheet insertion and state handling. Remove unused helpers and normalize internal naming.
- Reduce the web runtime size by grouping stylesheet caches, simplifying template compilation, and serializing the fixed metadata attributes directly.
- Track inserted class names in DOM hydration metadata so later instances reuse existing rules.
- Escape `<` in metadata content and HTML serialization so CSS text cannot close a `<style>` element.
- Retry failed rule creation without returning a class name for a rule that was never inserted.
- Fix nested theme token paths across sibling branches, React Native `vmin`/`vmax` conversion, and fallback to raw values for unknown React Native property-map entries.

Update browser and server benchmarks with static baselines, shared fixtures, warmup, and CSS extraction for each library. Simplify baseline reporting and report latency in milliseconds.
