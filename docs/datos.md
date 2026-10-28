# Data and persistent state

This repository has no database, no SQL and no ORM. "Data" here means persistent or generated state: ZMK settings flash (BLE bonds and profiles), volatile runtime state (layer, battery level), and the STL files produced by the hardware generators. Feature ids (F1-F16) are those used in `docs/features/`. Narrative context lives in `docs/01-hardware.md` to `docs/05-build-log.md`; where they disagree with code, code wins.

Evidence notes: CodeGraph indexes only `hardware/*.mjs`. Keymap, conf, devicetree, Kconfig and workflow files were read directly (line numbers from the file read). The ZMK upstream behavior (what lands in flash) is not in this repo, so those claims are marked `inferred from code`.

## 1. Stores

| Store | Kind | Owner | Connection / key | Evidence |
|---|---|---|---|---|
| Settings flash partition of each half (BLE bonds, active profile) | Flash (nice!nano) | Third party (ZMK / Zephyr settings subsystem); this repo only selects/clears via keymap and wipes via firmware | No connection key. Written through `&bt BT_SEL 0..2` and `&bt BT_CLR` | `config/dactyl.keymap:71` (F7), `build.yaml:6-8` (F13) |
| Active layer state | RAM, volatile | ZMK keymap engine | `&mo LAYER_*` momentary; lost at reset or deep sleep | `config/dactyl.keymap:44,48,50` (F2) |
| Battery level | RAM, volatile, derived from ADC | ZMK battery reporting; nice!nano board definition provides the voltage divider | `CONFIG_ZMK_BATTERY_REPORTING` | `config/dactyl.conf:10` (F11); `docs/01-hardware.md:35-37` |
| Device firmware flash (nice!nano) | Flash | This repo (build output) | `.uf2` copied to the bootloader drive | `build.yaml:1-8`, `.github/workflows/build.yml:6` (F12, F14) |
| Generated STL files | Files in git | This repo (generators in `hardware/`) | Output dir argument or script directory | `hardware/18650-holder/holder_18650_tight.mjs:257-259`, `hardware/switch-button/switch_cap.mjs:182-184` (F15, F16) |
| Third-party STLs | Files in git | Third party, read-only | n/a | `hardware/third-party/README.md` (not a catalogued process) |

Settings flash is not written by any file in this repo directly. That the bond and profile state persists across power cycles is `inferred from code` (the keymap invokes `&bt` behaviors; persistence is ZMK default behavior, with no `CONFIG_SETTINGS` override in `config/dactyl.conf:1-15`). See item 5 in `docs/preguntas-abiertas.md`.

## 2. Tables / collections

No applicable tables. `No aplica (there is no relational or document database)`. The closest equivalents are the persistent records below.

### 2.1 BLE profile and bond records (inferred)

| Field | Type | Written by | Evidence |
|---|---|---|---|
| Active profile index | integer 0..2 | `&bt BT_SEL 0`, `BT_SEL 1`, `BT_SEL 2` | `config/dactyl.keymap:71` |
| Bond (key material) for the selected profile | opaque, ZMK/Zephyr | pairing from host; deleted by `&bt BT_CLR` | `config/dactyl.keymap:71` |
| All stored settings of the half | flash partition | wiped by flashing `settings_reset` | `build.yaml:6-8` |

Column types and layout are defined by ZMK upstream, not in this repo (`inferred from code`). Others who write the same store: the BLE host during pairing; ZMK itself for other settings. The repo's `docs/03-keymap.md:140-141` states `BT CLR` clears the bond of the selected profile and acts on the central; this matches the keymap binding but the central-only effect is not provable from this repo.

### 2.2 Generated file records

| File | Format | Writer | Evidence |
|---|---|---|---|
| `hardware/18650-holder/holder_18650_tight.stl` | binary STL, 80-byte header `18650 holder - generated` | `holder_18650_tight.mjs` | `holder_18650_tight.mjs:230-255,264` |
| `hardware/18650-holder/holder_18650_tight_mirrored.stl` | binary STL, mirror on X then translated by `L` | same | `holder_18650_tight.mjs:265` |
| `hardware/switch-button/switch_cap.stl` | binary STL, header `switch cap - generated` | `switch_cap.mjs` | `switch_cap.mjs:155-187` |

