# Current state

Last updated: 2026-10-26

## What works

- The matrix is soldered and every switch of both halves registers.
- Each half runs ZMK and types over USB.
- The split is configured in firmware: `dactyl_left` is the central half,
  `dactyl_right` carries `col-offset = <6>`, and both share one 12-column transform.
- The v1.0 keymap (`config/dactyl.keymap`) implements the four documented layers.

## Not yet verified on hardware

The split firmware and the v1.0 keymap have not been flashed. The GitHub Actions
build proves that both halves compile; it does not prove that each key landed in the
right position. Flashing and the per-key check below are the open step.

## Test result

Both halves were flashed with the same 24-position test keymap (`A`..`X`, row by
row). Pressing the keys physically from left to right produces:

| Half | Row 1 | Row 2 | Row 3 | Row 4 |
| --- | --- | --- | --- | --- |
| Left | `a b c d e f` | `g h i j k l` | `m n o p q r` | `t u v w x` |
| Right | `f e d c b a` | `l k j i h g` | `r q p o n m` | `x w v u t` |

Two conclusions:

1. **23 keys per half.** The fourth row produces five letters, not six. The missing
   position is the bottom key of the outer column (`RC(3,0)` in each half's own
   matrix, `RC(3,6)` for the right half once it is offset into the shared transform).
   The unused position exists in the matrix and in the transform but has no switch.
2. **The right half is mirrored.** It outputs the same sequence in reverse order,
   because its physical column 0 is the outermost key instead of the innermost one.

## Diagnosis of the mirror

This is **not** a keymap problem. It is a `matrix-transform` problem:

- The left PCB counts columns from the outside to the inside.
- The right PCB is the mirror image, so it counts columns from the outside to the
  inside too, which lands on the opposite physical side.
- The current `dactyl_left.overlay` maps `RC(r,0)..RC(r,5)` straight through, with
  no distinction between halves.

The fix belongs in the transform of the right half (reverse the column order) and
not in the keymap (which would need every row written backwards, twice).

## Known gaps

| Gap | Detail |
| --- | --- |
| Not flashed | The split configuration and the v1.0 keymap exist only in `main`; only the old 24-position test keymap has run on hardware. |
| No battery | Powered over USB. Each half needs its own 18650 for BLE operation. The holder and the switch cap are designed and versioned, not printed or tested. |
| Cable | The halves may still be joined by a TRRS cable. It will not be used: the split runs over BLE only. |
| No labels | Keycaps are blank; the stickers will be ordered after the mapping is fixed. |

## Verified vs assumed

- **Verified:** 23 keys per half, mirrored right half, ZMK builds and flashes on the
  left, matrix pins as documented in `01-hardware.md`.
- **Assumed, to confirm:** that both nice!nano boards are identical and healthy, and
  that the TRRS cable does not carry VCC between the halves. Confirm before fitting
  two batteries.
