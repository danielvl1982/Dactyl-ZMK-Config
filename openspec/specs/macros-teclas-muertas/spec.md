# macros-teclas-muertas Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Two ZMK macros, `macro_grave` and `macro_caret`, send a dead key followed by `SPACE` so that one press on the SYM layer types the literal `` ` `` or `^` on a Spanish (ES) host layout. Documentation: `docs/features/macros-teclas-muertas.md`. Ticket: none.

## Requirements

### Requirement: Grave literal macro

The system SHALL define `macro_grave` as a `zmk,behavior-macro` that taps `&kp LBKT` and then `&kp SPACE` (`config/dactyl.keymap:25-29`). The macro MUST emit exactly these two taps in this order.

#### Scenario: Grave pressed on SYM
- GIVEN SYM is the highest active layer
- WHEN the user presses the key bound to `&macro_grave`
- THEN the system SHALL send `LBKT` and then `SPACE` in the HID keyboard report (`config/dactyl.keymap:28`)

### Requirement: Caret literal macro

The system SHALL define `macro_caret` as a `zmk,behavior-macro` that taps `&kp LS(LBKT)` (Left Shift plus `LBKT`) and then `&kp SPACE` (`config/dactyl.keymap:31-35`). The macro MUST emit exactly these two taps in this order.

#### Scenario: Caret pressed on SYM
- GIVEN SYM is the highest active layer
- WHEN the user presses the key bound to `&macro_caret`
- THEN the system SHALL send `LS(LBKT)` and then `SPACE` in the HID keyboard report (`config/dactyl.keymap:34`)

### Requirement: Macros take no parameters

The system SHALL declare both macros with `#binding-cells = <0>`, so they are referenced without arguments (`config/dactyl.keymap:27`, `config/dactyl.keymap:33`).

#### Scenario: Binding without arguments
- GIVEN the SYM layer binds `&macro_grave` and `&macro_caret`
- WHEN the keymap is built
- THEN the system SHALL accept both bindings with no parameter (`config/dactyl.keymap:80`, `config/dactyl.keymap:84`)

### Requirement: Placement only on the SYM layer

The system SHALL place `&macro_grave` on the SYM layer at row 1 right side (layer position 7) and `&macro_caret` on the SYM layer at row 3 left side (layer position 28) (`config/dactyl.keymap:80`, `config/dactyl.keymap:84`). The macros MUST NOT be bound on the base layer, which has no literal `` ` `` or `^` (`config/dactyl.keymap:46`).

#### Scenario: SYM reached by holding the layer key
- GIVEN the user holds `&mo LAYER_SYM`
- WHEN the user presses the grave or caret position
- THEN the system SHALL run the referenced macro (`config/dactyl.keymap:44`, `config/dactyl.keymap:77-88`)

#### Scenario: Base layer active
- GIVEN SYM is not active
- WHEN the user presses keys on the base layer
- THEN the system SHALL NOT run either macro (`config/dactyl.keymap:46`)

### Requirement: Spanish host layout assumption

The system SHALL rely on the host using the Spanish (ES) layout, where `LBKT` is the dead grave and `Shift`+`LBKT` is the dead circumflex; the composition of the literal character happens in the host OS, not in ZMK (`config/dactyl.keymap:8-10`, `config/dactyl.keymap:22-23`; `inferido del código`). The firmware MUST NOT enforce or detect the host layout.

#### Scenario: Host on ES layout
- GIVEN the host uses the ES layout
- WHEN a macro runs
- THEN the host SHALL compose the dead key and `SPACE` into the literal `` ` `` or `^` (`config/dactyl.keymap:22-23`; `inferido del código`)

#### Scenario: Host on US layout
- GIVEN the host uses the US layout
- WHEN a macro runs
- THEN the system SHALL still send the same keycodes, so the host types `[ ` for grave and `{ ` for caret (`config/dactyl.keymap:28`, `config/dactyl.keymap:34`; `inferido del código`)

### Requirement: Trailing space is always appended

The system SHALL always append `SPACE` after the dead key, so no layer provides the plain dead grave or circumflex for composing accented vowels (`config/dactyl.keymap:28`, `config/dactyl.keymap:34`, `config/dactyl.keymap:80`, `config/dactyl.keymap:84`; `inferido del código`). Dead acute (`SQT`) is a plain `&kp` and composes with the next key natively (`config/dactyl.keymap:46`).

#### Scenario: Accented vowel from the macro
- GIVEN SYM is active
- WHEN the user presses a macro key and then a vowel
- THEN the system SHALL have already sent `SPACE`, so the vowel is not composed with the dead key (`config/dactyl.keymap:28`, `config/dactyl.keymap:34`; `inferido del código`)

### Requirement: Default macro timing

The system SHALL use ZMK default macro timing, because neither macro node sets `wait-ms` or `tap-ms` and `config/dactyl.conf` does not set them (`config/dactyl.keymap:25-35`; `inferido del código`). The behavior of a macro interrupted by releasing SYM mid-macro is undetermined.

#### Scenario: Macro run with default timing
- GIVEN no `wait-ms` or `tap-ms` is configured
- WHEN a macro runs
- THEN the system SHALL apply ZMK defaults between the dead key and `SPACE` (`config/dactyl.keymap:25-35`; `inferido del código`)

### Requirement: Separate key for the degree symbol

The system SHALL keep `º` as a separate `&kp GRAVE` on NUM layer position 0, outside these macros (`config/dactyl.keymap:57`).

#### Scenario: NUM layer position 0
- GIVEN NUM is the highest active layer
- WHEN the user presses position 0
- THEN the system SHALL send `GRAVE` directly without `SPACE` (`config/dactyl.keymap:57`)
