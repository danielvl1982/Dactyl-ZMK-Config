# Keymap

Version: **v1.0** — complete vision, not yet flashed. The bottom-row trade is
decided: `HOME` moves to `NAV`.

Target: a Spanish (ES) keyboard with `Ñ`, split in half at column 6, with the
number row moved to a function layer to free keys for modifiers, layers and space.

> v1.0 supersedes v0.2. `DEL` was confirmed to be **Backspace**, so the three free
> outer-right keys are used for the layers and the dead acute, and `Delete`
> (forward) moves to `NAV`.

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

- 23 keys per half; 15 letters per hand.
- Columns, from the outside of each half towards the center:
  `outer, pinky, ring, middle, index, index2`.
- The bottom key of the `outer` column does not exist on either half. The right
  half therefore has three free keys: the `outer` column of rows 1 to 3.
- No thumb cluster. This is the main ergonomic constraint of the board: there is no
  natural key for space.

## Base layer

```
LEFT HALF (23)                                        RIGHT HALF (23)
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|  ESC  |   Q   |   W   |   E   |   R   |   T   |  |   Y   |   U   |   I   |   O   |   P   |MO(SYM)|
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|  TAB  |   A   |   S   |   D   |   F   |   G   |  |   H   |   J   |   K   |   L   |   Ñ   |   ´   |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
| LSHFT |   Z   |   X   |   C   |   V   |   B   |  |   N   |   M   |   ,   |   .   |   -   |MO(NAV)|
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |   {   |   }   | LCTRL | LGUI  | SPACE |  | ENTER | BSPC  |  FN   | LALT  |  END  |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
   outer   pinky   ring   middle   index  index2       index2  index  middle  ring   pinky    outer
```

### The three outer-right keys

| Row | Key | Why |
| --- | --- | --- |
| 1 | `MO(SYM)` | Right pinky holds the symbol layer; the left hand types the symbols. |
| 2 | `´` | In a physical ES board the dead acute sits right of `Ñ`, on that same row. |
| 3 | `MO(NAV)` | Right pinky holds the navigation layer; the rest of the right hand moves. |

### Bottom row

`DEL` was confirmed to be **Backspace**, so nothing else needs to move for it. The
space key is the remaining problem: it is not in the original bottom row.

Decided trade:

| Change | From | To |
| --- | --- | --- |
| Space enters the left bottom row | `LALT` (index2) | `SPACE` |
| `Alt` moves to the right bottom row | `HOME` (ring) | `LALT` |
| `HOME` moves to `NAV` | base | `NAV` (`Y`) |

`END` stays on the base layer. `LGUI` stays on the left (`index`).

## Layer access

| Key | Behavior |
| --- | --- |
| `FN` (right bottom, middle) | `&mo NUM` |
| outer-right row 1 | `&mo SYM` |
| outer-right row 3 | `&mo NAV` |

## NUM (hold `FN`)

The Spanish number row, exactly where it would be on a physical keyboard.

```
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|   º   |   1   |   2   |   3   |   4   |   5   |  |   6   |   7   |   8   |   9   |   0   |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |       |       |       |       |       |  |       |       |       |       |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |       |       |       |       |       |  |       |       |       |       |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |       |       |       |       |       |  |       |       |       |       |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
```

Blank cells are `&trans`. `¡` and `'` live on `SYM`.

## NAV (hold outer-right row 3)

```
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |  F1   |  F2   |  F3   |  F4   |  F5   |  | HOME  | PGDN  | PGUP  |  END  |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |  F6   |  F7   |  F8   |  F9   |  F10  |  | LEFT  | DOWN  |  UP   | RIGHT |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |  F11  |  F12  | VOL-  | VOL+  | MUTE  |  |  DEL  | BT 0  | BT 1  | BT 2  |BT CLR |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       | PREV  | NEXT  |       |       | PLAY  |  |       |       |       |       |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
```

`DEL` here is **forward Delete**, not Backspace. `BSPC` stays on the base layer and
still works while `NAV` is held.

`BT 0`..`BT 2` select one of three Bluetooth host profiles (for example PC, laptop,
phone) and `BT CLR` clears the bond of the selected profile. They act on the central
(left) half, which owns the host connection.

## SYM (hold outer-right row 1)

The right pinky holds the layer, so the right `pinky` column and the `outer` column
are unavailable while `SYM` is held. The left hand and the right `index2`, `index`,
`middle` and `ring` columns carry the symbols.

