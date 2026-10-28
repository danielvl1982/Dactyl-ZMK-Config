# F13 - Settings reset firmware (wipe BLE bonds and stored settings)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

Provides a build target that, once flashed on a half, erases that half's stored settings (BLE bonds and profiles) so stale pairings can be cleared. After that the real firmware must be flashed again. It is for the keyboard owner when bonds get stale (`build.yaml:6`, `docs/04-roadmap.md:47-48`). The repo only declares the target; the erase itself is done by the `settings_reset` shield shipped with ZMK (`inferred from code`).

## Trigger / Entry point

- Config: `settings_reset` entry of the build matrix, board `nice_nano//zmk` (`build.yaml:7-8`).
- Job: the matrix is built by the CI workflow on push, pull request or manual dispatch (`.github/workflows/build.yml:2`, `.github/workflows/build.yml:6`), see [F12](build-firmware-ci.md).
- Manual: the user flashes the resulting `.uf2` on one half (`build.yaml:6`, `README.md:64-65`).

## Inputs (payload/config)

- `include[].board` = `nice_nano//zmk` — same board as the real firmware (`build.yaml:7`).
- `include[].shield` = `settings_reset` — shield defined by ZMK upstream, not by this repo; the repo has no `settings_reset` shield files and no options for it (`build.yaml:8`, `docs/configuracion.md:140`) (`inferred from code`).
- No `config/dactyl.conf` options apply: the entry does not list either Dactyl shield (`build.yaml:7-8`); see [F9](roles-split-ble.md).

## Steps

1. CI builds the `build.yaml` matrix through ZMK's reusable workflow, producing one `.uf2` per entry (`.github/workflows/build.yml:6`, [F12](build-firmware-ci.md)).
2. The `settings_reset` entry yields its own `.uf2` image (`build.yaml:7-8`).
3. The user double-taps the reset button on the nice!nano so it mounts as a USB drive and copies the `settings_reset` `.uf2` onto it (`README.md:64-65`).
4. The flashed image erases the settings partition of that half: bonds and profiles (`build.yaml:6`; erase behavior is upstream, `inferred from code`).
5. The user flashes the real firmware (`dactyl_left` or `dactyl_right`) again on that half (`build.yaml:6`).
6. Repeat per half; the two halves do not share bond storage atomically (`docs/arquitectura.md:186`).

## Exit points

| Salida | Detalle |
|---|---|
| Workflow artifact `.uf2` | `settings_reset` image for `nice_nano//zmk` (`build.yaml:7-8`) |
| Flash settings partition of the half | Erase of bonds and profiles when the image runs (`build.yaml:6`, `inferred from code`) |

## Business rules

- The reset image must be flashed per half; it acts only on the half it is flashed to (`build.yaml:6`, `docs/arquitectura.md:186`).
- After flashing the reset image, the real firmware must be flashed again, otherwise the half has no keyboard firmware (`build.yaml:6`).
- Wiping all bonds is not done by the `&bt BT_CLR` key; that is a separate mechanism, see [F7](gestion-perfiles-bluetooth.md) (`docs/features/gestion-perfiles-bluetooth.md:47`).

## Errors and edge cases

- Reset image flashed on only one half → the other half keeps its old bonds (`inferred from code`, `docs/arquitectura.md:186`).
- Order of resetting both halves and re-pairing with the host is not documented (`docs/operaciones.md:47`).
- Roadmap item for flashing on both halves is still open (`docs/04-roadmap.md:47-48`).
- The `settings_reset` firmware revision follows ZMK `main`, which is not pinned (`.github/workflows/build.yml:6`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Whether the reset image is built at all | `build.yaml` → `settings_reset` matrix entry (`build.yaml:7-8`) |
| Target board of the reset image | `build.yaml` → `board` (`build.yaml:7`) |
| Build trigger or scheduling | `.github/workflows/build.yml` → `on` (`.github/workflows/build.yml:2`) |
| Upstream ZMK revision used by the reset image | `.github/workflows/build.yml` → `uses` (`.github/workflows/build.yml:6`) |
| Output artifact / flashing instructions | `README.md` → Build section (`README.md:59-65`) |
| Input validation, business rule, persistence | No aplica (no repo code; the erase is upstream ZMK) |

## Existing tests

- Ninguno conocido: the repository has no tests; CI only builds the target (`.github/workflows/build.yml:6`).

## Coverage / Gaps

- The erase behavior cannot be proven from this repo; documented as `inferred from code` (fragment on the open questions).
- No documented procedure for resetting both halves and pairing (`docs/operaciones.md:47`).
- Roadmap item not yet done (`docs/04-roadmap.md:47-48`).
