# F9 - Split roles and shield definition (left central, right peripheral, keyboard name)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

Defines the two halves of the Dactyl 4x6 as one ZMK split keyboard. The left half is the BLE central: it runs the keymap, talks to the host and advertises the name `Dactyl 4x6`. The right half is the peripheral: it sends its key events to the left half over the split BLE link (`config/boards/shields/dactyl/Kconfig.defconfig:1-7`). There is no explicit peripheral setting: the right half is a peripheral because nothing makes it central (inferred from code, see fragments). The shield symbols that select each half are defined in `Kconfig.shield`. This is firmware configuration only, with no runtime code of its own. [F11](informe-bateria-ble.md) relies on this central/peripheral split.

## Trigger / Entry point

- Config: build of `shield: dactyl_left` or `shield: dactyl_right` for `board: nice_nano//zmk` (`build.yaml:2-5`). Each build lists the shield name in the Zephyr shield list.
- Config: `SHIELD_DACTYL_LEFT` / `SHIELD_DACTYL_RIGHT` become `y` when `dactyl_left` / `dactyl_right` is in the shield list (`config/boards/shields/dactyl/Kconfig.shield:1-5`).
- Config: shield metadata `id: dactyl_4x6`, `name: Dactyl 4x6`, `requires: [pro_micro]` (`config/boards/shields/dactyl/dactyl.zmk.yml:2-6`).
- Config: the ZMK checkout is pulled from `zmkfirmware/zmk` branch `main` through `config/west.yml` (`config/west.yml:6-8`).

## Inputs (payload/config)

- Shield list entry `dactyl_left` or `dactyl_right` — comes from the `shield` field of the build matrix, no validation in this repo (`build.yaml:3`, `build.yaml:5`).
- `SHIELD_DACTYL_LEFT`, `SHIELD_DACTYL_RIGHT` — Kconfig `def_bool` from `$(shields_list_contains,...)` (`config/boards/shields/dactyl/Kconfig.shield:2`, `config/boards/shields/dactyl/Kconfig.shield:5`).
- `ZMK_KEYBOARD_NAME`, `ZMK_SPLIT_ROLE_CENTRAL`, `ZMK_SPLIT` — Kconfig symbols whose defaults this feature sets (`config/boards/shields/dactyl/Kconfig.defconfig:3`, `config/boards/shields/dactyl/Kconfig.defconfig:6`, `config/boards/shields/dactyl/Kconfig.defconfig:13`).

## Steps

1. The build selects the shield, so the matching `SHIELD_DACTYL_*` symbol is `y` (`config/boards/shields/dactyl/Kconfig.shield:1-5`).
2. Only for the left shield (`if SHIELD_DACTYL_LEFT`) (`config/boards/shields/dactyl/Kconfig.defconfig:1`):
   1. `ZMK_KEYBOARD_NAME` defaults to `"Dactyl 4x6"`, the name shown in the host Bluetooth list (`config/boards/shields/dactyl/Kconfig.defconfig:3-4`).
   2. `ZMK_SPLIT_ROLE_CENTRAL` defaults to `y`, so the left half is the central (`config/boards/shields/dactyl/Kconfig.defconfig:6-7`).
3. For either shield (`if SHIELD_DACTYL_LEFT || SHIELD_DACTYL_RIGHT`) `ZMK_SPLIT` defaults to `y` (`config/boards/shields/dactyl/Kconfig.defconfig:11-14`).
4. The right half gets no role setting, so it is built as a peripheral and links to the central over BLE (inferred from code: ZMK default when `ZMK_SPLIT` is on and `ZMK_SPLIT_ROLE_CENTRAL` is off; the ZMK source is not in this repo).
5. The central holds the keymap and runs the layer logic. Key positions of the right half arrive offset by 6 columns, see [F8](matriz-teclado-split.md) (`config/boards/shields/dactyl/dactyl_right.overlay:28-31`).
6. Settings shared by both halves, including battery reporting between the roles, live in `config/dactyl.conf` and are covered by [F11](informe-bateria-ble.md) (`config/dactyl.conf:10-12`).

## Exit points

