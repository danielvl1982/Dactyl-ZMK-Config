# Configuration

This repository has no runtime configuration files in the application sense. Configuration lives in four places: the Kconfig fragment read by the ZMK firmware build (`config/dactyl.conf`), the west manifest and build matrix that choose what is compiled (`config/west.yml`, `build.yaml`), the shield definition (Kconfig and devicetree under `config/boards/shields/dactyl/`), and the `P` parameter objects of the two STL generators. Defaults that are not set in the repo come from ZMK/Zephyr upstream; they are written here as `inferred from code` because no file in the repo proves them.

Related processes: F9 (split roles and shield), F10 (deep sleep), F11 (battery reporting), F12 (CI build), F13 (settings reset), F15 (18650 holder generator), F16 (switch cap generator).

## 1. Keys

### 1.1 Firmware: `config/dactyl.conf`

One shared file applied to both halves (`config/dactyl.conf:1`). Values are Kconfig symbols resolved at build time by the ZMK build.

| Key | Type | Value in repo | Default if unset | Where set | Effect |
|---|---|---|---|---|---|
| `CONFIG_ZMK_SLEEP` | bool | `y` | `n` (inferred from code) | `config/dactyl.conf:5` | Enables deep sleep after idle. Any key press wakes the half because `kscan0` is a `wakeup-source` (`config/dactyl.conf:4`, `config/boards/shields/dactyl/dactyl.dtsi:12`). F10. |
| `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT` | int, ms | `300000` (5 min) | `900000` (15 min) (inferred from code; the comment in the file states the default is 15) | `config/dactyl.conf:6` | Inactivity time before deep sleep. Changed from the 15 min default to 5 min; the change is in the working tree and not committed yet. F10. |
| `CONFIG_ZMK_BATTERY_REPORTING` | bool | `y` | inferred from code: depends on the board | `config/dactyl.conf:10` | Each half reports its own battery level. F11. |
| `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_FETCHING` | bool | `y` | `n` (inferred from code) | `config/dactyl.conf:11` | The central (left) fetches the peripheral's level over the split BLE link. F11. |
| `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_PROXY` | bool | `y` | `n` (inferred from code) | `config/dactyl.conf:12` | The central proxies both levels to the host. F11. |
| `CONFIG_BT_GATT_ENFORCE_SUBSCRIPTION` | bool | `n` | `y` (inferred from code) | `config/dactyl.conf:15` | Windows workaround: without it the battery level may not show in Settings (comment at `config/dactyl.conf:14`). F11. |

### 1.2 Shield Kconfig (`config/boards/shields/dactyl/`)

| Key | Type | Value | Where | Effect |
|---|---|---|---|---|
| `SHIELD_DACTYL_LEFT` | bool | `$(shields_list_contains,dactyl_left)` | `config/boards/shields/dactyl/Kconfig.shield:1-2` | True when the build includes the `dactyl_left` shield. |
| `SHIELD_DACTYL_RIGHT` | bool | `$(shields_list_contains,dactyl_right)` | `config/boards/shields/dactyl/Kconfig.shield:4-5` | True when the build includes the `dactyl_right` shield. |
| `ZMK_KEYBOARD_NAME` | string | `"Dactyl 4x6"` (left only) | `config/boards/shields/dactyl/Kconfig.defconfig:3-4` | BLE advertised name. F9. |
| `ZMK_SPLIT_ROLE_CENTRAL` | bool | `y` (left only) | `config/boards/shields/dactyl/Kconfig.defconfig:6-7` | Left half is the central; the right half is therefore the peripheral. F9. |
| `ZMK_SPLIT` | bool | `y` (left or right) | `config/boards/shields/dactyl/Kconfig.defconfig:13-14` | Enables split support on both halves. F9. |

### 1.3 Shield devicetree properties

