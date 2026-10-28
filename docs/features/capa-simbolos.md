# F5 - SYM layer (symbols reached with Shift/AltGr on ES layout)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

The SYM layer (layer 3) gives the typist the punctuation and programming symbols that the Spanish (ES) layout hides behind Shift or AltGr. The right pinky holds `&mo LAYER_SYM` and the left hand types the symbols (`config/dactyl.keymap:44`, `docs/03-keymap.md:146-148`). It carries 32 characters: 20 on the left half and 12 on the right (`config/dactyl.keymap:80-86`). The host must use the ES layout: ZMK sends HID positions and the OS decides the character, so every symbol is the ES key combination, never the US keycode of the same name (`config/dactyl.keymap:8-10`).

## Trigger / Entry point

- Config: `sym_layer` node of the `zmk,keymap`, 48 bindings in row-major order, 12 per row (`config/dactyl.keymap:77-88`).
- Activation: hold the `&mo LAYER_SYM` key at the outer-right of row 1, defined in the base layer and owned by [F2](cambio-de-capas.md) (`config/dactyl.keymap:44`, `config/dactyl.keymap:17`).
- Each key press on the active layer comes from the matrix of [F8](matriz-teclado-split.md).

## Inputs (payload/config)

- Key position 0..47 while SYM is held — same row-major numbering as [F1](capa-base-qwerty-es.md) (`config/dactyl.keymap:80-86`).
- `LAYER_SYM 3`: layer id, highest of the four layers (`config/dactyl.keymap:12`, `config/dactyl.keymap:17`).
- Host layout ES (Windows Spanish, KBDSP): assumed, not enforced by firmware (`config/dactyl.keymap:8-10`, `docs/03-keymap.md:189-192`).
- Macros `macro_grave` and `macro_caret` used by two keys, see [F6](macros-teclas-muertas.md) (`config/dactyl.keymap:25-35`).

## Steps

1. The user holds the `&mo LAYER_SYM` key; layer switching is handled by [F2](cambio-de-capas.md) (`config/dactyl.keymap:44`).
2. A key press is looked up in `sym_layer` first; a `&trans` entry falls through to the lower active layers and finally to the base layer (`config/dactyl.keymap:80-86`; fall-through is standard ZMK behavior, inferred from code).
3. Row 1 (`config/dactyl.keymap:80`): left `! @ # $ %` as `LS(N1)`, `RA(N2)`, `RA(N3)`, `LS(N4)`, `LS(N5)`; right `< \` > +` as `NUBS`, `macro_grave`, `LS(NUBS)`, `RBKT`.
4. Row 2 (`config/dactyl.keymap:82`): left `[ ] { } &` as `RA(LBKT)`, `RA(RBKT)`, `RA(SQT)`, `RA(BSLH)`, `LS(N6)`; right `" ' ¡ ?` as `LS(N2)`, `MINUS`, `EQUAL`, `LS(MINUS)`.
5. Row 3 (`config/dactyl.keymap:84`): left `| \ ~ ^ *` as `RA(N1)`, `RA(GRAVE)`, `RA(N4)`, `macro_caret`, `LS(RBKT)`; right `ç ¿ ; :` as `BSLH`, `LS(EQUAL)`, `LS(COMMA)`, `LS(DOT)`.
6. Row 4 (`config/dactyl.keymap:86`): left `( ) / = _` as `LS(N8)`, `LS(N9)`, `LS(N7)`, `LS(N0)`, `LS(SLASH)`; the rest is `&trans` and the outer-bottom positions are `&none`.
7. `&kp LS(x)` sends Left Shift plus the key, `&kp RA(x)` sends Right Alt (AltGr) plus the key, and the macros send the dead key then `SPACE` (`config/dactyl.keymap:25-35`, `config/dactyl.keymap:80-86`).
8. Releasing the SYM key returns to the base layer, see [F2](cambio-de-capas.md).

## Exit points

| Salida | Detalle |
|---|---|
| USB/BLE HID keyboard report | Write: `LS(...)` combinations for `! $ % & " ? ; : ( ) / = _ ` and `>`; `RA(...)` combinations for `@ # [ ] { } \| \ ~`; plain keycodes `NUBS`, `RBKT`, `MINUS`, `EQUAL`, `BSLH` for `< + ' ¡ ç` (`config/dactyl.keymap:80-86`) |
| HID report via macros | Write: `LBKT SPACE` (literal grave) and `LS(LBKT) SPACE` (literal caret) (`config/dactyl.keymap:28`, `config/dactyl.keymap:34`) |

## Business rules

