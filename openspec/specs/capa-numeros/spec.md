# capa-numeros Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). The NUM layer (layer 1) provides the Spanish number row (`º`, `1` to `0`) while `FN` is held. Documentation: `docs/features/capa-numeros.md`. Ticket: none.

## Requirements

### Requirement: Layer activation

The system SHALL activate the NUM layer (`LAYER_NUM`, index 1) only while the `FN` key is held, through `&mo LAYER_NUM` on the right half, bottom row, third position (`config/dactyl.keymap:50`, `config/dactyl.keymap:15`). The `num_layer` node MUST be the second entry under `keymap` so that it matches `LAYER_NUM` (`config/dactyl.keymap:12`, `config/dactyl.keymap:54`). The momentary-layer behavior itself is owned by F2 (`cambio-de-capas`).

#### Scenario: Holding FN
- GIVEN the base layer is active
- WHEN the user holds `FN`
- THEN the system SHALL look up key presses in `num_layer` (`config/dactyl.keymap:54-62`)

### Requirement: Layer shape

The system SHALL define `num_layer` with 48 bindings in row-major order, 12 per row (`config/dactyl.keymap:54-62`). Each half has 23 physical keys and 24 matrix positions; the missing outer-bottom key is bound to `&none` (`config/dactyl.keymap:60`).

#### Scenario: Binding count
- GIVEN the `num_layer` node
- WHEN the keymap is read
- THEN the system SHALL expose 4 rows of 12 bindings (`config/dactyl.keymap:57-60`)

### Requirement: Number row on row 1

The system SHALL bind row 1 as `&kp GRAVE &kp N1 &kp N2 &kp N3 &kp N4 &kp N5` on the left half and `&kp N6 &kp N7 &kp N8 &kp N9 &kp N0 &trans` on the right half (`config/dactyl.keymap:57`). The digits MUST be plain `&kp N1`..`&kp N0`, never combined with Shift or AltGr (`config/dactyl.keymap:57`).

#### Scenario: Digit key pressed with FN held
- GIVEN `FN` is held
- WHEN the user presses a row 1 key bound to `&kp N1`..`&kp N0`
- THEN the system SHALL emit the matching digit keycode with no modifiers (`config/dactyl.keymap:57`)

### Requirement: Ordinal mark key

The system SHALL bind the first key of row 1 to `&kp GRAVE`, which types `º` on a host set to the Spanish (ES) layout (`config/dactyl.keymap:56-57`, `config/dactyl.keymap:8-10`).

#### Scenario: ES host
- GIVEN the host uses the ES layout and `FN` is held
- WHEN the user presses the first key of row 1
- THEN the system SHALL emit the `GRAVE` keycode, which types `º`

#### Scenario: US host
- GIVEN the host uses the US layout and `FN` is held
- WHEN the user presses the first key of row 1
- THEN the system SHALL emit the same `GRAVE` keycode, which types a backtick; the firmware does not detect the host layout (`config/dactyl.keymap:8-10`)

### Requirement: Transparent positions

The system SHALL bind every position outside the `&kp` keys and the `&none` keys to `&trans`: rows 2 and 3 fully, the last key of row 1 and the inner keys of row 4 (`config/dactyl.keymap:57-60`). A `&trans` position MUST use the binding of the same position in the next lower active layer, the base layer (ZMK standard behavior, `inferido del código`).

#### Scenario: Non-number key with FN held
- GIVEN `FN` is held
- WHEN the user presses a position bound to `&trans` on NUM
- THEN the system SHALL apply the base-layer binding of that position (`config/dactyl.keymap:58-60`)

#### Scenario: FN key itself
- GIVEN `FN` is held
- WHEN the position of `FN` is evaluated on NUM
- THEN the system SHALL find `&trans` there, so releasing `FN` still ends the layer (`config/dactyl.keymap:60`, `config/dactyl.keymap:50`; `inferido del código`)

### Requirement: Outer-bottom keys send nothing

The system SHALL bind the two outer-bottom positions of row 4 to `&none`, which send nothing and MUST NOT fall through to lower layers (`config/dactyl.keymap:60`).

#### Scenario: Outer-bottom key pressed
- GIVEN `FN` is held
- WHEN the user presses an outer-bottom position
- THEN the system SHALL emit no keycode

### Requirement: Layer stacking through transparent keys

While `FN` is held, the layer-key positions that are `&trans` on NUM SHALL keep their base-layer layer-switching behavior (`config/dactyl.keymap:57`, `config/dactyl.keymap:44`, `config/dactyl.keymap:48`; `inferido del código`).

#### Scenario: Right-most key of row 1
- GIVEN `FN` is held
- WHEN the user presses the right-most key of row 1
- THEN the system SHALL fall through to the base `&mo LAYER_SYM`, so SYM is active on top of NUM

#### Scenario: NAV key
- GIVEN `FN` is held
- WHEN the user holds the right-most key of row 3 (`&mo LAYER_NAV`)
- THEN the system SHALL activate NAV above NUM, making the NAV F-keys reachable (`config/dactyl.keymap:48`, `config/dactyl.keymap:67`)

### Requirement: HID output

The system SHALL emit keyboard-report keycodes `GRAVE`, `N1`..`N0` through `&kp` on this layer, adding no modifiers (`config/dactyl.keymap:57`).

#### Scenario: Keycode emission
- GIVEN `FN` is held
- WHEN a `&kp` key of NUM is pressed
- THEN the system SHALL write that keycode to the USB/BLE HID keyboard report
