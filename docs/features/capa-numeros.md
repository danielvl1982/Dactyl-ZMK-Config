# F3 - NUM layer (numeral row, ordinal mark key)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

The NUM layer (layer 1) gives the keyboard the Spanish number row. It is active only while the `FN` key is held. It frees the top row of the base layer for modifiers and layer keys (`docs/03-keymap.md:7`, `docs/03-keymap.md:23`). Only the first row has bindings: `º`, `1` to `5` on the left half and `6`, `7`, `8`, `9`, `0` on the right. Every other position is `&trans`, or `&none` for the two outer-bottom keys (`config/dactyl.keymap:57-60`). It is meant for a host set to the Spanish (ES) layout (`config/dactyl.keymap:8-10`). Each half has 23 physical keys and 24 matrix positions; the missing outer-bottom key is bound to `&none` (`config/dactyl.keymap:60`).

## Trigger / Entry point

- Config: `num_layer` node of the `zmk,keymap`, 48 bindings in row-major order, 12 per row (`config/dactyl.keymap:54-62`).
- The layer is activated by `&mo LAYER_NUM` on the right half, bottom row, second position (`FN`) (`config/dactyl.keymap:50`). `LAYER_NUM` is `1` (`config/dactyl.keymap:15`). The momentary-layer behavior is owned by [F2](cambio-de-capas.md).

## Inputs (payload/config)

- Key position 0..47 while layer 1 is active. The position-to-matrix mapping is defined in [F8](matriz-teclado-split.md) (`config/boards/shields/dactyl/dactyl.dtsi:36-41`).
- Layer id `LAYER_NUM 1`, which matches the `num_layer` node being the second entry under `keymap` (`config/dactyl.keymap:12`, `config/dactyl.keymap:15`, `config/dactyl.keymap:54`).
- Host layout: Spanish (ES). Stated only in a comment and in docs, nothing in the firmware enforces it (`config/dactyl.keymap:8-10`, `docs/03-keymap.md:19-21`).

## Steps

1. The user holds `FN`. ZMK activates layer 1 through `&mo LAYER_NUM`, see [F2](cambio-de-capas.md) (`config/dactyl.keymap:50`).
2. A key press at a position is looked up in the highest active layer, which is `num_layer` (`config/dactyl.keymap:54-62`).
3. Row 1, left half: `&kp GRAVE &kp N1 &kp N2 &kp N3 &kp N4 &kp N5` (`config/dactyl.keymap:57`).
   1. `&kp GRAVE` is the first key of the row. On the ES host it types `º` (`config/dactyl.keymap:56`, `docs/03-keymap.md:42`).
4. Row 1, right half: `&kp N6 &kp N7 &kp N8 &kp N9 &kp N0 &trans` (`config/dactyl.keymap:57`).
5. Rows 2 and 3 are fully `&trans`; row 4 is `&trans` except the two outer keys, which are `&none` (`config/dactyl.keymap:58-60`).
6. For a `&trans` position ZMK uses the binding of the same position in the next lower active layer, which is the base layer (see [F1](capa-base-qwerty-es.md)) (`config/dactyl.keymap:58-60`; fall-through is ZMK standard behavior, inferido del código).
7. `&kp` emits the HID keycode to the keyboard report (`config/dactyl.keymap:57`).

## Exit points

| Salida | Detalle |
|---|---|
| USB/BLE HID keyboard report | Write: keycodes `GRAVE`, `N1`, `N2`, `N3`, `N4`, `N5`, `N6`, `N7`, `N8`, `N9`, `N0` (`config/dactyl.keymap:57`). No modifiers are added on this layer. |
| Base layer bindings (via `&trans`) | Delegated: 35 of the 48 positions fall through to the base layer (see [F1](capa-base-qwerty-es.md)) (`config/dactyl.keymap:57-60`) |

## Business rules

