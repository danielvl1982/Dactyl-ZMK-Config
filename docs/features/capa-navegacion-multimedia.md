# F4 - NAV layer (F1-F12, arrows, Home/End/PgUp/PgDn, Del, volume, media)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

The NAV layer (layer 2) gives the keyboard function keys, cursor keys, Home/End/PgUp/PgDn, forward Delete, volume and media transport, plus the Bluetooth profile keys, while the NAV key is held (`config/dactyl.keymap:12`, `config/dactyl.keymap:64-75`). It exists because the board has no dedicated keys for these and the number row lives on [F3](capa-numeros.md) (`docs/03-keymap.md:7-11`). Each half has 23 physical keys; the layer lists 24 positions per half and binds the outer-bottom one to `&none` (`config/dactyl.keymap:66-73`, `README.md:16`).

## Trigger / Entry point

- Config: `nav_layer` node of the `zmk,keymap`, 48 bindings in row-major order, 12 per row (`config/dactyl.keymap:64-75`).
- The layer is activated by the `&mo LAYER_NAV` key on the outer-right of row 3 of the base layer, owned by [F2](cambio-de-capas.md) (`config/dactyl.keymap:48`, `config/dactyl.keymap:16`).
- Key events come from the matrix of [F8](matriz-teclado-split.md).

## Inputs (payload/config)

- Key position 0..47, row-major, left half first in each row (`config/dactyl.keymap:66-73`; matrix mapping in [F8](matriz-teclado-split.md)).
- Layer constant `LAYER_NAV 2`, order base = 0, num = 1, nav = 2, sym = 3 (`config/dactyl.keymap:12`, `config/dactyl.keymap:16`).
- Include `dt-bindings/zmk/bt.h` for the `BT_SEL` and `BT_CLR` commands (`config/dactyl.keymap:3`).
- Host layout is not relevant for these keys: F-keys, cursor keys and consumer keys are layout independent (inferred from code, keycodes are not characters).

## Steps

1. The user holds the right outer key of row 3; [F2](cambio-de-capas.md) activates layer 2 (`config/dactyl.keymap:48`).
2. A key press is resolved at its position in the highest active layer that does not bind `&trans` (`config/dactyl.keymap:64-75`).
3. Row 1 (`config/dactyl.keymap:67`):
   1. Left: `&none`, `F1`, `F2`, `F3`, `F4`, `F5`.
   2. Right: `HOME`, `PG_DN`, `PG_UP`, `END`, `&trans`, `&trans`.
4. Row 2 (`config/dactyl.keymap:69`):
   1. Left: `&trans`, `F6`, `F7`, `F8`, `F9`, `F10`.
   2. Right: `LEFT`, `DOWN`, `UP`, `RIGHT`, `&trans`, `&trans`.
5. Row 3 (`config/dactyl.keymap:71`):
   1. Left: `&trans`, `F11`, `F12`, `C_VOL_DN`, `C_VOL_UP`, `C_MUTE`.
   2. Right: `DEL`, `&bt BT_SEL 0`, `&bt BT_SEL 1`, `&bt BT_SEL 2`, `&bt BT_CLR`, `&trans`. The Bluetooth keys are owned by [F7](gestion-perfiles-bluetooth.md).
6. Row 4 (`config/dactyl.keymap:73`):
   1. Left: `&none`, `C_PREV`, `C_NEXT`, `&trans`, `&trans`, `C_PP`.
   2. Right: `&trans` x5, `&none`.
7. `&kp` with a keyboard keycode writes to the HID keyboard report; `&kp` with a `C_*` code writes to the HID consumer report (`config/dactyl.keymap:67-73`).
8. A `&trans` position falls through to the layer below. This keeps `LSHFT`, `TAB` (left outer, rows 2-3), `ENTER`, `BSPC`, `&mo LAYER_NUM`, `LALT` and `END` (row 4 right), and the `&mo LAYER_NAV` key itself working while NAV is held (`config/dactyl.keymap:69,71,73`, `config/dactyl.keymap:46,48,50`).

## Exit points

| Salida | Detalle |
|---|---|
| HID keyboard report | Write: `F1`-`F12`, `HOME`, `PG_DN`, `PG_UP`, `END`, `LEFT`, `DOWN`, `UP`, `RIGHT`, `DEL` (`config/dactyl.keymap:67-71`) |
| HID consumer report | Write: `C_VOL_DN`, `C_VOL_UP`, `C_MUTE`, `C_PREV`, `C_NEXT`, `C_PP` (`config/dactyl.keymap:71,73`) |
| Bluetooth profile state | Write (indirect): `BT_SEL 0..2`, `BT_CLR`, see [F7](gestion-perfiles-bluetooth.md) (`config/dactyl.keymap:71`) |

## Business rules