| Salida | Detalle |
|---|---|
| BLE advertised name | `Dactyl 4x6`, set only on the left (central) build (`config/boards/shields/dactyl/Kconfig.defconfig:3-4`) |
| Split BLE link right -> left | Right half (peripheral) sends key events to the left (central); enabled by `ZMK_SPLIT` on both builds (`config/boards/shields/dactyl/Kconfig.defconfig:13-14`) |
| Firmware images | One image per shield from the build matrix (`build.yaml:2-5`); build and artifacts are covered by [F12](build-firmware-ci.md) |

## Business rules

- The left half is always the central; the choice is fixed at build time, not at runtime (`config/boards/shields/dactyl/Kconfig.defconfig:6-7`).
- The keyboard name is set only when the left shield is built, so the right half has no name of its own (`config/boards/shields/dactyl/Kconfig.defconfig:1-4`).
- Split is enabled for both halves, never for one only (`config/boards/shields/dactyl/Kconfig.defconfig:11-14`).
- The shield requires the `pro_micro` interface, so it fits `nice_nano` and compatible boards only (`config/boards/shields/dactyl/dactyl.zmk.yml:6`, `build.yaml:2`).
- The shield exposes only the `keys` feature: no encoder, display or backlight (`config/boards/shields/dactyl/dactyl.zmk.yml:7-9`).

## Errors and edge cases

- Building a shield name other than `dactyl_left` or `dactyl_right` sets neither symbol, so no split role or name is defined from this shield (inferred from code) (`config/boards/shields/dactyl/Kconfig.shield:2`, `config/boards/shields/dactyl/Kconfig.shield:5`).
- Flashing the left image on the right half (or the reverse): the matrix pins are identical but `col-offset` is set only on the right (`config/boards/shields/dactyl/dactyl_left.overlay:3-13`, `config/boards/shields/dactyl/dactyl_right.overlay:28-31`). Whether the keyboard still works in that case is not verifiable from code.
- With `settings_reset` the shield list contains neither Dactyl shield, so none of this feature applies (`build.yaml:7-8`); see [F13](reset-ajustes-bonds.md).
- Central role on the left means the host pairs with the left half only; the right half is not visible to the host (inferred from code: standard ZMK split behavior).
- `west.yml` tracks ZMK `main`, so the role defaults come from whatever ZMK revision is current at build time (`config/west.yml:6-8`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Which half is central (swap roles) | `config/boards/shields/dactyl/Kconfig.defconfig` → `ZMK_SPLIT_ROLE_CENTRAL` (`config/boards/shields/dactyl/Kconfig.defconfig:6-7`); the keyboard name goes with it (`config/boards/shields/dactyl/Kconfig.defconfig:3-4`); the right-half column offset must follow (`config/boards/shields/dactyl/dactyl_right.overlay:28-31`) |
| Keyboard name shown to the host | `config/boards/shields/dactyl/Kconfig.defconfig` → `ZMK_KEYBOARD_NAME` (`config/boards/shields/dactyl/Kconfig.defconfig:3-4`) |
| Shield selection symbols (rename a shield, add a variant) | `config/boards/shields/dactyl/Kconfig.shield` → `SHIELD_DACTYL_LEFT` / `SHIELD_DACTYL_RIGHT` (`config/boards/shields/dactyl/Kconfig.shield:1-5`) |
| Shield metadata (id, name, required board interface, features) | `config/boards/shields/dactyl/dactyl.zmk.yml` (`config/boards/shields/dactyl/dactyl.zmk.yml:2-9`) |
| Which firmware images are built | `build.yaml` → `include` list (`build.yaml:1-8`) |
| Split-wide options (sleep, battery over BLE) | `config/dactyl.conf` (`config/dactyl.conf:1-15`) |
| ZMK version used by the build | `config/west.yml` → `zmk` project `revision` (`config/west.yml:6-8`) |

## Existing tests

- Ninguno conocido. The repo has no tests; the only check is the CI firmware build described in [F12](build-firmware-ci.md).

## Coverage / Gaps

- Peripheral role is implicit and not covered by any test or explicit setting: see fragment "Peripheral role is implicit, relies on ZMK defaults".
- Roles are only confirmed by a successful build; pairing and typing over BLE are still unchecked in the roadmap (`docs/04-roadmap.md:49`).
- The keyboard name has a second copy in the shield metadata: see fragment "Keyboard name defined twice".
- ZMK is tracked on `main`: see fragment "ZMK revision not pinned".
