# Documentation index

This folder records the development of the Dactyl 4x6 keyboard: the hardware,
the current state, the agreed keymap, the plan and the history of every decision.

| Document | Purpose |
| --- | --- |
| [01-hardware.md](01-hardware.md) | Bill of materials, printed parts, controllers, wiring |
| [02-current-state.md](02-current-state.md) | What is soldered, flashed and verified today |
| [03-keymap.md](03-keymap.md) | The established Spanish (ES) mapping |
| [04-roadmap.md](04-roadmap.md) | Ordered next steps and open questions |
| [05-build-log.md](05-build-log.md) | Dated log of the development process |

## How to keep this current

1. Any change of behavior, wiring or keymap gets a dated entry in
   [05-build-log.md](05-build-log.md).
2. If the keymap changes, update [03-keymap.md](03-keymap.md) in the same commit.
3. If a step is finished, tick it in [04-roadmap.md](04-roadmap.md) and record the
   evidence in the log.
4. If something breaks, write down the symptom, the cause and the fix. The log is
   the memory of the project.

## Terminology

- **Half**: one physical side of the split keyboard (left or right).
- **Central**: the half that connects to the host over BLE and forwards the other
  half's events. Planned to be the left half.
- **Peripheral**: the other half. It reports key events to the central.
- **Transform**: the ZMK devicetree map from physical matrix position to logical
  key position.
- **Keymap**: the table that assigns a keycode to each logical position.