- NUM holds the number row where a physical Spanish keyboard has it: `º` then `1` to `0` (`docs/03-keymap.md:107-111`, `config/dactyl.keymap:57`).
- `º` (ordinal mark) is `&kp GRAVE`, because that HID position produces `º` on the ES layout (`config/dactyl.keymap:56-57`, `docs/03-keymap.md:42`).
- The digits are plain `&kp N1`..`&kp N0`, never combined with Shift or AltGr, so the layer types digits and not the symbols of the same keys (`config/dactyl.keymap:57`). The shifted symbols are on SYM, see [F5](capa-simbolos.md) (`config/dactyl.keymap:80`).
- Everything outside the first row is transparent, so the base layer stays usable while `FN` is held (`config/dactyl.keymap:58-60`).
- The `FN` key itself is `&trans` on NUM, so releasing it still ends the layer (`config/dactyl.keymap:60`, `config/dactyl.keymap:50`; inferido del código).
- Outer-bottom positions are `&none` and send nothing (`config/dactyl.keymap:60`).
- The last key of row 1 is `&trans`, so while `FN` is held it behaves as the base-layer `&mo LAYER_SYM` (`config/dactyl.keymap:57`, `config/dactyl.keymap:44`).

## Errors and edge cases

- Host in US layout → `GRAVE` types a backtick instead of `º`; the digits are unaffected. The firmware cannot detect it (`config/dactyl.keymap:8-10`, `docs/03-keymap.md:42`).
- `&none` positions send nothing and do not fall through to lower layers (`config/dactyl.keymap:60`).
- `FN` held and the right-most key of row 1 pressed → falls through to the base `&mo LAYER_SYM`, so SYM is active on top of NUM (`config/dactyl.keymap:57`, `config/dactyl.keymap:44`; inferido del código).
- Holding `FN` together with `&mo LAYER_NAV` (right-most key of row 3) activates NAV above NUM. The F-keys on NAV are therefore reachable while `FN` is held (`config/dactyl.keymap:60`, `config/dactyl.keymap:48`, `config/dactyl.keymap:67`; inferido del código).
- The transform still maps `RC(3,0)` and `RC(3,6)`, although no key exists there (`config/boards/shields/dactyl/dactyl.dtsi:40`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| A digit or the ordinal mark key | `config/dactyl.keymap` → `num_layer`, row 1 (`config/dactyl.keymap:57`) |
| Add a binding on another NUM position (rows 2-4) | `config/dactyl.keymap` → `num_layer` rows (`config/dactyl.keymap:58-60`) replacing `&trans` |
| Which key opens NUM / hold vs toggle behavior | `config/dactyl.keymap` → `&mo LAYER_NUM` (`config/dactyl.keymap:50`); layer ids at `config/dactyl.keymap:15-17`; see [F2](cambio-de-capas.md) |
| Layer index / order | `config/dactyl.keymap` → `LAYER_NUM` and node order under `keymap` (`config/dactyl.keymap:12`, `config/dactyl.keymap:15`, `config/dactyl.keymap:54`) |
| Physical position of a key (matrix) | `config/boards/shields/dactyl/dactyl.dtsi` → `default_transform` (`config/boards/shields/dactyl/dactyl.dtsi:32-42`), see [F8](matriz-teclado-split.md) |
| Host layout assumption (move to US) | `GRAVE` binding for `º` (`config/dactyl.keymap:57`); layout note at `config/dactyl.keymap:8-10` |

## Existing tests

- Ninguno conocido: the repository has no tests; `build.yaml` only builds the firmware (`build.yaml:1-8`).

## Coverage / Gaps

- No automated test pins the NUM layer; it is validated by flashing the CI artifacts (`build.yaml:1-8`).
- `docs/03-keymap.md` says "not yet flashed", so the behavior on hardware is unverified (`docs/03-keymap.md:3`).
- `docs/03-keymap.md` says blank cells are `&trans`, but the two outer-bottom cells are `&none` (`docs/03-keymap.md:121`, `config/dactyl.keymap:60`). See fragment.
- Fall-through of `&trans` and the self-release of `FN` rely on ZMK semantics, not on repository code (inferido del código).
- Open questions: `docs/.work/questions/capa-numeros.md`.
