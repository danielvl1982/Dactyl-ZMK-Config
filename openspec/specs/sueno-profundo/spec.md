# sueno-profundo Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Both halves of the keyboard enter deep sleep after a period without key activity and wake on any key press, configured only through Kconfig and one devicetree property (the repo contains no sleep code). Documentation: `docs/features/sueno-profundo.md`. Ticket: none.

## Requirements

### Requirement: Deep sleep enabled on both halves

The system SHALL enable the ZMK sleep feature with `CONFIG_ZMK_SLEEP=y` in the shared `config/dactyl.conf`, which has no `_left`/`_right` suffix (`config/dactyl.conf:1`, `config/dactyl.conf:5`). It MUST apply to both halves.

#### Scenario: Shared conf applies to both halves
- GIVEN `config/dactyl.conf` is the shared conf file without a half suffix
- WHEN either half is built
- THEN the system SHALL include `CONFIG_ZMK_SLEEP=y` in that build

### Requirement: Idle sleep timeout of 5 minutes

The system SHALL set `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT=300000` (5 min) (`config/dactyl.conf:6`). This line is committed on `main` (commit `8ac7234`); it replaces the ZMK default of 15 min mentioned in the file comment (`config/dactyl.conf:3`).

#### Scenario: Build uses 5 minutes
- GIVEN the committed `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT=300000` line is present
- WHEN firmware is built from `main`
- THEN the system SHALL use a 300000 ms idle timeout (unit ms is `inferido del código`, from the file comment "5 min")

#### Scenario: Timeout line removed
- GIVEN the timeout line is absent from `config/dactyl.conf`
- WHEN firmware is built
- THEN the system SHALL fall back to the ZMK default of 15 min (stated only in a comment, `config/dactyl.conf:3`; inferido del código)

### Requirement: Any key wakes the half

The system SHALL mark the `kscan0` node as `wakeup-source` (`config/boards/shields/dactyl/dactyl.dtsi:12`), so a press on any matrix key wakes the half. No per-key wake filter MUST exist. Both halves include the shared dtsi.

#### Scenario: Key press wakes a sleeping half
- GIVEN a half is in deep sleep
- WHEN any key of its scanned matrix is pressed
- THEN the system SHALL wake the half

### Requirement: Idle detection and sleep entry are implemented by ZMK

The system SHALL rely on ZMK for the idle timer and for entering deep sleep after `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT` ms without activity (`config/dactyl.conf:3`, `config/dactyl.conf:5-6`). The repo MUST NOT contain its own sleep code. This is `inferido del código`.

#### Scenario: Idle timeout elapses
- GIVEN `CONFIG_ZMK_SLEEP=y` and a timeout configured
- WHEN the timeout elapses without activity
- THEN ZMK SHALL put the MCU into deep sleep (`inferido del código`)
- AND what counts as activity is defined by ZMK, not this repo (`inferido del código`)

### Requirement: Volatile state and cross-half sync are not preserved

The system SHALL NOT preserve RAM state such as an active momentary layer across sleep (`inferido del código`; `docs/datos.md:12`, `docs/datos.md:59`). Each half sleeps on its own timer, and cross-half sync after wake is undefined here (`inferido del código`).

#### Scenario: Momentary layer lost after wake
- GIVEN a half slept while a momentary layer was active
- WHEN the half wakes
- THEN the system SHALL start without that layer active (`inferido del código`)

#### Scenario: Independent half timers
- GIVEN left and right halves have independent idle timers
- WHEN one half sleeps and the other does not
- THEN the repo SHALL define no synchronization between them (`inferido del código`)

### Requirement: On-device behavior is unverified

The system SHALL be treated as not verified on hardware: sleep was built in CI at `2bdfcf7` but "not flashed yet" (`docs/04-roadmap.md:41-42`). No automated tests MUST exist for it.

#### Scenario: No on-device evidence
- GIVEN the roadmap lists sleep as built but not flashed
- WHEN looking for sleep/wake test evidence
- THEN the system SHALL have none beyond the CI build
