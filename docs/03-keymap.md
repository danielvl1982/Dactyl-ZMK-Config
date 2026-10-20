# Keymap

Version: **v0.1** (agreed design, not yet flashed)

Target: a Spanish (ES) keyboard with `Ñ`, split in half at column 6, with the
number row moved to a function layer to free keys for modifiers, layers and space.

## Design rules

1. **The host OS uses the Spanish (ES) layout.** ZMK sends USB HID *positions*, not
   characters. With the OS in Spanish, `&kp N` types `n` and the `ñ` is on the key
   that a US keyboard calls `;`.
2. **Never write `&kp N` expecting `ñ`.** Use the position table below.
3. **Accents use the native ES dead keys.** `´` then `a` gives `á`; `Shift` + `´`
   then `u` gives `ü`. No macros and no Unicode are needed.
4. **Letters stay where a Spanish keyboard has them.** Muscle memory is worth more
   than a theoretically better layout.
5. **Numbers live on a layer** (`NUM`), per the agreed decision, to free the top row
   for space, modifiers and layer keys.

## ES position table

These are the only positions that differ from a US keyboard. Everything else
(`Q W E R T Y U I O P`, `A S D F G H J K L`, `Z X C V B N M`, digits, `,` and `.`)
is identical.

| Character | ZMK keycode | US position |
| --- | --- | --- |
| `ñ` | `&kp SEMI` | `;` |
| `´` (dead acute) | `&kp SQT` | `'` |
| `` ` `` (dead grave) | `&kp LBKT` | `[` |
| `+` | `&kp RBKT` | `]` |
| `ç` | `&kp BSLH` | `\` |
| `'` | `&kp MINUS` | `-` |
| `¡` | `&kp EQUAL` | `=` |
| `-` | `&kp SLASH` | `/` |
| `º` | `&kp GRAVE` | `` ` `` |
| `¨` (dead diaeresis) | `&kp SQT` + `Shift` | `'` + `Shift` |

Shifted variants come from the OS: `Shift+2` is `"`, `Shift+7` is `/`,
`Shift+8` is `(`, `Shift+0` is `=`, `Shift+SQT` is `¨`, and so on.

## Physical geometry

- 23 keys per half, left 15 letters + right 15 letters.
- Columns, from the outside of each half towards the center:
  `outer, pinky, ring, middle, index, index2`.
- The bottom key of the `outer` column does not exist on either half.
- No thumb cluster. This is the main ergonomic constraint of the board: there is no
  natural key for space.

## Base layer

```
LEFT HALF (23)                                        RIGHT HALF (23)
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|  ESC  |  TAB  | LSHFT | LCTRL |  LALT |   B   |  | BSPC  | RSHFT | RALT  | LGUI  |MO(NUM)|MO(SYM)|
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|MO(NAV)|   Q   |   W   |   E   |   R   |   T   |  |   Y   |   U   |   I   |   O   |   P   | ENTER |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|MO(SYM)|   A   |   S   |   D   |   F   |   G   |  |   H   |   J   |   K   |   L   |   Ñ   |   ´   |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |   Z   |   X   |   C   |   V   | SPACE |  |   N   |   M   |   ,   |   .   |   -   |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
   outer   pinky   ring   middle   idx    idx2        idx2    idx    middle  ring   pinky    outer
```

Resulting keycodes:

| Key | Keycode | Key | Keycode |
| --- | --- | --- | --- |
| `ESC` | `&kp ESC` | `BSPC` | `&kp BSPC` |
| `TAB` | `&kp TAB` | `ENTER` | `&kp ENTER` |
| `LSHFT` | `&kp LSHFT` | `RSHFT` | `&kp RSHFT` |
| `LCTRL` | `&kp LCTRL` | `RALT` (AltGr) | `&kp RALT` |
| `LALT` | `&kp LALT` | `LGUI` | `&kp LGUI` |
| `SPACE` | `&kp SPACE` | `Ñ` | `&kp SEMI` |
| `´` | `&kp SQT` | `MO(NUM)` | `&mo NUM` |
| `MO(NAV)` | `&mo NAV` | `MO(SYM)` | `&mo SYM` |

### Compromises of v0.1

- **Space** sits on the bottom key of the left inner column, the position closest to
  a thumb. The trackball occupies the right thumb, so space belongs to the left hand.
- **`B` moved one row up**, to the top of the same index column, so space could take
  its place. `B` is the least frequent Spanish letter that could be displaced, and it
  keeps the same finger.
- **Modifiers sit on the top row and the outer column.** A 46-key board with a
  number row has no room for eight dedicated modifier keys near the home row. This is
  the first thing to revisit if it feels wrong.
- **`MO(SYM)` exists on both halves** (left outer, right top) so either hand can hold
  it.

## Layers

Layer order in the `keymap` node: `BASE = 0`, `NUM = 1`, `NAV = 2`, `SYM = 3`.

### NUM (hold `MO(NUM)`)

The Spanish number row, exactly where it would be on a physical keyboard. The right
`MO(NUM)` key is transparent so it keeps holding the layer.

```
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|   º   |   1   |   2   |   3   |   4   |   5   |  |   6   |   7   |   8   |   9   |   0   |   '   |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |       |       |       |       |       |  |       |       |       |       |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |       |       |       |       |       |  |       |       |       |       |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |       |       |       |       |       |  |       |       |       |       |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
```

Blank cells are `&trans` (fall through to the base layer). `¡` is not on the layer:
it lives on `SYM` because the Spanish row has 13 keys and only 12 are available.

### NAV (hold `MO(NAV)`)

Navigation and function keys. Suggested v0.1, adjust freely.

| Position | Keycode |
| --- | --- |
| `H J K L` (right home) | `LEFT DOWN UP RIGHT` |
| `Y U I O` (right top) | `HOME PGDN PGUP END` |
| Left top row | `F1` .. `F6` |
| Left home row | `F7` .. `F12` |
| Everything else | `&trans` |

### SYM (hold `MO(SYM)`)

Symbols that the ES layout only reaches with AltGr, plus the ones that do not fit on
`NUM`.

| Position | Keycode |
| --- | --- |
| Left home row | `[ ] { }` |
| Left top row | `< > @ #` |
| Left bottom row | `| \ ~ ^` |
| Right home row | `+ ç ¡ ?` |
| Everything else | `&trans` |

## How this maps to devicetree

ZMK needs the two halves in one keymap, with 46 entries in `bindings`. The left half
contributes its 23 positions first, then the right half. Each row of 12 entries is
written as `6 left + 6 right`.

The right half needs its own transform with the column order reversed, because its
PCB is mirrored. That is a one-time fix in the shield, not a per-row reordering in
the keymap. See [04-roadmap.md](04-roadmap.md).

## Open questions

1. Modifier placement on the top row: acceptable, or should it move to home-row mods?
2. Space on the left inner bottom: confirm after a few days of typing.
3. Does the trackball need its own firmware support (pointing device) in ZMK?
