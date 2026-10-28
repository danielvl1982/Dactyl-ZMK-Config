# F8 - Key matrix scan and split matrix transform (12 columns)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

Defines how each half scans its physical switches and how both halves are merged into one 4 x 12 logical matrix, so the keymap can be written in reading order (left half then right half, 48 positions). Each half has 23 physical switches; the 24th matrix position (outer-bottom) is kept in the transform and bound to `&none` in the keymap (`config/boards/shields/dactyl/dactyl.dtsi:32-42`, `config/dactyl.keymap:50`). The layers that consume these positions are [F1](capa-base-qwerty-es.md), [F3](capa-numeros.md), [F4](capa-navegacion-multimedia.md) and [F5](capa-simbolos.md); the momentary layer keys are in [F2](cambio-de-capas.md).

## Trigger / Entry point

- Config: `kscan0` node, driver `zmk,kscan-gpio-matrix`, selected through `chosen` (`config/boards/shields/dactyl/dactyl.dtsi:4-7`, `config/boards/shields/dactyl/dactyl.dtsi:9-10`).
- Config: `default_transform` node, driver `zmk,matrix-transform`, 12 columns by 4 rows (`config/boards/shields/dactyl/dactyl.dtsi:32-35`).
- Config: left half `col-gpios` (`config/boards/shields/dactyl/dactyl_left.overlay:3-12`).
- Config: right half `col-gpios` and `col-offset = <6>` (`config/boards/shields/dactyl/dactyl_right.overlay:3-12`, `config/boards/shields/dactyl/dactyl_right.overlay:15-18`).
- Shield selection: `SHIELD_DACTYL_LEFT` / `SHIELD_DACTYL_RIGHT` tell which half is built (`config/boards/shields/dactyl/Kconfig.shield:1-5`). The left half is the split central; `ZMK_SPLIT` is forced on for both (`config/boards/shields/dactyl/Kconfig.defconfig:1-16`). The roles are covered in [F9](roles-split-ble.md).
- Used by [F1](capa-base-qwerty-es.md) (every key position of the base layer) and [F10](sueno-profundo.md) (`wakeup-source` of `kscan0`).

## Inputs (payload/config)

- `row-gpios` — four `pro_micro` pins 21, 20, 19, 18, `GPIO_ACTIVE_HIGH | GPIO_PULL_DOWN`, shared by both halves (`config/boards/shields/dactyl/dactyl.dtsi:14-20`).
- `diode-direction = "col2row"` (`config/boards/shields/dactyl/dactyl.dtsi:11`).
- `wakeup-source` — a key press wakes the half from deep sleep (`config/boards/shields/dactyl/dactyl.dtsi:12`, `config/dactyl.conf:3-6`).
- `col-gpios` — six `pro_micro` pins 2 to 7, `GPIO_ACTIVE_HIGH`, identical on both halves (`config/boards/shields/dactyl/dactyl_left.overlay:5-12`, `config/boards/shields/dactyl/dactyl_right.overlay:5-12`).
- `col-offset = <6>` — only on the right half, shifts its local columns 0-5 to global columns 6-11 (`config/boards/shields/dactyl/dactyl_right.overlay:17`). The left half does not set it, so it uses the default of 0 (`inferido del código`).
- `map` — 48 `RC(row,col)` entries, row-major, 12 per row (`config/boards/shields/dactyl/dactyl.dtsi:36-41`).

## Steps

1. Each half scans its own matrix: 4 rows by 6 columns, `col2row` (`config/boards/shields/dactyl/dactyl.dtsi:9-20`, `config/boards/shields/dactyl/dactyl_left.overlay:3-12`).
   1. Both PCBs count columns from the outside towards the center, so local column 0 is the outermost key of each half (`config/boards/shields/dactyl/dactyl.dtsi:27-28`).
2. The right half adds `col-offset = <6>` to its local column, so a press at local column `c` becomes global column `c + 6` (`config/boards/shields/dactyl/dactyl_right.overlay:15-18`). That the offset is applied to the reported event is `inferido del código` (ZMK driver behavior, not defined in this repo).
3. `default_transform` converts `RC(row,col)` to a key position by the order of the `map` entries (`config/boards/shields/dactyl/dactyl.dtsi:36-41`).
   1. Left half: columns 0-5 appear in order, so the position is `row * 12 + col` (`config/boards/shields/dactyl/dactyl.dtsi:37-40`).
   2. Right half: columns are listed in reverse (`RC(r,11)` ... `RC(r,6)`), so the outermost key (local column 0, global column 6) lands at the end of each row and the innermost one right after the left half (`config/boards/shields/dactyl/dactyl.dtsi:37-40`).
4. The resulting position (0 to 47) indexes the `bindings` list of the active layer in the keymap (`config/dactyl.keymap:44-50`). The right half press reaches the central over BLE (`inferido del código`: ZMK split behavior, enabled by `ZMK_SPLIT` in `config/boards/shields/dactyl/Kconfig.defconfig:13-14`).

Position table (row-major, 12 per row):

| Row | Left half | Right half |
|---|---|---|
| 0 | positions 0-5 = `RC(0,0)`-`RC(0,5)` | positions 6-11 = `RC(0,11)`-`RC(0,6)` |
| 1 | positions 12-17 | positions 18-23 |
| 2 | positions 24-29 | positions 30-35 |
| 3 | positions 36-41 | positions 42-47 |

The position numbers are `inferido del código` from the 12-per-row order of the `map` (`config/boards/shields/dactyl/dactyl.dtsi:36-41`).

## Exit points

