# capa-navegacion-multimedia Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). The NAV layer (layer 2) provides function keys, cursor keys, Home/End/PgUp/PgDn, forward Delete, volume and media transport, plus the Bluetooth profile keys, while the NAV key is held. Documentation: `docs/features/capa-navegacion-multimedia.md`. Ticket: none.

## Requirements

### Requirement: NAV layer definition and activation

The system SHALL define the NAV layer as the `nav_layer` node of the `zmk,keymap` with 48 bindings in row-major order, 12 per row, with `LAYER_NAV` equal to 2 (`config/dactyl.keymap:12`, `config/dactyl.keymap:64-75`). The layer SHALL be activated while the `&mo LAYER_NAV` key on the outer-right of row 3 of the base layer is held (`config/dactyl.keymap:48`, `config/dactyl.keymap:16`).

#### Scenario: Holding the NAV key
- GIVEN the base layer is active
- WHEN the user holds the `&mo LAYER_NAV` key
- THEN the system SHALL activate layer 2 and resolve key presses against `nav_layer` first

#### Scenario: Key position resolution
- GIVEN layer 2 is active
- WHEN a key at a position is pressed
- THEN the system SHALL use the highest active layer that does not bind `&trans` at that position

#### Scenario: Outer-bottom positions
- GIVEN each half has 23 physical keys
- WHEN the outer-bottom position of a half is pressed on NAV
- THEN the layer MUST bind it to `&none` (`config/dactyl.keymap:66-73`)

### Requirement: Function keys F1-F12

The system SHALL bind `F1`-`F5` to row 1 left, `F6`-`F10` to row 2 left, and `F11`, `F12` to row 3 left, writing to the HID keyboard report (`config/dactyl.keymap:67`, `config/dactyl.keymap:69`, `config/dactyl.keymap:71`).

#### Scenario: Press F-key on NAV
- GIVEN NAV is held
- WHEN the key at row 1 left position 2 is pressed
- THEN the system SHALL send `F1` in the HID keyboard report

### Requirement: Cursor and navigation keys

The system SHALL bind `HOME`, `PG_DN`, `PG_UP`, `END` on row 1 right, `LEFT`, `DOWN`, `UP`, `RIGHT` on row 2 right, and `DEL` on row 3 right, writing to the HID keyboard report (`config/dactyl.keymap:67`, `config/dactyl.keymap:69`, `config/dactyl.keymap:71`). `DEL` on NAV SHALL act as forward Delete (`config/dactyl.keymap:71`, `docs/03-keymap.md:137-138`).

#### Scenario: Arrow cluster
- GIVEN NAV is held
- WHEN the user presses the right home-row keys
- THEN the system SHALL send `LEFT`, `DOWN`, `UP`, `RIGHT` in that left-to-right order

#### Scenario: Backspace while NAV held
- GIVEN NAV is held
- WHEN the user presses the `BSPC` position
- THEN the system SHALL fall through to the base layer and send `BSPC`, which MUST remain available (`config/dactyl.keymap:71`, `config/dactyl.keymap:50`, `docs/03-keymap.md:137-138`)

#### Scenario: HOME and END availability
- GIVEN the NAV and base layers are defined
- WHEN comparing where `HOME` and `END` are bound
- THEN `HOME` SHALL exist only on NAV while `END` exists on both NAV and the base layer (`config/dactyl.keymap:67`, `config/dactyl.keymap:50`, `docs/03-keymap.md:93`)

### Requirement: Volume and media transport

The system SHALL bind `C_VOL_DN`, `C_VOL_UP`, `C_MUTE` on row 3 left and `C_PREV`, `C_NEXT`, `C_PP` on row 4 left, writing to the HID consumer report (`config/dactyl.keymap:71`, `config/dactyl.keymap:73`). `C_PP` SHALL replace `SPACE` while NAV is held, so NAV has no space bar (`config/dactyl.keymap:73`, `config/dactyl.keymap:50`).

#### Scenario: Volume up
- GIVEN NAV is held
- WHEN the key bound to `C_VOL_UP` is pressed
- THEN the system SHALL send the consumer usage `C_VOL_UP` in the HID consumer report

#### Scenario: Play/pause replaces space
- GIVEN NAV is held
- WHEN the base-layer `SPACE` position is pressed
- THEN the system SHALL send `C_PP` and MUST NOT send `SPACE`

### Requirement: Bluetooth profile keys on NAV

