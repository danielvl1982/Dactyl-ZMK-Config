# F15 - Parametric 18650 battery holder generator (STL and mirrored STL)

Ticket: sin ticket (no tickets in git log or docs)

## Purpose

Node CLI script that builds the 3D model of a 18650 (NCR18650B) battery holder for the Dactyl 4x6 case and writes it as binary STL, plus its mirror image for the other half (`hardware/18650-holder/holder_18650_tight.mjs:1-5`, `hardware/18650-holder/package.json:6`). The script is the source of truth for the two committed STL files (`docs/01-hardware.md:131-133`). It has no relation to the firmware; the sibling generator for the switch cap is [F16](generador-capuchon-pulsador.md).

## Trigger / Entry point

- `npm run build` in `hardware/18650-holder` runs `node holder_18650_tight.mjs` (`hardware/18650-holder/package.json:8`).
- Direct run `node holder_18650_tight.mjs [output-dir]` (`hardware/18650-holder/holder_18650_tight.mjs:5`). Top-level code, no exported function or `main`: every run executes the full pipeline (`hardware/18650-holder/holder_18650_tight.mjs:107-266`).
- Dependency `manifold-3d ^3.5.4`, loaded and initialised via `Module()` / `wasm.setup()` (`hardware/18650-holder/package.json:10-12`, `hardware/18650-holder/holder_18650_tight.mjs:32`, `hardware/18650-holder/holder_18650_tight.mjs:107-109`).

## Inputs (payload/config)

- `process.argv[2]` — optional output directory, resolved with `path.resolve`; default is the directory of the script (`hardware/18650-holder/holder_18650_tight.mjs:257-259`). Not validated or created: if the directory does not exist, `fs.writeFileSync` throws (`hardware/18650-holder/holder_18650_tight.mjs:253`), inferido del código.
- Object `P` is the only configuration; it is edited in the source, there are no CLI flags or env vars (`hardware/18650-holder/holder_18650_tight.mjs:40-84`). No value in `P` is validated.
  - Cell: `cellD` 18.5, `cellL` 65.8, `clearance` 0.4 (`hardware/18650-holder/holder_18650_tight.mjs:41-43`).
  - Cradle: `wall` 2.0, `rimAboveAxis` 0, `floorThick` 1.3 (`hardware/18650-holder/holder_18650_tight.mjs:45-46`).
  - End walls: `endNegThick` 2.0, `endPosThick` 2.0, `endWallAboveAxis` 0 (`hardware/18650-holder/holder_18650_tight.mjs:49-51`).
  - Terminal plates and seats: `negPlate` 9.0, `posPlate` 10.0, `seatClearance` 0.4, `seatDepth` 1.0 (`hardware/18650-holder/holder_18650_tight.mjs:56-59`).
  - End style: `roundEnds` true, `channelDepth` 1.5 (`hardware/18650-holder/holder_18650_tight.mjs:61-64`).
  - Flat-end ears, used only when `roundEnds` is false: `earAbovePlate`, `earSide`, `earChamfer` (`hardware/18650-holder/holder_18650_tight.mjs:66-69`).
  - Slots and tabs: `tabGroove` 0.6, `wireSlotW` 5.0, `wireSlotDepth` 4.0, `tabW` 4.0, `tabClearance` 0.4 (`hardware/18650-holder/holder_18650_tight.mjs:68-76`).
  - Terminals: `plateThick` 0.4, `springInstalledH` 3.5, `domeProtrusion` 1.5 (`hardware/18650-holder/holder_18650_tight.mjs:78-80`).
  - Output: `segments` 200, `outBase` `holder_18650_tight` (`hardware/18650-holder/holder_18650_tight.mjs:82-83`).
- `tabLen` is defined but never read (`hardware/18650-holder/holder_18650_tight.mjs:76`).

## Steps