| Property | Value | Where | Effect |
|---|---|---|---|
| `kscan0` `compatible` | `zmk,kscan-gpio-matrix` | `config/boards/shields/dactyl/dactyl.dtsi:10` | GPIO matrix scanner. F8. |
| `diode-direction` | `col2row` | `config/boards/shields/dactyl/dactyl.dtsi:11` | Diode orientation of the PCB. |
| `wakeup-source` | present | `config/boards/shields/dactyl/dactyl.dtsi:12` | Lets key presses wake the MCU from deep sleep. F10. |
| `row-gpios` | `pro_micro` pins 21, 20, 19, 18, active high, pull-down | `config/boards/shields/dactyl/dactyl.dtsi:15-20` | Row pins, identical on both halves. |
| `col-gpios` (left) | `pro_micro` pins 2 to 7, active high | `config/boards/shields/dactyl/dactyl_left.overlay:14-21` | Column pins of the left half. |
| `col-gpios` (right) | `pro_micro` pins 2 to 7, active high | `config/boards/shields/dactyl/dactyl_right.overlay:27-34` | Same pinout as the left; the PCB is the mirror image. |
| `columns` / `rows` | `12` / `4` | `config/boards/shields/dactyl/dactyl.dtsi:34-35` | Size of the shared matrix transform. |
| `col-offset` (right only) | `6` | `config/boards/shields/dactyl/dactyl_right.overlay:39` | The right half owns columns 6 to 11. |
| `map` | `RC(r,c)` list, right half reversed | `config/boards/shields/dactyl/dactyl.dtsi:36-41` | Maps matrix positions to key positions 0 to 47. |

Shield metadata `config/boards/shields/dactyl/dactyl.zmk.yml:1-9`: `id: dactyl_4x6`, `type: shield`, `requires: [pro_micro]`, `exposes: []`, `features: [keys]`.

### 1.4 Build selection

| Key | Value | Where | Effect |
|---|---|---|---|
| `include[].board` | `nice_nano//zmk` (three entries) | `build.yaml:2,4,7` | Target board, using the new board-revision/variant syntax. |
| `include[].shield` | `dactyl_left`, `dactyl_right`, `settings_reset` | `build.yaml:3,5,8` | One `.uf2` per entry. `settings_reset` wipes bonds (F13), see `build.yaml:6`. |
| `manifest.remotes[0]` | `zmkfirmware`, `url-base: https://github.com/zmkfirmware` | `config/west.yml:2-4` | Source of the ZMK project. |
| `projects[0].revision` | `main` | `config/west.yml:8` | Unpinned ZMK branch. |
| `projects[0].import` | `app/west.yml` | `config/west.yml:9` | Pulls ZMK's own dependencies (Zephyr and modules). |
| `self.path` | `config` | `config/west.yml:10-11` | The repo's `config` folder is the manifest repo. |
| Reusable workflow ref | `zmkfirmware/zmk/.github/workflows/build-user-config.yml@main` | `.github/workflows/build.yml:6` | Unpinned CI build logic. |
| Triggers | `push`, `pull_request`, `workflow_dispatch` | `.github/workflows/build.yml:2` | When the build runs. F12. |

### 1.5 Generator parameters: `hardware/18650-holder/holder_18650_tight.mjs` (object `P`, lines 40-84)

All lengths in mm. Edit the value and re-run `npm run build` (`hardware/18650-holder/package.json:7`). "Read at" gives the first line where `P.<name>` is consumed.

