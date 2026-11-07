# AGENTS.md

This repo is `coulis`: an atomic CSS-in-JS library with a tiny runtime.
Scaffolded with `@adbayb/stack`; workflow scripts delegate to the `stack` binary.

> Extend any section below as rules emerge.

## Project overview

- `coulis`: publishable package (`coulis/src/adapters/*/index.ts`; colocated `src/*.test.ts` via vitest; `exports` point to `dist/**`; built with quickbundle).
- Repository: `https://github.com/adbayb/coulis` (`adbayb/coulis`).
- `examples/*`: private playgrounds (excluded from the check build); `tools/*`: private local tooling.
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
- `pnpm release:log`, `pnpm release:version`, and `pnpm release:publish` run the corresponding `stack release` operations.
- `pnpm benchmark` runs the benchmark task.
- Focused: `pnpm check --filter <code|formatting> [files...]` (files only apply to these filters), `pnpm check --filter <dependency|commit>`, `pnpm fix [files...]`, `pnpm --filter coulis test`. CI: install -> build -> check -> test.

### Testing

- Use Vitest with its `expect` assertions and `vi` mocking APIs.
- Run `pnpm check` and `pnpm test` before finishing; fix regressions, report pre-existing failures.
- Test design and baseline handling: `software-design` reference `testing-refactoring.md`.

## Code style guidelines

Use `pnpm fix` for formatting and lint autofixes; never hand-format.

Design/style defaults: the `software-design` skill (SKILL.md + references). Load the repo copy when present; otherwise ask before installing it (`pnpm dlx skills add adbayb/stack --skill software-design -g`). Add repo-specific rules here; if it cannot load, follow local conventions and ask before structural changes.

## Security considerations

- Never commit secrets; use env vars, keep `.env*` ignored, and never log/print them.
- Code-level security rules: `software-design` reference `security.md`.
- Pin devDependencies exactly (`saveExact`); use caret for `dependencies` and `peerDependencies`; peer ranges stay explicit. `stack check` enforces; review Renovate.

## PR instructions

- Conventional Commits for PR titles and commits (commitlint + hooks).
- Before review: required checks green; changeset for non-internal changes.
- Do not commit, push, force-push, or publish unless asked; preserve unrelated worktree edits.
