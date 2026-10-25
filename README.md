# @llblab/pi-kit

![pi-kit banner](https://raw.githubusercontent.com/llblab/pi-kit/main/banner.jpg)

One install for the LLB Lab extension and Skill collection for [Pi](https://github.com/earendil-works/pi).

`@llblab/pi-kit` is a version-pinned package distribution, not another runtime extension. It brings together independently maintained packages; each keeps its own repository, releases, documentation, and development lifecycle.

## Included packages

Package links lead to the owning repositories for usage, documentation, issues, and contributions.

| Package | Version | Purpose |
| --- | ---: | --- |
| [`@llblab/pi-actors`](https://github.com/llblab/pi-actors) | `0.55.0` | Inspectable local Runs, reusable Recipes, persistent tools, and delegation Skills |
| [`@llblab/pi-claude-usage`](https://github.com/llblab/pi-claude-usage) | `0.2.3` | Claude subscription quota status and shared per-model Fast toggle for Opus, mirrored in Telegram |
| [`@llblab/pi-clean-room`](https://github.com/llblab/pi-clean-room) | `0.3.0` | Isolated nested Pi TUI with named npm extensions and compatible model selection |
| [`@llblab/pi-codex-usage`](https://github.com/llblab/pi-codex-usage) | `0.13.2` | OpenAI/legacy Codex subscription quota and Business credit status, with persistent priority Fast toggle mirrored in Telegram |
| [`@llblab/pi-grow-loop`](https://github.com/llblab/pi-grow-loop) | `0.9.0` | Visible continuation scheduling and bounded worker Skills through compiled, manifest-owned resources |
| [`@llblab/pi-state-flow`](https://github.com/llblab/pi-state-flow) | `0.26.5` | Scoped context/memory compiler with step-independent current memory, stable Passive/Active modes and visible blocked-state status |
| [`@llblab/pi-telegram`](https://github.com/llblab/pi-telegram) | `0.58.1` | Telegram companion with per-prompt Steer, queued controls, Reroute/Restore, recoverable connections, previews, follower Threads, files, and voice |
| [`@llblab/skills`](https://github.com/llblab/skills) | `1.15.0` | Portable workflows for engineering, review, design, context maintenance, and other focused tasks |

Versions are exact by design. An upstream release does not change an installed kit until this repository explicitly advances the dependency and publishes a new kit version. Runtime defects and package-specific feature requests belong in the linked repository; package selection and kit installation issues belong here.

## Install

Requires **Pi 1.0.0+** and **Node.js 22.19.0+**. State Flow requires its canonical checkpoint/tail storage format and does not convert unsupported stores in place. Preserve existing stores and consult the [owning package's storage guidance](https://github.com/llblab/pi-state-flow/blob/v0.26.5/docs/usage.md#moving-a-store-and-supported-formats) before changing installations.

From NPM:

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

Updates are **fully automatic for newer stable patch/minor releases within each existing package's current major**. The updater validates and commits the coherent update directly to `main`, then requests publication. There is no dependency PR, merge step or manual approval. This is an explicit maintainer policy accepting the risk of upstream code; exact versions and successful packaging checks do not establish extension safety.

### Daily update

[Update pi-kit dependencies](./.github/workflows/update-pi-kit-deps.yml) runs daily at **03:00 UTC** and supports `workflow_dispatch` on `main`. Manual dispatch defaults to `dry_run: true`: prepare and validate the complete diff, show the report and retain the data artifact, but do not commit or publish. Select `false` for the live automatic path.

The dependency-free [updater](./scripts/check-updates.mjs) reads npm's `latest` metadata for existing direct dependencies. A custom updater, rather than Dependabot, keeps one coherent update cohort:

- Exact dependency pins, both `bundledDependencies`/`bundleDependencies` aliases, and `package-lock.json` regenerated by `npm install --ignore-scripts --bin-links=false`.
- The README package/version inventory, versioned upstream documentation links, and [changelog](./CHANGELOG.md).
- The kit version: patch-only direct updates produce a kit patch; any direct minor update produces a kit minor. Transitive bumps do not determine the kit bump. Pending `Unreleased` outcomes move into the new release within the changelog budget.
- Existing package membership, extension pointers and resource order. Major updates, non-stable `latest` versions and changed resource declarations remain manual; automation does not guess a new composition.

Preparation runs in a **read-only job without repository secrets**. Both installation and clean `npm ci --ignore-scripts --bin-links=false` disable dependency lifecycle hooks and executable links, then `npm run validate` checks the package and bundled inventory. Failure stops before any main write.

A **separate fresh writer runner** receives only `package.json`, `package-lock.json`, `README.md` and `CHANGELOG.md` from that run's artifact. The trusted updater rejects extra paths, symlinks, script/resource/package-set changes, hidden rollbacks, incorrect kit bumps and unexpected prose edits. It does not install dependencies or execute transferred scripts. The writer requires a clean tracked checkout at the same main baseline, commits only those four files, and uses a normal push to `main`. A concurrent main change rejects the update; it never force-pushes, rebases or bypasses protection.

The report lists exact `old → new` pins and upstream release/compare links for audit. A read-only local discovery plan is available through `node scripts/check-updates.mjs --plan`; `npm run deps:check` prepares and validates local changes but does not push them. Internal `--apply-prepared` is the privileged clean-runner commit/push path, not a normal local update command.

### Automatic publication

Pushes made with `GITHUB_TOKEN` do not trigger another workflow's ordinary `push` event. The writer therefore explicitly dispatches [Publish pi-kit](./.github/workflows/publish-pi-kit.yml) using `workflow_dispatch` and an `expected_commit` SHA. GitHub permits this dispatch exception with `GITHUB_TOKEN`; no PAT is needed. The publisher rejects a different main commit before tag creation, even if the version would otherwise no-op.

On a live run with no new pins, the fresh job still checks for an untagged main version awaiting publication. This can retry a failed handoff before any tag exists; an unchanged already-tagged version does not manufacture a commit or release. The updater reports that publication was requested, not that it succeeded: inspect the separate publisher run for the final result.

The publisher also supports ordinary human pushes to `main` changing `package.json` and manual dispatch on `main`. It **reads, never bumps**, the kit version. If `v<version>` equals the latest `v*` tag in version-sort order, it exits successfully without republishing. Older versions and existing non-latest tags are rejected, not overwritten.

For a new version the order is: verify the hosted main-workflow OIDC environment and npm >= 11.5.1 → clean `npm ci --ignore-scripts --bin-links=false` → `npm run validate` → create and push `vX.Y.Z` → `npm publish --access public` through Trusted Publishing → verify public npm identity and packed inventory → `gh release create --generate-notes`. Publication is serialized. An npm version-conflict is accepted only when the tag and npm `gitHead` both match HEAD; authentication, staging-only permission and contradictory identities remain errors.

A tag may remain if npm or GitHub fails **after** successful validation and tag push. A same-version rerun intentionally no-ops and does not automatically repair this partial state. Recovery requires a separate maintainer decision: verify the existing remote tag and npm state, preserve the exact tagged commit, and repeat clean validation before any missing publication. Use an explicitly reviewed OIDC recovery or interactive maintainer publication with 2FA; never silently fall back to a persistent token or staging. Verify the public package before creating any missing GitHub Release. Never move/delete a published tag or reuse a version for different content.

### Manual changes and operations

Major/prerelease adoption, adding packages, changing resources and editing automation remain manual engineering work. [Release / validate](./.github/workflows/release.yml) still checks normal PRs; [CODEOWNERS](./.github/CODEOWNERS) requests owner review for workflows, manifests and scripts. CODEOWNERS does not gate the expressly authorized direct dependency updates.

Inspect failed workflow logs and upstream source/changelogs when validation fails or runtime behavior is suspect. Pre-1.0 minor versions can break compatibility. Check supported Pi/Node versions, transitive dependencies, executable hooks, pointer targets and auxiliary-file resolution from the owning package's `import.meta.url` when preparing manual changes. Packed validation does not certify installed-client rendering or runtime safety.

Disable the updater workflow before manually holding or rolling back a problematic pin, otherwise a later automatic run may advance it again. Publish corrective content at a new kit version; never retag or replace an npm version. Pi installation and live-client reload remain separate operator actions.

### Repository setup and secrets

- **npm Trusted Publishing (required; no `NPM_TOKEN`):** Configure the npm package for GitHub user/organization `llblab`, repository `pi-kit`, workflow filename `publish-pi-kit.yml` (without `.github/workflows/`), and no environment name. Explicitly allow **`npm publish`**, not only staging. A new binding must complete its first successful publication within two days or be recreated. Preflight checks runtime prerequisites, not registry authorization. See [npm's Trusted Publishing documentation](https://docs.npmjs.com/trusted-publishers/).
- **Actions permissions:** Preparation and PR validation are read-only. Only the fresh updater writer requests `contents: write` and `actions: write` for the main push and explicit publisher dispatch; it does not request PR permissions. Repository-wide default token permissions may remain read-only because jobs declare their needs. The publisher requests `contents: write` for the tag/GitHub Release and `id-token: write` for short-lived OIDC.
- **Main protection:** The repository must permit the updater's authorized main push. Required-PR or signing rules can reject it; automation fails rather than weakening rules, adding bypasses or force-pushing. Any compatibility decision about those protections is administrator-owned. The former Actions create-PR checkbox is no longer required by this updater.
- **`PI_KIT_PAT` (optional, publisher tag only):** Only needed if tag pushes must trigger other downstream workflows. The updater always uses `GITHUB_TOKEN` plus explicit dispatch, not a PAT. No token is committed to source or git configuration.
- **Do not substitute stage-only tokens:** Granular-token direct publication is being removed in January 2027. Stage-only publication requires separate maintainer promotion with 2FA; this pipeline instead uses explicitly permitted direct OIDC publication and never silently stages.

## Security

Pi extensions execute with the user's system permissions, and Skills can guide executable actions. This repository explicitly opts into adopting supported upstream releases **without human review before publication**. Validation and npm audit are packaging signals, not a security decision; reproducible exact pins do not make new code trustworthy. Disable automatic updates if human source review is required. Private Knowledge, credentials and personal Pi configuration are not bundled.
