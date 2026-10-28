# F16 - Switch cap generator (7x7x14 mm push switch, TRRS hole)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

A Node script that generates the 3D-printable STL of a cap ("capuchon") for the 7x7x14 mm push switch of the Dactyl 4x6 case. The cap plugs onto the square switch head inside the case and its stem slides through the TRRS jack hole of `pro_micro_adapter.stl`, so the button can be pressed with the case closed (`hardware/switch-button/switch_cap.mjs:1-3`, `hardware/switch-button/switch_cap.mjs:55`). The maintainer edits the parameters, runs the script and prints the resulting STL. It has no relation to the firmware; it is a sibling of [F15](generador-soporte-18650.md).

## Trigger / Entry point

- CLI: `npm run build` in `hardware/switch-button` runs `node switch_cap.mjs` (`hardware/switch-button/package.json:7-8`).
- CLI: `node switch_cap.mjs [output-dir]`; the optional first argument is the output directory (`hardware/switch-button/switch_cap.mjs:182-184`). Note that `npm run build` cannot pass the argument without `npm run build -- <dir>` (`inferido del código`: standard npm behavior).
- Prerequisite: `npm install` for `manifold-3d` (`hardware/switch-button/package.json:10-12`, `hardware/switch-button/switch_cap.mjs:6`, `hardware/switch-button/switch_cap.mjs:32`).

## Inputs (payload/config)

There is no config file or environment variable. Inputs are the constants of object `P`, edited in the source (`hardware/switch-button/switch_cap.mjs:40-61`). No value is validated on entry; only the derived-geometry checks below run.

- `switchW` 7.0 mm: square head across flats, marked `MEASURE` (`hardware/switch-button/switch_cap.mjs:42`).
- `socketClearance` 0.3 mm total play (`hardware/switch-button/switch_cap.mjs:43`), `socketCornerR` 1.5 mm (`hardware/switch-button/switch_cap.mjs:44`), `socketDepth` 4.0 mm (`hardware/switch-button/switch_cap.mjs:45`).
- `leadIn` 0.6 mm and `leadInPlay` 0.8 mm: relieved step at the socket mouth (`hardware/switch-button/switch_cap.mjs:46-47`).
- `capD` 11.2 mm base diameter and `capH` 16.0 mm total height, the latter marked `MEASURE` (`hardware/switch-button/switch_cap.mjs:51-52`).
- `holeD` 6.1 mm, marked `MEASURED: TRRS jack hole in pro_micro_adapter.stl` (`hardware/switch-button/switch_cap.mjs:55`), `stemClearance` 0.3 mm total, `stemH` 8.0 mm (`hardware/switch-button/switch_cap.mjs:56-57`).
- `segments` 96 (cylinder facets) and `outBase` `switch_cap` (output file name without extension) (`hardware/switch-button/switch_cap.mjs:59-60`).
- CLI argument 1: output directory, resolved with `path.resolve`; default is the script's own directory (`hardware/switch-button/switch_cap.mjs:182-184`).

## Steps

1. Derive the geometry from `P` (`hardware/switch-button/switch_cap.mjs:66-76`).
   1. `socket = switchW + socketClearance` (7.3 mm with defaults) and `cornerR = min(socketCornerR, socket/2 - 0.1)` (`hardware/switch-button/switch_cap.mjs:66-67`).
   2. Socket diagonal to the rounded corner, `sqrt2 * (apothem - cornerR) + cornerR`, then wall at the flats and at the corners (`hardware/switch-button/switch_cap.mjs:68-71`).
   3. `stemD = holeD - stemClearance` (5.8 mm), `flareH = (capD - stemD) / 2` (45 degree flare), `baseZ = stemH + flareH` (`hardware/switch-button/switch_cap.mjs:73-75`).
