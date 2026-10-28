# F11 - Battery level reporting for both halves over BLE

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

Each half measures its own battery and the left half (BLE central) shows both levels to the host (PC or phone) through the standard BLE Battery Service. The goal is to see the charge of the left and right 18650 cells in the host's Bluetooth settings without wiring anything extra: the nice!nano board definition already includes the voltage divider (`docs/01-hardware.md:35-37`). The feature is pure Kconfig; no keymap binding or source code is involved (`config/dactyl.conf:8-15`). The split roles it relies on are in [F9](roles-split-ble.md).

## Trigger / Entry point

- Config: `CONFIG_ZMK_BATTERY_REPORTING=y` turns on battery measurement and reporting on both halves, because `config/dactyl.conf` is shared with no `_left`/`_right` suffix (`config/dactyl.conf:1`, `config/dactyl.conf:10`).
- Config: `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_FETCHING=y` makes the central fetch the peripheral level over the split link (`config/dactyl.conf:11`).
- Config: `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_PROXY=y` makes the central expose the peripheral level to the host (`config/dactyl.conf:12`).
- Config: `CONFIG_BT_GATT_ENFORCE_SUBSCRIPTION=n`, a Windows workaround (`config/dactyl.conf:14-15`).
- The keys only take effect at build time: CI builds both shields with the same conf (`build.yaml:1-7`, see [F12](build-firmware-ci.md)). There is no runtime trigger in this repository; the periodic measurement and notification happen inside upstream ZMK (`inferido del código`, `config/dactyl.conf:8-12`).

## Inputs (payload/config)

- `CONFIG_ZMK_BATTERY_REPORTING` — bool, `y`; each half reports its own level. Default is not provable from this repo (`config/dactyl.conf:10`).
- `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_FETCHING` — bool, `y`; only meaningful on the central (`config/dactyl.conf:11`).
- `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_PROXY` — bool, `y`; only meaningful on the central (`config/dactyl.conf:12`).
- `CONFIG_BT_GATT_ENFORCE_SUBSCRIPTION` — bool, `n`; the comment says that without it the level may not show in Windows Settings (`config/dactyl.conf:14-15`).
- Battery voltage — read from the board's voltage divider and ADC, provided by the nice!nano board definition, not by this repo (`docs/01-hardware.md:35-37`; `inferido del código`).
- Central role — the left shield sets `ZMK_SPLIT_ROLE_CENTRAL` to `y`; the right shield does not, so it is the peripheral (`config/boards/shields/dactyl/Kconfig.defconfig:1-7`, see [F9](roles-split-ble.md)).
- ZMK is taken from the `main` branch of `zmkfirmware/zmk`, so the meaning of the keys follows whatever upstream has at build time (`config/west.yml:6-7`).

## Steps

1. At build time, CI compiles `dactyl_left` and `dactyl_right` with `config/dactyl.conf` applied to both (`build.yaml:2-5`, `config/dactyl.conf:1`; see [F12](build-firmware-ci.md)).
2. Both halves get `CONFIG_ZMK_BATTERY_REPORTING=y`, so each one measures its own cell level (`config/dactyl.conf:10`; behavior is upstream, `inferido del código`).
3. On the left (central) the fetching key makes it read the right half's level over the split BLE link (`config/dactyl.conf:11`, `config/boards/shields/dactyl/Kconfig.defconfig:6-7`).
4. On the left the proxy key exposes that fetched level to the host next to its own, so the host sees two levels over one connection (`config/dactyl.conf:12`).
5. The host reads or subscribes to the BLE GATT battery data. With `BT_GATT_ENFORCE_SUBSCRIPTION=n` the GATT check on notification subscription is off, which is meant to let Windows show the level (`config/dactyl.conf:14-15`).
6. The right half has no direct host link; its level reaches the host only through the central (`config/dactyl.conf:8-9`, [F9](roles-split-ble.md)).
7. Sleep of the halves is separate and does not change these keys; see [F10](sueno-profundo.md) (`config/dactyl.conf:3-6`).

## Exit points

| Salida | Detalle |
|---|---|
| BLE GATT Battery Service to the host | Writes/notifies the left level and the proxied right level (`config/dactyl.conf:10-12`). Characteristic layout is upstream (`inferido del código`; `docs/datos.md:147-150`). |
| Split BLE link, peripheral to central | The right half sends its level to the left (`config/dactyl.conf:11`). |
| Log or display | `No aplica (no logging, display or LED code for battery in this repo)`; the keymap has no battery binding (`config/dactyl.keymap:19-90`). |