| Salida | Detalle |
|---|---|
| ZMK key position events (0..47) | One event per press/release at the position given by `default_transform`; the right half is reported over BLE to the central (`config/boards/shields/dactyl/dactyl.dtsi:6`, `config/boards/shields/dactyl/Kconfig.defconfig:1-8`) |

## Business rules

- Both halves use the same row pins and the same column pins; the only difference between the overlays is `col-offset` on the right (`config/boards/shields/dactyl/dactyl.dtsi:14-20`, `config/boards/shields/dactyl/dactyl_left.overlay:5-12`, `config/boards/shields/dactyl/dactyl_right.overlay:5-12`, `config/boards/shields/dactyl/dactyl_right.overlay:17`).
- The right half column order is reversed in the transform, not in the keymap, so the keymap rows stay in reading order (`config/boards/shields/dactyl/dactyl.dtsi:27-28`, `config/boards/shields/dactyl/dactyl.dtsi:37-40`).
- Each half has 23 physical keys; the missing one is the bottom key of the outer column: position 36 (`RC(3,0)`) on the left and position 47 (`RC(3,6)`) on the right (`config/boards/shields/dactyl/dactyl.dtsi:29-30`, `config/boards/shields/dactyl/dactyl.dtsi:40`, `docs/01-hardware.md:15-16`).
- The transform keeps all 24 positions per half, including the missing key. The keymap binds those two positions to `&none` on every layer (`config/dactyl.keymap:50`, `config/dactyl.keymap:60`, `config/dactyl.keymap:73`, `config/dactyl.keymap:86`). This is the current behavior, confirmed by the user.
- The left half is the split central; the right half is the peripheral (`config/boards/shields/dactyl/Kconfig.defconfig:1-8`).
- `columns = <12>` and `rows = <4>` must stay consistent with the keymap size of 48 bindings per layer (`config/boards/shields/dactyl/dactyl.dtsi:34-35`, `config/dactyl.keymap:44-50`).

## Errors and edge cases

- Both halves have the same pins and matrix; flashing the wrong shield on a half gives a mirrored or shifted layout rather than an error (`inferido del código`; `config/boards/shields/dactyl/dactyl_left.overlay:5-12`, `config/boards/shields/dactyl/dactyl_right.overlay:5-12`).
- Positions 36 and 47 cannot produce an event because no switch is wired there; their `&none` binding is never exercised on hardware (`inferido del código`; `config/dactyl.keymap:50`).
- A layer with a binding count different from 48 is not checked by this repo; any compile-time check belongs to ZMK (`inferido del código`; `config/dactyl.keymap:41-52`).
- Binding a real key to position 36 or 47 by mistake would leave it silently dead (`inferido del código`; `config/dactyl.keymap:50`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Row pins (both halves) | `config/boards/shields/dactyl/dactyl.dtsi` → `kscan0.row-gpios` (`config/boards/shields/dactyl/dactyl.dtsi:15-20`) |
| Column pins, left half | `config/boards/shields/dactyl/dactyl_left.overlay` → `&kscan0.col-gpios` (`config/boards/shields/dactyl/dactyl_left.overlay:5-12`) |
| Column pins, right half | `config/boards/shields/dactyl/dactyl_right.overlay` → `&kscan0.col-gpios` (`config/boards/shields/dactyl/dactyl_right.overlay:5-12`) |
| Diode direction or wake-up | `config/boards/shields/dactyl/dactyl.dtsi` → `kscan0` (`config/boards/shields/dactyl/dactyl.dtsi:11-12`) |
| Right half offset | `config/boards/shields/dactyl/dactyl_right.overlay` → `&default_transform.col-offset` (`config/boards/shields/dactyl/dactyl_right.overlay:15-18`) |
| Column order or mirror (position to `RC`) | `config/boards/shields/dactyl/dactyl.dtsi` → `default_transform.map` (`config/boards/shields/dactyl/dactyl.dtsi:36-41`) |
| Add or remove a physical key (e.g. fill the outer-bottom position) | `default_transform.map` (`config/boards/shields/dactyl/dactyl.dtsi:40`) and the `&none` entries in each layer (`config/dactyl.keymap:50`, `config/dactyl.keymap:60`, `config/dactyl.keymap:73`, `config/dactyl.keymap:86`) |
| Matrix size | `default_transform.columns` / `rows` (`config/boards/shields/dactyl/dactyl.dtsi:34-35`) |
| Which half is central, split enabled | `config/boards/shields/dactyl/Kconfig.defconfig` (`config/boards/shields/dactyl/Kconfig.defconfig:1-16`) |
| Keyboard name | `config/boards/shields/dactyl/Kconfig.defconfig` → `ZMK_KEYBOARD_NAME` (`config/boards/shields/dactyl/Kconfig.defconfig:3-4`) |

## Existing tests

Ninguno conocido. The repo has no automated tests; the matrix was verified by hand on hardware with a 24-position test keymap (`docs/02-current-state.md:21-34`, `docs/02-current-state.md:62-63`).

## Coverage / Gaps

- No test or build check pins the position map or the 48-binding size; correctness depends on the manual hardware test of the old 24-position keymap (`docs/02-current-state.md:21-34`).
- The 23-vs-24 key mismatch is resolved: 23 physical keys per half is correct and the 24th transform position is kept on purpose, bound to `&none` (`docs/preguntas-abiertas.md`, "Resuelto durante la documentación" item 1; `config/boards/shields/dactyl/dactyl.dtsi:29-31`, `config/boards/shields/dactyl/dactyl.dtsi:37-40`).
- Related docs: `docs/01-hardware.md:15-19`, `docs/01-hardware.md:57-65`.
