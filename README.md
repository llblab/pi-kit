# @llblab/pi-kit

![pi-kit banner](https://raw.githubusercontent.com/llblab/pi-kit/main/banner.jpg)

One install for the LLB Lab extension and Skill collection for [Pi](https://github.com/earendil-works/pi).

`@llblab/pi-kit` is a version-pinned package distribution, not another runtime extension. It brings together independently maintained packages; each keeps its own repository, releases, documentation, and development lifecycle.

## Included packages

Package links lead to the owning repositories for usage, documentation, issues, and contributions.

| Package | Version | Purpose |
| --- | ---: | --- |
| [`@llblab/pi-actors`](https://github.com/llblab/pi-actors) | `0.54.0` | Inspectable local Runs, reusable Recipes, persistent tools, and delegation Skills |
| [`@llblab/pi-claude-usage`](https://github.com/llblab/pi-claude-usage) | `0.2.2` | Claude subscription quota status and shared per-model Fast toggle for Opus, mirrored in Telegram |
| [`@llblab/pi-clean-room`](https://github.com/llblab/pi-clean-room) | `0.3.0` | Isolated nested Pi TUI with named npm extensions and compatible model selection |
| [`@llblab/pi-codex-usage`](https://github.com/llblab/pi-codex-usage) | `0.13.1` | OpenAI/legacy Codex subscription quota and Business credit status, with persistent priority Fast toggle mirrored in Telegram |
| [`@llblab/pi-grow-loop`](https://github.com/llblab/pi-grow-loop) | `0.9.0` | Visible continuation scheduling and bounded worker Skills through compiled, manifest-owned resources |
| [`@llblab/pi-state-flow`](https://github.com/llblab/pi-state-flow) | `0.26.4` | Scoped context/memory compiler with step-independent current memory, stable Passive/Active modes and visible blocked-state status |
| [`@llblab/pi-telegram`](https://github.com/llblab/pi-telegram) | `0.57.3` | Telegram companion with per-prompt Steer, queued controls, Reroute/Restore, recoverable connections, previews, follower Threads, files, and voice |
| [`@llblab/skills`](https://github.com/llblab/skills) | `1.15.0` | Portable workflows for engineering, review, design, context maintenance, and other focused tasks |

Versions are exact by design. An upstream release does not change an installed kit until this repository explicitly advances the dependency and publishes a new kit version. Runtime defects and package-specific feature requests belong in the linked repository; package selection and kit installation issues belong here.

## Install

Requires **Pi 1.0.0+** and **Node.js 22.19.0+**. State Flow requires its canonical checkpoint/tail storage format and does not convert unsupported stores in place. Preserve existing stores and consult the [owning package's storage guidance](https://github.com/llblab/pi-state-flow/blob/v0.26.4/docs/usage.md#moving-a-store-and-supported-formats) before changing installations.

From npm:

```bash
pi install npm:@llblab/pi-kit
```

From GitHub:

```bash
pi install git:github.com/llblab/pi-kit
```

Pi loads seven extension entrypoints and the Skill resources explicitly declared by the kit. Each extension entrypoint is a thin pointer inside this package that re-exports the exact bundled entrypoint, so the startup list and `pi config` show a compact label such as `@llblab/pi-kit:pi-telegram` instead of the full nested path. A pointer copies no package source and keeps a single module instance; the `@llblab/pi-kit:` prefix remains and only the path part shortens. The kit adds no runtime behavior and does not copy the packages' source or instructions into a new owner. State Flow remains opt-in; bundling it does not enable its state handoff mode.

Prefer the kit instead of separately loading the same packages. If you already use individual installations or local Skill copies, use `pi config` to disable duplicate resources. Installing the kit does not remove or rewrite those installations.

## Development

Telegram provides Normal/Priority/Steer prompt lanes and independent Keep/Skip controls. Only thumbs-up (Priority), thumbs-down (Skip) and fire (Steer) control the queue; other reactions are ignored. Steer inserts a correction at a model-step boundary, while Normal remains the default. Reroute preserves visible prompt copies and reply anchors, while Restore keeps command completion and old-tab cleanup separate. Explicit connection recovery may leave an extra tab after a lost creation response, but does not clear accepted input.

Telegram keeps the follower's Thread, letter slot and acknowledged title silently across same-process session replacement. Automatic Thread display is shared across bot profiles through top-level `threads.displayMode`; choose it through Telegram Settings. Profiles hold only bot identity and the paired owner.

Telegram keeps bus protocol v3: update every Pi process that runs pi-telegram together; 0.53.x followers cannot register with current leaders. Restore and connection recovery additionally negotiate compatible capabilities, including follower `/start` and `/help` menu restoration; update both peers to use the new paths. Runtime storage stays in `tmp/pi-telegram`. Drain the prompt queue or accept losing waiting work before reload/restart; damaged-state reset discards all profiles' runtime continuity. `npm run validate` checks exact installed pins, declared resources, dependency audit and bundled inventory. It does not certify installed-client rendering; carried checks remain in [Backlog](./BACKLOG.md).

```bash
npm install
npm run validate
```

The repository-local `.npmrc` keeps Pi-provided peer packages out of the kit's lockfile; Pi supplies those peers at runtime. To advance an included package, update its exact version in `dependencies`, run `npm install`, synchronize bundled dependencies, each declared extension pointer and its target, declared Skill paths, tests, the table above, and the changelog, then validate the packed artifact. Keep every pointer target identical to the entrypoint its pin declares. A bundled package must resolve auxiliary files, workers and sibling packages from its own module URL rather than from the declared entry path, because a pointer redirects only that entry. Expose only resources declared by the published owning package; do not use version ranges or unpublished local paths.

## Update automation

Two independent workflows prepare updates and publish **human-reviewed** kit versions. Automation reduces synchronization work; it does not decide whether an extension is safe and never enables auto-merge.

### Prepare an update PR

[Update pi-kit dependencies](./.github/workflows/update-pi-kit-deps.yml) runs daily at **03:00 UTC** and supports `workflow_dispatch` on `main`. Manual dispatch defaults to `dry_run: true`: it prepares and validates the complete working-tree diff and prints it in the run log/summary, but does not push a branch or create/update a PR. Select `false` to open or refresh the single `chore/pi-kit-deps` PR, labelled `dependencies` and `automated`.

The dependency-free [updater](./scripts/check-updates.mjs) reads npm's `latest` metadata for the existing direct dependencies. A custom updater is used instead of Dependabot because one coherent PR must synchronize kit-owned artifacts, not just npm pins:

- Exact dependency versions, both `bundledDependencies`/`bundleDependencies` aliases, and `package-lock.json` regenerated by `npm install --ignore-scripts --bin-links=false`.
- The README package/version inventory and versioned upstream documentation links.
- The kit version and [changelog](./CHANGELOG.md): patch-only direct updates produce a kit patch; any direct minor update produces a kit minor. Transitive bumps do not determine the kit bump; pending `Unreleased` outcomes are carried into the new release within the changelog budget.
- Existing package membership, extension pointers and resource order are preserved. Tests reject changed upstream resource declarations; prepare those composition changes manually rather than guessing new entrypoints.

Major updates and non-stable `latest` versions are reported for manual preparation, never silently accepted. Pre-1.0 minor releases can still break compatibility and require particular care. After synchronization, the updater runs **`npm ci --ignore-scripts --bin-links=false` and `npm run validate`**. Failure stops the run before any PR write; inspect the failed run's log. Both installs disable dependency lifecycle hooks and executable links, so a dependency-provided `node`/`npm` bin cannot shadow validation commands. This is not a security verdict about the bundled code. For a read-only local discovery plan, run `node scripts/check-updates.mjs --plan`; `npm run deps:check` instead prepares and validates changes locally and should be used on a disposable working branch.

Preparation runs in a **read-only job without repository secrets**. A separate fresh runner receives only `package.json`, `package-lock.json`, `README.md` and `CHANGELOG.md` from that run's artifact. Before any PR write, the trusted updater rejects extra paths, symlinks, package-set/resource/script changes, incorrect version bumps and unexpected prose edits; it regenerates the PR report itself. The write job never installs dependencies or executes artifact-provided scripts. Read-only preparation cannot poison the later write runner's command path.

### Maintainer review

For every bot PR, use the [Security](#security) guidance and its generated checklist:

1. Read the linked upstream releases, changelogs and source comparisons. Investigate breaking changes and compatibility with the supported Pi/Node versions.
2. Review new transitive dependencies, registry integrity changes, executable hooks and auxiliary workers/scripts. Confirm pointer-loaded extensions resolve auxiliary files from their own `import.meta.url`, not the redirected entry path.
3. Inspect the entire diff: exact pins with no ranges, both bundle aliases matching the package set, lockfile, README inventory, kit version and changelog. No new package, capability or resource should enter through an automatic pin-only update.
4. Inspect successful `validate` output, including the dry-run tarball's bundled manifests, extension targets and Skills. Run necessary isolated runtime/client smoke checks; package checks and a clean audit do not establish extension safety.
5. Obtain human approval, then **merge manually**. Do not enable auto-merge. If the updater refreshes the PR, review the new diff again before approval.

The existing [Release / validate](./.github/workflows/release.yml) PR check is retained, without a tag-triggered publisher. PRs created with `GITHUB_TOKEN` normally do **not** trigger another workflow. The updater already validates before creating them; to obtain the separate PR check, a maintainer can close/reopen the PR or push a reviewed change with their own credentials. `workflow_dispatch` on the PR branch can also provide separate validation evidence, but it does not replace a required PR check. Use an automation-account `PI_KIT_PAT` when automatic downstream PR checks are needed; do not use the sole reviewer's PAT, since authors cannot approve their own PRs.

### Publish after merge

[Publish pi-kit](./.github/workflows/publish-pi-kit.yml) runs on `main` pushes changing `package.json`, or by manual dispatch on `main`. It **reads**, never bumps, the reviewed kit version. If `v<version>` equals the latest `v*` tag in version-sort order, the run exits successfully without publishing. Older versions and existing non-latest tags are rejected, not overwritten.

For a new version the order is: verify the hosted main-workflow OIDC environment and npm >= 11.5.1 → clean `npm ci --ignore-scripts --bin-links=false` → `npm run validate` → create and push `vX.Y.Z` → `npm publish --access public` through Trusted Publishing → verify public npm identity and packed inventory → `gh release create --generate-notes`. Validation must succeed before a tag is created. The tag push is non-forced, concurrent publications are serialized, and an npm version-conflict error is accepted only when the tag and npm `gitHead` both match the current HEAD. Authentication, registry failures and contradictory identities remain errors. The workflow never commits to `main`.

A tag may remain if npm or GitHub fails **after** successful validation and tag push. An ordinary rerun intentionally no-ops once that version is the latest tag; it does not republish. Recovery requires a separate maintainer decision: verify the existing remote tag and npm state, preserve the exact tagged commit, and rerun `npm ci --ignore-scripts --bin-links=false` and `npm run validate` before any missing publication. Use an explicitly reviewed OIDC recovery or an interactive maintainer publication with 2FA; never silently fall back to a persistent token or staging. Run `node scripts/publish-pi-kit.mjs verify` before creating a missing GitHub Release with `gh release create vX.Y.Z --verify-tag --generate-notes`. Never move/delete a published tag or reuse a version for different content.

### Repository setup and secrets

- **npm Trusted Publishing (required; no `NPM_TOKEN`):** In the npm settings for `@llblab/pi-kit`, add a GitHub Actions trusted publisher for user/organization `llblab`, repository `pi-kit`, workflow filename `publish-pi-kit.yml` (without `.github/workflows/`), and no environment name. Explicitly allow **`npm publish`**, not only `npm stage publish`. Keep an existing `release.yml` trust connection until the new publisher succeeds. A new configuration must complete its first successful publication within two days or be recreated. The preflight verifies runtime prerequisites, not npm authorization; only the successful publish validates the binding. See [npm's Trusted Publishing documentation](https://docs.npmjs.com/trusted-publishers/).
- **`PI_KIT_PAT` (optional):** A repository-scoped automation-account token with contents and pull-request write access. Without it, PR writes and tag pushes use `GITHUB_TOKEN`; those events do not trigger downstream workflows. Use the PAT only if those downstream events are required. No token is stored in source or committed git configuration.
- **Actions permissions:** Permit Actions to create pull requests in the repository settings. Only the updater's fresh PR-write job requests `contents: write` and `pull-requests: write`; dependency preparation and PR validation are read-only. The publisher requests `contents: write` for the validated tag/GitHub Release and `id-token: write` for short-lived npm OIDC authentication on a GitHub-hosted runner. No long-lived npm credential is needed.
- **Do not substitute stage-only tokens:** npm is removing granular-token direct publication in January 2027. A stage-only token returns `E_STAGE_REQUIRED` for `npm publish` and requires separate maintainer approval with 2FA after `npm stage publish`. That is a different release process; this workflow keeps automatic post-merge publication through explicitly permitted OIDC and never silently stages instead.
- **Required human review:** [CODEOWNERS](./.github/CODEOWNERS) assigns `@llblab` to workflows, manifests and automation scripts. An administrator must separately protect `main` with a pull-request requirement, required Code Owner approval, stale-approval dismissal after new commits, and the `validate` status check; disallow bypasses and auto-merge. CODEOWNERS alone does **not** enforce approval. Configure these settings before relying on the pipeline as a mandatory review gate.

## Security

Pi extensions execute with the user's system permissions, and Skills can guide executable actions. Review each included package and release before advancing its pin; the [maintainer checklist](#maintainer-review) makes that review explicit for automated PRs. Automated validation and npm audit are packaging signals, not approval to trust an update. Private Knowledge, credentials, and personal Pi configuration are not bundled.
