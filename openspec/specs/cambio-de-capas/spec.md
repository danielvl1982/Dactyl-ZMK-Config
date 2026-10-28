# cambio-de-capas Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Momentary switching of the SYM, NAV and NUM layers from three keys on the base layer. Documentation: `docs/features/cambio-de-capas.md`. Ticket: none.

## Requirements

### Requirement: Momentary layer keys on the base layer

The system SHALL bind `&mo LAYER_SYM` at position 11, `&mo LAYER_NAV` at position 35 and `&mo LAYER_NUM` at position 44 (the `FN` key) of `base_layer` (`config/dactyl.keymap:44`, `config/dactyl.keymap:48`, `config/dactyl.keymap:50`). Positions are counted row-major, 12 per row, left half first; the numeric positions are `inferido del código` from that order. All three keys MUST be on the right half.

#### Scenario: Holding a layer key
- GIVEN no layer key is held
- WHEN the key at position 11, 35 or 44 is pressed and held
- THEN the system SHALL activate layer SYM, NAV or NUM respectively while the key stays pressed (`&mo` semantics are standard ZMK behavior, `inferido del código`)

#### Scenario: Releasing a layer key
- GIVEN a layer is active through its `&mo` key
- WHEN the key is released
- THEN the system SHALL deactivate that layer and resolve later presses from the layers below (`inferido del código`)

### Requirement: Layers are momentary only

The system MUST NOT keep any layer active after its key is released: the keymap contains no `&tog`, `&to` or `&sl` binding, and defines no `conditional_layers`, `combos` or other layer behavior (`config/dactyl.keymap:41-90`, `config/dactyl.keymap:19-90`).

#### Scenario: No persistent layer
- GIVEN the keymap as shipped
- WHEN any layer key is released
- THEN the system SHALL return to the layers that remain held, with no toggled or sticky layer left on

### Requirement: Layer index constants

The system SHALL define `LAYER_NUM 1`, `LAYER_NAV 2` and `LAYER_SYM 3`, with the base layer at index 0 (`config/dactyl.keymap:12`, `config/dactyl.keymap:15-17`). The order of the layer nodes (`base_layer`, `num_layer`, `nav_layer`, `sym_layer`) MUST match these constants (`config/dactyl.keymap:41`, `config/dactyl.keymap:54`, `config/dactyl.keymap:64`, `config/dactyl.keymap:77`). Nothing checks this match; that ZMK assigns indexes by node order is `inferido del código`.

#### Scenario: Node order matches constants
- GIVEN the nodes are ordered base, NUM, NAV, SYM
- WHEN an `&mo` key is pressed
- THEN the system SHALL activate the layer whose name matches the constant used

#### Scenario: Node order changed without updating constants
- GIVEN the layer nodes are reordered and the constants are unchanged
- WHEN an `&mo` key is pressed
- THEN the system SHALL activate the layer at the constant's index, which is the wrong layer (`inferido del código`; no check exists)

### Requirement: Fall-through resolution with `&trans`

The system SHALL resolve each key press from the highest active layer downward: a non-`&trans` binding wins and `&trans` falls through to the layer below (`config/dactyl.keymap:57-60`, `config/dactyl.keymap:67-73`, `config/dactyl.keymap:80-86`). Every layer MUST have 48 bindings, with `&trans` wherever the base layer must stay reachable (`config/dactyl.keymap:54-88`).

#### Scenario: Transparent key under NAV
- GIVEN NAV is held
- WHEN `BSPC` is pressed
- THEN the system SHALL emit Backspace because NAV has `&trans` at that position (`config/dactyl.keymap:50`, `config/dactyl.keymap:73`)

#### Scenario: Release handled by the resolving layer
- GIVEN a key press was resolved on a given layer
- WHEN the key is released, even after the layer key has been released
- THEN the system SHALL handle the release on the layer where the press was resolved (`inferido del código` from ZMK behavior)

### Requirement: Layer keys stay transparent on target layers

The system SHALL bind `&trans` at positions 11, 35 and 44 on the NUM, NAV and SYM layers, so the held key keeps acting as the layer key while the layer is active (NUM `config/dactyl.keymap:57`, `config/dactyl.keymap:59`, `config/dactyl.keymap:60`; NAV `config/dactyl.keymap:67`, `config/dactyl.keymap:71`, `config/dactyl.keymap:73`; SYM `config/dactyl.keymap:80`, `config/dactyl.keymap:84`, `config/dactyl.keymap:86`).

#### Scenario: Layer key position while its layer is held
- GIVEN a layer is active through its `&mo` key
- WHEN another layer key position is inspected on the active layer
- THEN the system SHALL resolve it as `&trans` and fall through to the base layer binding

### Requirement: Multiple layer keys held

The system SHALL consult the highest layer index first when several layers are held, so SYM wins over NAV and NAV over NUM on conflicts (`config/dactyl.keymap:15-17`). This is `inferido del código` from ZMK layer resolution; it is neither documented nor tested.

#### Scenario: Two layer keys held
- GIVEN two layer keys are held at once
- WHEN a key is pressed that both layers bind
- THEN the system SHALL use the binding of the higher-index layer (`inferido del código`)

### Requirement: Layer state is transient and split-dependent

The system SHALL keep the active layer state in RAM only, set on press and cleared on release, never persisted (`config/dactyl.keymap:44`, `config/dactyl.keymap:48`, `config/dactyl.keymap:50`). No Kconfig key or devicetree property controls layers (`config/dactyl.conf:1-15`). Because all three layer keys are on the peripheral half and the keymap lives on the central, layer state depends on the BLE link (`config/dactyl.conf:9-12`; `inferido del código`).

#### Scenario: Layer state after power cycle
- GIVEN a layer key was held
- WHEN the keyboard restarts
- THEN the system SHALL start on the base layer with no stored layer state

#### Scenario: Peripheral disconnected while a layer key is held
- GIVEN a layer key on the right half is held
- WHEN the peripheral disconnects from the central
- THEN the layer state follows the BLE link (`inferido del código` from the split setup)