1. Derive the geometry from `P` (`hardware/18650-holder/holder_18650_tight.mjs:89-105`).
   1. Bore radius = (`cellD` + `clearance`) / 2; outer radius = bore radius + `wall`; flat bottom plane `baseZ` = -(bore radius + `floorThick`) (`hardware/18650-holder/holder_18650_tight.mjs:89-91`).
   2. `topZ` = `outerR` when `roundEnds`, otherwise `endWallAboveAxis` (`hardware/18650-holder/holder_18650_tight.mjs:92`).
   3. Terminal protrusions: `plateBack` = `seatDepth` - `plateThick`; `negGap` = `springInstalledH` - `plateBack`; `posGap` = `domeProtrusion` - `plateBack` (`hardware/18650-holder/holder_18650_tight.mjs:95-97`).
   4. `innerSpan` = `cellL` + `negGap` + `posGap`; total length `L` = `endNegThick` + `innerSpan` + `endPosThick` (`hardware/18650-holder/holder_18650_tight.mjs:98-99`). With the default values this is 69.6 mm and 73.6 mm (derived by hand from the code, matches the header at `hardware/18650-holder/holder_18650_tight.mjs:8`).
   5. Seat sizes = plate + `seatClearance`; tab slot width = `tabW` + `tabClearance`; ear widths for the flat-end variant (`hardware/18650-holder/holder_18650_tight.mjs:101-105`).
2. Initialise the manifold WASM module (`hardware/18650-holder/holder_18650_tight.mjs:107-109`).
3. Build the solid (`hardware/18650-holder/holder_18650_tight.mjs:160-207`).
   1. Full cylinder along +X of length `L` (`cylX`, `hardware/18650-holder/holder_18650_tight.mjs:114-115`, `hardware/18650-holder/holder_18650_tight.mjs:160`).
   2. Cut everything below `baseZ` to make the flat base (`hardware/18650-holder/holder_18650_tight.mjs:163`).
   3. Only if `roundEnds` is false: trim both end walls down to `topZ` (`hardware/18650-holder/holder_18650_tight.mjs:166-169`).
   4. Cut the cradle sides between the end walls above `rimAboveAxis` (`hardware/18650-holder/holder_18650_tight.mjs:171`).
   5. Compute `earTopNeg` / `earTopPos`: `outerR` when `roundEnds`, else plate half-size + `earAbovePlate` (`hardware/18650-holder/holder_18650_tight.mjs:174-175`).
   6. Only if `roundEnds` is false and `earAbovePlate` > 0: add retaining ears and chamfer their long top edges (`hardware/18650-holder/holder_18650_tight.mjs:176-188`, `ear` at `hardware/18650-holder/holder_18650_tight.mjs:154-155`).
   7. Cut the main bore between the end walls (`hardware/18650-holder/holder_18650_tight.mjs:191`).
   8. Cut the half cradle again, same box as step 3.4 (`hardware/18650-holder/holder_18650_tight.mjs:194`).
   9. Cut the negative seat and the positive seat with `terminalSeat` (`hardware/18650-holder/holder_18650_tight.mjs:197-204`).
      1. Square seat pocket (`hardware/18650-holder/holder_18650_tight.mjs:131-132`).
      2. If `earTop` > 0: tab channel above the plate (`hardware/18650-holder/holder_18650_tight.mjs:134-138`), tab groove on the ear top (`hardware/18650-holder/holder_18650_tight.mjs:139-142`) and, if `wireSlotW` > 0, the wire slot through the wall (`hardware/18650-holder/holder_18650_tight.mjs:143-148`). With `roundEnds` the channel depth is `channelDepth` and the wire slot runs down to `rimAboveAxis`.
   10. Translate the part by `-baseZ` so it rests on z = 0 (`hardware/18650-holder/holder_18650_tight.mjs:207`).
