# Changelog

All notable changes to `@llblab/pi-kit` are documented here.

## 0.10.3 - 2026-09-11

- `State Flow Telegram Surface`: Advances the exact State Flow pin to `0.9.4`, so the pre-Settings section button always carries the spiral identity and the live value (`🌀 State Flow: off`, `🌀 State Flow: #N`), and its submenu repeats that state line, follows it with a short explanation of what State Flow is, and exposes one wide `Start` or `Stop` action instead of Start, Refresh, and Cancel start. The package set, resource inventory, and explicit load order remain unchanged.

## 0.10.2 - 2026-09-11

- `State Flow Publication`: Advances the exact State Flow pin to `0.9.3`, syncing the publication-queue lineage-rewrite hotfix. A queued target orphaned by a reset or re-initialized journal now retargets the live lineage instead of failing every `turn_end`, and deferred remote publication is reported accurately. The package set, resource inventory, and explicit load order remain unchanged.

## 0.10.1 - 2026-09-11

- `State Flow Telegram Surface`: Advances the exact State Flow pin to `0.9.2`, so State Flow appears in Telegram exactly once: the pre-Settings section button carries the live status (`🌀 State Flow: #N`, `⚫️ State Flow` while off) and the duplicated Status-screen row is removed. The package set, resource inventory, and explicit load order remain unchanged.
- `Grow Loop Status Text`: Advances the exact Grow Loop pin to `0.8.1`, mirroring the terminal status literally as `Grow Loop ∞N` with no waiting, running, or countdown decoration. The package set, resource inventory, and explicit load order remain unchanged.
- `Queue Refresh Icon`: Advances the exact Telegram pin to `0.45.5`, so the queue menu's Refresh button renders `🔄 Refresh` while `🌀` stays the State Flow identity. The package set, resource inventory, and explicit load order remain unchanged.

## 0.10.0 - 2026-09-11

- `State Flow Telegram Surface`: Advances the exact State Flow pin to `0.9.0`, adding the optional fail-open Telegram status line (`State Flow: on · step #N`) and the inline main-menu section button before Settings with Start, Stop, Refresh, and deferred-start control for the current session branch. The package set, resource inventory, and explicit load order remain unchanged.
- `Grow Loop Telegram Mirror`: Advances the exact Grow Loop pin to `0.8.0`, mirroring the visible loop rhythm (`Grow Loop: #N · waiting`, `#N · Ns`, `#N · running`) into the Telegram status screen with the same fail-open, no-scheduling-change guarantees. The package set, resource inventory, and explicit load order remain unchanged.

## 0.9.1 - 2026-09-11

- `Telegram Draft Cadence`: Advances the exact Telegram pin to `0.45.4`, so each preview segment holds its first frame for one full two-second interval from its first visible text; the opening draft is an accumulated passage instead of a single streamed word, later frames keep the trailing cadence, and rollover after tool work reopens the window while sealing or final publication still cancels pending timers. The package set, resource inventory, and explicit load order remain unchanged.
- `State Flow Preserved Answers`: Advances the exact State Flow pin to `0.8.1`, preserving the first terminal draft as the runtime-owned response even without `final:true` and bounding same-run fallback turns to eliciting the final patch without replacing the visible answer. The package set, resource inventory, and explicit load order remain unchanged.

## 0.9.0 - 2026-09-11

- `State Flow Atomic Cohorts`: Advances the exact State Flow pin to `0.8.0`, replacing the single-scope PATCH/UNCHANGED protocol with one `patch_state({global?, cwd?, session?, final?})` primitive whose supplied scopes commit as one atomic transition, turning `final:true` into an ephemeral per-iteration terminal-eligibility latch with bounded three-attempt steering, and retaining exact rejected-call arguments in opt-in diagnostics while preserving the package set, resource inventory, and explicit load order.

## 0.8.1 - 2026-09-11

- `Telegram Schema Hotfix`: Advances the exact Telegram pin to `0.45.2`, whose bounded-depth `telegram_bind` argument schema is accepted by OpenAI and Gemini tool APIs again, restoring working agent requests while the bridge is connected. The package set, resource inventory, and explicit load order remain unchanged.

## 0.8.0 - 2026-09-11

- `State Flow Resolution`: Advances the exact State Flow pin to `0.7.0`, bringing explicit PATCH/UNCHANGED resolution, bounded passive-stop continuation, runtime-owned artifact provenance, fixed hot history, local-first activation, asynchronous publication, and opt-in diagnostics while preserving the package set and resource order.

## 0.7.1 - 2026-09-11

- `Telegram Hotfix`: Advances the exact Telegram pin to `0.45.1`, bringing immediate editable Guest Mode acknowledgements, concise guest delivery guidance, environment-backed bot-token references, and durable photo/video channel publication with caption edits and retry-safe media identity. The package set and resource order remain unchanged.

## 0.7.0 - 2026-09-10

- `Current Distribution`: Advances Actors to `0.53.0`, State Flow to `0.6.0`, Telegram to `0.45.0`, and Skills to `1.15.0`. The kit now includes durable Workspace-bound Telegram Threads, expanded run orchestration, current opt-in state handoffs, and the latest portable workflows while preserving the package set, resource inventory, and explicit load order.

