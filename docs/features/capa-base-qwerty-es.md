# F1 - Base layer typing (QWERTY, host in Spanish ES layout)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

The base layer (layer 0) is what the keyboard sends when no momentary layer is held. It is a QWERTY layout meant to be typed with the host OS set to the Spanish (ES) layout: ZMK sends HID key positions and the OS decides the character (`config/dactyl.keymap:8-10`). Each half has 23 physical keys (`README.md:16`, `docs/03-keymap.md:56`); the keymap lists 24 positions per half, and the missing outer-bottom key is bound to `&none` (`config/dactyl.keymap:50`).

## Trigger / Entry point

- Config: `base_layer` node of the `zmk,keymap`, 48 bindings read in row-major order (`config/dactyl.keymap:41-52`).
- Any physical key press produces a position event from [F8](matriz-teclado-split.md); layer 0 is the default and is always active (`config/dactyl.keymap:12`, layer order base = 0).

## Inputs (payload/config)

- Key position 0..47 — row-major, 12 per row, left half first in each row; the position-to-matrix mapping is defined in [F8](matriz-teclado-split.md) (`config/boards/shields/dactyl/dactyl.dtsi:36-41`).
- Host layout: Spanish (ES). Stated only in a comment and in docs, nothing in the firmware enforces it (`config/dactyl.keymap:8-10`, `docs/03-keymap.md:19-21`).
- Layer constants `LAYER_NUM 1`, `LAYER_NAV 2`, `LAYER_SYM 3` used by the `&mo` bindings (`config/dactyl.keymap:15-17`).

## Steps

1. A key press is detected by the matrix scan and mapped to a position by the transform (see [F8](matriz-teclado-split.md)).
2. ZMK looks up the binding at that position in the highest active layer; with no layer held that is `base_layer` (`config/dactyl.keymap:41-52`).
3. Row 1: `ESC Q W E R T` / `Y U I O P &mo LAYER_SYM` (`config/dactyl.keymap:44`).
4. Row 2: `TAB A S D F G` / `H J K L &kp SEMI &kp SQT` (`config/dactyl.keymap:46`). On ES, `SEMI` is `ñ` and `SQT` is the dead acute `´`.
5. Row 3: `LSHFT Z X C V B` / `N M COMMA DOT &kp SLASH &mo LAYER_NAV` (`config/dactyl.keymap:48`). On ES, `SLASH` types `-`.
6. Row 4: `&none &kp RA(SQT) &kp RA(BSLH) LCTRL LGUI SPACE` / `ENTER BSPC &mo LAYER_NUM LALT END &none` (`config/dactyl.keymap:50`).
   1. `RA(SQT)` is AltGr plus the `'` position and types `{` on ES; `RA(BSLH)` types `}` (`config/dactyl.keymap:8-10`, `config/dactyl.keymap:49`, `docs/03-keymap.md:60-70`).
7. Keys bound to `&mo` hand over to layer switching, see [F2](cambio-de-capas.md); their content is in [F3](capa-numeros.md), [F4](capa-navegacion-multimedia.md) and [F5](capa-simbolos.md) (`config/dactyl.keymap:44,48,50`).
8. `&kp` emits the HID keycode, with `RA(...)` adding Right Alt (AltGr) to the report (`config/dactyl.keymap:50`).

## Exit points

| Salida | Detalle |
|---|---|
| USB/BLE HID keyboard report | Write: keycodes `A-Z`, `SEMI`, `SQT`, `COMMA`, `DOT`, `SLASH`, `ESC`, `TAB`, `SPACE`, `ENTER`, `BSPC`, `END`, modifiers `LSHFT`, `LCTRL`, `LGUI`, `LALT`, and `RA(SQT)`, `RA(BSLH)` (`config/dactyl.keymap:44-50`) |
| ZMK active layer state | Write (indirect): `&mo` to SYM, NAV and NUM while held, owned by [F2](cambio-de-capas.md) (`config/dactyl.keymap:44,48,50`) |

## Business rules

