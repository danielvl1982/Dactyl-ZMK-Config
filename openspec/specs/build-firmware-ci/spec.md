# build-firmware-ci Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Every push, pull request or manual run builds the ZMK firmware for the Dactyl 4x6 through ZMK's reusable workflow and publishes one `.uf2` per target as a workflow artifact. Documentation: `docs/features/build-firmware-ci.md`. Ticket: none.

## Requirements

### Requirement: Workflow triggers

The system SHALL start the `Build ZMK firmware` workflow on `push`, `pull_request` and `workflow_dispatch` (`.github/workflows/build.yml:2`). The workflow MUST NOT apply any path or branch filter.

#### Scenario: Push triggers a build
- GIVEN a commit is pushed to any branch
- WHEN the push reaches GitHub
- THEN the system SHALL start the workflow

#### Scenario: Docs-only push still builds
- GIVEN a push that changes only documentation files
- WHEN the push reaches GitHub
- THEN the system SHALL start the workflow, since no path filter exists (`.github/workflows/build.yml:2`)

#### Scenario: Manual dispatch
- GIVEN the maintainer opens the Actions tab
- WHEN the maintainer runs the workflow manually
- THEN the system SHALL start the build via `workflow_dispatch`

### Requirement: Delegation to the ZMK reusable workflow

The system SHALL run a single job `build` that calls `zmkfirmware/zmk/.github/workflows/build-user-config.yml@main` (`.github/workflows/build.yml:5-6`). The job MUST NOT pass inputs or secrets, and the repository contains no build code of its own.

#### Scenario: Job calls ZMK workflow
- GIVEN the workflow was triggered
- WHEN job `build` runs
- THEN the system SHALL invoke the reusable workflow at `@main` with no inputs or secrets (`.github/workflows/build.yml:5-6`)

#### Scenario: No caching or release publishing
- GIVEN a build finishes
- WHEN the repository workflow is inspected
- THEN the system SHALL define no caching and no release publishing step (`.github/workflows/build.yml:1-6`)

### Requirement: Target matrix

The system SHALL build exactly three firmware images from the `build.yaml` `include` list: `dactyl_left`, `dactyl_right` and `settings_reset`, all with board `nice_nano//zmk` (`build.yaml:1-8`). Reading the matrix is done by the ZMK workflow (`inferido del código`; `README.md:60-61`).

#### Scenario: One build per matrix entry
- GIVEN `build.yaml` lists three entries
- WHEN the reusable workflow runs
- THEN the system SHALL start one build per entry for `nice_nano//zmk` (`build.yaml:2-8`; `inferido del código`)

#### Scenario: Uniform board
- GIVEN the three matrix entries
- WHEN their `board` values are read
- THEN every entry SHALL use `nice_nano//zmk` (`build.yaml:2`, `build.yaml:4`, `build.yaml:7`)

### Requirement: Settings reset image

The system SHALL include a `settings_reset` shield target whose purpose is to wipe bonds on a half; the file comment says to flash it and then flash the real firmware again (`build.yaml:6-8`).

#### Scenario: Reset image is built with the halves
- GIVEN a successful run
- WHEN artifacts are listed
- THEN the system SHALL include a `settings_reset` image next to left and right (`build.yaml:7-8`)

### Requirement: Unpinned ZMK revision

The system SHALL fetch ZMK at `revision: main` and import `app/west.yml` from `config/west.yml`, using the remote `zmkfirmware` at `https://github.com/zmkfirmware` with `self.path: config` (`config/west.yml:2-11`). Both the manifest and the reusable workflow MUST remain unpinned, so builds always use the latest ZMK `main`.

#### Scenario: Upstream change alters the build
- GIVEN ZMK `main` receives a breaking change and no commit is made here
- WHEN a build runs
- THEN the build SHALL use the new upstream code and MAY fail or change the firmware (`config/west.yml:8`, `.github/workflows/build.yml:6`)

#### Scenario: Board name dropped upstream
- GIVEN ZMK renames or drops the `nice_nano//zmk` board name (hardware-model v2 syntax)
- WHEN a build runs
- THEN the matrix SHALL fail (`build.yaml:2`; `inferido del código`)

### Requirement: Firmware artifacts

The system SHALL upload one `.uf2` per matrix entry as a workflow artifact (`inferido del código`: performed by the ZMK workflow). A recorded run produced `dactyl_left-nice_nano__zmk-zmk.uf2` (460800 bytes) and `dactyl_right-nice_nano__zmk-zmk.uf2` (377856 bytes) (`docs/05-build-log.md:107-108`).

#### Scenario: Artifacts per target
- GIVEN a green run
- WHEN the maintainer opens the run page
- THEN the system SHALL offer one `.uf2` artifact for left, right and `settings_reset` (`build.yaml:1-8`; `inferido del código`)

#### Scenario: Retention and naming
- GIVEN the artifacts exist
- WHEN retention or naming is considered
- THEN the system SHALL leave both to the ZMK workflow, not this repository (`inferido del código`)

### Requirement: Compiled inputs and absence of tests

The system SHALL compile the shield definitions, keymap and conf from the `config` folder (`config/boards/shields/dactyl/`, `config/dactyl.keymap`, `config/dactyl.conf`; `inferido del código` via `config/west.yml:11`). The repository MUST have no tests; the only check is the workflow run itself (`.github/workflows/build.yml:1-6`).

#### Scenario: Only CI compile validates
- GIVEN a change is pushed
- WHEN the workflow completes
- THEN the system SHALL report green or red status as the sole validation, with the build on `2bdfcf7` recorded green (`docs/05-build-log.md:15`)
