# F7 - Bluetooth profile selection and clearing

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

Lets the user keep up to three Bluetooth host pairings on the keyboard (for example PC, laptop, phone) and switch between them from the keyboard itself, or discard the pairing of the current profile to re-pair it. It is reached by holding the NAV key and pressing one of four keys on the right half (`config/dactyl.keymap:71`, `docs/03-keymap.md:140-142`). The firmware only binds the ZMK `&bt` behavior; profile storage and the pairing logic are ZMK/Zephyr code outside this repo (inferred from code).

## Trigger / Entry point

- Config: four `&bt` bindings in the `nav_layer` node, row 3, right half: `&bt BT_SEL 0`, `&bt BT_SEL 1`, `&bt BT_SEL 2`, `&bt BT_CLR` (`config/dactyl.keymap:71`). Key positions 31, 32, 33 and 34 (row-major, 12 per row; inferred from code).
- The commands come from `dt-bindings/zmk/bt.h` (`config/dactyl.keymap:3`).
- The layer is active only while `&mo LAYER_NAV` is held, owned by [F2](cambio-de-capas.md) (`config/dactyl.keymap:48`, `config/dactyl.keymap:16`). The rest of the layer is documented in [F4](capa-navegacion-multimedia.md).

## Inputs (payload/config)

- Profile index argument `0`, `1` or `2` of `BT_SEL`: literal in the keymap, no runtime validation in this repo (`config/dactyl.keymap:71`). Three profiles is the count used by the docs (`docs/03-keymap.md:140`); the upper limit is a ZMK setting not defined here (inferred from code).
- `BT_CLR` takes no argument (`config/dactyl.keymap:71`).
- Key press events from the matrix of [F8](matriz-teclado-split.md).
- No Kconfig key in `config/dactyl.conf` touches profiles (`config/dactyl.conf:1-15`); ZMK defaults apply (inferred from code).

## Steps

1. The user holds the NAV key; [F2](cambio-de-capas.md) activates layer 2 (`config/dactyl.keymap:48`).
2. The user presses a key on the right half, row 3. The binding at that position in `nav_layer` is resolved (`config/dactyl.keymap:71`).
3. Select path: `&bt BT_SEL n` runs the ZMK Bluetooth behavior with command `BT_SEL` and parameter `n` (`config/dactyl.keymap:71`, `config/dactyl.keymap:3`).
   1. ZMK makes profile `n` the active one and the keyboard advertises or reconnects to the host bonded to that slot (inferred from code, ZMK behavior; not defined in this repo).
   2. The active profile index is saved in the half's settings flash (`docs/datos.md:11,28`; inferred from code).
4. Clear path: `&bt BT_CLR` runs the ZMK Bluetooth behavior with command `BT_CLR` (`config/dactyl.keymap:71`).
   1. The bond (key material) of the currently selected profile is deleted; the profile stays selected, so the keyboard can advertise again for new pairing (`docs/datos.md:29,74`; inferred from code).
5. The BLE role of the halves is not changed by these keys: the left half is central and holds the host connection, the right half is the peripheral (`config/boards/shields/dactyl/Kconfig.defconfig:6-7`; roles in F9). The keys sit on the right half; that the event is executed on the central is ZMK default behavior locality (inferred from code, see question fragment).

## Exit points

| Salida | Detalle |
|---|---|
| BLE active profile (settings flash) | Write: active profile index 0..2 on `BT_SEL` (`config/dactyl.keymap:71`; `docs/datos.md:28`, inferred from code) |
| BLE bond of the current profile (settings flash) | Delete: `BT_CLR` removes the bond key material of the selected profile (`config/dactyl.keymap:71`; `docs/datos.md:29`, inferred from code) |
| BLE advertising / connection | Side effect: the keyboard disconnects from the previous host and connects or advertises for the new profile (inferred from code, ZMK behavior) |

## Business rules