## 0.6.0 - 2026-09-06

- `Current Distribution`: Advances Telegram to `0.44.0`, Grow Loop to `0.7.5`, and Skills to `1.14.1`. The kit now includes reliable default-on Telegram draft previews and prompt anchors, unambiguous `grow-loop` runtime status, and ABCd contiguous-list validation while preserving the existing package set, resource inventory, and load order.

## 0.5.2 - 2026-09-06

- `Telegram Ordering Hotfix`: Advances the exact Telegram pin to `0.43.2`, bringing bounded threadless command lifetime, causal final/artifact/compaction publication order, stale-delivery fencing, and suppression of voice replay after uncertain acknowledgement. Other pins and the resource inventory remain unchanged; operator-coordinated live smoke follows release.

## 0.5.1 - 2026-09-06

- `Telegram Continuity Hotfix`: Advances the exact Telegram pin to `0.43.1`, bringing bounded persistent polling-conflict stand-down with accepted queue preservation, missing/null system-prompt normalization, and authority-fenced preview cleanup without changing the resource inventory.

## 0.5.0 - 2026-09-05

- `Telegram Native Controls`: Advances the exact Telegram pin to `0.43.0`, bringing in-body button blocks, shared JSON/CML disabled controls, HTML footer fallback, and updated agent Skills while preserving package-owned implementations and the existing resource inventory.

## 0.4.0 - 2026-09-05

- `Expanded Composition`: Adds exact published pins for Clean Room and opt-in State Flow alongside the portable LLBLAB Skills collection, exposing each package's own declared resources without duplicating source or runtime ownership.
- `Verified Hotfix Cohort`: Advances Actors to `0.52.1`, Grow Loop to `0.7.4`, and Telegram to `0.42.4`, including guarded thread recovery and cleanup, while retaining independent package release ownership.
- `Independent Package Guide`: Links every included package to its owning repository, explains its purpose, and documents duplicate-resource configuration for users migrating from individual installations.

## 0.3.2 - 2026-09-01

- `Telegram Comment Membrane`: Advances `@llblab/pi-telegram` to `0.42.2`, keeping assistant-authored HTML comments transport-private across Telegram previews and final replies while preserving top-level button and voice activation and skipping empty text sends after sanitization.

## 0.3.1 - 2026-09-01

- `Telegram Patch Release`: Advances `@llblab/pi-telegram` to `0.42.1`, accepting prompt-only CML button cells such as `{|e2}` and their optional selected-style form while preserving prompt-as-label fallback and fail-closed empty prompt, style, and voice atoms.

## 0.3.0 - 2026-09-01

- `Telegram Minor Release`: Advances `@llblab/pi-telegram` to `0.42.0`, bringing tolerant JSON and compact CML action parsing, positional voice action cells, Thread-aware generated-button prompts, and focused proactive control-surface guidance into the bundled kit.
- `Release Cohort Policy`: Codifies that the kit follows the highest dependency bump in each synchronized cohort, so dependency patch-only updates produce kit patches while any dependency minor update produces a kit minor.

## 0.2.0 - 2026-08-31

- `Actors Minor Releases`: Advances `@llblab/pi-actors` to `0.52.0`, bringing root-owned follow-ups, durable completion epochs, presentation acknowledgment, recovery-safe scheduling, explicit urgent steering, and settled packed-package parity into the bundled kit.
- `Telegram Minor Release`: Advances `@llblab/pi-telegram` to `0.41.0`, keeping typing active through settled work and compaction, making connected companion projection always-on, and updating generated controls, connection notices, token telemetry, and voice setup guidance.

## 0.1.13 - 2026-08-30

- `Telegram Minor Release`: Advances `@llblab/pi-telegram` to `0.40.0`, requiring Pi 0.84.4 and adopting native compaction-failure, mid-run compaction, terminal-message, and local UI-prompt lifecycle contracts while increasing bounded inbound text output to 24,000 characters.

## 0.1.12 - 2026-08-28

- `Codex Usage Release`: Advances `@llblab/pi-codex-usage` to `0.9.4`, reducing automatic OpenAI quota polling by increasing the refresh interval from 30 to 60 seconds while preserving the local countdown responsiveness.
- `Telegram Hotfix`: Advances `@llblab/pi-telegram` to `0.39.5`, preserving terminal-equivalent chronology by delivering an active turn's final Telegram answer before automatic-compaction start and completion notices.

## 0.1.11 - 2026-08-28

- `Telegram Hotfix`: Advances `@llblab/pi-telegram` to `0.39.4`, preventing repeated extension errors when print, RPC, ACP, or other headless hosts refresh lifecycle status without an initialized theme while preserving interactive status rendering.

## 0.1.10 - 2026-08-26

- `Extension Releases`: Advances `@llblab/pi-grow-loop` to `0.7.3` for the current bounded continuation protocol and `@llblab/pi-telegram` to `0.39.3` for Windows IPC replacement fencing, trusted outbound voice command compatibility, and macOS lock-recovery contention handling.

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