All three are tracked in git (verified: `git ls-files`). Sizes at the time of reading: 92884 bytes (each holder STL), 155784 bytes (cap STL).

## 3. Read/write matrix by operation

Columns are the stores of section 1. `R` read, `W` write, `D` delete, `-` none.

| Feature | Settings flash | Layer state (RAM) | Battery (RAM) | Firmware flash | STL files | Evidence |
|---|---|---|---|---|---|---|
| F1 base layer | - | R (layer 0 default) | - | - | - | `config/dactyl.keymap:41` |
| F2 layer switching | - | W while key held | - | - | - | `config/dactyl.keymap:44,48,50` |
| F3 NUM layer | - | R | - | - | - | `config/dactyl.keymap:54` |
| F4 NAV layer | - | R | - | - | - | `config/dactyl.keymap:64` |
| F5 SYM layer | - | R | - | - | - | `config/dactyl.keymap:77` |
| F6 dead-key macros | - | R | - | - | - | `config/dactyl.keymap:25,31` |
| F7 BT profiles | W (select), D (clear bond) | - | - | - | - | `config/dactyl.keymap:71` |
| F8 matrix scan | - | - | - | - | - | `config/boards/shields/dactyl/dactyl.dtsi:9` |
| F9 split roles | - | - | - | - | - | `config/boards/shields/dactyl/Kconfig.defconfig:1` |
| F10 deep sleep | - | lost on sleep (inferred) | - | - | - | `config/dactyl.conf:5-6`, `config/boards/shields/dactyl/dactyl.dtsi:12` |
| F11 battery report | - | - | R (both halves), W to GATT | - | - | `config/dactyl.conf:10-12` |
| F12 CI build | - | - | - | W artifacts (`.uf2`) | - | `build.yaml:1-8`, `.github/workflows/build.yml:6` |
| F13 settings reset | D (whole partition) | - | - | W (flashes reset image) | - | `build.yaml:6-8` |
| F14 flash and pair | W (new bonds on pairing, inferred) | - | - | W (`.uf2` copy) | - | `README.md:64` |
| F15 holder generator | - | - | - | - | W (2 files) | `hardware/18650-holder/holder_18650_tight.mjs:264-265` |
| F16 cap generator | - | - | - | - | W (1 file) | `hardware/switch-button/switch_cap.mjs:187` |

F1 to F6 only read `.keymap` data compiled into firmware (static, read-only at runtime). They produce HID reports, not persistent writes. Layer state is not persisted (momentary layers only: `config/dactyl.keymap:44,48,50`).

## 4. State semantics

| State | Values | Who sets it | Transitions | Evidence |
|---|---|---|---|---|
| Active layer | `0` base, `LAYER_NUM`=1, `LAYER_NAV`=2, `LAYER_SYM`=3 | `&mo LAYER_SYM` (last key of row 1, `config/dactyl.keymap:44`), `&mo LAYER_NAV` (last key of row 3, `config/dactyl.keymap:48`), `&mo LAYER_NUM` (FN, third key of the right half in the bottom row, `config/dactyl.keymap:50`); the board has no thumb cluster | Layer is active only while the key is held; release returns to the layer below. No toggle or sticky layer exists | `config/dactyl.keymap:15-17,44,48,50` |
| Active BLE profile | 0, 1, 2 | `&bt BT_SEL n` (NAV layer) | Any to any on key press; `BT_CLR` deletes the bond of the current profile, profile stays selected (inferred) | `config/dactyl.keymap:71` |
| Split role | central (left), peripheral (right) | Kconfig defaults | Fixed at build time | `config/boards/shields/dactyl/Kconfig.defconfig:1-7` |
| Power | active, deep sleep | idle timer; key press wakes (`wakeup-source` on kscan0) | Active to sleep after `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT` = 300000 ms (5 min); sleep to active on any key | `config/dactyl.conf:5-6`, `config/boards/shields/dactyl/dactyl.dtsi:12` |
| Battery reporting | enabled / disabled flags | Kconfig | Build time | `config/dactyl.conf:10-12,15` |

