# Keymap

Version: **v0.2** (approved layout, not yet flashed)

Target: a 46-key Spanish (ES) keyboard split in half at column 6. The NORMAL map
keeps letters in their familiar positions; two held function keys select complete
alternate maps for numbers/functions and navigation/symbols.

## Design rules

1. **The host OS uses the Spanish (ES) layout.** ZMK sends USB HID *positions*, not
   characters. With the OS in Spanish, `&kp N` types `n` and the `ñ` is on the key
   that a US keyboard calls `;`.
2. **Never write `&kp N` expecting `ñ`.** Use the position table below.
3. **Accents use the native ES dead keys.** `´` then `a` gives `á`; `Shift` + `´`
   then `u` gives `ü`. No macros and no Unicode are needed.
4. **Letters stay where a Spanish keyboard has them.** Muscle memory is worth more
   than a theoretically better layout.
5. **Function keys switch complete maps while held.** Releasing either function key
   returns to `NORMAL`; unassigned keys on function maps do not fall through.

## ES position table

These are selected ES position translations relevant to this design, not a
complete ES keycode reference. Letter positions, digits, `,`, and `.` use their
usual HID codes; the direct `<` key and function-layer symbols still need
firmware-level binding validation.

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

## NORMAL map

This is the `NORMAL` map. The key labeled `LSHFT` is the left Shift key (not Caps
Lock). `ENTER`, `SPACE`, and `BSPC` are adjacent on the lower right.

```
LEFT HALF (23)                                        RIGHT HALF (23)
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|  ESC  |   Q   |   W   |   E   |   R   |   T   |  |   Y   |   U   |   I   |   O   |   P   | HOME  |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|  TAB  |   A   |   S   |   D   |   F   |   G   |  |   H   |   J   |   K   |   L   |   Ñ   |  END  |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
| LSHFT |   Z   |   X   |   C   |   V   |   B   |  |   N   |   M   |   ,   |   .   |   -   |   <   |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       |   ´   |   ç   | CTRL  |  WIN  |  ALT  |  | ENTER | SPACE |  BSPC |  FN1  |  FN2  |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
   outer   pinky   ring   middle   idx    idx2        idx2    idx    middle  ring   pinky    outer
```

Selected bindings:

| Key | Binding | Key | Binding |
| --- | --- | --- | --- |
| `ESC` | `&kp ESC` | `HOME` | `&kp HOME` |
| `TAB` | `&kp TAB` | `END` | `&kp END` |
| `LSHFT` | `&kp LSHFT` | `ENTER` (Intro/Return) | `&kp ENTER` |
| `LCTRL` | `&kp LCTRL` | `BSPC` (Backspace/Borrar) | `&kp BSPC` |
| `WIN` | `&kp LGUI` | `SPACE` | `&kp SPACE` |
| `ALT` | `&kp LALT` | `Ñ` | `&kp SEMI` |
| `´` | `&kp SQT` | `ç` | `&kp BSLH` |
| `FN1` | `&mo FN1` | `FN2` | `&mo FN2` |

The diagram shows intended characters, not final ZMK bindings for the symbols.
Their ES-layout key combinations must be verified when the firmware is implemented.

### Decisions in v0.2

- `HOME` and `END` are directly available on the right outer column; `PG_UP` and
  `PG_DN` move to `FN2` because the user expects to use Home/End more often while coding.
- `FN1` exposes the Spanish number row and F1-F12. `FN2` exposes navigation and the
  frequently used C# symbols `<`, `>`, and `@`.
- `ENTER`, `SPACE`, and `BSPC` sit together on the lower right. Return/Intro/Enter
  are the same action; Backspace is the separate delete-backward action.
- The `CAPS` position in the original sketch is `LSHIFT` in this map. It is not a
  Caps Lock key.

## Function maps

Layer order in the `keymap` node: `NORMAL = 0`, `FN1 = 1`, `FN2 = 2`.
Define these names before using `&mo FN1` and `&mo FN2` in the keymap.

Hold `FN1` or `FN2` to activate that complete map; releasing the key immediately
returns to `NORMAL`. This is a momentary-layer behavior (`&mo`), not a tap-toggle or
a simultaneous-key combo. There is no long-press threshold: the alternate map is
active for as long as the function key is held.

Unassigned positions use `&none`, so they produce no keypress and do not fall through
to `NORMAL`. This is intentional: each function layer changes the active map rather
than partially overlaying the base map. ZMK distinguishes `&none` (swallow the press)
from `&trans` (pass the press to a lower active layer); see the [ZMK behavior
overview](https://zmk.dev/docs/keymaps/behaviors). The [layer behavior
reference](https://zmk.dev/docs/keymaps/behaviors/layers) documents `&mo` as active
while pressed and disabled on release.

### FN1 (hold `&mo FN1`)

The Spanish number row spans the top physical row. F1-F12 occupy the home-row
positions across both halves.

```
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|   º   |   1   |   2   |   3   |   4   |   5   |  |   6   |   7   |   8   |   9   |   0   |   '   |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|  F1   |  F2   |  F3   |  F4   |  F5   |  F6   |  |  F7   |  F8   |  F9   |  F10  |  F11  |  F12  |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
| &none | &none | &none | &none | &none | &none |  | &none | &none | &none | &none | &none | &none |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       | &none | &none | &none | &none | &none |  | &none | &none | &none | &none | &none |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
```

The blanks in the bottom outer positions are physical gaps, not keys. The other
unassigned positions are explicitly `&none`.

### FN2 (hold `&mo FN2`)

Navigation and symbols. `<`, `>`, and `@` are prioritized for C#; `H J K L` provide
the arrow cluster.

```
LEFT HALF (23)                                        RIGHT HALF (23)
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
| &none | &none | &none | &none | &none | &none |  | PG_UP | PG_DN | &none | &none | &none | &none |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
| &none |   [   |   ]   |   {   |   }   |   <   |  | LEFT  | DOWN  |  UP   | RIGHT |   >   |   @   |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
| &none | &none | &none | &none | &none | &none |  | &none | &none | &none | &none | &none | &none |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
|       | &none | &none | &none | &none | &none |  | &none | &none | &none | &none | &none |       |
+-------+-------+-------+-------+-------+-------+  +-------+-------+-------+-------+-------+-------+
```

`&none` cells are intentionally inactive while the layer is held. The two function
keys are not mapped as simultaneous combos; each independently activates its map.
The current function maps also leave the normal modifier positions inactive; decide
whether to repeat those modifiers explicitly if shifted symbols or shortcuts are
needed while holding a function key.

## How this maps to devicetree

ZMK needs the two halves in one keymap, with 46 entries in `bindings`. The left half
contributes its 23 positions first, then the right half. Each row of 12 entries is
written as `6 left + 6 right`.

The right half needs its own transform with the column order reversed, because its
PCB is mirrored. That is a one-time fix in the shield, not a per-row reordering in
the keymap. See [04-roadmap.md](04-roadmap.md).

## Validation after firmware implementation

1. Test the single left Shift position, Space, Enter, and Backspace during normal typing.
2. Confirm that holding each function key selects only its intended map and releasing
   returns to `NORMAL`.
3. Verify the ES host-layout outputs for `<`, `>`, `@`, brackets, braces, and `ç` in
   firmware; some require AltGr on the ES host layout, and the diagram records
   intended characters rather than final devicetree bindings.
4. Decide whether Shift, Ctrl, Win, and Alt should remain available inside `FN1`
   and `FN2`; the approved visual map currently leaves those positions inactive.
5. Determine whether the trackball needs its own pointing-device support in ZMK.
