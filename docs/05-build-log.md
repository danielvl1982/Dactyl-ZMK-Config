# Build log

Newest entries first. Every entry records what was done, what was observed and what
comes next. Failures are recorded with their cause and their fix.

## 2026-10-21 — Split firmware and keymap v1.0

**Done**

- Rebuilt the shield as one directory, `config/boards/shields/dactyl/`, shared by
  both halves: `dactyl.dtsi` holds the kscan and a 12-column transform, with
  `dactyl_left.overlay` and `dactyl_right.overlay` adding the column pins.
- Added the split: `ZMK_SPLIT` on both halves, `ZMK_SPLIT_ROLE_CENTRAL` on the left,
  and `col-offset = <6>` on the right so its reversed columns land in reading order.
- Implemented `config/dactyl.keymap` with the four v1.0 layers, 48 bindings each:
  the 46 keys plus the two `&none` gaps where there is no switch.
- Translated every ES symbol to its AltGr combination (`&kp RA(...)`); backtick and
  circumflex became macros because both are dead keys on ES.
- Added both shields to `build.yaml`. The keymap moved from
  `config/dactyl_left.keymap` to `config/dactyl.keymap`, which applies to both.

**Observed**

- CI run `39615755235` succeeded and produced `dactyl_left-nice_nano__zmk-zmk.uf2`
  (460800 bytes) and `dactyl_right-nice_nano__zmk-zmk.uf2` (377856 bytes).
- Not flashed. The build proves it compiles, not that every key is in the right place.

**Next**

- Flash both halves and run the per-key check described in
  [02-current-state.md](02-current-state.md).

---

## 2026-10-21 — Keymap v1.0 supersedes v0.2

**Done**

- Reconciled the divergence between the two working machines. The keymap drafted
  locally as v1.0 was kept as the definitive design and v0.2 stayed in the history.
- Restored [03-keymap.md](03-keymap.md) to v1.0: three held layers, `NUM`, `NAV`
  and `SYM`, using `&trans` so the base modifiers and letters stay available while
  a layer is held.
- Decided the three free outer-right keys: `MO(SYM)` on row 1, the dead acute `´`
  on row 2, `MO(NAV)` on row 3, all held by the right pinky.
- Decided the bottom row: `SPACE` on the left `index2`, `LCTRL` and `LGUI` next to
  it, `LALT` on the right bottom row, `HOME` moved to `NAV`, `END` kept on base.
- Updated the open-decisions table in [04-roadmap.md](04-roadmap.md) to v1.0.

**Observed**

- This is a documented layout decision only. The v1.0 keymap has not been
  implemented in devicetree, flashed or tested on the keyboard.
- v1.0 supersedes v0.2 because `&none` on the function maps of v0.2 disabled the
  modifiers while a layer was held.

**Next**

- Implement the ES symbol bindings, the held-layer behavior and the bottom-row
  trades during Phase 4 of the roadmap.

---

## 2026-10-21 — Keymap v0.2 approved

**Done**

- Documented the approved 46-key NORMAL map in [03-keymap.md](03-keymap.md):
  QWERTY letters, a left Shift in the position initially called Caps, direct
  Home/End, and an Enter/Space/Backspace cluster on the lower right.
- Defined two held function maps: `FN1` for the Spanish number row and F1-F12,
  and `FN2` for navigation and coding symbols, especially `<`, `>`, and `@`.
- Kept the maps independent: positions not assigned on a function map are
  inactive rather than falling through to NORMAL.

**Observed**

- This is a documented layout decision only. The v0.2 keymap has not been
  implemented in devicetree, flashed or tested on the keyboard.

**Next**

- Implement and validate the ES symbol bindings, held-layer behavior, and
  modifier access on function maps during Phase 4 of the roadmap.

---

## 2026-10-20 — Project documentation

**Done**

- Created `README.md` and the `docs/` folder in the `Dactyl-ZMK-Config` repository.
- Wrote the hardware reference, current state, keymap v0.1, roadmap and this log.
- Agreed the design direction for the keymap:
  - Spanish (ES) host layout with `Ñ`.
  - QWERTY letter positions, as a Spanish keyboard has them.
  - Numbers on a `NUM` layer to free the top row.
  - Accents through the native ES dead keys, no macros.

**Observed**

- Both halves were flashed with the test keymap `A`..`X` and every switch registers.
- The left half types `abcdef / ghijkl / mnopqr / tuvwx`.
- The right half types `fedcba / lkjihg / rqponm / xwvut`.
- The fourth row has five keys, so there are **23 keys per half**, not 24.

**Cause of the mirror**

- The right PCB is a physical mirror of the left, so its column 0 is the outer key
  instead of the inner one.
- The current shield maps the matrix straight through with no per-half handling, so
  the right half reads each row backwards.
- This is a transform issue, not a keymap issue.

**Not done yet**

- The right shield, the split configuration and the real keymap.
- Batteries and BLE operation.

**Next**

- Build the `dactyl_right` shield and the split configuration (Phase 2 of the
  roadmap).

---

## Earlier history (pre-repository)

- Case and keycaps printed from the Thingiverse models in `files/`.
- Matrix hand-wired, 4 rows x 6 columns per half, col2row diodes.
- Both halves flashed with a 24-position test keymap (`A`..`X`) to verify the wiring.
- Vendor firmware (`CURRENT.UF2`) kept as a reference in the parent project folder.
