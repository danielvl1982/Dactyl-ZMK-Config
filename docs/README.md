# Documentation index

This folder records the development of the Dactyl 4x6 keyboard (ZMK firmware plus printable hardware parts): the hardware, the current state, the agreed keymap, the plan, the history of every decision, and a code-derived reference.

The code-derived documents (architecture, data, configuration, operations, features) describe the real code at commit `a7ec066`. Every relevant claim cites `file:line`. What cannot be confirmed by reading the code is marked **inferido del código** and collected in [preguntas-abiertas.md](preguntas-abiertas.md). Machine state: [.manifest.json](.manifest.json).

Conventions: code paths are relative to the repository root and line numbers match the commit above, except `config/dactyl.conf`, which has an uncommitted change (the 5 minute sleep timeout, open question 2), so its line numbers may shift once it is committed. No secrets are documented.

## How to use this documentation to implement

1. Find the affected entry point or output in [features/README.md](features/README.md) (entry and exit matrices).
2. Open the feature and go to **Where to act**.
3. Read its spec in `openspec/specs/<slug>/spec.md` and the linked open questions.
4. Open an OpenSpec change before touching behavior.

## Index

### Hand-written project records

| Document | Purpose |
| --- | --- |
| [01-hardware.md](01-hardware.md) | Bill of materials, printed parts, controllers, wiring |
| [02-current-state.md](02-current-state.md) | What is soldered, flashed and verified today |
| [03-keymap.md](03-keymap.md) | The established Spanish (ES) mapping |
| [04-roadmap.md](04-roadmap.md) | Ordered next steps and open questions |
| [05-build-log.md](05-build-log.md) | Dated log of the development process |

### Code-derived reference

| Document | Content |
| --- | --- |
| [arquitectura.md](arquitectura.md) | ZMK user config (keymap, `dactyl` shield, split BLE, CI build) plus two Node/manifold-3d STL generators; features F1-F16 |
| [configuracion.md](configuracion.md) | Firmware Kconfig/devicetree keys (sleep timeout 5 min), west/CI build selection, and the `P` parameters of both STL generators |
| [datos.md](datos.md) | Persistent and generated state (no database): BLE bonds and profiles, volatile layer and battery state, read/write matrix, STL data contracts |
| [operaciones.md](operaciones.md) | CI-only `.uf2` build, npm STL generators, flash/reset/pair procedure (prose only, unverified on hardware), sleep and battery switches, known risks |
| [preguntas-abiertas.md](preguntas-abiertas.md) | Findings that cannot be verified from code, and inconsistencies |
| [features/README.md](features/README.md) | Feature list and entry/exit matrices |

No `api.md`: the project exposes no API.

### Features

