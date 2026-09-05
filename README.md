# @llblab/pi-kit

One install for the LLB Lab extension and Skill collection for [Pi](https://github.com/earendil-works/pi).

`@llblab/pi-kit` is a version-pinned package distribution, not another runtime extension. It brings together independently maintained packages; each keeps its own repository, releases, documentation, and development lifecycle.

## Included packages

Package links lead to the owning repositories for usage, documentation, issues, and contributions.

| Package | Version | Purpose |
| --- | ---: | --- |
| [`@llblab/pi-actors`](https://github.com/llblab/pi-actors) | `0.52.1` | Inspectable local Runs, reusable Recipes, persistent tools, and delegation Skills |
| [`@llblab/pi-clean-room`](https://github.com/llblab/pi-clean-room) | `0.1.1` | Isolated nested Pi TUI with explicitly selected extensions |
| [`@llblab/pi-codex-usage`](https://github.com/llblab/pi-codex-usage) | `0.9.4` | Compact Codex/Spark subscription-limit status |
| [`@llblab/pi-grow-loop`](https://github.com/llblab/pi-grow-loop) | `0.7.4` | Visible continuation scheduling and bounded worker Skills |
| [`@llblab/pi-state-flow`](https://github.com/llblab/pi-state-flow) | `0.3.0` | Opt-in validated state handoffs between agent runs |
| [`@llblab/pi-telegram`](https://github.com/llblab/pi-telegram) | `0.42.4` | Telegram companion, queues, files, voice, controls, and Generative Apps guidance |
| [`@llblab/skills`](https://github.com/llblab/skills) | `1.14.0` | Portable workflows for engineering, review, design, context maintenance, and other focused tasks |

Versions are exact by design. An upstream release does not change an installed kit until this repository explicitly advances the dependency and publishes a new kit version. Runtime defects and package-specific feature requests belong in the linked repository; package selection and kit installation issues belong here.

## Install

From npm:

```bash
pi install npm:@llblab/pi-kit
```

From GitHub:

```bash
pi install git:github.com/llblab/pi-kit
```

Pi loads the six extension entrypoints and the Skill resources explicitly declared by the kit. The kit adds no runtime behavior and does not copy the packages' source or instructions into a new owner. State Flow remains opt-in; bundling it does not enable its state handoff mode.

Prefer the kit instead of separately loading the same packages. If you already use individual installations or local Skill copies, use `pi config` to disable duplicate resources. Installing the kit does not remove or rewrite those installations.

## Development

```bash
npm install
npm run validate
```

To advance an included package, update its exact version in `dependencies`, run `npm install`, synchronize bundled dependencies, declared resource paths, tests, the table above, and the changelog, then validate the packed artifact. Expose only resources declared by the published owning package; do not use version ranges or unpublished local paths.

## Security

Pi extensions execute with the user's system permissions, and Skills can guide executable actions. Review each included package and release before advancing its pin. Private Knowledge, credentials, and personal Pi configuration are not bundled.
