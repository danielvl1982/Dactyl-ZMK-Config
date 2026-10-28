# F12 - Firmware build in GitHub Actions (left, right, settings_reset .uf2)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

Every push, pull request or manual run builds the ZMK firmware for the Dactyl 4x6 and publishes one `.uf2` file per target as a workflow artifact. The maintainer downloads those files and flashes them by hand ([F14](flasheo-emparejado.md)). The repository holds no build code: it only supplies a short workflow that calls ZMK's reusable workflow, a target matrix and a west manifest.

## Trigger / Entry point

- Job `build`: triggered on `push`, `pull_request` and `workflow_dispatch` (`.github/workflows/build.yml:2`). It delegates to `zmkfirmware/zmk/.github/workflows/build-user-config.yml@main` (`.github/workflows/build.yml:6`).
- Config: `build.yaml` target matrix (`build.yaml:1`), read by the ZMK workflow (`inferido del código`: the file name and `include` key follow the ZMK user-config convention; `README.md:60-61` says the workflow reads `build.yaml`).
- Config: `config/west.yml` manifest selecting the ZMK revision (`config/west.yml:1`).

## Inputs (payload/config)

- Workflow events: `push`, `pull_request`, `workflow_dispatch` (`.github/workflows/build.yml:2`). There is no path or branch filter.
- `build.yaml` `include` list: three entries, each `board: nice_nano//zmk` plus a `shield` (`build.yaml:1-8`).
  - `dactyl_left` (`build.yaml:2-3`)
  - `dactyl_right` (`build.yaml:4-5`)
  - `settings_reset` (`build.yaml:7-8`), see [F13](reset-ajustes-bonds.md).
- `config/west.yml`: remote `zmkfirmware` at `https://github.com/zmkfirmware` (`config/west.yml:2-4`), project `zmk` with `revision: main` and `import: app/west.yml` (`config/west.yml:5-9`), and `self.path: config` (`config/west.yml:10-11`).
- Shield definitions, keymap and conf compiled in: `config/boards/shields/dactyl/`, `config/dactyl.keymap`, `config/dactyl.conf` (`inferido del código`: the ZMK workflow uses the `config` folder as user config, matching `self.path` at `config/west.yml:11`). See [F9](roles-split-ble.md) and [F8](matriz-teclado-split.md).

## Steps

1. A push, pull request or manual dispatch starts the `Build ZMK firmware` workflow (`.github/workflows/build.yml:1-2`).
2. Job `build` calls the reusable workflow `build-user-config.yml@main` of `zmkfirmware/zmk` (`.github/workflows/build.yml:5-6`). No inputs or secrets are passed.
3. The reusable workflow reads the `build.yaml` matrix and starts one build per entry (`inferido del código`; `build.yaml:1-8`).
   1. `dactyl_left` for `nice_nano//zmk` (`build.yaml:2-3`).
   2. `dactyl_right` for `nice_nano//zmk` (`build.yaml:4-5`).
   3. `settings_reset` for `nice_nano//zmk` (`build.yaml:7-8`).
4. Each build initialises west from `config/west.yml`, which pulls `zmkfirmware/zmk` at `main` and imports its `app/west.yml` (Zephyr and modules) (`config/west.yml:5-9`).
5. Each build produces a `.uf2` and uploads it as a workflow artifact (`inferido del código`: done inside the ZMK workflow; the build log records the resulting files, `docs/05-build-log.md:107-108`).

## Exit points

| Salida | Detalle |
|---|---|
| Workflow artifacts (`.uf2`) | One file per matrix entry: left, right, `settings_reset` for `nice_nano//zmk` (`build.yaml:1-8`). A recorded run produced `dactyl_left-nice_nano__zmk-zmk.uf2` (460800 bytes) and `dactyl_right-nice_nano__zmk-zmk.uf2` (377856 bytes) (`docs/05-build-log.md:107-108`). |
| Workflow run status | Green or red on GitHub; the build on `2bdfcf7` finished green (`docs/05-build-log.md:15`). |

## Business rules

- Exactly three firmware images are built: both halves and the settings reset image (`build.yaml:1-8`).
- All targets use the board `nice_nano//zmk` (`build.yaml:2`, `build.yaml:4`, `build.yaml:7`).
- The `settings_reset` image exists only to wipe bonds on a half; the comment says to flash it, then flash the real firmware again (`build.yaml:6`).
- The build always uses the latest ZMK `main`, because both the reusable workflow and the manifest are unpinned (`.github/workflows/build.yml:6`, `config/west.yml:8`).
- The workflow has no inputs, secrets, caching or release publishing (`.github/workflows/build.yml:1-6`).

## Errors and edge cases

- A breaking change in ZMK `main` can break the build or change the firmware without any commit in this repo (`config/west.yml:8`, `.github/workflows/build.yml:6`).
- The `nice_nano//zmk` board name uses the Zephyr hardware-model v2 syntax; if ZMK renames or drops it the matrix fails (`build.yaml:2`; `inferido del código`).
- Docs-only pushes also trigger a build, since there is no path filter (`.github/workflows/build.yml:2`). `README.md:61` says "every push that changes the config".
- Artifact retention and naming are decided by the ZMK workflow, not this repo (`inferido del código`).
- Flashing of these artifacts had not been done at last record (`docs/02-current-state.md:15`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Workflow triggers (scheduling/config), e.g. add path or branch filters | `.github/workflows/build.yml` → `on` (`.github/workflows/build.yml:2`) |
| Which reusable workflow version runs (pin `@main`) | `.github/workflows/build.yml` → `uses` (`.github/workflows/build.yml:6`) |
| Add or remove a firmware target (selection) | `build.yaml` → `include` (`build.yaml:1-8`) |
| Board used for a target (input validation of the matrix) | `build.yaml` → `board` (`build.yaml:2`, `build.yaml:4`, `build.yaml:7`) |
| Settings reset image (business rule) | `build.yaml` → `shield: settings_reset` (`build.yaml:7-8`) |
| ZMK version used (pin `revision: main`) | `config/west.yml` → `projects[zmk].revision` (`config/west.yml:8`) |
| Extra west modules or a different manifest import | `config/west.yml` → `projects` (`config/west.yml:5-9`) |
| Output / artifacts (name, retention, release) | Not in this repo; belongs to the ZMK reusable workflow (`.github/workflows/build.yml:6`, `inferido del código`) |

## Existing tests

Ninguno conocido. The only check is the workflow run itself (`.github/workflows/build.yml:1-6`).

## Coverage / Gaps

- No tests or validation beyond a successful compile in CI.
- Unpinned `@main` and `revision: main`, the missing path filter, and unprovable artifact behavior are recorded in `docs/preguntas-abiertas.md` items 10, 22 and 41.
- Used by [F13](reset-ajustes-bonds.md) (settings reset target) and [F14](flasheo-emparejado.md) (flashing the artifacts).
