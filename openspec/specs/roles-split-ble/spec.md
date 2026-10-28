# roles-split-ble Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Defines the two Dactyl 4x6 halves as one ZMK split keyboard: left half is the BLE central with the keyboard name, right half is the peripheral. Documentation: `docs/features/roles-split-ble.md`. Ticket: none.

## Requirements

### Requirement: Shield selection symbols

The system SHALL set `SHIELD_DACTYL_LEFT` or `SHIELD_DACTYL_RIGHT` to `y` when `dactyl_left` or `dactyl_right` is in the Zephyr shield list (`config/boards/shields/dactyl/Kconfig.shield:1-5`). The shield name comes from the build matrix and is not validated in this repository (`build.yaml:2-5`).

#### Scenario: Left shield build
- GIVEN a build with `shield: dactyl_left` for `board: nice_nano//zmk`
- WHEN Kconfig is evaluated
- THEN the system SHALL set `SHIELD_DACTYL_LEFT` to `y`

#### Scenario: Right shield build
- GIVEN a build with `shield: dactyl_right`
- WHEN Kconfig is evaluated
- THEN the system SHALL set `SHIELD_DACTYL_RIGHT` to `y`

#### Scenario: Unknown shield name (inferido del código)
- GIVEN a shield list containing neither `dactyl_left` nor `dactyl_right`
- WHEN Kconfig is evaluated
- THEN neither symbol SHALL be set and no split role or keyboard name is defined from this shield

### Requirement: Left half is the central with the keyboard name

The system SHALL, only when `SHIELD_DACTYL_LEFT` is set, default `ZMK_KEYBOARD_NAME` to `"Dactyl 4x6"` and `ZMK_SPLIT_ROLE_CENTRAL` to `y` (`config/boards/shields/dactyl/Kconfig.defconfig:1-7`). The central role is fixed at build time, not at runtime.

#### Scenario: Left build defaults
- GIVEN the left shield is built
- WHEN Kconfig defaults are applied
- THEN the system SHALL advertise the name `Dactyl 4x6` and build the left half as central

#### Scenario: Right build has no name
- GIVEN the right shield is built
- WHEN Kconfig defaults are applied
- THEN the system SHALL NOT set `ZMK_KEYBOARD_NAME` from this shield

### Requirement: Split enabled for both halves

The system SHALL default `ZMK_SPLIT` to `y` when either `SHIELD_DACTYL_LEFT` or `SHIELD_DACTYL_RIGHT` is set (`config/boards/shields/dactyl/Kconfig.defconfig:11-14`). Split is never enabled for one half only.

#### Scenario: Either shield enables split
- GIVEN a build of `dactyl_left` or `dactyl_right`
- WHEN Kconfig defaults are applied
- THEN `ZMK_SPLIT` SHALL default to `y`

### Requirement: Right half is an implicit peripheral

The system SHALL build the right half as a peripheral that sends key events to the central over BLE, without any explicit peripheral setting (inferido del código: ZMK default when `ZMK_SPLIT` is on and `ZMK_SPLIT_ROLE_CENTRAL` is off; `config/boards/shields/dactyl/Kconfig.defconfig:6-7`, `config/boards/shields/dactyl/Kconfig.defconfig:13-14`). The ZMK source is not in this repository.

#### Scenario: Right build role
- GIVEN the right shield is built with `ZMK_SPLIT` on
- WHEN no code sets `ZMK_SPLIT_ROLE_CENTRAL`
- THEN the system SHALL treat the right half as a peripheral linked to the left central

#### Scenario: Host visibility (inferido del código)
- GIVEN the left half is the central
- WHEN a host scans over Bluetooth
- THEN the host SHALL pair with the left half only and not see the right half

### Requirement: Keymap runs on the central

The system SHALL run the keymap and layer logic on the central, receiving right-half key positions offset by 6 columns (`config/boards/shields/dactyl/dactyl_right.overlay:15-18`). Column offset is set only on the right overlay (`config/boards/shields/dactyl/dactyl_left.overlay:3-13`).

#### Scenario: Right-half key press
- GIVEN the right half sends a key event
- WHEN the central receives it
- THEN the central SHALL resolve it at the right-half position offset by 6 columns

### Requirement: Shield metadata

The system SHALL declare shield `id: dactyl_4x6`, `name: Dactyl 4x6`, `requires: [pro_micro]` and only the `keys` feature (`config/boards/shields/dactyl/dactyl.zmk.yml:2-9`). It SHALL NOT expose encoder, display or backlight features.

#### Scenario: Compatible board
- GIVEN the shield is built for `nice_nano//zmk` (`build.yaml:2`)
- WHEN the shield metadata is checked
- THEN the `pro_micro` interface requirement SHALL be satisfied

### Requirement: One firmware image per shield

The system SHALL produce one firmware image per shield in the build matrix (`build.yaml:2-5`). The `settings_reset` entry contains neither Dactyl shield, so none of the role or name defaults apply to it (`build.yaml:7-8`).

#### Scenario: Settings reset build
- GIVEN a build with the `settings_reset` shield
- WHEN Kconfig is evaluated
- THEN the system SHALL NOT apply the split role or keyboard name defaults

### Requirement: ZMK revision tracked on main

The system SHALL fetch ZMK from `zmkfirmware/zmk` branch `main` (`config/west.yml:6-8`). The role defaults therefore come from whichever ZMK revision is current at build time.

#### Scenario: Unpinned ZMK
- GIVEN a firmware build
- WHEN west resolves the `zmk` project
- THEN the system SHALL use the latest `main` revision, not a pinned one
