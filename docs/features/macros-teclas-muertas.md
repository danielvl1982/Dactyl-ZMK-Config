# F6 - Dead-key literal macros (grave and caret)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

On the Spanish (ES) host layout, `` ` `` and `^` are dead keys: pressing them alone shows nothing until the next key is typed. Two ZMK macros, `macro_grave` and `macro_caret`, send the dead key followed by `SPACE`, so a single press on the SYM layer types the literal character (`config/dactyl.keymap:21-35`). Both macros are placed on the SYM layer, owned by [F5](capa-simbolos.md) (`config/dactyl.keymap:80`, `config/dactyl.keymap:84`).

## Trigger / Entry point

- Config: `macro_grave` node, `compatible = "zmk,behavior-macro"`, bound as `&macro_grave` in the SYM layer, row 1 right side, position 7 of the layer (`config/dactyl.keymap:25-29`, `config/dactyl.keymap:80`).
- Config: `macro_caret` node, same behavior type, bound as `&macro_caret` in the SYM layer, row 3 left side, position 28 of the layer (`config/dactyl.keymap:31-35`, `config/dactyl.keymap:84`).
- Both fire only while SYM is the highest active layer, reached by holding `&mo LAYER_SYM` (`config/dactyl.keymap:44`, see [F2](cambio-de-capas.md)).

## Inputs (payload/config)

- Macro bindings: `<&kp LBKT &kp SPACE>` for grave and `<&kp LS(LBKT) &kp SPACE>` for caret (`config/dactyl.keymap:28`, `config/dactyl.keymap:34`).
- `#binding-cells = <0>`: the macros take no parameter, so they are referenced without arguments (`config/dactyl.keymap:27`, `config/dactyl.keymap:33`).
- Host layout: Spanish (ES), on which `LBKT` is the dead grave key and `Shift`+`LBKT` is the dead circumflex (`config/dactyl.keymap:8-10`, `config/dactyl.keymap:22-23`, `docs/03-keymap.md:36`). Nothing in the firmware enforces it.
- Macro timing keys `wait-ms` and `tap-ms` are not set in either node nor in `config/dactyl.conf`, so ZMK defaults apply (inferred from code) (`config/dactyl.keymap:25-35`).

## Steps

1. With SYM active, the user presses the key at the macro position (`config/dactyl.keymap:80`, `config/dactyl.keymap:84`).
2. ZMK looks up the binding in `sym_layer` and runs the referenced macro behavior (`config/dactyl.keymap:77-88`).
3. `macro_grave`: taps `&kp LBKT`, then taps `&kp SPACE` (`config/dactyl.keymap:28`).
4. `macro_caret`: taps `&kp LS(LBKT)`, that is Left Shift plus `LBKT`, then taps `&kp SPACE` (`config/dactyl.keymap:34`).
5. The host receives the dead key, then space, and composes the literal `` ` `` or `^` (`config/dactyl.keymap:22-23`, `inferido del código`: dead-key composition happens in the OS, not in ZMK).
6. The base layer does not use these macros; it has no literal `` ` `` or `^` and the dead acute `SQT` stays a plain `&kp` (`config/dactyl.keymap:46`, see [F1](capa-base-qwerty-es.md)).

## Exit points

| Salida | Detalle |
|---|---|
| USB/BLE HID keyboard report | Write: `LBKT` then `SPACE` for grave; `LS(LBKT)` then `SPACE` for caret (`config/dactyl.keymap:28`, `config/dactyl.keymap:34`) |

## Business rules

- A literal `` ` `` or `^` requires the dead key followed by a space on ES (`config/dactyl.keymap:21-24`).
- Grave is the unshifted `LBKT` position; caret is the same position with Left Shift (`config/dactyl.keymap:28`, `config/dactyl.keymap:34`).
- The macros live only on SYM; the right-hand grave is on row 1 (`macro_grave`) and the left-hand caret on row 3 (`macro_caret`) (`config/dactyl.keymap:79-84`).
- `º` is a separate key, `&kp GRAVE`, on NUM layer position 0 and is not part of these macros (`config/dactyl.keymap:57`, `docs/03-keymap.md:42`).

## Errors and edge cases

- Host in US layout → `LBKT` types `[` and `SPACE` follows, so the macros emit `[ ` and `{ ` instead of the literal characters; the firmware cannot detect it (`config/dactyl.keymap:8-10`, `config/dactyl.keymap:28`, `config/dactyl.keymap:34`; inferred from code).
- The macros always append a space: there is no way to compose an accented vowel (e.g. `ò`, `â`) from them; the plain dead key is not available on any layer for grave or circumflex (`config/dactyl.keymap:80`, `config/dactyl.keymap:84`; inferred from code).
- Dead acute and diaeresis are not macros and compose with the next key natively (`docs/03-keymap.md:19-20`, `config/dactyl.keymap:46`).
- Releasing SYM mid-macro: macro timing is ZMK default and not configured here, so behavior of an interrupted macro is undetermined (inferred from code) (`config/dactyl.keymap:25-35`). See fragment.

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| The character sent by grave or caret (dead key position) | `config/dactyl.keymap` → `macro_grave` `bindings` (`config/dactyl.keymap:28`), `macro_caret` `bindings` (`config/dactyl.keymap:34`) |
| Drop the trailing space (type the plain dead key) | `config/dactyl.keymap` → `bindings` of both macros (`config/dactyl.keymap:28`, `config/dactyl.keymap:34`) |
| Where the macros are placed on the keyboard | `config/dactyl.keymap` → `sym_layer` (`config/dactyl.keymap:80` for grave, `config/dactyl.keymap:84` for caret); see [F5](capa-simbolos.md) |
| Add another literal dead-key macro (acute, diaeresis) | `config/dactyl.keymap` → `macros` node (`config/dactyl.keymap:20-36`) |
| Macro speed or reliability (delay between dead key and space) | Add `wait-ms`/`tap-ms` to the macro nodes (`config/dactyl.keymap:25-35`); global defaults would go in `config/dactyl.conf` |
| Host layout assumption (move to US) | Both macro `bindings` and the layout note (`config/dactyl.keymap:8-10`, `config/dactyl.keymap:28`, `config/dactyl.keymap:34`) |
| Docs describing the macros | `docs/03-keymap.md` (`docs/03-keymap.md:197`, `docs/03-keymap.md:209`, `docs/03-keymap.md:216-217`) |

## Existing tests

- Ninguno conocido: the repository has no tests; `build.yaml` only builds the firmware (`build.yaml:1-8`).

## Coverage / Gaps

- No automated test pins either macro; they are validated only by flashing the CI artifacts (`build.yaml:1-8`).
- `docs/03-keymap.md` says "No macros and no Unicode are needed" but two macros exist and it documents them further down (`docs/03-keymap.md:19-20`, `docs/03-keymap.md:216-217`, `config/dactyl.keymap:25-35`). See fragment.
- `docs/03-keymap.md` lists the dead grave as `&kp LBKT` without noting that SYM uses `macro_grave` instead (`docs/03-keymap.md:36`, `config/dactyl.keymap:80`).
- Macro timing is unconfigured (no `wait-ms`/`tap-ms`), so reliability on slow BLE hosts is unverified; the keymap is documented as not yet flashed (`config/dactyl.keymap:25-35`, `docs/03-keymap.md:3`).
- Open questions: `docs/preguntas-abiertas.md` items 24, 50 and 51.