- The layout is ES-based: the keycode names are US names and the OS translates them (`config/dactyl.keymap:8-10`).
- `ñ` is `&kp SEMI` and the dead acute is `&kp SQT` on the right of row 2 (`config/dactyl.keymap:46`, `docs/03-keymap.md:37-47`).
- `{` and `}` need AltGr, so they are `RA(SQT)` and `RA(BSLH)`, never the US keycodes of the same name (`config/dactyl.keymap:8-10`, `config/dactyl.keymap:50`).
- Letters keep the positions of a Spanish keyboard (`docs/03-keymap.md:27-28`).
- Space sits on the left bottom row index2 key because the board has no thumb cluster (`config/dactyl.keymap:50`, `docs/03-keymap.md:80-100`).
- `BSPC` stays on the base layer and `DEL` lives on NAV (`config/dactyl.keymap:50`, `config/dactyl.keymap:71`).
- The outer-bottom key of each half does not exist and is `&none`: first position of row 4 on the left, last on the right (`config/dactyl.keymap:50`, `config/boards/shields/dactyl/dactyl.dtsi:29-31`).
- The outer-right keys of rows 1 to 3 are `&mo LAYER_SYM`, `&kp SQT` (dead acute) and `&mo LAYER_NAV`; `&mo LAYER_NUM` is on the right middle of row 4 (`config/dactyl.keymap:44,46,48,50`).

## Errors and edge cases

- Host in US layout → `SEMI`, `SQT`, `SLASH`, `RA(SQT)` and `RA(BSLH)` type different characters; the firmware cannot detect it (`config/dactyl.keymap:8-10`).
- Dead acute `SQT`: pressing it then a vowel gives an accented vowel; alone it shows nothing until the next key (inferred from code, ES dead-key behavior; literal-character macros exist only for grave and caret, see [F6](macros-teclas-muertas.md)) (`config/dactyl.keymap:25-35`).
- `&none` positions send nothing and do not fall through to lower layers (`config/dactyl.keymap:50`).
- The transform still maps `RC(3,0)` and `RC(3,6)`, although no key exists there (`config/boards/shields/dactyl/dactyl.dtsi:40`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| A letter, punctuation or modifier on the base layer | `config/dactyl.keymap` → `base_layer` (`config/dactyl.keymap:41-52`), rows at lines 44, 46, 48, 50 |
| Move `ñ`, acute or `-` (ES positions) | `config/dactyl.keymap` → `&kp SEMI`, `&kp SQT`, `&kp SLASH` (`config/dactyl.keymap:46,48`) |
| `{` or `}` (AltGr combinations) | `config/dactyl.keymap` → `RA(SQT)`, `RA(BSLH)` (`config/dactyl.keymap:50`) |
| Which key opens a layer | `config/dactyl.keymap` → `&mo LAYER_*` (`config/dactyl.keymap:44,48,50`); layer ids at `config/dactyl.keymap:15-17` |
| Physical position of a key (matrix) | `config/boards/shields/dactyl/dactyl.dtsi` → `default_transform` (`config/boards/shields/dactyl/dactyl.dtsi:32-42`), see [F8](matriz-teclado-split.md) |
| Host layout assumption (move to US) | Every ES-dependent keycode listed above; layout note at `config/dactyl.keymap:8-10` and `docs/03-keymap.md:19-21` |

## Existing tests

- Ninguno conocido: the repository has no tests; `build.yaml` only builds the firmware (`build.yaml:1-8`).

## Coverage / Gaps

- No automated test pins the base layer; it is validated by flashing the CI artifacts (`build.yaml:1-8`).
- `docs/03-keymap.md` says "15 letters per hand", but the right half has 12 letters (`Y U I O P H J K L Ñ N M`) (`docs/03-keymap.md:56`, `config/dactyl.keymap:44-48`). See fragment.
- `docs/03-keymap.md` says "not yet flashed", so the behavior on hardware is unverified (`docs/03-keymap.md:3`).
- Open questions: `docs/preguntas-abiertas.md` items 12 and 43.