| Id | Feature | Ticket | Document | Spec (OpenSpec) |
|---|---|---|---|---|
| F1 | Base layer typing (QWERTY, host in ES layout) | - | [features/capa-base-qwerty-es.md](features/capa-base-qwerty-es.md) | [openspec/specs/capa-base-qwerty-es/spec.md](../openspec/specs/capa-base-qwerty-es/spec.md) |
| F2 | Momentary layer switching (SYM, NAV, NUM) | - | [features/cambio-de-capas.md](features/cambio-de-capas.md) | [openspec/specs/cambio-de-capas/spec.md](../openspec/specs/cambio-de-capas/spec.md) |
| F3 | NUM layer | - | [features/capa-numeros.md](features/capa-numeros.md) | [openspec/specs/capa-numeros/spec.md](../openspec/specs/capa-numeros/spec.md) |
| F4 | NAV layer (F-keys, arrows, media, Bluetooth keys) | - | [features/capa-navegacion-multimedia.md](features/capa-navegacion-multimedia.md) | [openspec/specs/capa-navegacion-multimedia/spec.md](../openspec/specs/capa-navegacion-multimedia/spec.md) |
| F5 | SYM layer (symbols via Shift/AltGr on ES layout) | - | [features/capa-simbolos.md](features/capa-simbolos.md) | [openspec/specs/capa-simbolos/spec.md](../openspec/specs/capa-simbolos/spec.md) |
| F6 | Dead-key literal macros (grave and caret) | - | [features/macros-teclas-muertas.md](features/macros-teclas-muertas.md) | [openspec/specs/macros-teclas-muertas/spec.md](../openspec/specs/macros-teclas-muertas/spec.md) |
| F7 | Bluetooth profile selection and clearing | - | [features/gestion-perfiles-bluetooth.md](features/gestion-perfiles-bluetooth.md) | [openspec/specs/gestion-perfiles-bluetooth/spec.md](../openspec/specs/gestion-perfiles-bluetooth/spec.md) |
| F8 | Key matrix scan and split matrix transform | - | [features/matriz-teclado-split.md](features/matriz-teclado-split.md) | [openspec/specs/matriz-teclado-split/spec.md](../openspec/specs/matriz-teclado-split/spec.md) |
| F9 | Split roles and shield definition | - | [features/roles-split-ble.md](features/roles-split-ble.md) | [openspec/specs/roles-split-ble/spec.md](../openspec/specs/roles-split-ble/spec.md) |
| F10 | Deep sleep on idle with key wake-up | - | [features/sueno-profundo.md](features/sueno-profundo.md) | [openspec/specs/sueno-profundo/spec.md](../openspec/specs/sueno-profundo/spec.md) |
| F11 | Battery level reporting for both halves over BLE | - | [features/informe-bateria-ble.md](features/informe-bateria-ble.md) | [openspec/specs/informe-bateria-ble/spec.md](../openspec/specs/informe-bateria-ble/spec.md) |
| F12 | Firmware build in GitHub Actions | - | [features/build-firmware-ci.md](features/build-firmware-ci.md) | [openspec/specs/build-firmware-ci/spec.md](../openspec/specs/build-firmware-ci/spec.md) |
| F13 | Settings reset firmware (wipe BLE bonds) | - | [features/reset-ajustes-bonds.md](features/reset-ajustes-bonds.md) | [openspec/specs/reset-ajustes-bonds/spec.md](../openspec/specs/reset-ajustes-bonds/spec.md) |
| F14 | Flashing and pairing workflow (documented only) | - | [features/flasheo-emparejado.md](features/flasheo-emparejado.md) | [openspec/specs/flasheo-emparejado/spec.md](../openspec/specs/flasheo-emparejado/spec.md) |
| F15 | Parametric 18650 holder generator | - | [features/generador-soporte-18650.md](features/generador-soporte-18650.md) | [openspec/specs/generador-soporte-18650/spec.md](../openspec/specs/generador-soporte-18650/spec.md) |
| F16 | Parametric switch cap generator | - | [features/generador-capuchon-pulsador.md](features/generador-capuchon-pulsador.md) | [openspec/specs/generador-capuchon-pulsador/spec.md](../openspec/specs/generador-capuchon-pulsador/spec.md) |

## How to keep this current

1. Any change of behavior, wiring or keymap gets a dated entry in [05-build-log.md](05-build-log.md).
2. If the keymap changes, update [03-keymap.md](03-keymap.md) in the same commit.
3. If a step is finished, tick it in [04-roadmap.md](04-roadmap.md) and record the evidence in the log.
4. If something breaks, write down the symptom, the cause and the fix. The log is the memory of the project.
5. After a behavior change, update the matching feature document and spec (`docs-change-intake` flow).

## Terminology

- **Half**: one physical side of the split keyboard (left or right).
- **Central**: the half that connects to the host over BLE and forwards the other half's events. The left half.
- **Peripheral**: the other half. It reports key events to the central.
- **Transform**: the ZMK devicetree map from physical matrix position to logical key position.
- **Keymap**: the table that assigns a keycode to each logical position.
