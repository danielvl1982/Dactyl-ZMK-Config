# Current state

Last updated: 2026-10-20

## What works

- The matrix is soldered and every switch of both halves registers.
- The left half runs ZMK and types.
- The test keymap in `config/dactyl_left.keymap` assigns `A` to `X` row by row so
  the wiring can be verified.

## Test result

Both halves were flashed with the same 24-position test keymap (`A`..`X`, row by
row). Pressing the keys physically from left to right produces:

| Half | Row 1 | Row 2 | Row 3 | Row 4 |
| --- | --- | --- | --- | --- |
| Left | `a b c d e f` | `g h i j k l` | `m n o p q r` | `t u v w x` |
| Right | `f e d c b a` | `l k j i h g` | `r q p o n m` | `x w v u t` |

Two conclusions:

1. **23 keys per half.** The fourth row produces five letters, not six. The missing
   position is the bottom key of the outer column (`RC(3,0)` on the left,
   `RC(3,5)` on the right). The unused position exists in the matrix and in the
   transform but has no switch.
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
| Not a split | `dactyl_left.overlay` defines one 24-position kscan with no `zmk,split`, no `col-offset` and no right shield. Each half currently behaves as an independent keyboard. |
| No right shield | There is no `dactyl_right` shield, so both halves use the same "left" definition. |
| Test keymap only | `A`..`X` is intentional and temporary. It does not type Spanish yet. |
| No battery | Powered over USB. Each half needs its own LiPo for BLE operation. |
| Cable | The halves are joined by a TRRS cable. It will not be used once the BLE split is configured. |
| No labels | Keycaps are blank; the stickers will be ordered after the mapping is fixed. |

## Verified vs assumed

- **Verified:** 23 keys per half, mirrored right half, ZMK builds and flashes on the
  left, matrix pins as documented in `01-hardware.md`.
- **Assumed, to confirm:** that both nice!nano boards are identical and healthy, and
  that the TRRS cable does not carry VCC between the halves. Confirm before fitting
  two batteries.