2. Load the `manifold-3d` WASM module and call `setup()` (`hardware/switch-button/switch_cap.mjs:80-82`).
3. Build the solid in print orientation, stem on the bed (`hardware/switch-button/switch_cap.mjs:102-104`): a cylinder `stemD` wide and `stemH + EPS` tall, plus a conical flare from `stemD` to `capD`, plus a full-width cylinder up to `capH`. Helpers: `cyl` (`hardware/switch-button/switch_cap.mjs:84-85`).
4. Subtract the socket: a rounded square pocket `socketDepth` deep from the top face, built by `roundedSquare` (`hardware/switch-button/switch_cap.mjs:88-96`, `hardware/switch-button/switch_cap.mjs:107-108`).
5. If `leadIn > 0`, subtract a wider rounded-square step of height `leadIn` at the mouth (`hardware/switch-button/switch_cap.mjs:112-116`).
6. Print the report: manifold status, bounding-box size, volume and estimated PLA mass (volume * 0.00124 g/mm3), and the main dimensions (`hardware/switch-button/switch_cap.mjs:121-133`).
7. Run the fit checks and print `FIT PROBLEMS` plus one line per problem, or `fit           : ok` (`hardware/switch-button/switch_cap.mjs:135-150`).
8. Write the STL regardless of the fit result (`hardware/switch-button/switch_cap.mjs:186-187`). `writeBinarySTL` computes one face normal per triangle from its vertices and writes the 80-byte header `switch cap - generated`, the triangle count and 50 bytes per triangle (`hardware/switch-button/switch_cap.mjs:155-180`).

## Exit points

| Salida | Detalle |
|---|---|
| `hardware/switch-button/switch_cap.stl` (or `<output-dir>/switch_cap.stl`) | Binary STL written with `fs.writeFileSync`, overwriting any existing file; the file is tracked in git (`hardware/switch-button/switch_cap.mjs:178`, `hardware/switch-button/switch_cap.mjs:186-187`) |
| stdout | Geometry report, `FIT PROBLEMS` list or `fit           : ok`, and `wrote <path> (<n> tris)` (`hardware/switch-button/switch_cap.mjs:124-150`, `hardware/switch-button/switch_cap.mjs:187`) |

The process exit code is not set by the script, so it is 0 on a normal finish even when fit problems were printed (`inferido del código`: no `process.exit` or `process.exitCode` in the file).

## Business rules

- The socket is `switchW + socketClearance` wide, with corner radius capped at `socket/2 - 0.1` (`hardware/switch-button/switch_cap.mjs:66-67`).
- The cap diameter must clear the socket diagonal: the corner wall must be at least 0.8 mm, otherwise the problem suggests `capD >= (diagonal + 0.8) * 2` (`hardware/switch-button/switch_cap.mjs:136-138`). With defaults the corner wall is about 1.06 mm and the flat wall 1.95 mm (computed from `hardware/switch-button/switch_cap.mjs:70-71`).
- The stem is `holeD - stemClearance` wide, i.e. 0.15 mm per side of play in the case hole (`hardware/switch-button/switch_cap.mjs:56`, `hardware/switch-button/switch_cap.mjs:73`).
- The flare is 45 degrees so the part prints without supports; the part is printed closed top on the bed with the socket opening up (`hardware/switch-button/switch_cap.mjs:5`, `hardware/switch-button/switch_cap.mjs:74`).
- The flare must end at least 0.6 mm below the socket floor: `baseZ <= socketFloorZ - 0.6` (`hardware/switch-button/switch_cap.mjs:139-141`).
- The solid top above the socket must be at least 1.2 mm (`topThick = capH - socketDepth`) (`hardware/switch-button/switch_cap.mjs:72`, `hardware/switch-button/switch_cap.mjs:142`).
- The socket depth must be at least 40 percent of `switchW`, otherwise the cap "will rock" (`hardware/switch-button/switch_cap.mjs:143`).
- The lead-in must be shallower than the socket (`hardware/switch-button/switch_cap.mjs:144`).
- With the default parameters all five checks pass (computed from `hardware/switch-button/switch_cap.mjs:40-76`).

## Errors and edge cases

