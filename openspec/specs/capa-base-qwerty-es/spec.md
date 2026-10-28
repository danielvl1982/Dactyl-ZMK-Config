# capa-base-qwerty-es Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). The base layer (layer 0) is the QWERTY layout the keyboard sends when no momentary layer is held, intended to be typed with the host OS set to the Spanish (ES) layout. Documentation: `docs/features/capa-base-qwerty-es.md`. Ticket: none.

## Requirements

### Requirement: Base layer is the default active layer

The system SHALL treat `base_layer` as layer 0, always active, with 48 bindings read in row-major order (`config/dactyl.keymap:12`, `config/dactyl.keymap:41-52`). Each half has 23 physical keys, and the keymap lists 24 positions per half (`README.md:16`, `docs/03-keymap.md:56`).

#### Scenario: No layer held
- GIVEN no momentary layer key is held
- WHEN a key at position 0..47 is pressed
- THEN the system SHALL resolve the binding from `base_layer`

### Requirement: Keycodes are US names resolved by a Spanish ES host

The system SHALL send HID key positions using US keycode names and leave the character choice to the host OS, which is expected to use the Spanish (ES) layout (`config/dactyl.keymap:8-10`). The firmware MUST NOT enforce or detect the host layout (`config/dactyl.keymap:8-10`, `docs/03-keymap.md:19-21`).

#### Scenario: Host in ES layout
- GIVEN the host OS uses the Spanish (ES) layout
- WHEN `&kp SEMI` is sent
- THEN the host SHALL type `ñ`

#### Scenario: Host in US layout
- GIVEN the host OS uses the US layout
- WHEN `SEMI`, `SQT`, `SLASH`, `RA(SQT)` or `RA(BSLH)` is sent
- THEN the system SHALL still send the same keycodes and the host types different characters (`config/dactyl.keymap:8-10`)

### Requirement: Letter and punctuation rows

The system SHALL bind row 1 to `ESC Q W E R T` / `Y U I O P &mo LAYER_SYM` (`config/dactyl.keymap:44`), row 2 to `TAB A S D F G` / `H J K L &kp SEMI &kp SQT` (`config/dactyl.keymap:46`), and row 3 to `LSHFT Z X C V B` / `N M COMMA DOT &kp SLASH &mo LAYER_NAV` (`config/dactyl.keymap:48`). Letters MUST keep the positions of a Spanish keyboard (`docs/03-keymap.md:27-28`).

#### Scenario: Row 2 right side on ES host
- GIVEN the base layer is active and the host uses the ES layout
- WHEN the keys right of `L` in row 2 are pressed
- THEN `&kp SEMI` SHALL type `ñ` and `&kp SQT` SHALL type the dead acute `´` (`config/dactyl.keymap:46`, `docs/03-keymap.md:37-47`)

#### Scenario: Slash position on ES host
- GIVEN the base layer is active and the host uses the ES layout
- WHEN `&kp SLASH` in row 3 is pressed
- THEN the host SHALL type `-` (`config/dactyl.keymap:48`)

### Requirement: Bottom row and braces through AltGr

The system SHALL bind row 4 to `&none &kp RA(SQT) &kp RA(BSLH) LCTRL LGUI SPACE` / `ENTER BSPC &mo LAYER_NUM LALT END &none` (`config/dactyl.keymap:50`). `{` and `}` MUST be `RA(SQT)` and `RA(BSLH)` (AltGr plus the `'` and backslash positions), never the US keycodes of the same name (`config/dactyl.keymap:8-10`, `config/dactyl.keymap:49`, `docs/03-keymap.md:60-70`). `RA(...)` SHALL add Right Alt to the HID report (`config/dactyl.keymap:50`).

#### Scenario: Brace on ES host
- GIVEN the base layer is active and the host uses the ES layout
- WHEN `&kp RA(SQT)` is pressed
- THEN the system SHALL send `'` position with Right Alt and the host types `{`
- AND WHEN `&kp RA(BSLH)` is pressed THEN the host types `}`

### Requirement: Space, backspace and thumb-less placement

The system SHALL place `SPACE` on the left bottom row index2 key because the board has no thumb cluster (`config/dactyl.keymap:50`, `docs/03-keymap.md:80-100`). `BSPC` SHALL stay on the base layer while `DEL` lives on NAV (`config/dactyl.keymap:50`, `config/dactyl.keymap:71`).

#### Scenario: Backspace without layer
- GIVEN no layer is held
- WHEN the `BSPC` key in row 4 is pressed
- THEN the system SHALL send `BSPC`

### Requirement: Momentary layer keys on the base layer

The system SHALL bind the outer-right keys of rows 1 to 3 to `&mo LAYER_SYM`, `&kp SQT` and `&mo LAYER_NAV`, and the right middle of row 4 to `&mo LAYER_NUM` (`config/dactyl.keymap:44,46,48,50`). Layer constants MUST be `LAYER_NUM 1`, `LAYER_NAV 2`, `LAYER_SYM 3` (`config/dactyl.keymap:15-17`). Layer switching itself is owned by F2 (`config/dactyl.keymap:44,48,50`).

#### Scenario: Holding a layer key
- GIVEN the base layer is active
- WHEN an `&mo` key is held
- THEN the system SHALL hand over to layer switching for the target layer (see `docs/features/cambio-de-capas.md`)

### Requirement: Missing outer-bottom keys are inert

The system SHALL bind the outer-bottom position of each half (first of row 4 on the left, last on the right) to `&none` because no key exists there (`config/dactyl.keymap:50`, `config/boards/shields/dactyl/dactyl.dtsi:29-31`). `&none` positions MUST NOT send anything and MUST NOT fall through to lower layers (`config/dactyl.keymap:50`). The transform still maps `RC(3,0)` and `RC(3,6)` (`config/boards/shields/dactyl/dactyl.dtsi:40`).

#### Scenario: Press on a `&none` position
- GIVEN the base layer is active
- WHEN position 36 or 47 is triggered
- THEN the system SHALL send no key event

### Requirement: Dead acute behavior (inferido del código)

The system SHALL send `SQT` as a plain keycode with no literal-character macro for the acute; literal-character macros exist only for grave and caret (`config/dactyl.keymap:25-35`). Resulting dead-key behavior (acute then vowel gives an accented vowel, alone it shows nothing until the next key) is inferido del código, from ES host dead-key behavior, and is not enforced by the firmware.

#### Scenario: Acute followed by a vowel
- GIVEN the base layer is active and the host uses the ES layout
- WHEN `&kp SQT` is pressed and then a vowel key
- THEN the host SHALL produce an accented vowel (inferido del código)

### Requirement: No automated tests pin the base layer

The system SHALL have no automated test for the base layer; `build.yaml` only builds the firmware and validation is by flashing CI artifacts (`build.yaml:1-8`). Hardware behavior is unverified because `docs/03-keymap.md` states it was not yet flashed (`docs/03-keymap.md:3`). `docs/03-keymap.md` claims "15 letters per hand" while the right half has 12 letters (`docs/03-keymap.md:56`, `config/dactyl.keymap:44-48`).

#### Scenario: Validating a keymap change
- GIVEN a change to `base_layer`
- WHEN CI runs
- THEN the system SHALL only build the firmware and run no keymap test (`build.yaml:1-8`)
