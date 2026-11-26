---
"coulis": patch
---

Make rendering several properties per element faster on the web, with the same class names and rules.

`createStyles` returns the same string for the same sequence of class names instead of joining a new one on each call: browsers recognize it without reading it again. Rendering 6,000 elements with nine properties each is about 12% faster (8.2 ms to about 7.2 ms in Chromium). A call giving a single class name is unchanged.

The web bundle grows from 2.58 kB to 2.66 kB (minified + gzip).