4. Report to stdout: mesh status, volume and PLA weight (density 0.00124 g/mm3), bounding box, bore and outer diameter, inner span, end wall height, seats, ears (`hardware/18650-holder/holder_18650_tight.mjs:212-225`). The report never prints a failure: there are no checks that exit non-zero (no equivalent of the fit checks of [F16](generador-capuchon-pulsador.md)).
5. Write the main STL (`hardware/18650-holder/holder_18650_tight.mjs:261`, `hardware/18650-holder/holder_18650_tight.mjs:264`).
6. Mirror the solid across X, translate by `L` to keep it in the same range, and write the mirrored STL (`hardware/18650-holder/holder_18650_tight.mjs:262`, `hardware/18650-holder/holder_18650_tight.mjs:265-266`).

STL writer `writeBinarySTL`: 80-byte header text `18650 holder - generated`, triangle count, then per triangle a face normal recomputed from the vertices, 3 vertices as float32 and a 2-byte attribute (`hardware/18650-holder/holder_18650_tight.mjs:230-255`). The same function is duplicated in the F16 generator (`hardware/switch-button/switch_cap.mjs:155-179`).

## Exit points

| Salida | Detalle |
|---|---|
| `<output-dir>/holder_18650_tight.stl` | Binary STL write, overwrites the file (`hardware/18650-holder/holder_18650_tight.mjs:261`, `hardware/18650-holder/holder_18650_tight.mjs:264`) |
| `<output-dir>/holder_18650_tight_mirrored.stl` | Binary STL write of the X-mirrored part (`hardware/18650-holder/holder_18650_tight.mjs:262`, `hardware/18650-holder/holder_18650_tight.mjs:265-266`) |
| stdout | Report lines and two `wrote <path> (<n> tris)` lines (`hardware/18650-holder/holder_18650_tight.mjs:215-225`, `hardware/18650-holder/holder_18650_tight.mjs:264-266`) |

Default `<output-dir>` is `hardware/18650-holder/`, where the two STL files are committed.

## Business rules

- The holder is a half cradle: the cell drops in from above, the cradle stops at the cell axis (`rimAboveAxis` = 0) (`hardware/18650-holder/holder_18650_tight.mjs:46`, `hardware/18650-holder/holder_18650_tight.mjs:171`, `hardware/18650-holder/holder_18650_tight.mjs:194`).
- Round end discs are the current design (`roundEnds` = true): the end walls keep the full disc up to `outerR`, because the printed flush-trimmed ears snapped under terminal pressure (`hardware/18650-holder/holder_18650_tight.mjs:61-63`, `hardware/18650-holder/holder_18650_tight.mjs:92`, `hardware/18650-holder/holder_18650_tight.mjs:166`; commit `a7ec066` in the git log).
- Total length depends on the terminal heights: `springInstalledH` and `domeProtrusion` set the inner span (`hardware/18650-holder/holder_18650_tight.mjs:95-99`, header at `hardware/18650-holder/holder_18650_tight.mjs:28-30`).
- The negative end seats a 9 mm plate (spring terminal), the positive end a 10 mm plate (dome terminal) (`hardware/18650-holder/holder_18650_tight.mjs:56-57`, `hardware/18650-holder/holder_18650_tight.mjs:197-204`).
- The mirrored STL is the same part reflected in X, for the second half of the split keyboard (`hardware/18650-holder/holder_18650_tight.mjs:265`; purpose `docs/01-hardware.md:133`).
- Print guidance (flat base on the bed, no supports, 0.2 mm layers, 3 perimeters, brim) lives only in the header comment (`hardware/18650-holder/holder_18650_tight.mjs:4`).

## Errors and edge cases

