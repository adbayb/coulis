---
"coulis": minor
---

Speed up web `createStyles` with declaration, class name, and precompiled state template caches, and shorten generated class names with base-36 hash encoding (e.g. `c1sog3h` instead of `c108636029`) for smaller HTML/CSS payloads. Measured gains: cached style creation ~5x faster, state variants ~6x faster, repeated dynamic styles ~3x faster, and SSR HTML shrinks ~12% (120KB to 106KB for a 1000-row table thanks to base-36 encoding).
