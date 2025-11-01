# Change Log

## 0.20.0

### Minor Changes

- [#60](https://github.com/adbayb/coulis/pull/60) [`27b4152`](https://github.com/adbayb/coulis/commit/27b41522d649869e3055fb79f250ef37f485464e) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `quickbundle` to `2.14.0`.
  Updated dependency `react-native` to `^0.81.1`.
  Updated dependency `@babel/core` to `7.28.3`.
  Updated dependency `@types/react` to `19.1.12`.
  Updated dependency `next` to `^15.5.2`.
  Updated dependency `@types/react-dom` to `19.1.9`.
  Updated dependency `vite` to `7.1.3`.
  Updated dependency `playwright-test` to `14.1.12`.
  Updated dependency `tinybench` to `4.1.0`.
  Updated dependency `tsx` to `4.20.5`.

## 0.19.0

### Minor Changes

- [`408fdd6`](https://github.com/adbayb/coulis/commit/408fdd6c3ef3e3b158312e4000a4a00ccff46f06) Thanks [@adbayb](https://github.com/adbayb)! - Process other dimension-like style properties for react native target.

- [`f65ee85`](https://github.com/adbayb/coulis/commit/f65ee85191ab306c30ad15bd2b573582e9e88911) Thanks [@adbayb](https://github.com/adbayb)! - Make react-native transformation logic scalable with a composing approach.

## 0.18.1

### Patch Changes

- [`133fa4b`](https://github.com/adbayb/coulis/commit/133fa4b9e53bb4afe941b6a6d0f3dc50f35a787d) Thanks [@adbayb](https://github.com/adbayb)! - Fix non-theme-based global style value being passed as undefined.

## 0.18.0

### Minor Changes

- [`13f74a4`](https://github.com/adbayb/coulis/commit/13f74a4ea5de150990accdab64e9305d757413ea) Thanks [@adbayb](https://github.com/adbayb)! - Improve type inference performance by simplifying and removing conditional types for setGlobalStyles interface.

- [`27fbdd0`](https://github.com/adbayb/coulis/commit/27fbdd0e955322ba02a53c641d86c79c5f77c45c) Thanks [@adbayb](https://github.com/adbayb)! - `createMetadata` is replaced by `getMetadata` to simplify developer experience and avoid premature cross-request state pollution optimization introducing side effects.

## 0.17.0

### Minor Changes

- [`74c50ef`](https://github.com/adbayb/coulis/commit/74c50efa19a46e53c96553b02e7cccfd8d1f8b20) Thanks [@adbayb](https://github.com/adbayb)! - Add `borderRadius` support for react-native target.

- [`854c160`](https://github.com/adbayb/coulis/commit/854c1605bc486262ea997bc92b196614c6aa95aa) Thanks [@adbayb](https://github.com/adbayb)! - Add `fontSize` support for react-native target.

- [`eacc3a9`](https://github.com/adbayb/coulis/commit/eacc3a9836224fdb7be25d3a82a7776631361d1f) Thanks [@adbayb](https://github.com/adbayb)! - Flag `createKeyframes` and `setGlobalStyles` as unsupported methods for react-native platform target.

## 0.16.0

### Minor Changes

- [`a6d0e22`](https://github.com/adbayb/coulis/commit/a6d0e223b9694d4b978f4c00dc8734966565e177) Thanks [@adbayb](https://github.com/adbayb)! - Add `getContract` to retrieve property information.

- [`2123029`](https://github.com/adbayb/coulis/commit/2123029fa6f19817b90cf411702228f35874d187) Thanks [@adbayb](https://github.com/adbayb)! - `getMetadata` getter is replaced in favor of `createMetadata` to allow built-in cross-request state pollution prevention.

- [#51](https://github.com/adbayb/coulis/pull/51) [`3e1132f`](https://github.com/adbayb/coulis/commit/3e1132f296ff1daf3cd76b36ea08d27ab9655ec5) Thanks [@adbayb](https://github.com/adbayb)! - API refactoring to prepare for future adapter development (currently web, later React Native).

    The following breaking changes have been introduced:
    - Remove singleton in favor of `createCoulis` factory.
    - Move `createStyles` contract definition to `createCoulis` to make the styling contract available to all interfaces.
    - `createStyles` does not return a function anymore, but the class name.
    - `createCustomProperties` is removed (custom properties are created while defining the `theme` in `createStyles`).
    - `createVariants` is removed.
    - `createServerContext` is replaced in favor of `getMetadata` getter.
    - Bundle size reduction by 18%.

- [`e34b8c1`](https://github.com/adbayb/coulis/commit/e34b8c1748503a90b96ec3a8a32500691ea2ed0c) Thanks [@adbayb](https://github.com/adbayb)! - Expose shorhands in `createKeyframes` and `setGlobalStyles` interfaces.

## 0.15.0

### Minor Changes

- [`93d5309`](https://github.com/adbayb/coulis/commit/93d5309d541f938c2785fa4b09f40438b0d8e9f7) Thanks [@adbayb](https://github.com/adbayb)! - Add `getMetadataAsString` method to `createServerContext` factory.

- [`6c1f2b2`](https://github.com/adbayb/coulis/commit/6c1f2b2aa0925bbfd19f4b25012ef02469fd7b58) Thanks [@adbayb](https://github.com/adbayb)! - Simplify `createServerContext` interface by removing `createRenderer` method.

## 0.14.0

### Minor Changes

- [`11483fb`](https://github.com/adbayb/coulis/commit/11483fb860231f4edef58000a6f957d8ececcdc6) Thanks [@adbayb](https://github.com/adbayb)! - Improve cache clearing to prevent cross-request state pollution.

- [`3c2225e`](https://github.com/adbayb/coulis/commit/3c2225e87044b391381d49fa0745ab9acd99107c) Thanks [@adbayb](https://github.com/adbayb)! - New `createServerContext` to better encapsulate server-side logic. It replaces `extractStyles` interface (breaking change).

## 0.13.0

### Minor Changes

- [`c039e8b`](https://github.com/adbayb/coulis/commit/c039e8bc8c471d612465a2ea3b418ed5740ec0c4) Thanks [@adbayb](https://github.com/adbayb)! - Improve rule retrieval performance browser side.

- [`96128fc`](https://github.com/adbayb/coulis/commit/96128fc9e68f1f1c9ca630aab65ad700bf31c445) Thanks [@adbayb](https://github.com/adbayb)! - Make dev and prod-like environment logic iso by removing `insertRule` implementation (no performance gain).

- [`47c6643`](https://github.com/adbayb/coulis/commit/47c66432f8024ca71360a15aed7a272cf236992c) Thanks [@adbayb](https://github.com/adbayb)! - Improve rule insertion performance browser side.

- [`6d564ae`](https://github.com/adbayb/coulis/commit/6d564aef12a85e136a1b65c973bf83af91c4fe5d) Thanks [@adbayb](https://github.com/adbayb)! - Rename `globalStyles` to `setGlobalStyles` to make its setter nature more explicit (not a getter returning a value).

- [#30](https://github.com/adbayb/coulis/pull/30) [`e10c238`](https://github.com/adbayb/coulis/commit/e10c23880f9cff85150b7d99e553d478fb3978d2) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@types/node` to `20.16.2`.

- [#22](https://github.com/adbayb/coulis/pull/22) [`0a20e13`](https://github.com/adbayb/coulis/commit/0a20e13cf9baa630affc7467ba3d0f1ffa7fee49) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@emotion/css` to `^11.12.0`.
  Updated dependency `styled-components` to `^6.1.12`.
  Updated dependency `@babel/preset-react` to `7.24.7`.
  Updated dependency `@types/react` to `18.3.3`.
  Updated dependency `@vitejs/plugin-react` to `4.3.1`.
  Updated dependency `vite` to `5.3.4`.
  Updated dependency `next` to `^14.2.5`.
  Updated dependency `vitest` to `1.6.0`.

- [#19](https://github.com/adbayb/coulis/pull/19) [`a2db2fb`](https://github.com/adbayb/coulis/commit/a2db2fbdbe52d240b5ab7dc6a6de33df2dcd8ebf) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@types/node` to `20.12.13`.

- [#32](https://github.com/adbayb/coulis/pull/32) [`844c4ae`](https://github.com/adbayb/coulis/commit/844c4aed6f6218ccf118a5df97cf8672159fb100) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@types/node` to `20.16.10`.

- [#23](https://github.com/adbayb/coulis/pull/23) [`dead6cf`](https://github.com/adbayb/coulis/commit/dead6cf5481015b1e63311d277cf05569f25e684) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@types/node` to `20.14.10`.

- [#34](https://github.com/adbayb/coulis/pull/34) [`52a01f0`](https://github.com/adbayb/coulis/commit/52a01f0bdd6a16bd9685e178050513f173d111c6) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@babel/preset-react` to `7.25.9`.
  Updated dependency `@types/react` to `18.3.12`.
  Updated dependency `@vitejs/plugin-react` to `4.3.3`.
  Updated dependency `vite` to `5.4.10`.
  Updated dependency `next` to `^14.2.16`.
  Updated dependency `quickbundle` to `2.6.0`.
  Updated dependency `vitest` to `2.1.4`.

- [#33](https://github.com/adbayb/coulis/pull/33) [`351a2f9`](https://github.com/adbayb/coulis/commit/351a2f95b952f16ea7358af7b4b4978aa3fdaa45) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@emotion/css` to `^11.13.4`.
  Updated dependency `styled-components` to `^6.1.13`.
  Updated dependency `@babel/preset-react` to `7.25.7`.
  Updated dependency `@types/react` to `18.3.11`.
  Updated dependency `@vitejs/plugin-react` to `4.3.2`.
  Updated dependency `vite` to `5.4.8`.
  Updated dependency `next` to `^14.2.14`.
  Updated dependency `vitest` to `2.1.2`.

- [#27](https://github.com/adbayb/coulis/pull/27) [`1f359ba`](https://github.com/adbayb/coulis/commit/1f359ba5233378fc164309083d3bcb4b1d112601) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `vitest` to `2.0.5`.

- [#25](https://github.com/adbayb/coulis/pull/25) [`d72277d`](https://github.com/adbayb/coulis/commit/d72277d909c4e1ea98b160da31b40b038cbf3cb8) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `@types/node` to `20.14.13`.

- [`3a3e2e0`](https://github.com/adbayb/coulis/commit/3a3e2e02aa7d881a06ecbd8f19e7609285983625) Thanks [@adbayb](https://github.com/adbayb)! - Rename `extract` to `extractStyles` to bring consistency.

### Patch Changes

- [`4909579`](https://github.com/adbayb/coulis/commit/490957922b4e94d15fbc37d93086497517f7f6e1) Thanks [@adbayb](https://github.com/adbayb)! - Check if `process` is defined before using it (to prevent issues when the library is used without a build step with variable replacement).

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
