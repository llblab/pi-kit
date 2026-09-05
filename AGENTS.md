# Project Context

## Product Contract

- `@llblab/pi-kit` is a Pi package distribution, not a Pi extension.
- It bundles independently released LLBLAB extensions and Skill packages behind one installable package.
- Every included package version is exact. Ranges, floating tags, local paths, and unpublished refs are forbidden in release state.
- The kit owns composition and version selection only. Runtime behavior, Skills, documentation, and implementation remain owned by the included packages.
- Loading order is explicit in `package.json`; do not rely on recursive package discovery.

## Context Ownership

- `README.md` owns public purpose, contents, installation, and update instructions.
- `package.json` owns the canonical package set, exact versions, bundled resources, and load order.
- `BACKLOG.md` owns open work only.
- `CHANGELOG.md` owns completed delivery history, with at most eight outcome bullets of at most 512 characters per release.
- Tests own executable package-coherence evidence.

## Engineering Rules

- Start work from `BACKLOG.md` and inspect the included package manifests before changing pins or resource paths.
- Keep `dependencies`, `bundledDependencies`, Pi resource paths, README inventory, tests, and lockfile synchronized.
- Bundle every included Pi package so npm installation is self-contained under this package's module root.
- Expose only resources declared by each included package. Prefer published distribution entrypoints over source entrypoints when both exist.
- Do not copy extension source, Skills, or documentation into this repository.
- Preserve package independence: a kit release may advance any subset of included extensions without forcing lockstep extension releases.
- Adding packages or newly exposed capabilities requires a kit minor bump. For updates to the existing composition, derive the kit version bump from the highest dependency bump in the synchronized release cohort: dependency patch-only updates require a kit patch bump, while any dependency minor update requires a kit minor bump. Do not let lower-level dependency bumps force a larger kit bump.
- Use English for public and repository-facing text.
- Do not commit, publish, tag, create a remote repository, or mutate Pi settings without explicit authorization.

## Validation

- Run `npm test` after manifest or inventory changes.
- Run `npm run pack:check` before declaring package readiness.
- Inspect the dry-run tarball inventory to confirm every package in `bundledDependencies` and its declared resources are present.
- Run `npm run validate` at completion.
