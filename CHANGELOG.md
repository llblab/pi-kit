# Changelog

All notable changes to `@llblab/pi-kit` are documented here.

## 0.1.9 - 2026-08-24

- `Telegram Release`: Advances `@llblab/pi-telegram` to `0.38.0`, presenting the default voice mode as `manual`, retaining legacy `hidden` compatibility, and removing the redundant transcript-caption configuration and provider contract.

## 0.1.8 - 2026-08-23

- `Telegram Releases`: Advances `@llblab/pi-telegram` to `0.37.1`, bringing journal-owned polling admission state from `0.37.0` plus the settings-manager compatibility hotfix for `/start`, model, and queue menus.
- `Release Verification`: Allows up to ten minutes for Trusted Publisher releases to become publicly readable before package identity and bundled inventory verification, avoiding false failures from npm registry propagation delay.

## 0.1.7 - 2026-08-22

- `Telegram Hotfix`: Advances `@llblab/pi-telegram` to `0.36.11`, bringing at-most-once durable prompt dispatch that prevents session or process replacement from automatically replaying an already-admitted Telegram prompt.

## 0.1.6 - 2026-08-22

- `Extension Releases`: Advances `@llblab/pi-actors` to `0.50.0` and `@llblab/pi-telegram` to `0.36.10`, bringing their latest released runtime, Skill, and Telegram integration updates into the bundled kit.
- `Branding`: Standardizes the public package description on the LLB Lab name.

## 0.1.5 - 2026-08-20

- `Installation`: Makes the npm installation command version-agnostic so the README stays current across future kit releases.

## 0.1.4 - 2026-08-20

- `Installation`: Updates the npm example to the current kit version and replaces the local-path example with direct installation from the GitHub repository.

## 0.1.3 - 2026-08-20

- `Extension Releases`: Advances `@llblab/pi-codex-usage` to `0.9.3` for current Pi header-type compatibility and Trusted Publisher releases, and `@llblab/pi-grow-loop` to `0.7.2` for audited Trusted Publisher releases.

## 0.1.2 - 2026-08-20

- `Trusted Release Automation`: Adds tag-gated validation, npm Trusted Publisher provenance, immutable package/tag identity checks, public package verification, and workflow-owned GitHub Release creation through `.github/workflows/release.yml`.

## 0.1.1 - 2026-08-20

- `Telegram Release`: Advances `@llblab/pi-telegram` to `0.36.7`, bringing proactive prompt-button delivery, explicit connection-state context, scoped Telegram control activation, provider-neutral voice configuration guidance, separated tool errors, host compatibility, prompt-block compatibility, and orphan-journal protection into the bundled kit.

## 0.1.0 - 2026-08-18

- `Package`: Established a version-pinned Pi distribution bundling Actors, Codex usage, Grow Loop, and Telegram extensions with their declared Skills behind one installable package.
- `Validation`: Added executable coherence checks for exact versions, bundled dependencies, resource paths, installed manifests, and public inventory synchronization; verified the packed distribution through Pi in an isolated agent home.
- `Pinned Releases`: Advances Actors to `0.49.1` for maintained Music Player Generative App routing and Telegram to `0.36.1` for adaptive JSON/CML controls, hybrid surface guidance, consistent denials, destructive Skip state, and Trusted Publisher release automation.