- Every symbol is the ES combination: what ES reaches with AltGr is written `RA(...)`, never the US keycode of the same name (`config/dactyl.keymap:8-10`).
- `@`, `#`, `[`, `]`, `{`, `}`, `|`, `\`, `~` are AltGr combinations (`config/dactyl.keymap:80`, `config/dactyl.keymap:82`, `config/dactyl.keymap:84`).
- `` ` `` and `^` are dead keys on ES, so each is a macro sending the dead key plus `SPACE` to type the literal character (`config/dactyl.keymap:22-35`, `config/dactyl.keymap:80`, `config/dactyl.keymap:84`).
- `{` and `}` exist both on SYM and on the base layer as `RA(SQT)` / `RA(BSLH)` (`config/dactyl.keymap:50`, `config/dactyl.keymap:82`).
- Parentheses, `/`, `=` and `_` live on the bottom row of the left hand, with `(` and `)` on the outer columns (`config/dactyl.keymap:86`).
- The right half carries symbols only on the four inner columns; the two outer columns are `&trans` (`config/dactyl.keymap:80-84`).
- The outer-bottom position of each half is `&none` and sends nothing (`config/dactyl.keymap:86`).
- The mapping follows the Windows Spanish layout; the X11 `es` layout differs on `[ ] { } \ < >` (`docs/03-keymap.md:189-192`).

## Errors and edge cases

- Host in US layout → every symbol types a different character; the firmware cannot detect it (`config/dactyl.keymap:8-10`).
- Physical Shift held with a `LS(...)` key → Shift is already part of the report, so the character is unchanged (inferred from code); with plain keycodes such as `NUBS`, `MINUS`, `EQUAL`, `COMMA`-style keys the shifted ES character is typed instead (`<` becomes `>`, `'` becomes `?`) because `LSHFT` is `&trans` on SYM (`config/dactyl.keymap:48`, `config/dactyl.keymap:84`). See fragment.
- `&trans` on the right outer columns exposes the base layer: `ñ`, the dead acute, `MO(NAV)`, `ENTER`, `BSPC`, `&mo LAYER_NUM`, `LALT` and `END` stay active while SYM is held, contrary to the doc that says the columns are unavailable (`config/dactyl.keymap:46`, `config/dactyl.keymap:48`, `config/dactyl.keymap:50`, `config/dactyl.keymap:86`, `docs/03-keymap.md:146-148`). See fragment.
- SYM is layer 3, above NUM and NAV: when held together with them, a SYM binding wins and `&trans` falls to the lower layer (`config/dactyl.keymap:12`; ZMK layer priority, inferred from code).
- `&none` positions send nothing and do not fall through (`config/dactyl.keymap:86`).
- `€` and other rare AltGr symbols are not present (`docs/03-keymap.md:222`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| A symbol on SYM (replace or move) | `config/dactyl.keymap` → `sym_layer` (`config/dactyl.keymap:77-88`), rows at lines 80, 82, 84, 86 |
| A symbol that ES reaches with AltGr (`@ # [ ] { } \| \ ~`) | `config/dactyl.keymap` → `RA(...)` entries (`config/dactyl.keymap:80`, `config/dactyl.keymap:82`, `config/dactyl.keymap:84`) |
| A symbol that needs Shift (`! $ % & ( ) / = _ " ? ; :`) | `config/dactyl.keymap` → `LS(...)` entries (`config/dactyl.keymap:80-86`) |
| Literal `` ` `` or `^` (dead-key macros) | `config/dactyl.keymap` → `macro_grave`, `macro_caret` (`config/dactyl.keymap:25-35`), see [F6](macros-teclas-muertas.md) |
| Which key opens SYM, or layer id | `config/dactyl.keymap` → `&mo LAYER_SYM` (`config/dactyl.keymap:44`), `#define LAYER_SYM` (`config/dactyl.keymap:17`), see [F2](cambio-de-capas.md) |
| Keys exposed through SYM (decide what falls through) | `config/dactyl.keymap` → `&trans` entries in `sym_layer` (`config/dactyl.keymap:80-86`) |
| Host layout assumption (move to US) | Every `RA(...)`/`LS(...)` in `sym_layer` and the layout note (`config/dactyl.keymap:8-10`, `docs/03-keymap.md:189-192`) |
| Physical position of a key | `config/boards/shields/dactyl/dactyl.dtsi` → `default_transform`, see [F8](matriz-teclado-split.md) |

## Existing tests

- Ninguno conocido: the repository has no tests; `build.yaml` only builds the firmware (`build.yaml:1-8`).

## Coverage / Gaps

- No automated test pins the SYM layer; it is validated by flashing the CI artifacts (`build.yaml:1-8`).
- `docs/03-keymap.md` says "not yet flashed", so the ES combinations are unverified on hardware (`docs/03-keymap.md:3`).
- `docs/03-keymap.md` says the right pinky and outer columns are unavailable under SYM, but the keymap uses `&trans` there. See fragment.
- Open questions: `docs/preguntas-abiertas.md` items 3, 4, 17 and 48; `€` and AltGr as a physical key are in `docs/03-keymap.md:221-222`.
