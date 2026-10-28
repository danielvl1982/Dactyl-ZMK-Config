# Operations

Build, flash, test, logs, switches and known risks for the Dactyl 4x6 ZMK config.
Feature ids (F1-F16) are those used in `docs/features/`. Nothing here has been run on hardware yet
(`docs/04-roadmap.md:24`, `docs/04-roadmap.md:47-49`, `docs/05-build-log.md:16`).

## 1. Requirements

| Need | Detail | Evidence |
|---|---|---|
| Firmware build | GitHub account with Actions; no local toolchain is required. Boards: `nice_nano//zmk` | `.github/workflows/build.yml:6`, `build.yaml:2-3` |
| Firmware flash | Two nice!nano boards, USB cable | `README.md:64-65` |
| STL generators | Node.js (ES modules) and `npm install` for `manifold-3d ^3.5.4`. No Node version is pinned (no `engines`, no `.nvmrc`) | `hardware/18650-holder/package.json:5,10-12`, `hardware/switch-button/package.json:5,10-12` |
| Internal feeds / DB / Docker | Not applicable (none used) | - |

## 2. Build

### Firmware (F12)

- CI is the only build path. The workflow runs on `push`, `pull_request` and `workflow_dispatch` and delegates to ZMK's reusable workflow `zmkfirmware/zmk/.github/workflows/build-user-config.yml@main` (`.github/workflows/build.yml:2,6`).
- The target matrix is `build.yaml:1-8`: `dactyl_left`, `dactyl_right` and `settings_reset`, all on `nice_nano//zmk`. Each target produces one `.uf2` in the workflow artifacts (`README.md:59-61`).
- ZMK is pulled from `main` through `config/west.yml:7-9` (unpinned, see section 9).
- Local `west` builds are not documented. `.gitignore:2-9` ignores `build/`, `*.uf2`, `.west/`, `zmk/`, so a local build is possible but not described.

### STL generators (F15, F16)

Run inside each folder after `npm install`:

```bash
cd hardware/18650-holder && npm run build    # node holder_18650_tight.mjs
cd hardware/switch-button && npm run build   # node switch_cap.mjs
```

- Scripts: `hardware/18650-holder/package.json:8`, `hardware/switch-button/package.json:8`. There is no root `package.json`.
- Both accept an optional output directory as the first argument (`hardware/18650-holder/holder_18650_tight.mjs:257-258`, `hardware/switch-button/switch_cap.mjs:182-183`); without it they write next to the script.
- Outputs: `holder_18650_tight.stl` and `holder_18650_tight_mirrored.stl` (`hardware/18650-holder/holder_18650_tight.mjs:261-262`), and `switch_cap.stl` (`hardware/switch-button/switch_cap.mjs:186`). The generated STLs are versioned in git.

## 3. Run, flash, pair and reset (F14, F13, F7)

All of this is documented only; the roadmap records none of it as done on hardware (`docs/04-roadmap.md:24,47-49`).

1. **Flash** (F14): double-tap the reset button on the nice!nano so it mounts as a USB drive, then copy the matching `.uf2` onto it (`README.md:64-65`). Use `dactyl_left` for the left half and `dactyl_right` for the right half.
2. **Reset bonds and settings** (F13): the `settings_reset` target exists to wipe a half's bonds. Flash it on the half, then flash the real firmware again (`build.yaml:6-8`). The roadmap plans this on both halves (`docs/04-roadmap.md:47-48`).
3. **Pair** (F7): the left half is the central and the right half the peripheral (`config/boards/shields/dactyl/Kconfig.defconfig:1`; roles per catalog F9). Pairing with the host is still open (`docs/04-roadmap.md:49`). Profiles are selected with `&bt BT_SEL 0/1/2` and the current bond is cleared with `&bt BT_CLR`, all on the NAV layer (`config/dactyl.keymap:71`).
4. **Run**: there is no process to start. The firmware runs on the boards. Required configuration is in `config/dactyl.conf` (see `docs/configuracion.md`).

The exact order for resetting both halves and pairing with the host is not described anywhere (item 7 in `docs/preguntas-abiertas.md`).

## 4. Tests