| Parameter | Value | Read at | Effect |
|---|---|---|---|
| `cellD` | `18.5` | `holder_18650_tight.mjs:89` | NCR18650B cell diameter; bore = `cellD + clearance`. |
| `cellL` | `65.8` | `holder_18650_tight.mjs:98` | Cell length including the button top; feeds the inner span. |
| `clearance` | `0.4` | `holder_18650_tight.mjs:89` | Diameter clearance of the bore. |
| `wall` | `2.0` | `holder_18650_tight.mjs:90` | Cradle wall thickness. |
| `rimAboveAxis` | `0` | `holder_18650_tight.mjs:147` | Cradle rim height above the cell axis (0 is a half cradle). |
| `floorThick` | `1.3` | `holder_18650_tight.mjs:91` | Material under the cell at the flat base. |
| `endNegThick` | `2.0` | `holder_18650_tight.mjs:99` | Negative (spring) end wall thickness. |
| `endPosThick` | `2.0` | `holder_18650_tight.mjs:99` | Positive (dome) end wall thickness. |
| `endWallAboveAxis` | `0` | `holder_18650_tight.mjs:92` | End wall height above the axis; only used when `roundEnds` is false. |
| `negPlate` | `9.0` | `holder_18650_tight.mjs:101` | Spring terminal plate size. |
| `posPlate` | `10.0` | `holder_18650_tight.mjs:102` | Dome terminal plate size. |
| `seatClearance` | `0.4` | `holder_18650_tight.mjs:101-102` | Total clearance of the seat around the plate. |
| `seatDepth` | `1.0` | `holder_18650_tight.mjs:95` | How deep the plate sits in the end wall. |
| `roundEnds` | `true` | `holder_18650_tight.mjs:92` | End walls stay full discs; the flat ears snapped under terminal pressure (comment at `holder_18650_tight.mjs:61-63`). |
| `channelDepth` | `1.5` | `holder_18650_tight.mjs:136` | Round ends: depth of the tab channel above the plate. |
| `earAbovePlate` | `2` | `holder_18650_tight.mjs:174` | Retaining ear height above the plate top edge; only used when `roundEnds` is false. |
| `earSide` | `1.2` | `holder_18650_tight.mjs:104` | Ear material either side of the tab slot. |
| `tabGroove` | `0.6` | `holder_18650_tight.mjs:142` | Depth of the groove the folded-back tab lies in. |
| `earChamfer` | `0.6` | `holder_18650_tight.mjs:178` | Chamfer on the ear top edges (0 is sharp). |
| `wireSlotW` | `5.0` | `holder_18650_tight.mjs:144` | Width of the wire slot through each ear (0 is none). |
| `wireSlotDepth` | `4.0` | `holder_18650_tight.mjs:147` | Wire slot depth below the ear top; round ends cut down to the cradle rim instead. |
| `tabW` | `4.0` | `holder_18650_tight.mjs:103` | Solder tab width. |
| `tabClearance` | `0.4` | `holder_18650_tight.mjs:103` | Clearance added to the tab slot width. |
| `tabLen` | `4.0` | not read | Defined at `holder_18650_tight.mjs:76` and never used; see section 6. |
| `plateThick` | `0.4` | `holder_18650_tight.mjs:95` | Terminal plate thickness. |
| `springInstalledH` | `3.5` | `holder_18650_tight.mjs:96` | Spring height above its plate with the cell fitted; sets the inner span and the overall length. |
| `domeProtrusion` | `1.5` | `holder_18650_tight.mjs:97` | Positive dome height above its plate. |
| `segments` | `200` | `holder_18650_tight.mjs:115` | Circle facet count of the cylinders. |
| `outBase` | `'holder_18650_tight'` | `holder_18650_tight.mjs:261` | Output base name; writes `<outBase>.stl` and `<outBase>_mirrored.stl` (`holder_18650_tight.mjs:261-262`). |

Command line: the optional first argument is the output directory, default is the script's own directory (`holder_18650_tight.mjs:257-259`). Dependency `manifold-3d ^3.5.4` (`hardware/18650-holder/package.json:11`). F15.

### 1.6 Generator parameters: `hardware/switch-button/switch_cap.mjs` (object `P`, lines 40-61)