- `DEL` on NAV is forward Delete; `BSPC` stays on the base layer and keeps working while NAV is held (`config/dactyl.keymap:71`, `config/dactyl.keymap:50`, `docs/03-keymap.md:137-138`).
- `HOME` lives only on NAV, `END` is on both NAV and the base layer (`config/dactyl.keymap:67`, `config/dactyl.keymap:50`, `docs/03-keymap.md:93`).
- Arrow cluster is `LEFT DOWN UP RIGHT` on the right home row (`config/dactyl.keymap:69`).
- Media transport sits in the left bottom row: `C_PREV`, `C_NEXT`, `C_PP` (`config/dactyl.keymap:73`).
- Volume down, up and mute sit on row 3 left (`config/dactyl.keymap:71`).
- The outer-left key of row 1 and both outer-bottom keys are `&none`, which sends nothing and does not fall through (`config/dactyl.keymap:67,73`).
- `LCTRL` and `LGUI` (base, left row 4 positions 3 and 4) stay reachable because NAV binds `&trans` there, so modifier plus arrow works (`config/dactyl.keymap:73`, `config/dactyl.keymap:50`; inferido del código / inferred from code).

## Errors and edge cases

- `C_PP` replaces `SPACE` while NAV is held, so there is no space bar in NAV (`config/dactyl.keymap:73`, `config/dactyl.keymap:50`).
- `Q W E R T`, `Y U I O`, `A S D F G`, `H J K L`, `Z X C V B` and `N M , . /` are all shadowed on NAV. `P`, `ñ` and the dead acute stay typeable because their NAV positions are `&trans` (`config/dactyl.keymap:67`, `config/dactyl.keymap:69`); every other letter cannot be typed while NAV is held (`config/dactyl.keymap:67-71`).
- The right outer key of row 1 is `&trans` and falls to `&mo LAYER_SYM`; holding it with NAV activates both layers, and the higher index (SYM = 3) wins where both bind a key (inferred from code, ZMK layer priority; `config/dactyl.keymap:67`, `config/dactyl.keymap:44`, `config/dactyl.keymap:17`).
- Consumer keys need the host to accept consumer HID usages; the project config does not enable or disable them explicitly (inferred from code, ZMK default; `config/dactyl.conf:1-15`).
- `F1`-`F12` and media keys depend on host and OS shortcuts; behavior on the host is not verifiable from code.
- Stale comment: the row 3 legend lists `DEL` followed by blanks, but the bindings carry four Bluetooth keys there (`config/dactyl.keymap:70-71`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| An F-key (F1-F12) | `config/dactyl.keymap` → `nav_layer` (`config/dactyl.keymap:67,69,71`) |
| Arrows, Home, End, PgUp, PgDn or Del | `config/dactyl.keymap` → `nav_layer` rows 1-3 right (`config/dactyl.keymap:67,69,71`) |
| Volume, mute, prev, next or play/pause | `config/dactyl.keymap` → `&kp C_*` (`config/dactyl.keymap:71,73`) |
| Add a media key (consumer code) | `config/dactyl.keymap` → free `&trans` position in `nav_layer` (`config/dactyl.keymap:73`); keycodes from `dt-bindings/zmk/keys.h` (`config/dactyl.keymap:2`) |
| Which key holds NAV | `config/dactyl.keymap` → `&mo LAYER_NAV` in `base_layer` (`config/dactyl.keymap:48`), id at `config/dactyl.keymap:16`; see [F2](cambio-de-capas.md) |
| Block or pass through a key while NAV is held | `&none` vs `&trans` in `nav_layer` (`config/dactyl.keymap:66-73`) |
| Bluetooth profile keys on NAV | `config/dactyl.keymap` → `&bt` bindings (`config/dactyl.keymap:71`); see [F7](gestion-perfiles-bluetooth.md) |
| Physical position of a key | `config/boards/shields/dactyl/dactyl.dtsi` → `default_transform`, see [F8](matriz-teclado-split.md) |
| Layer documentation to keep in sync | `docs/03-keymap.md` → NAV table (`docs/03-keymap.md:123-142`) |

## Existing tests

- Ninguno conocido: the repository has no tests; `build.yaml` only builds the firmware (`build.yaml:1-8`).

## Coverage / Gaps

- No automated test pins the NAV bindings; they are validated by flashing the CI artifacts (`build.yaml:1-8`).
- `docs/03-keymap.md` says "not yet flashed", so NAV behavior on hardware is unverified (`docs/03-keymap.md:3`, `docs/04-roadmap.md:57`).
- The roadmap still lists "verify NUM, NAV and SYM as momentary layers" as pending (`docs/04-roadmap.md:57`).
- Catalog exits for F4 omit the Bluetooth bindings that share the layer; see Exit points.
- Open questions: `docs/preguntas-abiertas.md` items 14, 15, 45 and 46.
