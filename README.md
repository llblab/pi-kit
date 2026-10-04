# @llblab/pi-kit

![pi-kit banner](https://raw.githubusercontent.com/llblab/pi-kit/main/banner.jpg)

One install for the LLB Lab extension and Skill collection for [Pi](https://github.com/earendil-works/pi).

`@llblab/pi-kit` is a version-pinned package distribution, not another runtime extension. It brings together independently maintained packages; each keeps its own repository, releases, documentation, and development lifecycle.

## Included packages

Package links lead to the owning repositories for usage, documentation, issues, and contributions.

| Package | Version | Purpose |
| --- | ---: | --- |
| [`@llblab/pi-actors`](https://github.com/llblab/pi-actors) | `0.54.0` | Inspectable local Runs, reusable Recipes, persistent tools, and delegation Skills |
| [`@llblab/pi-claude-usage`](https://github.com/llblab/pi-claude-usage) | `0.2.1` | Claude subscription quota status and shared per-model Fast toggle for Opus, mirrored in Telegram |
| [`@llblab/pi-clean-room`](https://github.com/llblab/pi-clean-room) | `0.3.0` | Isolated nested Pi TUI with named npm extensions and compatible model selection |
| [`@llblab/pi-codex-usage`](https://github.com/llblab/pi-codex-usage) | `0.12.1` | Shared Codex quota/Business credit status and persistent priority Fast toggle, mirrored in Telegram |
| [`@llblab/pi-grow-loop`](https://github.com/llblab/pi-grow-loop) | `0.9.0` | Visible continuation scheduling and bounded worker Skills through compiled, manifest-owned resources |
| [`@llblab/pi-state-flow`](https://github.com/llblab/pi-state-flow) | `0.25.5` | Scoped context/memory compiler with intent-owned memory, failed Active restoration fencing and Codemode-safe compaction |
| [`@llblab/pi-telegram`](https://github.com/llblab/pi-telegram) | `0.52.0` | Telegram companion with Workspace Restore, routing lifetime, resilient runtime storage, follower Threads, files, voice, and controls |
| [`@llblab/skills`](https://github.com/llblab/skills) | `1.15.0` | Portable workflows for engineering, review, design, context maintenance, and other focused tasks |

Versions are exact by design. An upstream release does not change an installed kit until this repository explicitly advances the dependency and publishes a new kit version. Runtime defects and package-specific feature requests belong in the linked repository; package selection and kit installation issues belong here.

## Install

Requires **Pi 1.0.0+** and **Node.js 22.19.0+**. State Flow requires its canonical checkpoint/tail storage format and does not convert unsupported stores in place. Preserve existing stores and consult the [owning package's storage guidance](https://github.com/llblab/pi-state-flow/blob/v0.25.5/docs/usage.md#moving-a-store-and-supported-formats) before changing installations.

From npm:

```bash
pi install npm:@llblab/pi-kit
```

From GitHub:

```bash
pi install git:github.com/llblab/pi-kit
```

Pi loads the seven extension entrypoints and the Skill resources explicitly declared by the kit. The kit adds no runtime behavior and does not copy the packages' source or instructions into a new owner. State Flow remains opt-in; bundling it does not enable its state handoff mode.

Prefer the kit instead of separately loading the same packages. If you already use individual installations or local Skill copies, use `pi config` to disable duplicate resources. Installing the kit does not remove or rewrite those installations.

## Development

The `0.28.0` composition includes Telegram `0.52.0` with Workspace Restore, bounded delivery replay protection and damaged-state reset; all other pins, resources and load order remain unchanged. Telegram runtime storage now uses `tmp/pi-telegram` without migrating the old directory. Drain the prompt queue or accept losing waiting work before reload/restart; damaged-state reset discards all profiles' runtime continuity. Windows Restore remains fail-closed without strict journal evidence. `npm run validate` checks exact installed pins, declared resources, dependency audit and bundled inventory. It does not certify installed-client rendering; carried checks remain in [Backlog](./BACKLOG.md).

```bash
npm install
npm run validate
```

The repository-local `.npmrc` keeps Pi-provided peer packages out of the kit's lockfile; Pi supplies those peers at runtime. To advance an included package, update its exact version in `dependencies`, run `npm install`, synchronize bundled dependencies, declared resource paths, tests, the table above, and the changelog, then validate the packed artifact. Expose only resources declared by the published owning package; do not use version ranges or unpublished local paths.

## Security

Pi extensions execute with the user's system permissions, and Skills can guide executable actions. Review each included package and release before advancing its pin. Private Knowledge, credentials, and personal Pi configuration are not bundled.
