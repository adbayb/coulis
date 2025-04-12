# Change Log

## 0.12.0

### Minor Changes

- [`ed15118`](https://github.com/adbayb/coulis/commit/ed1511848544dc5e307c95e6ac12469d8785393f) Thanks [@adbayb](https://github.com/adbayb)! - Allow computed value by defining a function-based `createStyles` property value.

## 0.11.2

### Patch Changes

- [`5f9e787`](https://github.com/adbayb/coulis/commit/5f9e787a1e2dcce61964e5adabcbb843b3b4b5ce) Thanks [@adbayb](https://github.com/adbayb)! - Fix `Expression produces a union type that is too complex to represent` while extrating style properties consumer side.

## 0.11.1

### Patch Changes

- [`d50ff81`](https://github.com/adbayb/coulis/commit/d50ff8121fcb7e74201a578dd4890590d1468ad4) Thanks [@adbayb](https://github.com/adbayb)! - Fix missing shorhand properties in `styles.getPropertyNames` method.

- [`731f778`](https://github.com/adbayb/coulis/commit/731f77825a1a9853c61735de8dd91cb16705c619) Thanks [@adbayb](https://github.com/adbayb)! - Escape invalid characters while generating custom properties.

## 0.11.0

### Minor Changes

- [`82daed3`](https://github.com/adbayb/coulis/commit/82daed3bd650ba23bc3e07f089208e01d77fe30b) Thanks [@adbayb](https://github.com/adbayb)! - Add static helper to retrieve `createStyles` defined property names.

## 0.10.0

### Minor Changes

- [`6f241ae`](https://github.com/adbayb/coulis/commit/6f241ae6e3e40e81825f5635494636a4247a609a) Thanks [@adbayb](https://github.com/adbayb)! - Improve performance by caching className hash creation.

- [`f527ae7`](https://github.com/adbayb/coulis/commit/f527ae7bc52262ffcd03aeb8b29de5eb68773e1b) Thanks [@adbayb](https://github.com/adbayb)! - Rename `looseProperties` and `shorthandProperties` optional `createStyles` parameters respectively to `loose` and `shorthands`.

### Patch Changes

- [`478b44c`](https://github.com/adbayb/coulis/commit/478b44cbab86a8dd5dc5cfa9bf6ffb89e49ac998) Thanks [@adbayb](https://github.com/adbayb)! - Fix state object key pollution due to literal union csstype hack.

- [`609d4f8`](https://github.com/adbayb/coulis/commit/609d4f8a18733639e42ebd3bd8197886dfbcf0b0) Thanks [@adbayb](https://github.com/adbayb)! - Make `styles` fallback to value if a key is not available in a custom property.

## 0.9.0

### Minor Changes

- [`56310fc`](https://github.com/adbayb/coulis/commit/56310fc381ed316da9418d1e4bb8e734e2190d75) Thanks [@adbayb](https://github.com/adbayb)! - Review `createStyles` to make transversal setup (e.g. states, loose properties, ...) more cohesive.

- [`4495c4a`](https://github.com/adbayb/coulis/commit/4495c4a9ab67a15202ca9bcd934903a927a68298) Thanks [@adbayb](https://github.com/adbayb)! - Allow values autocomplete in the first `createStyles` argument.

### Patch Changes

- [`d2f89ce`](https://github.com/adbayb/coulis/commit/d2f89cedcdce50019fe714ea558b2cbf3395f3e5) Thanks [@adbayb](https://github.com/adbayb)! - Make styles input stricter by not allowing unknown properties.

## 0.8.0

### Minor Changes

- [`3e5bbf0`](https://github.com/adbayb/coulis/commit/3e5bbf0a19d8dd8a800ec120c0db0d542538ce58) Thanks [@adbayb](https://github.com/adbayb)! - Rename `createAnimationName` to `createKeyframes` to reduce API learning curve.

- [`30af02c`](https://github.com/adbayb/coulis/commit/30af02c21e8c5bae179b7b8356663932ed348a55) Thanks [@adbayb](https://github.com/adbayb)! - Remove compose API.

- [`e86f307`](https://github.com/adbayb/coulis/commit/e86f307959b17cf44d861d17cb76d9d92d1fddaa) Thanks [@adbayb](https://github.com/adbayb)! - Improve `createCustomProperties` properties inference by using a `const` generic type.

- [`a042073`](https://github.com/adbayb/coulis/commit/a04207353a35f7503b793974ad8016c2ed2a394c) Thanks [@adbayb](https://github.com/adbayb)! - Welcome the new `createStyles` API and remove `styles` API.

- [`a042073`](https://github.com/adbayb/coulis/commit/a04207353a35f7503b793974ad8016c2ed2a394c) Thanks [@adbayb](https://github.com/adbayb)! - Update `createVariants` API to benefit from custom styles props via dependency injection.

## 0.7.0

### Minor Changes

- [`133d860`](https://github.com/adbayb/coulis/commit/133d860ceac1f6b29afa69554e9dc9c979951a0f) Thanks [@adbayb](https://github.com/adbayb)! - Remove `createCustomProperty` API in favor of `createCustomProperties`.

### Patch Changes

- [`0ded3ae`](https://github.com/adbayb/coulis/commit/0ded3aec64ee75c4cc7411137735db49d2c9ef77) Thanks [@adbayb](https://github.com/adbayb)! - Style reinsertion on dev environment when hot reload is enabled.

## 0.6.0

### Minor Changes

- [`2b541dc`](https://github.com/adbayb/coulis/commit/2b541dc5d26c473d4b9ac40744f8078e09980741) Thanks [@adbayb](https://github.com/adbayb)! - Add `createProperty` API.

### Patch Changes

- [`45b0f04`](https://github.com/adbayb/coulis/commit/45b0f04b25c1b8d7c7d54bae6bb662a5f26a1205) Thanks [@adbayb](https://github.com/adbayb)! - Do not expose internal types consumer-side (the dist is now unminified and no source maps are provided as they're consumer concerns).

## 0.5.0

### Minor Changes

- [`6d2e114`](https://github.com/adbayb/coulis/commit/6d2e1147bc4dfc1af6876d6500d348b82cfb6cae) Thanks [@adbayb](https://github.com/adbayb)! - Add `createVariants` API.

### Patch Changes

- [`9621586`](https://github.com/adbayb/coulis/commit/9621586d014cc036821347396e0f16e39919425e) Thanks [@adbayb](https://github.com/adbayb)! - Fix ESM resolution.

## 0.4.0

### Minor Changes

- [`ba0f87a`](https://github.com/adbayb/coulis/commit/ba0f87a4df10eb60d78d654703a84d49f75b0237) Thanks [@adbayb](https://github.com/adbayb)! - Prevent memory leak server-side by flushing the cache after each extraction.

- [`578a39b`](https://github.com/adbayb/coulis/commit/578a39ba112f10edd10034ff9272bf2e9ec9c939) Thanks [@adbayb](https://github.com/adbayb)! - Rename atoms, createAtoms, globals, keyframes APIs respectively to styles, createStyles, setGlobalStyles, and createAnimationName.

- [`e2ddeb7`](https://github.com/adbayb/coulis/commit/e2ddeb7ec0369a9dd3fc1bd0486aa2a833299364) Thanks [@adbayb](https://github.com/adbayb)! - Add compose API.

### Patch Changes

- [`f8f1b04`](https://github.com/adbayb/coulis/commit/f8f1b048e5de5a637541b9c9af57a383e55b49c8) Thanks [@adbayb](https://github.com/adbayb)! - Fix missing `px` unit for number-like values.

- [`b32dea5`](https://github.com/adbayb/coulis/commit/b32dea56e2e29a3a0019eb707bc0c8f4ebaea4d8) Thanks [@adbayb](https://github.com/adbayb)! - Fix style insertion order.

- [`69a4410`](https://github.com/adbayb/coulis/commit/69a44106fdde91760e3f264ed2b8b4420c8bcc1e) Thanks [@adbayb](https://github.com/adbayb)! - Fix insertion operation on client-side frameworks.

- [`be7fb51`](https://github.com/adbayb/coulis/commit/be7fb51e63caff2429ce4a556a052273b444d25c) Thanks [@adbayb](https://github.com/adbayb)! - Migrate to `@adbayb/stack` stack.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.3.0 (2021-11-25)

### Bug Fixes

- cache hydration ([e1661f0](https://github.com/adbayb/coulis/commit/e1661f0b0d9690a8d4c388432f8dfc1731f1006e))
- server side extraction ([ba90219](https://github.com/adbayb/coulis/commit/ba9021978c3e4ab88e5abe1f260945d8d2a6b223))

### Features

- add cache adapter ([0dc23bf](https://github.com/adbayb/coulis/commit/0dc23bfe0a88ca3e71ee8e2c41bc17fdfd828ffd))
- add client side benchmarks ([1bb914a](https://github.com/adbayb/coulis/commit/1bb914a8976bb874fd5fab9b2c39d61d2520e7ba))
- add css type support ([d970036](https://github.com/adbayb/coulis/commit/d9700367ac5bcb876537b6b89c75c66d26e76fec))
- add hydration ([81347dd](https://github.com/adbayb/coulis/commit/81347dd5f4249f12e6fcfbb58f3132c001d51b15))
- add keyframes and raw (for globals) api ([97b8dc8](https://github.com/adbayb/coulis/commit/97b8dc80c2c30c5b624c374830182504f0f35710))
- add minification ([8c9ae08](https://github.com/adbayb/coulis/commit/8c9ae08eebaa21337ab0f2e326b78d1c509b7d75))
- add server side support ([b086d8c](https://github.com/adbayb/coulis/commit/b086d8c154e6e8e9d9a6541a2e4fe367ad46dece))
- expose createCss function ([ff52cbb](https://github.com/adbayb/coulis/commit/ff52cbbbdfb456f2f11d2a22f5c2adf5e1f04ae1))
- introduce css api ([f26bbe2](https://github.com/adbayb/coulis/commit/f26bbe2760cdd4a0402769fb39f9a0c34db435ee))
- optimize style processing operations ([73b0ccf](https://github.com/adbayb/coulis/commit/73b0ccfb71982d387c1f8e832fc5dba0743c1ac7))

### Performance Improvements

- improve overall performance by memoizing style processing ([94d7625](https://github.com/adbayb/coulis/commit/94d7625cc6ed73f7e8d5b227d3f6c6d566c64ec8))
- improve simple case performance ([55bfa91](https://github.com/adbayb/coulis/commit/55bfa915480770c6198c1b80fdeb8eb3e267f09d))
