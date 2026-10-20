# Build log

Newest entries first. Every entry records what was done, what was observed and what
comes next. Failures are recorded with their cause and their fix.

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
