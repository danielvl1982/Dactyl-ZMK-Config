# flasheo-emparejado Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Documented-only manual workflow to flash each nice!nano half with the CI-built `.uf2` (double-tap reset, copy file) and pair the halves and a host over Bluetooth; no script, workflow or code implements it and it has not been exercised on hardware for the v1.0 firmware. Documentation: `docs/features/flasheo-emparejado.md`. Ticket: none.

## Requirements

### Requirement: Flash each half via bootloader drive

The system SHALL document flashing a half by double-tapping the reset button so the board mounts as a USB drive, then copying the matching `.uf2` onto it (`README.md:64-65`). The process MUST be treated as documented-only: no code triggers or automates it.

#### Scenario: Flash a half
- GIVEN a `.uf2` produced by the CI build and a nice!nano connected over USB
- WHEN the maintainer double-taps reset and copies the `.uf2` onto the mounted drive
- THEN the documented flow SHALL write that image to the half
- AND the reboot into the new firmware is inferido del código (standard UF2 bootloader behavior, not stated in the repo)

#### Scenario: No automation exists
- GIVEN the repository contents
- WHEN looking for a script, workflow or code that performs flashing
- THEN none SHALL exist (`docs/arquitectura.md:155`)

### Requirement: Matching image per half

Each half SHALL receive its own image: `dactyl_left.uf2` on the left half and `dactyl_right.uf2` on the right half; the images MUST NOT be treated as interchangeable (`build.yaml:1-4`, `README.md:65`, `docs/operaciones.md:42`).

#### Scenario: Choose the file for the right half
- GIVEN the CI artifacts `dactyl_left.uf2` and `dactyl_right.uf2`
- WHEN flashing the right half
- THEN the maintainer SHALL copy `dactyl_right.uf2`

#### Scenario: Wrong image is not detected
- GIVEN the right image is copied onto the left half
- WHEN the process completes
- THEN nothing in the repository SHALL detect the mistake (`docs/arquitectura.md:155`)

### Requirement: Optional bond wipe via settings_reset

The system SHALL document an optional bond wipe: flash `settings_reset.uf2` on a half, then flash the real firmware again (`build.yaml:6-8`, `docs/operaciones.md:43`). The roadmap plans this on both halves (`docs/04-roadmap.md:47-48`). See F13.

#### Scenario: Wipe bonds on a half
- GIVEN the `settings_reset` CI entry produced `settings_reset.uf2`
- WHEN the maintainer flashes it on a half and then re-flashes `dactyl_left` or `dactyl_right`
- THEN the BLE bonds stored in the settings partition SHALL be cleared (`build.yaml:6-8`, `docs/datos.md:63`)

### Requirement: Central and peripheral roles for pairing

The left half SHALL be the BLE central that pairs with the host and the right half the peripheral (`config/boards/shields/dactyl/Kconfig.defconfig:1,6-7`). See F9.

#### Scenario: Pairing target
- GIVEN both halves are flashed
- WHEN pairing with a host
- THEN the host SHALL pair with the left (central) half
- AND adding the keyboard in the host Bluetooth settings is not described in the repo (inferido del código from the `&bt` bindings at `config/dactyl.keymap:71`)

### Requirement: Host profile selection and clearing

Host profiles SHALL be selected with `&bt BT_SEL 0/1/2` and the current bond cleared with `&bt BT_CLR`, both on the NAV layer (`config/dactyl.keymap:71`). See F7.

#### Scenario: Switch or clear a profile
- GIVEN the keyboard is running with the NAV layer active
- WHEN the user presses a `&bt BT_SEL` key or the `&bt BT_CLR` key
- THEN the profile SHALL change or the current bond SHALL be cleared

### Requirement: Process is unverified on hardware

The documented process SHALL be regarded as untested: flashing the v1.0 firmware, flashing `settings_reset` and pairing with the host have not been done on hardware, and only the older 24-position test keymap was flashed (`docs/04-roadmap.md:24,47-49`, `docs/02-current-state.md:15-17,21,55`). No automated tests exist (`docs/operaciones.md:51`).

#### Scenario: Verification status
- GIVEN the v1.0 keymap and split firmware
- WHEN checking evidence of a hardware run
- THEN none SHALL exist
- AND key and layer verification on hardware remains an open roadmap item (`docs/04-roadmap.md:24`, `docs/05-build-log.md:20`)

### Requirement: Undocumented reset and pairing order

The system SHALL NOT define the order for resetting both halves, re-flashing and pairing with the host, nor whether the host must forget a previous pairing before re-pairing (`docs/operaciones.md:47`, `docs/04-roadmap.md:47-49`).

#### Scenario: Re-pair after reset
- GIVEN both halves were reset and re-flashed
- WHEN the maintainer needs the exact re-pairing sequence
- THEN the repository SHALL provide none; the behavior is unknown
