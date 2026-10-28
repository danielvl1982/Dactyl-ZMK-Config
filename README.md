# Dactyl 4x6 — ZMK split keyboard

A hand-wired Dactyl Manuform 4x6 split with a trackball on the right half, running
ZMK on nice!nano controllers. The keymap targets a **Spanish (ES) host layout** with
`Ñ`, accents and numbers on a function layer.

**Status:** work in progress. Both halves were flashed and type over USB with a test
keymap. The split firmware, the v1.0 Spanish keymap (four layers), Bluetooth profile
keys, battery reporting and deep sleep (5 min) are in `main` and compile in CI, but
have not been flashed or verified on hardware yet. The 18650 holder and the switch
cap are designed (`hardware/`) but not printed yet. See
[docs/02-current-state.md](docs/02-current-state.md).

## Quick facts

| Item | Value |
| --- | --- |
| Physical layout | 4 rows x 6 columns per half |
| Keys | 23 per half / 46 total (no thumb cluster) |
| Controllers | nice!nano (nRF52840), ZMK |
| Trackball | right half |
| Connection today | TRRS cable |
| Connection planned | BLE split (left = central) |
| Power today | USB |
| Power planned | LiPo per half |
| Host OS layout | Spanish (ES) |

## Documentation

Everything about the build lives in [`docs/`](docs/):

| Document | Contents |
| --- | --- |
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/01-hardware.md](docs/01-hardware.md) | Bill of materials, printed parts, wiring |
| [docs/02-current-state.md](docs/02-current-state.md) | What works today and what is broken |
| [docs/03-keymap.md](docs/03-keymap.md) | The established Spanish mapping |
| [docs/04-roadmap.md](docs/04-roadmap.md) | Next steps |
| [docs/05-build-log.md](docs/05-build-log.md) | Development history, dated |

Reference derived from the code (every claim cites `file:line`):

| Document | Contents |
| --- | --- |
| [docs/arquitectura.md](docs/arquitectura.md) | Architecture: keymap, shield, split BLE, CI build, STL generators |
| [docs/configuracion.md](docs/configuracion.md) | Every firmware key and generator parameter |
| [docs/datos.md](docs/datos.md) | Persistent and generated state (BLE bonds, STL files) |
| [docs/operaciones.md](docs/operaciones.md) | Build, flash, reset, pairing and known risks |
| [docs/features/README.md](docs/features/README.md) | The 16 features (layers, Bluetooth, sleep, CI, generators) with entry and exit matrices |
| [docs/preguntas-abiertas.md](docs/preguntas-abiertas.md) | Open questions and inconsistencies |
| [openspec/specs/](openspec/specs/) | One baseline spec per feature (current behavior) |

## Repository layout

```
config/
  dactyl.keymap                       # v1.0 keymap (base, NUM, NAV, SYM layers)
  dactyl.conf                         # sleep, battery reporting, Windows BLE workaround
  west.yml                            # ZMK manifest
  boards/shields/dactyl/
    dactyl.dtsi                       # matrix and shared transform
    dactyl_left.overlay               # left half pins (central)
    dactyl_right.overlay              # right half pins (col-offset 6)
    dactyl.zmk.yml                    # shield metadata
    Kconfig.defconfig                 # roles and keyboard name
    Kconfig.shield
hardware/
  18650-holder/                       # parametric battery holder (generator + STLs)
  switch-button/                      # parametric switch cap (generator + STL)
  third-party/                        # third-party STL parts with attribution
build.yaml                            # GitHub Actions build targets
docs/                                 # project documentation
openspec/                             # baseline spec per feature
```

The QMK port (`src/`), the case and keycap models (`files/`), the original battery
tray (`NCR18650B/`), photos and the vendor firmware live in the parent project
folder, outside this repository.

## Build

The firmware is built by the GitHub Actions workflow (`.github/workflows/build.yml`),
which reads `build.yaml`. Every push that changes the config produces a `.uf2` per
target in the workflow artifacts.

To flash: double-tap the reset button on the nice!nano so it mounts as a USB drive,
then copy the matching `.uf2` onto it.

## Conventions

- Firmware and documentation are written in English.
- Keycodes are US HID positions; the Spanish characters come from the host layout.
  See [docs/03-keymap.md](docs/03-keymap.md).