Windows workaround flag: `CONFIG_BT_GATT_ENFORCE_SUBSCRIPTION=n` disables subscription enforcement so the battery level can appear in Windows Settings (`config/dactyl.conf:14-15`).

## 5. Formulas and calculations

### 5.1 Matrix position (F8)

Keymap position 0..47 is reading order over 4 rows by 12 columns; the left half owns columns 0-5 and the right half 6-11 through `col-offset = <6>` (`config/boards/shields/dactyl/dactyl_right.overlay:16-18`). The right half is listed in reverse (`RC(r,11)` first) because both PCBs count columns outside to center (`config/boards/shields/dactyl/dactyl.dtsi:27-28,37-40`).

Worked example: first key of the right half on row 0 is keymap position 6, mapped to `RC(0,11)`; the right overlay offsets local column 5 by 6 to reach column 11 (`dactyl.dtsi:37`, `dactyl_right.overlay:17`). The transform maps 48 positions (4 x 12), see item 1 of the resolved list in `docs/preguntas-abiertas.md`.

### 5.2 18650 holder geometry (F15)

Derived values at `hardware/18650-holder/holder_18650_tight.mjs:89-105`:

- `boreR = (cellD + clearance) / 2`, `outerR = boreR + wall`, `baseZ = -(boreR + floorThick)`
- `plateBack = seatDepth - plateThick`, `negGap = springInstalledH - plateBack`, `posGap = domeProtrusion - plateBack`
- `innerSpan = cellL + negGap + posGap`, `L = endNegThick + innerSpan + endPosThick`

Worked example with the committed parameters (`holder_18650_tight.mjs:40-84`):

- `boreR = (18.5 + 0.4) / 2 = 9.45`, `outerR = 9.45 + 2.0 = 11.45`, `baseZ = -(9.45 + 1.3) = -10.75`
- `plateBack = 1.0 - 0.4 = 0.6`, `negGap = 3.5 - 0.6 = 2.9`, `posGap = 1.5 - 0.6 = 0.9`
- `innerSpan = 65.8 + 2.9 + 0.9 = 69.6`, `L = 2.0 + 69.6 + 2.0 = 73.6`
- Height: the cradle rim is at the axis, so `0 - baseZ` = 10.75 mm (`holder_18650_tight.mjs:8,171`). With `roundEnds: true` the end discs are kept to `topZ = outerR` (`holder_18650_tight.mjs:92`), so the end discs reach `outerR - baseZ` = 11.45 + 10.75 = 22.2 mm. The header still states "overall 73.6 x 22.9 x 10.75" (`holder_18650_tight.mjs:8`). See item 36 in `docs/preguntas-abiertas.md`.

The mirrored STL is `part.mirror([1,0,0]).translate([L,0,0])`, so both files share the same bounding box in X (`holder_18650_tight.mjs:265`).

### 5.3 Switch cap geometry (F16)

Derived at `hardware/switch-button/switch_cap.mjs:66-76`:

- `socket = switchW + socketClearance`, `stemD = holeD - stemClearance`, `flareH = (capD - stemD) / 2`, `baseZ = stemH + flareH`, `socketFloorZ = capH - socketDepth`
- `socketDiagonal = SQRT2 * (socketApothem - cornerR) + cornerR`, `wallCorner = capD / 2 - socketDiagonal`

Worked example with the committed parameters (`switch_cap.mjs:40-61`):

- `socket = 7.0 + 0.3 = 7.3`, `stemD = 6.1 - 0.3 = 5.8`, `flareH = (11.2 - 5.8) / 2 = 2.7`, `baseZ = 8.0 + 2.7 = 10.7`, `socketFloorZ = 16.0 - 4.0 = 12.0`
- `socketDiagonal = 1.4142 * (3.65 - 1.5) + 1.5 = 4.54`, `wallCorner = 5.6 - 4.54 = 1.06`, `wallFlat = 5.6 - 3.65 = 1.95`
- `topThick = 16.0 - 4.0 = 12.0`