The system SHALL bind `&bt BT_SEL 0`, `&bt BT_SEL 1`, `&bt BT_SEL 2` and `&bt BT_CLR` on row 3 right after `DEL`, using `dt-bindings/zmk/bt.h` (`config/dactyl.keymap:3`, `config/dactyl.keymap:71`). The Bluetooth profile behavior is owned by F7 (`gestion-perfiles-bluetooth`).

#### Scenario: Select profile 1
- GIVEN NAV is held
- WHEN the key bound to `&bt BT_SEL 0` is pressed
- THEN the system SHALL invoke the Bluetooth profile selection for profile 0

### Requirement: Transparent and blocked positions

The system SHALL bind unused NAV positions to `&trans` so they fall through to the layer below (`config/dactyl.keymap:69,71,73`, `config/dactyl.keymap:46,48,50`). The outer-left key of row 1 and both outer-bottom keys SHALL be `&none`, sending nothing and not falling through (`config/dactyl.keymap:67,73`).

#### Scenario: Transparent position
- GIVEN NAV is held
- WHEN a `&trans` position is pressed
- THEN the system SHALL send the binding of the layer below

#### Scenario: Keys kept working through transparency
- GIVEN NAV is held
- WHEN `LSHFT`, `TAB`, `ENTER`, `BSPC`, `&mo LAYER_NUM`, `LALT`, `END` (row 4 right) or the `&mo LAYER_NAV` key is pressed
- THEN the system SHALL send the base-layer binding (`config/dactyl.keymap:69,71,73`, `config/dactyl.keymap:46,48,50`)

#### Scenario: Blocked position
- GIVEN NAV is held
- WHEN a `&none` position is pressed
- THEN the system SHALL send nothing and MUST NOT fall through

#### Scenario: Modifier plus arrow
- GIVEN NAV is held
- WHEN `LCTRL` and a right home-row arrow key are pressed together
- THEN the system SHALL send `LCTRL` with the arrow keycode, because `LCTRL` and `LGUI` on the base layer stay reachable where NAV binds `&trans` (`config/dactyl.keymap:73`, `config/dactyl.keymap:50`; inferido del código)

### Requirement: Letters shadowed on NAV

The system SHALL shadow the letter keys (`Q W E R T`, `Y U I O`, `A S D F G`, `H J K L`, `Z X C V B`, `N M , . /`) with NAV bindings, so those letters cannot be typed while NAV is held (`config/dactyl.keymap:67-73`). The base-layer positions of `P`, `ñ` (`SEMI`) and the acute accent (`SQT`) are `&trans` on NAV, so they still fall through to the base layer and stay typeable (`config/dactyl.keymap:67`, `config/dactyl.keymap:69`; inferido del código, ZMK `&trans` behavior).

#### Scenario: Letter key under NAV
- GIVEN NAV is held
- WHEN a base-layer letter position is pressed
- THEN the system SHALL send the NAV binding at that position and MUST NOT send the letter

#### Scenario: P, ñ and acute under NAV
- GIVEN NAV is held
- WHEN the base-layer `P`, `ñ` or acute-accent position is pressed
- THEN the system SHALL find `&trans` there and send the base-layer key (`config/dactyl.keymap:67`, `config/dactyl.keymap:69`; inferido del código)

### Requirement: Combined NAV and SYM activation

The system SHALL leave the right outer key of row 1 as `&trans` on NAV so it falls through to `&mo LAYER_SYM`; holding it with NAV activates both layers and the higher index (SYM = 3) wins where both bind a key (`config/dactyl.keymap:67`, `config/dactyl.keymap:44`, `config/dactyl.keymap:17`; inferido del código, ZMK layer priority).

#### Scenario: NAV and SYM held together
- GIVEN NAV is held
- WHEN the user also holds the right outer key of row 1
- THEN the system SHALL activate layers 2 and 3 and resolve shared positions from layer 3 (inferido del código)

### Requirement: Consumer HID support is not configured explicitly

The system SHALL NOT enable or disable consumer HID usages in the project configuration; support relies on the ZMK default (`config/dactyl.conf:1-15`; inferido del código). Behavior of `F1`-`F12` and media keys on the host depends on host and OS shortcuts and is not verifiable from code.

#### Scenario: Consumer keys without explicit config
- GIVEN `config/dactyl.conf` has no consumer-report setting
- WHEN a `C_*` key is pressed
- THEN the system SHALL rely on the ZMK default for the HID consumer report (inferido del código)
