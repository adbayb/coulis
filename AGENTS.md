# AGENTS.md

This repo is `coulis`: an atomic CSS-in-JS library with a tiny runtime.
Scaffolded with `@adbayb/stack`; workflow scripts delegate to the `stack` binary.

> Extend any section below as rules emerge.

## Project overview

- `coulis`: an atomic CSS-in-JS library with a tiny runtime.
- Repository: `https://github.com/adbayb/coulis` (`adbayb/coulis`).
- `coulis/`: publishable package (entry points `src/adapters/{web,react-native}/index.ts` over shared `src/core/`; colocated `src/**/*.test.ts` via vitest; `exports` point to `dist/**`; built with quickbundle).
- `examples/*/`: private playgrounds consuming the package via `workspace:` (excluded from the check build).
- `tools/*/`: private local tooling (`tools/benchmark`: runtime benchmark against other CSS-in-JS libraries).
- Root configs: `oxlint.config.ts`/`oxfmt.config.ts` re-export `@adbayb/stack` presets; `tsconfig.json` extends the shared preset; `turbo.json` is local. Extend, don't replace.
- Workspace: `coulis`, `examples/*`, `tools/*` (`pnpm-workspace.yaml`, `saveExact`). Add nested `AGENTS.md` for package-specific rules; nearest wins.

## Instruction precedence

`AGENTS.md` applies to its subtree; nearest wins on conflicts. Repo rules override skill defaults; each skill owns its internal precedence.

## Bootstrap

- Match `devEngines` in root `package.json` (Node, pnpm) before running anything.
- `stack create` already runs `pnpm install` and `stack install`; when cloning instead, run `pnpm install --frozen-lockfile` (its lifecycle runs `stack install`).
- `stack install` writes `.git/hooks/pre-commit` (`stack fix` on staged files, then `git add -A`) and `commit-msg` (`stack check --filter commit`). Re-run if missing.

## Commands

Root scripts are thin wrappers; use them, not raw tools.

- `pnpm build` -> `stack build`: cached turbo build to `dist/**` via quickbundle.
- `pnpm check` -> `stack check`: build + dependency/format/code checks; commit checks are separate (`--filter commit` or hook).
- `pnpm fix` -> `stack fix`: cached build, then oxlint + oxfmt autofix.
- `pnpm test` -> `stack test`: turbo tests, build first.
- `pnpm start` / `pnpm watch`: turbo start/watch runs (package-defined).
- `pnpm clean` -> `stack clean`: removes git-ignored files and `node_modules/.cache`; keeps installed dependencies/`.env*`; never hand-delete `dist/`.
- `pnpm release:changelog` adds a changeset; `release:{version,snapshot,publish}` run only in `.github/workflows/continuous_delivery.yml`.
- `pnpm benchmark` -> `turbo run benchmark`: builds, then runs the `tools/benchmark` browser (Playwright) and server suites; `pnpm --filter @coulis/benchmark benchmark:<browser|server>` runs one.

Focused: `pnpm check --filter <code|formatting> [files...]` (files only apply to these filters), `pnpm check --filter <dependency|commit>`, `pnpm fix [files...]`, `pnpm --filter <package> test`. CI: install -> build -> check -> test.

### Testing

- Use Vitest with its `expect` assertions and `vi` mocking APIs.
- Run `pnpm check` and `pnpm test` before finishing; fix regressions, report pre-existing failures.
- Test design and baseline handling: `software-design` reference `testing-refactoring.md`.

## Performance requirements

Runtime speed and a tiny runtime are the library's main selling points, so every change to `coulis/src/**` is held to both budgets below. Changes outside it (docs, examples, tools, configs) are exempt.

- Runtime performance must not degrade, whatever the change adds: no browser or server throughput (ops/s) regression beyond run-to-run noise.
- Bundle size may grow only when the change adds functional behavior or improves runtime performance, and then by the smallest increase that delivers it; refactors, fixes, and internal changes must not grow it.
- Minimize size in every change: reuse existing helpers, keep exports tree-shakable (`sideEffects: false`), keep adapter-specific code out of the other adapter's entry point, and add no runtime dependency when a few lines of local code do the job.
- Measure before finishing, against the base branch on the same machine: run `pnpm benchmark` on both and compare the medians of three runs; measure bundle size on both with the method in the `Bundle size` section of `coulis/README.md` (minified + gzip of the web entry point).
- Report both deltas (ops/s and gzip bytes) in the final summary and the PR description, with the reason for any size increase.
- When the measured figures differ from those published in the `Benchmarks` section of `coulis/README.md` (runtime table, bundle size table, or the measurement method itself), update that section in the same change so the published numbers stay true.
- When a budget is missed, optimize or rework the change first; if it still cannot be met, stop and ask before continuing instead of accepting the regression.

## Code style guidelines

Use `pnpm fix` for formatting and lint autofixes; never hand-format.

Design/style defaults: the `software-design` skill (SKILL.md + references). Load the repo copy when present; otherwise ask before installing it (`pnpm dlx skills add adbayb/stack --skill software-design -g`). Add repo-specific rules here; if it cannot load, follow local conventions and ask before structural changes.

## Security considerations

- Never commit secrets; use env vars, keep `.env*` ignored, and never log/print them.
- Code-level security rules: `software-design` reference `security.md`.
- Pin devDependencies exactly (`saveExact`, `workspace:*` locally); use caret for `dependencies` and `peerDependencies` (`workspace:^` for local deps); peer ranges stay explicit. `stack check` enforces; review Renovate.

## PR instructions

- Conventional Commits for PR titles and commits (commitlint + hooks).
- Before review: required checks green; changeset for non-internal changes (`pnpm release:changelog`); performance deltas reported per `Performance requirements`.
- Do not commit, push, force-push, or publish unless asked; preserve unrelated worktree edits.
