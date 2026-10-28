# matriz-teclado-split Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Defines how each half scans its physical switches and how both halves are merged into one 4 x 12 logical matrix (48 key positions) so the keymap can be written in reading order. Documentation: `docs/features/matriz-teclado-split.md`. Ticket: none.

## Requirements

### Requirement: Per-half matrix scan

The system SHALL scan each half as a 4-row by 6-column GPIO matrix with `diode-direction = "col2row"` and `wakeup-source`, using the same four row pins (`pro_micro` 21, 20, 19, 18, `GPIO_ACTIVE_HIGH | GPIO_PULL_DOWN`) on both halves (`config/boards/shields/dactyl/dactyl.dtsi:9-20`).

#### Scenario: Both halves share row pins
- GIVEN the left or the right half is built
- WHEN the `kscan0` node is evaluated
- THEN the system SHALL use the same `row-gpios` list for that half

#### Scenario: Key press wakes the half
- GIVEN `wakeup-source` is set on `kscan0`
- WHEN a key is pressed while the half is in deep sleep
- THEN the system SHALL treat the press as a wake-up source (`config/boards/shields/dactyl/dactyl.dtsi:12`, `config/dactyl.conf:3-6`)

### Requirement: Column pins

The system SHALL define six column pins (`pro_micro` 2 to 7, `GPIO_ACTIVE_HIGH`) identical on the left and right overlays (`config/boards/shields/dactyl/dactyl_left.overlay:3-12`, `config/boards/shields/dactyl/dactyl_right.overlay:3-12`). The only difference between the overlays SHALL be `col-offset` on the right (`config/boards/shields/dactyl/dactyl_right.overlay:17`).

#### Scenario: Identical column pins
- GIVEN the left and right overlays
- WHEN their `col-gpios` are compared
- THEN the system SHALL have the same six pins on both

#### Scenario: Wrong shield flashed
- GIVEN the same pins and matrix on both halves
- WHEN the wrong shield is flashed on a half
- THEN the layout is mirrored or shifted rather than rejected with an error (`inferido del código`)

### Requirement: Right half column offset

The system SHALL set `col-offset = <6>` only on the right half, so a press at local column `c` becomes global column `c + 6` (`config/boards/shields/dactyl/dactyl_right.overlay:15-18`). The left half does not set it and uses the default of 0 (`inferido del código`).

#### Scenario: Right half press
- GIVEN the right half is pressed at local column 0 (outermost key)
- WHEN the transform is applied
- THEN the system SHALL report global column 6 (offset applied by the ZMK driver, `inferido del código`)

#### Scenario: Left half press
- GIVEN the left half is pressed at local column `c`
- WHEN the transform is applied
- THEN the system SHALL report global column `c` (`inferido del código`)

### Requirement: Matrix transform to key positions

The system SHALL declare `default_transform` (`zmk,matrix-transform`) with `columns = <12>` and `rows = <4>` and a `map` of 48 `RC(row,col)` entries in row-major order, 12 per row (`config/boards/shields/dactyl/dactyl.dtsi:32-42`). It SHALL be selected through `chosen` (`config/boards/shields/dactyl/dactyl.dtsi:4-7`).

#### Scenario: Left half positions
- GIVEN the left half columns 0-5 are listed in order in each row
- WHEN a left key is pressed at `RC(r,c)`
- THEN the system SHALL map it to position `r * 12 + c` (`config/boards/shields/dactyl/dactyl.dtsi:37-40`)

#### Scenario: Right half reversed order
- GIVEN the right half is listed as `RC(r,11)` to `RC(r,6)` in each row
- WHEN the outermost right key (global column 6) is pressed
- THEN the system SHALL map it to the last position of the row, with the innermost key right after the left half (`config/boards/shields/dactyl/dactyl.dtsi:37-40`)

#### Scenario: Position numbering
- GIVEN the 12-per-row order of `map`
- WHEN positions are enumerated
- THEN rows 0-3 occupy positions 0-11, 12-23, 24-35 and 36-47 (`inferido del código`; `config/boards/shields/dactyl/dactyl.dtsi:36-41`)

### Requirement: Keymap in reading order

The system SHALL reverse the right half column order in the transform, not in the keymap, so keymap rows stay in reading order (left half then right half) (`config/boards/shields/dactyl/dactyl.dtsi:27-28`, `config/boards/shields/dactyl/dactyl.dtsi:37-40`). The resulting position (0 to 47) SHALL index the `bindings` list of the active layer (`config/dactyl.keymap:44-50`).

#### Scenario: Position indexes layer binding
- GIVEN a layer with 48 bindings
- WHEN a key event at position `p` is produced
- THEN the system SHALL use the `p`-th binding of the active layer

#### Scenario: Binding count mismatch
- GIVEN a layer with a binding count different from 48
- WHEN the repo is built
- THEN this repo does not check it; any check belongs to ZMK (`inferido del código`; `config/dactyl.keymap:41-52`)

### Requirement: Missing outer-bottom key

The system SHALL keep all 24 positions per half in the transform although each half has 23 physical keys (`config/boards/shields/dactyl/dactyl.dtsi:29-30`, `docs/01-hardware.md:15-16`). The keymap SHALL bind the missing positions to `&none` on every layer (`config/dactyl.keymap:50`, `config/dactyl.keymap:60`, `config/dactyl.keymap:73`, `config/dactyl.keymap:86`).

#### Scenario: Missing key positions
- GIVEN the missing key is the bottom of the outer column of each half
- WHEN positions are identified
- THEN they SHALL be 36 (`RC(3,0)`) on the left and 47 (`RC(3,6)`) on the right (`config/boards/shields/dactyl/dactyl.dtsi:40`)

#### Scenario: No switch at positions 36 and 47
- GIVEN no switch is wired at positions 36 and 47
- WHEN the keyboard is used
- THEN the system SHALL never produce an event there, so their `&none` binding is not exercised (`inferido del código`)

#### Scenario: Real key bound by mistake
- GIVEN a real key is bound to position 36 or 47
- WHEN the keyboard is used
- THEN the key is silently dead because no switch exists (`inferido del código`; `config/dactyl.keymap:50`)

### Requirement: Shield selection and split roles

The system SHALL select the half to build through `SHIELD_DACTYL_LEFT` / `SHIELD_DACTYL_RIGHT` (`config/boards/shields/dactyl/Kconfig.shield:1-5`), force `ZMK_SPLIT` on for both and make the left half the split central and the right half the peripheral (`config/boards/shields/dactyl/Kconfig.defconfig:1-16`).

#### Scenario: Right half press reaches central
- GIVEN the right half is the peripheral
- WHEN a key on the right half is pressed
- THEN its position event is reported to the central over BLE (`inferido del código`; `config/boards/shields/dactyl/Kconfig.defconfig:13-14`)

### Requirement: Matrix size consistent with keymap

The system MUST keep `columns = <12>` and `rows = <4>` consistent with the 48 bindings per layer in the keymap (`config/boards/shields/dactyl/dactyl.dtsi:34-35`, `config/dactyl.keymap:44-50`).

#### Scenario: No automated check
- GIVEN the repo has no automated tests
- WHEN the position map or binding count changes
- THEN no test or build check in this repo pins it; correctness relied on a manual hardware test of the old 24-position keymap (`docs/02-current-state.md:21-34`)
