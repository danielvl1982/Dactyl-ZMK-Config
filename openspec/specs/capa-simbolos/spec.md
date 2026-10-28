# capa-simbolos Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). The SYM layer (layer 3) gives the typist the punctuation and programming symbols that the Spanish (ES) layout hides behind Shift or AltGr. Documentation: `docs/features/capa-simbolos.md`. Ticket: none.

## Requirements

### Requirement: SYM layer definition and activation

The system SHALL define `sym_layer` as a layer of 48 bindings in row-major order, 12 per row (`config/dactyl.keymap:77-88`). The layer SHALL be activated while the `&mo LAYER_SYM` key is held, where `LAYER_SYM` is layer id 3, the highest of the four layers (`config/dactyl.keymap:12`, `config/dactyl.keymap:17`, `config/dactyl.keymap:44`). Releasing the key MUST return to the base layer (layer switching is owned by F2, `cambio-de-capas`).

#### Scenario: Holding the SYM key
- GIVEN the base layer is active
- WHEN the user holds the `&mo LAYER_SYM` key at the outer-right of row 1
- THEN the system SHALL resolve key presses against `sym_layer` first

#### Scenario: Releasing the SYM key
- GIVEN `sym_layer` is active through `&mo LAYER_SYM`
- WHEN the user releases the key
- THEN the system SHALL return to the base layer

### Requirement: Fall-through of transparent entries

The system SHALL look up each key press in `sym_layer` first; a `&trans` entry falls through to the lower active layers and finally to the base layer (`config/dactyl.keymap:80-86`; standard ZMK behavior, `inferido del código`). An `&none` entry MUST send nothing and MUST NOT fall through (`config/dactyl.keymap:86`).

#### Scenario: Transparent key under SYM
- GIVEN SYM is held
- WHEN a key whose `sym_layer` entry is `&trans` is pressed
- THEN the system SHALL send the binding of the layer below

#### Scenario: Disabled key under SYM
- GIVEN SYM is held
- WHEN a key at an `&none` position (outer-bottom of each half) is pressed
- THEN the system SHALL send nothing

### Requirement: Row 1 symbols

The system SHALL map row 1 of `sym_layer` as: left `! @ # $ %` to `LS(N1)`, `RA(N2)`, `RA(N3)`, `LS(N4)`, `LS(N5)`; right `< \` > +` to `NUBS`, `macro_grave`, `LS(NUBS)`, `RBKT`; the leftmost and the two rightmost positions are `&trans` (`config/dactyl.keymap:80`).

#### Scenario: Typing `@`
- GIVEN SYM is held and the host uses the ES layout
- WHEN the second key of row 1 is pressed
- THEN the system SHALL send Right Alt plus `N2`

#### Scenario: Typing `>`
- GIVEN SYM is held
- WHEN the third right key of row 1 is pressed
- THEN the system SHALL send Left Shift plus `NUBS`

### Requirement: Row 2 symbols

The system SHALL map row 2 of `sym_layer` as: left `[ ] { } &` to `RA(LBKT)`, `RA(RBKT)`, `RA(SQT)`, `RA(BSLH)`, `LS(N6)`; right `" ' ¡ ?` to `LS(N2)`, `MINUS`, `EQUAL`, `LS(MINUS)`; the leftmost and the two rightmost positions are `&trans` (`config/dactyl.keymap:82`).

#### Scenario: Typing `{`
- GIVEN SYM is held
- WHEN the third left key of row 2 is pressed
- THEN the system SHALL send Right Alt plus `SQT`

#### Scenario: Typing `"`
- GIVEN SYM is held
- WHEN the first right key of row 2 is pressed
- THEN the system SHALL send Left Shift plus `N2`

### Requirement: Row 3 symbols

The system SHALL map row 3 of `sym_layer` as: left `| \ ~ ^ *` to `RA(N1)`, `RA(GRAVE)`, `RA(N4)`, `macro_caret`, `LS(RBKT)`; right `ç ¿ ; :` to `BSLH`, `LS(EQUAL)`, `LS(COMMA)`, `LS(DOT)`; the leftmost and the two rightmost positions are `&trans` (`config/dactyl.keymap:84`).

#### Scenario: Typing `|`
- GIVEN SYM is held
- WHEN the first symbol key of row 3 is pressed
- THEN the system SHALL send Right Alt plus `N1`

#### Scenario: Typing `:`
- GIVEN SYM is held
- WHEN the fourth right key of row 3 is pressed
- THEN the system SHALL send Left Shift plus `DOT`

### Requirement: Row 4 symbols

The system SHALL map row 4 of `sym_layer` left `( ) / = _` to `LS(N8)`, `LS(N9)`, `LS(N7)`, `LS(N0)`, `LS(SLASH)`, with `&none` at the outer-left position; every right-half position is `&trans` except the outer-bottom position, which is `&none` (`config/dactyl.keymap:86`).

#### Scenario: Typing `(`
- GIVEN SYM is held
- WHEN the first left symbol key of row 4 is pressed
- THEN the system SHALL send Left Shift plus `N8`

#### Scenario: Right half of row 4
- GIVEN SYM is held
- WHEN a right-half key of row 4 is pressed other than the outer-bottom one
- THEN the system SHALL fall through to the lower layer

### Requirement: Modifier combinations per symbol class