- Exactly three profile slots are exposed, `0`, `1`, `2`, one key each, in order left to right (`config/dactyl.keymap:71`).
- `BT_CLR` sits immediately right of `BT_SEL 2` and acts on the current profile only (`config/dactyl.keymap:71`, `docs/03-keymap.md:141`).
- The keys exist only on NAV, so they cannot be pressed from the base layer by accident (`config/dactyl.keymap:64-75`, `config/dactyl.keymap:41-52`).
- Docs state the keys act on the central (left) half, which owns the host connection (`docs/03-keymap.md:141-142`); the code only proves the binding on the right half (see Gaps).
- Wiping all stale bonds is not done by these keys: the `settings_reset` firmware is built separately and flashed per half (`build.yaml:6-8`, `docs/04-roadmap.md:47-48`).

## Errors and edge cases

- `BT_CLR` clears the current profile's bond on the keyboard; the host must also forget the keyboard before re-pairing, which is a host action not verifiable from code (inferred from code).
- A profile index beyond ZMK's configured maximum has no guard in this repo; only 0..2 are used (`config/dactyl.keymap:71`).
- Pairing with the host has not been done on hardware yet: the roadmap leaves it open (`docs/04-roadmap.md:47-49`), and the keymap is documented as not yet flashed (`docs/03-keymap.md:3`).
- The NAV legend comment of row 3 does not list the Bluetooth keys (`config/dactyl.keymap:70`); see the [F4](capa-navegacion-multimedia.md) fragment.
- If the split link is down, whether the keys take effect is not provable from this repo (inferred from code, ZMK split behavior).
- Holding NAV and SYM together activates both layers and the higher index (SYM = 3) wins where both bind a key. SYM binds `&kp` at positions 31-33 (`LS(EQUAL)`, `LS(COMMA)`, `LS(DOT)`) and `&trans` at 34, so `BT_SEL 0..2` are shadowed while SYM is also held and only `BT_CLR` still works (`config/dactyl.keymap:84`, `config/dactyl.keymap:17`; inferred from code, ZMK layer priority).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Which key selects profile 0, 1 or 2 | `config/dactyl.keymap` → `&bt BT_SEL n` in `nav_layer` (`config/dactyl.keymap:71`) |
| Move or remove the clear-bond key | `config/dactyl.keymap` → `&bt BT_CLR` (`config/dactyl.keymap:71`) |
| Number of profiles / extra commands (`BT_NXT`, `BT_PRV`, `BT_DISC`) | `config/dactyl.keymap` → `&bt` bindings (`config/dactyl.keymap:71`); command names from `dt-bindings/zmk/bt.h` (`config/dactyl.keymap:3`); max profiles is a ZMK Kconfig not set in `config/dactyl.conf:1-15` |
| Which key holds NAV (and so exposes the BT keys) | `config/dactyl.keymap` → `&mo LAYER_NAV` (`config/dactyl.keymap:48`); see [F2](cambio-de-capas.md) |
| Bluetooth-related Kconfig (battery proxy, GATT subscription) | `config/dactyl.conf` (`config/dactyl.conf:8-15`) |
| Which half is central (host-facing) | `config/boards/shields/dactyl/Kconfig.defconfig` → `ZMK_SPLIT_ROLE_CENTRAL` (`config/boards/shields/dactyl/Kconfig.defconfig:6-7`) |
| Wipe all bonds on a half | `build.yaml` → `settings_reset` entry (`build.yaml:6-8`) |
| Key legend / docs to keep in sync | `docs/03-keymap.md` → NAV table and BT notes (`docs/03-keymap.md:131,140-142`); comment at `config/dactyl.keymap:70` |

## Existing tests

- Ninguno conocido: the repository has no tests; `build.yaml` only builds the firmware and the `settings_reset` image (`build.yaml:1-8`).

## Coverage / Gaps

- No automated test pins the `&bt` bindings; validation is flashing CI artifacts (`build.yaml:1-8`).
- Pairing, profile switching and `BT_CLR` have not been verified on hardware (`docs/04-roadmap.md:45-49`, `docs/03-keymap.md:3`).
- Which half executes `&bt` when pressed on the right half is not provable from this repo (`docs/03-keymap.md:141-142`).
- Catalog exit lists only the profile/bond writes; the advertising side effect is added here.
- Open questions: `docs/.work/questions/gestion-perfiles-bluetooth.md`.
