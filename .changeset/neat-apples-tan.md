---
"coulis": minor
---

API refactoring to prepare for future adapter development (currently web, later React Native).

The following breaking changes have been introduced:

- Remove singleton in favor of `createCoulis` factory.
- Move `createStyles` contract definition to `createCoulis` to make the styling contract available to all interfaces.
- `createStyles` does not return a function anymore, but the class name.
- `createCustomProperties` is removed (custom properties are created while defining the `theme` in `createStyles`).
- `createVariants` is removed.
- `createServerContext` is replaced in favor of `getMetadata` getter.
- Bundle size reduction by 18%.
