# generador-soporte-18650 Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). Node CLI script that builds the parametric 3D model of an 18650 battery holder for the Dactyl 4x6 case and writes it as binary STL plus an X-mirrored STL. Documentation: `docs/features/generador-soporte-18650.md`. Ticket: none.

## Requirements

### Requirement: Entry point and configuration

The system SHALL run the full pipeline on every execution of `node holder_18650_tight.mjs [output-dir]` or `npm run build`, as top-level code with no exported function (`hardware/18650-holder/holder_18650_tight.mjs:107-266`, `hardware/18650-holder/package.json:8`). All configuration MUST come from the object `P` edited in the source; there are no CLI flags or env vars and no value in `P` is validated (`hardware/18650-holder/holder_18650_tight.mjs:40-84`).

#### Scenario: Run with defaults
- GIVEN no argument is passed
- WHEN the script runs
- THEN the system SHALL use the script directory as output directory (`hardware/18650-holder/holder_18650_tight.mjs:257-259`)

#### Scenario: Unused configuration
- GIVEN `P.tabLen` is defined
- WHEN the script runs
- THEN the system SHALL NOT read `tabLen` (`hardware/18650-holder/holder_18650_tight.mjs:76`)

### Requirement: Geometry derivation

The system SHALL derive bore radius as (`cellD` + `clearance`) / 2, outer radius as bore radius + `wall`, `baseZ` as -(bore radius + `floorThick`), `innerSpan` as `cellL` + `negGap` + `posGap`, and total length `L` as `endNegThick` + `innerSpan` + `endPosThick` (`hardware/18650-holder/holder_18650_tight.mjs:89-99`).

#### Scenario: Terminal protrusions set the length
- GIVEN `springInstalledH` and `domeProtrusion` in `P`
- WHEN the geometry is derived
- THEN `plateBack` SHALL be `seatDepth` - `plateThick`, `negGap` SHALL be `springInstalledH` - `plateBack` and `posGap` SHALL be `domeProtrusion` - `plateBack` (`hardware/18650-holder/holder_18650_tight.mjs:95-97`)

#### Scenario: Default dimensions
- GIVEN the default `P`
- WHEN `innerSpan` and `L` are computed
- THEN they SHALL be 69.6 mm and 73.6 mm (derived by hand from the code, inferido del código; `hardware/18650-holder/holder_18650_tight.mjs:98-99`)

### Requirement: Half-cradle solid with round end discs

The system SHALL build a cylinder along +X of length `L`, cut everything below `baseZ`, cut the cradle sides above `rimAboveAxis` between the end walls, and cut the main bore (`hardware/18650-holder/holder_18650_tight.mjs:160-194`). With `roundEnds` true (current value) the end walls MUST keep the full disc up to `outerR` (`hardware/18650-holder/holder_18650_tight.mjs:61-63`, `hardware/18650-holder/holder_18650_tight.mjs:92`).

#### Scenario: Round ends
- GIVEN `roundEnds` is true
- WHEN the solid is built
- THEN `topZ` SHALL equal `outerR` and the end walls SHALL NOT be trimmed (`hardware/18650-holder/holder_18650_tight.mjs:92`, `hardware/18650-holder/holder_18650_tight.mjs:166-169`)

#### Scenario: Flat ends with ears
- GIVEN `roundEnds` is false and `earAbovePlate` is greater than 0
- WHEN the solid is built
- THEN the system SHALL trim both end walls to `topZ`, add retaining ears and chamfer their top edges (`hardware/18650-holder/holder_18650_tight.mjs:166-188`)

#### Scenario: Repeated side cut
- GIVEN the cradle side cut already ran before the bore cut
- WHEN the bore has been cut
- THEN the system SHALL cut the same box again (`hardware/18650-holder/holder_18650_tight.mjs:171`, `hardware/18650-holder/holder_18650_tight.mjs:194`)

### Requirement: Terminal seats

The system SHALL cut a negative seat for a 9 mm plate and a positive seat for a 10 mm plate with `terminalSeat` (`hardware/18650-holder/holder_18650_tight.mjs:56-57`, `hardware/18650-holder/holder_18650_tight.mjs:197-204`). When `earTop` is greater than 0 it MUST also cut the tab channel, the tab groove and, if `wireSlotW` > 0, the wire slot (`hardware/18650-holder/holder_18650_tight.mjs:134-148`).

#### Scenario: Round ends with channel
- GIVEN `roundEnds` is true
- WHEN a seat is cut
- THEN the channel depth SHALL be `channelDepth` and the wire slot SHALL run down to `rimAboveAxis` (`hardware/18650-holder/holder_18650_tight.mjs:134-148`)

#### Scenario: Flat ends without ears
- GIVEN `roundEnds` is false and `earAbovePlate` is 0
- WHEN a seat is cut
- THEN only the square pocket SHALL be cut, with no channel, groove or wire slot (`hardware/18650-holder/holder_18650_tight.mjs:133`, `hardware/18650-holder/holder_18650_tight.mjs:174-175`, inferido del código)

#### Scenario: Pocket depth uses EPS
- GIVEN `seatDepth` is changed alone
- WHEN a seat is cut
- THEN the pocket extent into the wall SHALL remain the constant `EPS` (1.0) and `seatDepth` SHALL only move the bore-side box edge (`hardware/18650-holder/holder_18650_tight.mjs:111`, `hardware/18650-holder/holder_18650_tight.mjs:128-130`, inferido del código)

### Requirement: Console report without failure checks

The system SHALL print mesh status, volume, PLA weight (density 0.00124 g/mm3), bounding box, bore and outer diameter, inner span, end wall height, seats and ears to stdout (`hardware/18650-holder/holder_18650_tight.mjs:212-225`). It MUST NOT exit non-zero because of geometry quality.

#### Scenario: Invalid geometry
- GIVEN a parameter change yields non-manifold geometry
- WHEN the script runs
- THEN the report SHALL show it only in the `status` line and the STL files SHALL still be written (`hardware/18650-holder/holder_18650_tight.mjs:215`, `hardware/18650-holder/holder_18650_tight.mjs:264`)

### Requirement: STL output and mirror

The system SHALL write `holder_18650_tight.stl` and `holder_18650_tight_mirrored.stl` (solid mirrored across X, translated by `L`) to the output directory, overwriting without confirmation (`hardware/18650-holder/holder_18650_tight.mjs:253`, `hardware/18650-holder/holder_18650_tight.mjs:261-266`). Each file MUST be binary STL (`hardware/18650-holder/holder_18650_tight.mjs:230-255`).

#### Scenario: STL encoding
- GIVEN a solid to write
- WHEN `writeBinarySTL` runs
- THEN the file SHALL start with the 80-byte header `18650 holder - generated`, then the triangle count, with recomputed face normals and float32 vertices (`hardware/18650-holder/holder_18650_tight.mjs:230-255`)

#### Scenario: Successful run
- GIVEN the output directory exists
- WHEN the script finishes
- THEN the system SHALL print two `wrote <path> (<n> tris)` lines (`hardware/18650-holder/holder_18650_tight.mjs:264-266`)

#### Scenario: Missing output directory
- GIVEN `process.argv[2]` points to a non-existent directory
- WHEN the first STL is written
- THEN `fs.writeFileSync` SHALL throw a Node error and the run SHALL end; the directory is not created (`hardware/18650-holder/holder_18650_tight.mjs:253`, `hardware/18650-holder/holder_18650_tight.mjs:257-259`, inferido del código)
