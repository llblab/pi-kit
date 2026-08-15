# @llblab/pi-kit

`@llblab/pi-kit` is the version-pinned LLBLAB extension distribution for [Pi](https://github.com/badlogic/pi-mono). It provides one installable package while each included extension keeps its own repository, release line, and development lifecycle.

## Included packages

| Package | Version | Resources |
| --- | ---: | --- |
| `@llblab/pi-actors` | `0.47.0` | Extension and Skills |
| `@llblab/pi-codex-usage` | `0.9.2` | Extension |
| `@llblab/pi-grow-loop` | `0.7.1` | Extension and Skills |
| `@llblab/pi-telegram` | `0.29.0` | Extension and Skills |

Versions are exact by design. Updating an extension does not change an installed kit until this repository explicitly advances that dependency and publishes a new kit version.

## Install

From npm after publication:

```bash
pi install npm:@llblab/pi-kit@0.1.0
```

For local development:

```bash
pi install ./pi-kit
```

Pi loads the bundled extension entrypoints and Skills declared by this package. The kit itself does not register an extension or introduce runtime behavior.

## Development

```bash
npm install
npm run validate
```

To advance one included package, update its exact version in `dependencies`, run `npm install`, update the package table and changelog, then validate the packed artifact. Do not use version ranges.

## Security

Pi extensions execute with the user's system permissions. Review every included package and its release before advancing the pinned version.