- Output directory does not exist → `writeFileSync` throws and the run ends with a Node error; the first STL may not exist (`hardware/18650-holder/holder_18650_tight.mjs:253`, `hardware/18650-holder/holder_18650_tight.mjs:257-259`), inferido del código.
- Invalid or non-manifold geometry after a parameter change → only visible as the `status` line, the STL is still written (`hardware/18650-holder/holder_18650_tight.mjs:215`, `hardware/18650-holder/holder_18650_tight.mjs:264`).
- `roundEnds` false with `earAbovePlate` 0 → `earTop` is 0, so `terminalSeat` cuts only the square pocket: no tab channel, no groove, no wire slot (`hardware/18650-holder/holder_18650_tight.mjs:133`, `hardware/18650-holder/holder_18650_tight.mjs:174-175`), inferido del código.
- Seat depth: in `terminalSeat` the pocket extent into the wall is the constant `EPS` (1.0), not `seatDepth`; `seatDepth` only moves the box edge on the bore side (`hardware/18650-holder/holder_18650_tight.mjs:128-130`, `hardware/18650-holder/holder_18650_tight.mjs:111`). With the defaults both are 1.0 so the result is correct; changing `seatDepth` alone changes `innerSpan` but not the real pocket depth (inferido del código, see fragment).
- Existing STL files are overwritten without confirmation (`hardware/18650-holder/holder_18650_tight.mjs:253`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Cell size, wall, clearance, terminal dimensions, any default | `hardware/18650-holder/holder_18650_tight.mjs` → `P` (`hardware/18650-holder/holder_18650_tight.mjs:40`) |
| Overall length / terminal heights | `innerSpan` and `L` (`hardware/18650-holder/holder_18650_tight.mjs:98-99`) |
| Round versus trimmed end walls, wall height | `roundEnds`, `topZ` and the trim block (`hardware/18650-holder/holder_18650_tight.mjs:61`, `hardware/18650-holder/holder_18650_tight.mjs:92`, `hardware/18650-holder/holder_18650_tight.mjs:166-169`) |
| Terminal seat, tab channel, wire slot | `terminalSeat` (`hardware/18650-holder/holder_18650_tight.mjs:126`) and its two calls (`hardware/18650-holder/holder_18650_tight.mjs:197-204`) |
| Retaining ears (flat-end variant) | `ear` and the ear block (`hardware/18650-holder/holder_18650_tight.mjs:154`, `hardware/18650-holder/holder_18650_tight.mjs:176-188`) |
| Cradle, bore and base shape | Solid section (`hardware/18650-holder/holder_18650_tight.mjs:160-194`) |
| Mirrored output | Mirror step (`hardware/18650-holder/holder_18650_tight.mjs:265`) |
| Output names / folder | `outBase` and `outDir` (`hardware/18650-holder/holder_18650_tight.mjs:83`, `hardware/18650-holder/holder_18650_tight.mjs:257-262`) |
| STL encoding | `writeBinarySTL` (`hardware/18650-holder/holder_18650_tight.mjs:230`); the same function exists in `hardware/switch-button/switch_cap.mjs:155` and must be changed in both |
| Console report | Report block (`hardware/18650-holder/holder_18650_tight.mjs:212-225`) |
| Run command, dependency version | `hardware/18650-holder/package.json:7-12` |

## Existing tests

Ninguno conocido. No test files or test script exist (`hardware/18650-holder/package.json:7-9` only defines `build`).

## Coverage / Gaps

- No tests and no assertions on the result: the only check is a human reading the printed `status`, volume and size (`hardware/18650-holder/holder_18650_tight.mjs:212-225`).
- Header comment still describes the flush end walls design (`endWallAboveAxis = 0`, "overall 73.6 x 22.9 x 10.75", half-pocket for the plates) while `roundEnds` is true (`hardware/18650-holder/holder_18650_tight.mjs:8-26` vs `hardware/18650-holder/holder_18650_tight.mjs:61`). See fragments.
- `tabLen` is dead configuration (`hardware/18650-holder/holder_18650_tight.mjs:76`).
- `earAbovePlate`, `earSide`, `earChamfer` and the ear branches are dead code while `roundEnds` is true (`hardware/18650-holder/holder_18650_tight.mjs:66-69`, `hardware/18650-holder/holder_18650_tight.mjs:176-188`).
- The cradle side cut is executed twice with the same box (`hardware/18650-holder/holder_18650_tight.mjs:171`, `hardware/18650-holder/holder_18650_tight.mjs:194`).
- STL files are committed binaries; nothing checks that they match the current `P` (`docs/01-hardware.md:132-133`).
- Open questions: `docs/preguntas-abiertas.md` items 29-34 and 36-38.
