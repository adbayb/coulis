# Contributing

Thanks for showing interest in contributing to `coulis` 🥳.
We are open to all contributions including bug reports, fixes, new features, documentation improvements, and more!

## 🥇 Your first contribution

1. **Fork** the repository and clone it locally.
2. Create a branch.
3. Install dependencies: `pnpm install`.
4. Make your changes.
5. Build all packages: `pnpm build`.
6. Run linters and tests: `pnpm check && pnpm test`.
7. Check non-regression on examples: `pnpm start`.
8. Open a pull request against `main`.

Before starting significant work, open an issue first so we can align on the approach.

## 🗂️ Conventions

### Commit messages

This repository uses [Conventional Commits](https://www.conventionalcommits.org/).
Pull request titles are validated automatically via the `conventional_commit` workflow.

Format: `<type>(<scope>): <description>`

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`.

### Changelog entries

Every change that affects the public API of the `coulis` package must include a changelog entry:

```sh
pnpm release:log
```

Choose `patch` for bug fixes and internal improvements, `minor` for new features or behaviour changes, and `major` for breaking changes.

## 👨‍🍳 Recipes

### How do I run tests?

```sh
# From the repo root
pnpm test

# Watch mode, from the coulis package
cd coulis && pnpm vitest --typecheck
```

### How do I run the benchmark?

```sh
pnpm benchmark
```

This builds the `tools/benchmark` package and runs benchmarks against different CSS-in-JS alternatives in Node and headless browser environments. Results are printed as a table in the terminal.

### How is the code organised?

```
coulis/src/
  core/
    entities/   # Platform-agnostic building blocks (cache, style, theme, …)
    ports/      # Generic TypeScript interfaces that adapters must implement
  adapters/
    web/        # Browser adapter — emits CSS class names and injects <style> tags
    react-native/ # React Native adapter — emits StyleSheet objects
```

All public-facing behavior lives in the adapters.
The `core` layer must stay free of platform-specific imports.

### How do I add a new CSS property?

Consumers define their own allowed properties via the `properties` callback in `createCoulis`. The library itself does not maintain a list of supported properties — it delegates to `csstype` for type safety.

### How do I release?

Releases are automated via the `continuous_delivery` workflow.
Once changelog files are merged to `main`, the workflow creates (or updates) a versioning PR.
Merging that PR publishes the package to npm.
