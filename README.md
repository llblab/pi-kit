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

## Security

Pi extensions execute with the user's system permissions, and Skills can guide executable actions. Review each included package and release before advancing its pin. Private Knowledge, credentials, and personal Pi configuration are not bundled.
