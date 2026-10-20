# Dactyl 4x6 — ZMK split keyboard

A hand-wired Dactyl Manuform 4x6 split with a trackball on the right half, running
ZMK on nice!nano controllers. The keymap targets a **Spanish (ES) host layout** with
`Ñ`, accents and numbers on a function layer.

**Status:** work in progress. One half flashes and types with a test keymap. The
split, Bluetooth link, batteries and the final Spanish keymap are still pending.

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

## Repository layout

```
config/
  dactyl_left.keymap                  # current keymap (test map A-X)
  boards/shields/dactyl_left/
    dactyl_left.overlay               # matrix, pins and transform
    dactyl_left.zmk.yml               # shield metadata
    Kconfig.defconfig                 # shield Kconfig
    Kconfig.shield
build.yaml                            # GitHub Actions build targets
docs/                                 # project documentation
```

The QMK port (`src/`), the 3D models (`files/`), photos and the vendor firmware
live in the parent project folder, outside this repository.

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
