# informe-bateria-ble Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Each half measures its own battery and the left half (BLE central) exposes both levels to the host through the standard BLE Battery Service, configured purely through Kconfig. Documentation: `docs/features/informe-bateria-ble.md`. Ticket: none.

## Requirements

### Requirement: Battery reporting enabled on both halves

The system SHALL set `CONFIG_ZMK_BATTERY_REPORTING=y` in the shared `config/dactyl.conf`, so each half reports its own battery level (`config/dactyl.conf:10`). The file has no `_left`/`_right` suffix and MUST NOT be overridden per half (`config/dactyl.conf:1`).

#### Scenario: Same conf applied to both shields
- GIVEN CI builds `dactyl_left` and `dactyl_right` (`build.yaml:2-5`)
- WHEN the firmware is compiled
- THEN the system SHALL apply `config/dactyl.conf` to both halves, so both get battery reporting
- AND the actual periodic measurement is upstream ZMK behavior (`inferido del código`)

### Requirement: Central fetches the peripheral level

The system SHALL set `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_FETCHING=y` so the central reads the peripheral's battery level over the split BLE link (`config/dactyl.conf:11`). The central MUST be the left half (`config/boards/shields/dactyl/Kconfig.defconfig:1-7`).

#### Scenario: Left half reads the right half level
- GIVEN the left shield sets `ZMK_SPLIT_ROLE_CENTRAL` to `y` and the right does not
- WHEN the halves are paired over the split link
- THEN the system SHALL have the left half fetch the right half's level (`config/dactyl.conf:11`)
- AND the key is also set on the right half, where its effect is not provable from the repo (`inferido del código`)

### Requirement: Central proxies both levels to the host

The system SHALL set `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_PROXY=y` so the central exposes the fetched peripheral level to the host next to its own (`config/dactyl.conf:12`). The right half has no direct host link, so its level MUST reach the host only through the central (`config/dactyl.conf:8-9`).

#### Scenario: Host sees two levels over one connection
- GIVEN the left half is connected to the host
- WHEN the host reads or subscribes to the BLE GATT battery data
- THEN the system SHALL expose the left level and the proxied right level (`config/dactyl.conf:10-12`)
- AND the characteristic layout is upstream (`inferido del código`; `docs/datos.md:147-150`)

#### Scenario: Right half absent
- GIVEN the right half is off, asleep or out of range
- WHEN the host reads the battery levels
- THEN what the host shows is not defined in this repository (`inferido del código`; `config/dactyl.conf:11-12`)

### Requirement: GATT subscription enforcement disabled

The system SHALL set `CONFIG_BT_GATT_ENFORCE_SUBSCRIPTION=n`, a deliberate Windows workaround so the level shows in Windows Settings (`config/dactyl.conf:14-15`). The setting MUST remain `n` to keep that workaround.

#### Scenario: Windows host shows the level
- GIVEN the host is Windows
- WHEN the host subscribes to battery notifications
- THEN the GATT check on subscription is off, which is meant to let Windows show the level (`config/dactyl.conf:14-15`)

### Requirement: No extra wiring or in-repo battery output

The system SHALL obtain battery voltage from the nice!nano board's built-in voltage divider and ADC, with no extra wiring (`docs/01-hardware.md:35-37`; `inferido del código`). It MUST NOT provide any logging, display, LED or keymap binding for battery in this repo (`config/dactyl.keymap:19-90`).

#### Scenario: Only the host shows battery
- GIVEN the firmware built from this repo
- WHEN the user wants to see the battery level
- THEN the system SHALL offer it only through the host's Bluetooth battery display
- AND the system MUST NOT cut off at low voltage, so a reported level is informational (`docs/04-roadmap.md:36-38`, `docs/operaciones.md:88`)

### Requirement: Behavior follows upstream ZMK revision

The system SHALL take ZMK from the `main` branch of `zmkfirmware/zmk`, so the meaning of the battery keys follows whatever upstream has at build time (`config/west.yml:6-7`). The keys MUST be taken effect at build time only; there is no runtime trigger in this repository (`config/dactyl.conf:8-12`; `inferido del código`).

#### Scenario: Build-time only effect
- GIVEN CI builds both shields with the same conf (`build.yaml:1-7`)
- WHEN the firmware is compiled and flashed
- THEN the system SHALL derive battery behavior from upstream ZMK at that revision
- AND it has compiled in CI but has not been flashed or verified on hardware (`docs/04-roadmap.md:43-44`, `docs/04-roadmap.md:49-50`)
