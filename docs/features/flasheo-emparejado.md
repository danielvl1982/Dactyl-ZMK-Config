# F14 - Flashing and pairing workflow (double-tap reset, copy .uf2)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

Gets the firmware built by CI ([F12](build-firmware-ci.md)) onto each nice!nano half and connects the halves and a host over Bluetooth, for the maintainer of this keyboard. This process exists only as prose: there is no script, workflow or code behind it. Every step below is documented-only (`inferido del código` / inferred from code where noted). `docs/04-roadmap.md:24,47-49` records that flashing the v1.0 firmware, flashing `settings_reset` and pairing with the host have not been done on hardware yet; only the older 24-position test keymap was flashed (`docs/02-current-state.md:15-17,21,55`).

## Trigger / Entry point

- Manual action by the maintainer: double-tap the reset button on a nice!nano so it mounts as a USB drive, then copy the matching `.uf2` onto it (`README.md:64-65`). Documented only; no code triggers it.
- Manual reset variant: flash the `settings_reset` image on a half, then flash the real firmware again (`build.yaml:6-8`, `docs/operaciones.md:43`). See [F13](reset-ajustes-bonds.md).
- Manual pairing on the host side (add the keyboard in the host's Bluetooth settings) is not described in the repo; inferred from code (`inferido del código`) from the existence of the `&bt` bindings (`config/dactyl.keymap:71`). See [F7](gestion-perfiles-bluetooth.md).

## Inputs (payload/config)

- `dactyl_left.uf2` — artifact of the CI matrix entry `shield: dactyl_left`, flashed on the left half (`build.yaml:1-2`, `docs/operaciones.md:42`).
- `dactyl_right.uf2` — artifact for `shield: dactyl_right`, flashed on the right half (`build.yaml:3-4`).
- `settings_reset.uf2` — artifact for `shield: settings_reset`, flashed on a half to wipe its bonds (`build.yaml:6-8`).
- Artifact naming and download location are defined by the upstream ZMK workflow, not by this repo (`.github/workflows/build.yml:6`, `README.md:59-61`; `inferido del código`). See [F12](build-firmware-ci.md).
- Hardware: two nice!nano boards and a USB cable (`docs/operaciones.md:12`).

## Steps

1. Obtain the `.uf2` files from the workflow artifacts produced by [F12](build-firmware-ci.md) (`README.md:59-61`).
2. Flash each half (documented only):
   1. Double-tap the reset button so the board mounts as a USB drive (`README.md:64`).
   2. Copy the matching `.uf2` onto the drive: `dactyl_left` to the left half, `dactyl_right` to the right half (`README.md:65`, `docs/operaciones.md:42`).
   3. The board reboots into the new firmware on its own; this is standard nice!nano UF2 bootloader behavior and not stated in the repo (`inferido del código`).
3. Optional bond wipe, per [F13](reset-ajustes-bonds.md): flash `settings_reset.uf2` on a half, then flash the real firmware again (`build.yaml:6`). The roadmap plans this on both halves (`docs/04-roadmap.md:47-48`).
4. Pair (documented only):
   1. The left half is the central and the right half the peripheral (`config/boards/shields/dactyl/Kconfig.defconfig:1,6-7`; see [F9](roles-split-ble.md)).
   2. Pairing the central half with the host and confirming both halves type over BLE is an open roadmap item (`docs/04-roadmap.md:49`).
   3. Host profiles are selected with `&bt BT_SEL 0/1/2` and the current bond cleared with `&bt BT_CLR` on the NAV layer (`config/dactyl.keymap:71`; see [F7](gestion-perfiles-bluetooth.md)).
5. Verify each key and layer on the hardware (`docs/04-roadmap.md:24`, `docs/05-build-log.md:20`).

## Exit points

| Salida | Detalle |
|---|---|
| nice!nano firmware flash (each half) | Write: `.uf2` copied to the bootloader drive (`README.md:64-65`) |
| Settings flash partition (BLE bonds, profiles) | Written when the host pairs (`inferido del código`); wiped when `settings_reset` is flashed (`build.yaml:6-8`, `docs/datos.md:63`) |

## Business rules

- Each half receives its own `.uf2`; left and right images are not interchangeable (`README.md:65`, `docs/operaciones.md:42`).
- Flash `settings_reset`, then the real firmware again, to clear bonds (`build.yaml:6`).
- The left half is the BLE central that pairs with the host; the right half is the peripheral (`config/boards/shields/dactyl/Kconfig.defconfig:6-7`).

## Errors and edge cases

- Order for resetting both halves, re-flashing and pairing with the host is not described anywhere → undocumented (`docs/operaciones.md:47`). Fragment emitted.
- Whether the host must forget a previous pairing before re-pairing is not documented → unknown (`docs/04-roadmap.md:47-49`). Fragment emitted.
- Nothing in the repo detects a wrong `.uf2` on a half (for example the right image on the left half); no code exists for this process (`docs/arquitectura.md:155`).
- Flashing the v1.0 keymap and split firmware has never been tried (`docs/02-current-state.md:15,55`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Flash instructions (manual steps) | `README.md` → section "Build" (`README.md:64-65`) |
| Which images exist to flash (targets) | `build.yaml` → `include` matrix (`build.yaml:1-8`) |
| Bond wipe procedure | `build.yaml` → `settings_reset` entry and comment (`build.yaml:6-8`), see [F13](reset-ajustes-bonds.md) |
| Which half is central (pairing target) | `config/boards/shields/dactyl/Kconfig.defconfig` → `ZMK_SPLIT_ROLE_CENTRAL` (`:6-7`), see [F9](roles-split-ble.md) |
| Host profile selection and clearing | `config/dactyl.keymap` → `nav_layer` `&bt` bindings (`config/dactyl.keymap:71`), see [F7](gestion-perfiles-bluetooth.md) |
| Operational write-up and roadmap status | `docs/operaciones.md:38-47`, `docs/04-roadmap.md:47-49` |

## Existing tests

Ninguno conocido. No automated tests exist; validation is a human flashing and typing (`docs/operaciones.md:51`).

## Coverage / Gaps

- Entire process is untested and unverified on hardware for the v1.0 firmware (`docs/04-roadmap.md:24,47-49`, `docs/02-current-state.md:55`).
- Reset and pairing order is undocumented (fragment `negocio-datos`; also Q-OPS-3 in `docs/operaciones.md:47`).
- Conflicting prose: `README.md:7` says one half flashes and types with a test keymap, while `docs/02-current-state.md:21` says both halves were flashed with it (fragment `inconsistencia`).