## Business rules

- Both halves report; the central also fetches and proxies, so the host can show left and right levels (`config/dactyl.conf:8-12`).
- The central is always the left half (`config/boards/shields/dactyl/Kconfig.defconfig:1-7`).
- The same conf applies to both halves; there is no per-half override (`config/dactyl.conf:1`, `build.yaml:2-5`).
- Battery voltage needs no extra wiring because the nice!nano includes the divider (`docs/01-hardware.md:35-37`).
- The TRRS cable is not used, so the two batteries never share a rail (`docs/02-current-state.md:65`, `docs/04-roadmap.md:52`).
- GATT subscription enforcement is deliberately disabled to make Windows show the level (`config/dactyl.conf:14-15`).

## Errors and edge cases

- Windows may not show the level if enforcement is on; this is why the key is `n` (`config/dactyl.conf:14-15`).
- If the right half is off, asleep or out of range, what the host shows is not defined in this repo (`inferido del código`; `config/dactyl.conf:11-12`). See fragment.
- Fetching and proxy keys are set on the right half too, where they have no role; whether they are ignored or cause an error is not provable here (`config/dactyl.conf:1`, `config/dactyl.conf:11-12`; `inferido del código`).
- No cut-off: the nice!nano charges the cell but does not cut off at low voltage, so a reported level is informational and does not protect the cell (`docs/04-roadmap.md:36-38`, `docs/operaciones.md:88`).
- Not tested on hardware: the keys compile in CI but have not been flashed (`docs/04-roadmap.md:43-44`, `docs/04-roadmap.md:49-50`).
- Both halves share one conf file with an uncommitted change at the time of writing (git status), so line numbers may shift (`config/dactyl.conf:1-15`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Enable or disable battery reporting on both halves | `config/dactyl.conf` → `CONFIG_ZMK_BATTERY_REPORTING` (`config/dactyl.conf:10`) |
| Whether the central reads the peripheral level | `config/dactyl.conf` → `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_FETCHING` (`config/dactyl.conf:11`) |
| Whether the host sees both levels (output) | `config/dactyl.conf` → `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_PROXY` (`config/dactyl.conf:12`) |
| Host-specific behavior (Windows display, GATT security) | `config/dactyl.conf` → `CONFIG_BT_GATT_ENFORCE_SUBSCRIPTION` (`config/dactyl.conf:14-15`) |
| Which half is central (who proxies) | `config/boards/shields/dactyl/Kconfig.defconfig` → `ZMK_SPLIT_ROLE_CENTRAL` (`config/boards/shields/dactyl/Kconfig.defconfig:6-7`) |
| A per-half setting (validation of a half-specific value) | New `_left`/`_right` conf next to `config/dactyl.conf`; none exists today (`config/dactyl.conf:1`) |
| Which ZMK revision defines the keys' behavior | `config/west.yml` → `zmk` `revision` (`config/west.yml:6-7`) |
| Which shields get the conf (build scheduling) | `build.yaml` → `include` (`build.yaml:1-7`) |
| Battery hardware (cell, holder) | [F15](generador-soporte-18650.md) and `docs/01-hardware.md:35-37` |

## Existing tests

- Ninguno conocido: there is no test suite in this repo. The only check is the CI build, which compiles both shields (`build.yaml:1-7`, [F12](build-firmware-ci.md)). The roadmap records "CI build green on `2bdfcf7`; not flashed yet" (`docs/04-roadmap.md:43-44`).

## Coverage / Gaps

- Nothing verified on hardware: levels, proxy and the Windows display are not confirmed (`docs/04-roadmap.md:43-44`, `docs/04-roadmap.md:49-50`; fragment).
- The battery-life measurement over a week is pending (`docs/04-roadmap.md:50`).
- Defaults of the four keys are not provable from this repo (`docs/configuracion.md:151`; fragment).
- Behavior when one half is absent is undefined here (fragment).
- Security trade-off of the GATT key is already open in `docs/.work/questions/arquitectura.md:17-21`; it is recorded here only for its battery side (fragment).
- `docs/operaciones.md:67` cites `config/dactyl.conf:9` for `CONFIG_ZMK_BATTERY_REPORTING`, but it is on line 10 (fragment).