| Parameter | Value | Read at | Effect |
|---|---|---|---|
| `switchW` | `7.0` | `switch_cap.mjs:66` | Square head across flats; marked MEASURE in the source. |
| `socketClearance` | `0.3` | `switch_cap.mjs:66` | Total play of the socket; smaller is tighter. |
| `socketCornerR` | `1.5` | `switch_cap.mjs:67` | Rounded socket corner radius (self-centring). |
| `socketDepth` | `4.0` | `switch_cap.mjs:72` | How deep the head sits inside the cap. |
| `leadIn` | `0.6` | `switch_cap.mjs:112` | Relieved step at the mouth of the socket. |
| `leadInPlay` | `0.8` | `switch_cap.mjs:114` | How much wider that step is, across. |
| `capD` | `11.2` | `switch_cap.mjs:70` | Base outer diameter; must clear the socket diagonal. |
| `capH` | `16.0` | `switch_cap.mjs:72` | Total height, i.e. how far the button stands out of the case; marked MEASURE. |
| `holeD` | `6.1` | `switch_cap.mjs:73` | TRRS jack hole diameter measured in `pro_micro_adapter.stl`. |
| `stemClearance` | `0.3` | `switch_cap.mjs:73` | Total play of the stem in the hole (stem diameter = `holeD - stemClearance`). |
| `stemH` | `8.0` | `switch_cap.mjs:75` | Straight stem height. |
| `segments` | `96` | `switch_cap.mjs:85` | Circle facet count. |
| `outBase` | `'switch_cap'` | `switch_cap.mjs:186` | Output base name; writes `<outBase>.stl`. |

Command line: the optional first argument is the output directory, default is the script's own directory (`switch_cap.mjs:182-184`). Dependency `manifold-3d ^3.5.4` (`hardware/switch-button/package.json:11`). F16.

## 2. Hot reload

Nothing reloads without a rebuild.

- Firmware keys (sections 1.1 to 1.3) are Kconfig and devicetree values compiled into the `.uf2`. Changing one means a new CI build and reflashing both halves.
- West and build matrix files (`config/west.yml`, `build.yaml`) are read by each CI run only.
- The `P` objects are constants in the scripts; the model is regenerated by re-running the script.

## 3. Additional configuration files

| File | Purpose |
|---|---|
| `config/dactyl.keymap` | Keymap (devicetree). Documented in `docs/03-keymap.md`, not covered by this section. |
| `config/boards/shields/dactyl/dactyl.zmk.yml` | Shield metadata, see 1.3. |
| `hardware/18650-holder/package.json`, `hardware/switch-button/package.json` | npm manifests with the single `build` script (`package.json:7`) and the `manifold-3d` dependency. |
| `.gitignore` | Excludes `build/`, `*.uf2`, `.west/`, `modules/`, `zephyr/`, `zmk/`, `node_modules/` (`.gitignore:1-12`). |

Precedence: `config/dactyl.conf` overrides the Kconfig defaults of ZMK and Zephyr. The shield `Kconfig.defconfig` only changes defaults, so a same-named key in `dactyl.conf` would win (inferred from code, standard Kconfig behavior).

## 4. Environments

There is a single environment: the GitHub Actions build (`.github/workflows/build.yml:1-6`) running for every push, pull request and manual dispatch. There are no per-environment files or variables. The only variants are the three build targets of `build.yaml:2-8`; `dactyl_left` and `dactyl_right` share `config/dactyl.conf`, while `settings_reset` is a separate shield with no repo-defined options.

## 5. Test configuration

`No aplica (no test suite or test configuration in the repo)`.

## 6. Inconsistencies

- `P.tabLen` is defined and never read in `hardware/18650-holder/holder_18650_tight.mjs:76`.
- `west.yml` and the CI workflow track `main` of ZMK (`config/west.yml:8`, `.github/workflows/build.yml:6`), so every build can change without a commit in this repo.
- The catalog entry for F10 still says the idle timeout is "default 15 min, not set in repo" while `config/dactyl.conf:6` now sets it to 300000.
- Defaults of ZMK/Zephyr keys (`CONFIG_ZMK_SLEEP`, `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT`, `CONFIG_ZMK_BATTERY_REPORTING`, `CONFIG_BT_GATT_ENFORCE_SUBSCRIPTION`) are not provable from this repo.
- The header comment of `holder_18650_tight.mjs` (lines 8-26) describes the earlier flush-wall geometry while `roundEnds: true` is now the default; only the `P` object is authoritative.
