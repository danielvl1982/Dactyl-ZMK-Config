# gestion-perfiles-bluetooth Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Lets the user keep up to three Bluetooth host pairings on the keyboard, switch between them from the NAV layer, and clear the bond of the current profile. Documentation: `docs/features/gestion-perfiles-bluetooth.md`. Ticket: none.

## Requirements

### Requirement: Profile selection keys

The system SHALL bind `&bt BT_SEL 0`, `&bt BT_SEL 1` and `&bt BT_SEL 2` to key positions 31, 32 and 33 of the `nav_layer` node, one profile per key in order left to right (`config/dactyl.keymap:71`). The profile index is a literal and MUST NOT be validated at runtime in this repo.

#### Scenario: Selecting a profile
- GIVEN the NAV layer is active
- WHEN the user presses the key bound to `&bt BT_SEL n` (n in 0..2)
- THEN the system SHALL run the ZMK Bluetooth behavior with command `BT_SEL` and parameter `n` (`config/dactyl.keymap:71`)

#### Scenario: Profile switch effect (inferido del código)
- GIVEN `BT_SEL n` was executed
- WHEN ZMK processes the command
- THEN ZMK makes profile `n` active and the keyboard advertises or reconnects to the host bonded to that slot; this is ZMK behavior not defined in this repo (inferido del código)

#### Scenario: Active profile persisted (inferido del código)
- GIVEN `BT_SEL n` was executed
- WHEN ZMK stores state
- THEN the active profile index is saved in the half's settings flash (`docs/datos.md:11,28`; inferido del código)

### Requirement: Clear current profile bond

The system SHALL bind `&bt BT_CLR` to key position 34 of the `nav_layer` node, immediately right of `BT_SEL 2` (`config/dactyl.keymap:71`). `BT_CLR` MUST take no argument and MUST act on the currently selected profile only.

#### Scenario: Clearing the bond
- GIVEN the NAV layer is active and a profile is selected
- WHEN the user presses the `&bt BT_CLR` key
- THEN the system SHALL run the ZMK Bluetooth behavior with command `BT_CLR` (`config/dactyl.keymap:71`)

#### Scenario: Bond deletion effect (inferido del código)
- GIVEN `BT_CLR` was executed
- WHEN ZMK processes the command
- THEN the bond key material of the selected profile is deleted and the profile stays selected, so the keyboard can advertise for new pairing (`docs/datos.md:29,74`; inferido del código)

#### Scenario: Host must also forget the keyboard (inferido del código)
- GIVEN the bond was cleared on the keyboard
- WHEN the user wants to re-pair
- THEN the host must also forget the keyboard, a host action not verifiable from code (inferido del código)

### Requirement: Bluetooth keys only on NAV layer

The system SHALL expose the Bluetooth keys only on the NAV layer, which is active only while `&mo LAYER_NAV` is held (`config/dactyl.keymap:48`, `config/dactyl.keymap:64-75`). The keys MUST NOT be reachable from the base layer.

#### Scenario: Base layer
- GIVEN no layer key is held
- WHEN the user presses the right-half row 3 positions 31-34
- THEN the system SHALL NOT run any `&bt` command (`config/dactyl.keymap:41-52`)

### Requirement: Layer priority with SYM

The system SHALL resolve a key bound on both NAV and SYM to the higher layer index when both are held; SYM (index 3) binds `&kp` at positions 31-33 and `&trans` at 34 (`config/dactyl.keymap:84`, `config/dactyl.keymap:17`).

#### Scenario: NAV and SYM held together (inferido del código)
- GIVEN NAV and SYM are both held
- WHEN the user presses positions 31-33
- THEN `BT_SEL 0..2` are shadowed by the SYM `&kp` bindings, while `BT_CLR` at position 34 still works through `&trans` (inferido del código, ZMK layer priority)

### Requirement: Split roles unchanged by Bluetooth keys

The system SHALL keep the left half as BLE central and the right half as peripheral regardless of these keys (`config/boards/shields/dactyl/Kconfig.defconfig:6-7`). The keys sit on the right half; which half executes `&bt` is not proven by the code.

#### Scenario: Which half executes the command (inferido del código)
- GIVEN a `&bt` key is pressed on the right half
- WHEN the event is handled
- THEN execution on the central is ZMK default behavior locality; docs state the keys act on the central half (`docs/03-keymap.md:141-142`; inferido del código)

#### Scenario: Split link down (inferido del código)
- GIVEN the split link between halves is down
- WHEN a `&bt` key is pressed on the right half
- THEN whether it takes effect is not provable from this repo (inferido del código)

### Requirement: No bulk bond wipe from the keymap

The system SHALL NOT wipe all stale bonds through these keys; the `settings_reset` firmware is built separately and flashed per half (`build.yaml:6-8`, `docs/04-roadmap.md:47-48`).

#### Scenario: Wiping all bonds
- GIVEN stale bonds exist on a half
- WHEN the user needs to wipe them
- THEN the user SHALL flash the `settings_reset` image built by `build.yaml:6-8`

### Requirement: Profile count and defaults

The system SHALL expose exactly three profile slots (`0`, `1`, `2`) and MUST NOT guard against a larger index in this repo (`config/dactyl.keymap:71`). No Kconfig key in `config/dactyl.conf` touches profiles, so ZMK defaults apply (`config/dactyl.conf:1-15`).

#### Scenario: Index beyond ZMK maximum
- GIVEN a profile index above the ZMK configured maximum
- WHEN it would be bound in the keymap
- THEN no guard exists in this repo; only 0..2 are bound (`config/dactyl.keymap:71`)

#### Scenario: Unverified on hardware
- GIVEN the firmware has not been flashed
- WHEN pairing, switching or `BT_CLR` is considered
- THEN these behaviors remain unverified on hardware (`docs/04-roadmap.md:47-49`, `docs/03-keymap.md:3`)