Fit checks that print a failure (not an exit code): corner wall below 0.8 mm, flare ending too near the socket floor, top thinner than 1.2 mm, socket depth under `0.4 * switchW`, lead-in as deep as the socket (`switch_cap.mjs:135-150`). Both generators exit 0 regardless of the report, so a failed fit check does not stop the STL from being written (`switch_cap.mjs:145-150,187`).

## 6. Generated data contracts

### 6.1 Binary STL (F15, F16)

Both generators use an identical `writeBinarySTL` (`holder_18650_tight.mjs:230-255`, `switch_cap.mjs:155-180`).

| Field | Bytes | Source |
|---|---|---|
| Header | 80 | ASCII text `18650 holder - generated` or `switch cap - generated`, rest zero |
| Triangle count | 4 (uint32 LE) | `triVerts.length / 3` of the manifold mesh |
| Per triangle | 50 | normal (3 float32), 3 vertices (9 float32), attribute (uint16 = 0) |

File size = `84 + triangles * 50`. The normal is recomputed from the vertices, not copied from the mesh (`holder_18650_tight.mjs:245-249`). The function is duplicated in both scripts (see item 30 in `docs/preguntas-abiertas.md`).

Output path: `[output-dir]/<outBase>.stl`; the output directory is `process.argv[2]` when given, otherwise the script directory (`holder_18650_tight.mjs:257-262`, `switch_cap.mjs:182-186`). `outBase` is `holder_18650_tight` or `switch_cap`. The generators overwrite existing files without warning.

Generation is deterministic as far as the code shows (no random, no timestamp in the header: `holder_18650_tight.mjs:237`); byte-identical regeneration is `inferred from code` and not tested.

### 6.2 Firmware artifacts (F12)

Output of the reusable ZMK workflow referenced at `.github/workflows/build.yml:6` for the matrix at `build.yaml:1-8`: one `.uf2` per entry (`dactyl_left`, `dactyl_right`, `settings_reset`, board `nice_nano//zmk`). The artifact names and fields are defined by the upstream workflow, not in this repo (`inferred from code`). `*.uf2` and `build/` are git-ignored (`.gitignore`).

### 6.3 HID reports (F1 to F6)

Keyboard and consumer HID reports are produced by ZMK from the keymap bindings (`config/dactyl.keymap:41-88`); the byte layout is upstream. Consumer usages used: `C_VOL_DN`, `C_VOL_UP`, `C_MUTE`, `C_PREV`, `C_NEXT`, `C_PP` (`config/dactyl.keymap:71,73`).

### 6.4 BLE GATT battery data (F11)

The central proxies its own and the peripheral's level to the host (`config/dactyl.conf:10-12`). Characteristic structure is defined upstream (`inferred from code`).

## 7. Schema differences

`No aplica (there is no production DDL, no test schema and no database)`. The equivalent comparison is between generated artifacts and the documented parameters, recorded as items in `docs/preguntas-abiertas.md`:

- The committed STLs cannot be proven to match the committed `.mjs` parameters without regenerating them; the holder header comment (`holder_18650_tight.mjs:8-12`) describes flush end walls while `roundEnds: true` (`holder_18650_tight.mjs:61`) keeps full discs.
- The 5 min idle timeout (`CONFIG_ZMK_IDLE_SLEEP_TIMEOUT=300000`, `config/dactyl.conf:6`) is committed in `8ac7234`; the ZMK default it replaces is 15 min (see item 2 of the resolved list in `docs/preguntas-abiertas.md`).
- `docs/01-hardware.md:7` and `docs/04-roadmap.md:63,81` mention a trackball; no persistent or generated data exists for it.

Cross-links: `docs/01-hardware.md` (holder), `docs/03-keymap.md` (layers, BT keys), `docs/04-roadmap.md` (settings reset, battery).
