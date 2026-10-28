# reset-ajustes-bonds Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). The repository declares a build target that produces a `settings_reset` firmware image which, once flashed on one keyboard half, erases that half's stored settings (BLE bonds and profiles). Documentation: `docs/features/reset-ajustes-bonds.md`. Ticket: none.

## Requirements

### Requirement: Reset target declared in the build matrix

The system SHALL declare a `settings_reset` entry in the build matrix with board `nice_nano//zmk` (`build.yaml:7-8`). The entry MUST NOT list either Dactyl shield, so no `config/dactyl.conf` option applies to it (`build.yaml:7-8`).

#### Scenario: Matrix entry present
- GIVEN the `build.yaml` build matrix
- WHEN the matrix is read
- THEN the system SHALL contain one entry with board `nice_nano//zmk` and shield `settings_reset`
- AND the entry SHALL NOT reference `dactyl_left` or `dactyl_right`

### Requirement: Shield is provided by upstream ZMK

The system SHALL reference the `settings_reset` shield without defining it in the repository; the repo has no shield files or options for it (`build.yaml:8`, `docs/configuracion.md:140`). The shield definition comes from ZMK upstream (`inferido del código`).

#### Scenario: No local shield definition
- GIVEN the repository contents
- WHEN looking for `settings_reset` shield files or options
- THEN the system SHALL have none and rely on upstream ZMK

### Requirement: CI builds the reset image

The system SHALL build the `settings_reset` entry through ZMK's reusable workflow on push, pull request or manual dispatch, producing its own `.uf2` image as a workflow artifact (`.github/workflows/build.yml:2`, `.github/workflows/build.yml:6`, `build.yaml:7-8`).

#### Scenario: Matrix built by CI
- GIVEN a push, pull request or manual dispatch
- WHEN the workflow runs
- THEN the system SHALL produce one `.uf2` per matrix entry, including the `settings_reset` image

### Requirement: Image is flashed manually per half

The system SHALL require the user to flash the `settings_reset` `.uf2` manually on one half by double-tapping the reset button so the nice!nano mounts as a USB drive (`README.md:64-65`). The reset image MUST act only on the half it is flashed to (`build.yaml:6`, `docs/arquitectura.md:186`).

#### Scenario: Flash on one half
- GIVEN the `settings_reset` `.uf2` and a half in USB bootloader mode
- WHEN the user copies the image onto the drive
- THEN the system SHALL run the image on that half only

### Requirement: Flashed image erases bonds and profiles

The system SHALL erase the settings partition of the flashed half, covering BLE bonds and profiles, when the reset image runs (`build.yaml:6`). The erase itself is implemented upstream and cannot be proven from this repo (`inferido del código`).

#### Scenario: Stale bonds cleared
- GIVEN a half holding stale bonds
- WHEN the `settings_reset` image is flashed and runs
- THEN the system SHALL clear that half's stored bonds and profiles (`inferido del código`)

### Requirement: Real firmware must be reflashed afterwards

The system MUST require flashing the real firmware (`dactyl_left` or `dactyl_right`) again on the half after the reset, otherwise the half has no keyboard firmware (`build.yaml:6`).

#### Scenario: Half left on reset image
- GIVEN a half flashed with the `settings_reset` image
- WHEN the real firmware has not been flashed afterwards
- THEN the system SHALL leave that half without keyboard firmware

### Requirement: Halves are reset independently

The system SHALL NOT reset both halves with one flash; the halves do not share bond storage atomically (`docs/arquitectura.md:186`). Flashing the reset image on only one half leaves the other half's old bonds in place (`inferido del código`).

#### Scenario: Only one half reset
- GIVEN both halves hold old bonds
- WHEN the reset image is flashed on one half only
- THEN the system SHALL keep the old bonds on the other half

### Requirement: Reset is distinct from the BT_CLR key

The system SHALL treat wiping all bonds by the reset image as separate from the `&bt BT_CLR` key mechanism (`docs/features/gestion-perfiles-bluetooth.md:47`).

#### Scenario: Key does not replace reset image
- GIVEN stale bonds on a half
- WHEN the user relies on `&bt BT_CLR`
- THEN the system SHALL NOT be considered to have run the `settings_reset` wipe

### Requirement: Upstream revision is not pinned

The system SHALL build the `settings_reset` firmware from the ZMK revision followed by the reusable workflow, which tracks `main` and is not pinned (`.github/workflows/build.yml:6`).

#### Scenario: Revision follows upstream
- GIVEN the workflow `uses` reference
- WHEN the reset image is built at different times
- THEN the system SHALL use whatever ZMK `main` provides at build time