No automated tests were detected: no test directories, test scripts or CI test jobs. The only validation is that CI compiles and that a human flashes and types (`build.yaml:1-8`, `docs/04-roadmap.md:24,57-62`). Per-layer commands: Not applicable (no test layers). The manual per-key and accent checks are open items in `docs/04-roadmap.md:24,57-62`.

## 5. Coverage

Not applicable (no tests, so no coverage command or measured value).

## 6. Logs

Not applicable at the application level: no logging option is set in `config/dactyl.conf:1-15` (no USB logging, no `CONFIG_LOG`). The only diagnostic output is the GitHub Actions build log of the workflow run. The STL generators write only the STL files (`hardware/18650-holder/holder_18650_tight.mjs:253`, `hardware/switch-button/switch_cap.mjs:178`).

## 7. Switches and parameters

| Switch | Value | Effect | Evidence |
|---|---|---|---|
| `CONFIG_ZMK_SLEEP` | `y` | Enables deep sleep; any key press wakes the half (`kscan0` is a wakeup-source) (F10) | `config/dactyl.conf:5`, `config/boards/shields/dactyl/dactyl.dtsi:12` |
| `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT` | `300000` (5 min, in ms) | Idle time before deep sleep; ZMK default is 15 min | `config/dactyl.conf:6` |
| `CONFIG_ZMK_BATTERY_REPORTING` | `y` | Each half reports its battery (F11) | `config/dactyl.conf:10` |
| `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_FETCHING` / `_PROXY` | `y` | Central fetches the peripheral level and proxies both to the host | `config/dactyl.conf:11-12` |
| `CONFIG_BT_GATT_ENFORCE_SUBSCRIPTION` | `n` | Windows workaround so the battery level shows in Settings | `config/dactyl.conf:15` |
| `workflow_dispatch` | manual trigger | Rebuild firmware without a push | `.github/workflows/build.yml:2` |
| Hardware power switch | cut-off on the positive 18650 lead | Planned, not fitted; the nice!nano has no low-voltage cut-off | `docs/04-roadmap.md:36-38` |

No frequencies or scheduled jobs exist. The 5 min sleep timeout is committed in `8ac7234` (on `main`) and the comment in `config/dactyl.conf:3` already says "set to 5 min, default is 15".

## 8. Deployment

There is no deployment pipeline. Delivery is manual: download the `.uf2` artifacts from the workflow run and copy them to each board (section 3). Artifact retention follows the reusable workflow defaults and is not set here. No release or tagging process is defined: No consta en el repositorio (item 26 in `docs/preguntas-abiertas.md`).

## 9. Known risks

| Risk | Detail | Evidence | Question |
|---|---|---|---|
| Unpinned ZMK and CI | `west.yml` tracks ZMK `main` and the workflow tracks `@main`, so builds are not reproducible and can break without any change here | `config/west.yml:8`, `.github/workflows/build.yml:6` | Item 10 |
| Nothing verified on hardware | Split firmware, keymap, battery and BT keys compile but are not flashed; only the old 24-position test keymap has run | `docs/02-current-state.md:15-17,55`, `docs/04-roadmap.md:24,47-49` | Item 11 |
| No tests | Validation is compile-only plus manual typing | `build.yaml:1-8` | Item 25 |
| Sleep timeout changed to 5 min | `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT=300000` is committed in `8ac7234` but not yet flashed to the boards | `config/dactyl.conf:6` | Resolved item 2 |
| Trackball undecided | Documented on the right half, with a Logitech M575 mentioned by the requester (not named in the repository); no sensor node, driver or feature exists in the shield or `config/dactyl.conf`. The roadmap marks it "Not started" | `README.md:19`, `docs/04-roadmap.md:63,81`, `config/boards/shields/dactyl/dactyl_right.overlay:1-18` | Item 18 |
| Battery safety | The nice!nano charges but does not cut off at low voltage; a cut-off switch is planned, not fitted | `docs/04-roadmap.md:36-38` | - |
| Node and dependency drift | `manifold-3d` uses a caret range and no Node version is pinned; lockfiles are committed | `hardware/18650-holder/package.json:10-12`, `hardware/switch-button/package.json:10-12` | - |