```
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |   !   |   @   |   #   |   $   |   %   |  |   <   |   `   |   >   |   +   |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |   [   |   ]   |   {   |   }   |   &   |  |   "   |   '   |   ¡   |   ?   |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |   |   |   \   |   ~   |   ^   |   *   |  |   ç   |   ¿   |   ;   |   :   |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |   (   |   )   |   /   |   =   |   _   |  |       |       |       |       |       |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
```

These characters come from the ES layout, so several are AltGr combinations in the
host (`@` = `RA(N2)`, `#` = `RA(N3)`, `|` = `RA(N1)`, and so on). The devicetree
implementation must translate each character to its ES combination, not to the US
keycode of the same name.

## How this maps to devicetree

The implementation is `config/dactyl.keymap` plus `config/boards/shields/dactyl/`,
shared by both halves:

- `dactyl.dtsi` defines the kscan and one 12-column `zmk,matrix-transform`.
- `dactyl_left.overlay` adds the column pins and owns columns 0 to 5.
- `dactyl_right.overlay` adds the same pins and `col-offset = <6>`, owning columns 6
  to 11.
- `Kconfig.defconfig` sets `ZMK_SPLIT` for both halves and
  `ZMK_SPLIT_ROLE_CENTRAL` on the left, so the left half runs the keymap.

Both PCBs count columns from the outside towards the center, so the transform lists
the right half in reverse (`RC(r,11)` down to `RC(r,6)`). The keymap then reads in
physical order: left outer-to-inner, then right inner-to-outer.

Both halves are missing the bottom key of the outer column, so the transform has 48
positions and every `bindings` list carries 48 entries: the 46 keys plus two `&none`
gaps, at `RC(3,0)` on the left and `RC(3,6)` on the right.

### ES combinations used

The host layout turns these into characters; ZMK only sends the position. Anything
ES reaches with AltGr uses `RA(...)`, never the US keycode of the same name. The
table follows the Windows Spanish layout (KBDSP), which is the host this keyboard
talks to; the X11 `es` layout differs on `[ ] { } \ < >`.

| Left hand | Binding | Right hand | Binding |
| --- | --- | --- | --- |
| `!` | `&kp LS(N1)` | `<` | `&kp NUBS` |
| `@` | `&kp RA(N2)` | `` ` `` | `macro_grave` (dead grave + space) |
| `#` | `&kp RA(N3)` | `>` | `&kp LS(NUBS)` |
| `$` | `&kp LS(N4)` | `+` | `&kp RBKT` |
| `%` | `&kp LS(N5)` | `"` | `&kp LS(N2)` |
| `[` | `&kp RA(LBKT)` | `'` | `&kp MINUS` |
| `]` | `&kp RA(RBKT)` | `¡` | `&kp EQUAL` |
| `{` | `&kp RA(SQT)` | `?` | `&kp LS(MINUS)` |
| `}` | `&kp RA(BSLH)` | `ç` | `&kp BSLH` |
| `&` | `&kp LS(N6)` | `¿` | `&kp LS(EQUAL)` |
| `|` | `&kp RA(N1)` | `;` | `&kp LS(COMMA)` |
| `\` | `&kp RA(GRAVE)` | `:` | `&kp LS(DOT)` |
| `~` | `&kp RA(N4)` | `,` | `&kp COMMA` |
| `^` | `macro_caret` (dead circumflex + space) | `.` | `&kp DOT` |
| `*` | `&kp LS(RBKT)` | `-` | `&kp SLASH` |
| `(` | `&kp LS(N8)` | `º` | `&kp GRAVE` |
| `)` | `&kp LS(N9)` | `Ñ` | `&kp SEMI` |
| `/` | `&kp LS(N7)` | `´` | `&kp SQT` |
| `=` | `&kp LS(N0)` | `_` | `&kp LS(SLASH)` |

`` ` `` and `^` are dead keys on ES, so each is a macro that sends the dead key and
then `SPACE` to produce the literal character.

## Open questions

1. `RALT` (AltGr) as a physical key: needed, or is `SYM` enough?
2. `€` and other rare ES AltGr symbols: add to `SYM`, or leave out?
3. Layer access: are `FN`, outer-right row 1 and row 3 the right fingers?
4. Does the trackball need its own firmware support (pointing device) in ZMK?