- Fit problems are only printed; the STL is still generated and overwrites the previous one (`hardware/switch-button/switch_cap.mjs:145-150`, `hardware/switch-button/switch_cap.mjs:186-187`). See fragment `fit-checks-do-not-block`.
- The lead-in step is wider than the socket but its corner wall is not checked. With defaults the step is 8.1 mm square with radius 1.9 mm, so its corner wall is about 0.66 mm, below the 0.8 mm threshold used for the socket (computed from `hardware/switch-button/switch_cap.mjs:112-115`, `hardware/switch-button/switch_cap.mjs:136`). See fragment `lead-in-wall-unchecked`.
- If `manifold-3d` is not installed, the top-level `import` fails before anything is written (`hardware/switch-button/switch_cap.mjs:32`; `inferido del código`: standard ESM behavior).
- A missing output directory is not created: `fs.writeFileSync` throws `ENOENT` (`hardware/switch-button/switch_cap.mjs:178`, `inferido del código`).
- Non-manifold or empty results are reported through `part.status()` but do not stop the export (`hardware/switch-button/switch_cap.mjs:124`).
- `EPS` is 1.0 mm, used as overlap so subtractions cut cleanly through faces (`hardware/switch-button/switch_cap.mjs:78`, `hardware/switch-button/switch_cap.mjs:102`, `hardware/switch-button/switch_cap.mjs:108`).
- `P.socketDepth` and `P.leadIn` values of 0 or negative are accepted without error (`hardware/switch-button/switch_cap.mjs:112`, `hardware/switch-button/switch_cap.mjs:143-144`, `inferido del código`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Switch or socket dimensions (head width, play, depth, corner radius) | `hardware/switch-button/switch_cap.mjs` → constant `P` (`hardware/switch-button/switch_cap.mjs:40-47`) |
| Cap height or diameter | `P.capD`, `P.capH` (`hardware/switch-button/switch_cap.mjs:51-52`) |
| Stem and case hole (TRRS hole size, play, length) | `P.holeD`, `P.stemClearance`, `P.stemH` (`hardware/switch-button/switch_cap.mjs:55-57`) |
| Derived geometry or wall formulas | derived constants (`hardware/switch-button/switch_cap.mjs:66-76`) |
| Shape of the solid (stem, flare, base, socket, lead-in) | `part` construction (`hardware/switch-button/switch_cap.mjs:102-116`), helpers `cyl` and `roundedSquare` (`hardware/switch-button/switch_cap.mjs:84-96`) |
| Fit validation rules or making them block the export | `problems` checks (`hardware/switch-button/switch_cap.mjs:135-150`) |
| Report content or PLA density | report block (`hardware/switch-button/switch_cap.mjs:124-133`) |
| STL format or header | `writeBinarySTL` (`hardware/switch-button/switch_cap.mjs:155-180`); a copy lives in `hardware/18650-holder/holder_18650_tight.mjs:230` (see [F15](generador-soporte-18650.md)) |
| Output path, file name, CLI arguments | `outDir`, `out`, `P.outBase` (`hardware/switch-button/switch_cap.mjs:182-187`, `hardware/switch-button/switch_cap.mjs:60`); npm script (`hardware/switch-button/package.json:7-8`) |
| Dependency version | `hardware/switch-button/package.json:10-12` |

## Existing tests

Ninguno conocido. CodeGraph reports no covering tests for `writeBinarySTL`; the package has no test script (`hardware/switch-button/package.json:7-9`).

## Coverage / Gaps

- No tests: geometry, fit checks and STL writer are unverified except by running the script and inspecting the STL by eye.
- Fit checks do not stop the export, and the exit code stays 0 (fragment `fit-checks-do-not-block`).
- Lead-in corner wall is not checked (fragment `lead-in-wall-unchecked`).
- `holeD` 6.1 mm depends on an STL not generated here, `hardware/third-party/dactyl-4x6-trackball/pro_micro_adapter.stl` (fragment `hole-diameter-source`).
- `writeBinarySTL` is duplicated between this script and the 18650 holder generator (fragment `duplicated-stl-writer`).
- The committed `switch_cap.stl` can drift from `P` because nothing checks that it matches the source (fragment `committed-stl-drift`).
- The header comment says `npm install manifold-3d` while `package.json` pins `^3.5.4` and a lockfile exists (`hardware/switch-button/switch_cap.mjs:6`, `hardware/switch-button/package.json:11`).