The system SHALL send `&kp LS(x)` as Left Shift plus the key and `&kp RA(x)` as Right Alt (AltGr) plus the key (`config/dactyl.keymap:80-86`). Every symbol MUST be the ES key combination, never the US keycode of the same name (`config/dactyl.keymap:8-10`).

#### Scenario: AltGr symbol
- GIVEN SYM is held and the host uses the ES layout
- WHEN the `[` key is pressed
- THEN the system SHALL send Right Alt plus `LBKT`, never the US keycode of the same name

#### Scenario: Shift symbol
- GIVEN SYM is held
- WHEN the `=` key of row 4 is pressed
- THEN the system SHALL send Left Shift plus `N0`

#### Scenario: AltGr symbol set
- GIVEN SYM is held
- WHEN any of `@ # [ ] { } | \ ~` is pressed
- THEN the system SHALL send it as an AltGr combination (`config/dactyl.keymap:80`, `config/dactyl.keymap:82`, `config/dactyl.keymap:84`)

#### Scenario: Plain keycode symbols
- GIVEN SYM is held
- WHEN a key bound to `NUBS`, `RBKT`, `MINUS`, `EQUAL` or `BSLH` is pressed
- THEN the system SHALL produce `< + ' ¡ ç` respectively (`config/dactyl.keymap:80-86`)

### Requirement: Dead-key literals through macros

The system SHALL type the literal `` ` `` and `^` through the macros `macro_grave` and `macro_caret`, because both are dead keys on ES; each macro sends the dead key then `SPACE`: `LBKT SPACE` for grave and `LS(LBKT) SPACE` for caret (`config/dactyl.keymap:22-35`, `config/dactyl.keymap:80`, `config/dactyl.keymap:84`). The macros are owned by F6 (`macros-teclas-muertas`).

#### Scenario: Typing a literal grave
- GIVEN SYM is held
- WHEN the second right key of row 1 is pressed
- THEN the system SHALL send `LBKT` then `SPACE`

#### Scenario: Typing a literal caret
- GIVEN SYM is held
- WHEN the fourth left key of row 3 is pressed
- THEN the system SHALL send Left Shift plus `LBKT` then `SPACE`

### Requirement: Symbols duplicated on the base layer

The system SHALL expose `{` and `}` both on SYM and on the base layer as `RA(SQT)` / `RA(BSLH)` (`config/dactyl.keymap:50`, `config/dactyl.keymap:82`).

#### Scenario: Braces without SYM
- GIVEN the base layer is active
- WHEN the base-layer brace keys are pressed
- THEN the system SHALL send Right Alt plus `SQT` or `BSLH`, the same combinations as on SYM

### Requirement: Base keys exposed through transparent positions

The system SHALL keep base-layer keys active while SYM is held wherever `sym_layer` uses `&trans`: `ñ`, the dead acute, `MO(NAV)`, `ENTER`, `BSPC`, `&mo LAYER_NUM`, `LALT` and `END` (`config/dactyl.keymap:46`, `config/dactyl.keymap:48`, `config/dactyl.keymap:50`, `config/dactyl.keymap:86`). This differs from `docs/03-keymap.md:146-148`, which says those columns are unavailable under SYM.

#### Scenario: Enter while SYM is held
- GIVEN SYM is held
- WHEN a key whose `sym_layer` entry is `&trans` over `ENTER` is pressed
- THEN the system SHALL send `ENTER`

### Requirement: Shift behavior while SYM is held

The system SHALL treat physical Left Shift as `&trans` on SYM, so Shift falls through to the base layer (`config/dactyl.keymap:48`). With `LS(...)` keys, Shift is already part of the report and the character MUST be unchanged (`inferido del código`). With plain keycodes such as `NUBS`, `MINUS` and `EQUAL`, the shifted ES character SHALL be typed (`<` becomes `>`, `'` becomes `?`) (`config/dactyl.keymap:84`).

#### Scenario: Shift with a plain keycode
- GIVEN SYM is held and physical Shift is held
- WHEN the `<` key (`NUBS`) is pressed
- THEN the system SHALL type the shifted ES character `>`

#### Scenario: Shift with an LS key
- GIVEN SYM is held and physical Shift is held
- WHEN a `LS(...)` key such as `!` is pressed
- THEN the system SHALL type the same character as without Shift (`inferido del código`)

### Requirement: Layer priority and host layout assumption

SYM MUST be layer 3, above NUM and NAV: when held together with them, a SYM binding wins and `&trans` falls to the lower layer (`config/dactyl.keymap:12`; ZMK layer priority, `inferido del código`). The firmware SHALL assume a Windows Spanish (KBDSP) host layout and MUST NOT detect or enforce it (`config/dactyl.keymap:8-10`, `docs/03-keymap.md:189-192`).

#### Scenario: SYM held with NUM
- GIVEN SYM and NUM are both held
- WHEN a key with a non-`&trans` SYM binding is pressed
- THEN the system SHALL send the SYM binding

#### Scenario: US host layout
- GIVEN the host uses the US layout
- WHEN any SYM key is pressed
- THEN the system SHALL send the same ES-based HID report and the host types a different character

#### Scenario: Rare AltGr symbols
- GIVEN SYM is held
- WHEN looking for `€` or other rare AltGr symbols
- THEN the system SHALL NOT have them present (`docs/03-keymap.md:222`)
