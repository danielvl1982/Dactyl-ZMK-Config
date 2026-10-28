# generador-capuchon-pulsador Specification

## Purpose

Baseline spec (current behavior, derived from code on 2026-10-28). A Node script that generates the 3D-printable binary STL of a cap for the 7x7x14 mm push switch of the Dactyl 4x6 case, with a stem that slides through the TRRS jack hole. Documentation: `docs/features/generador-capuchon-pulsador.md`. Ticket: none.

## Requirements

### Requirement: Entry point and output location

The system SHALL run through `node switch_cap.mjs [output-dir]` or `npm run build` in `hardware/switch-button`, taking the optional first argument as the output directory resolved with `path.resolve` and defaulting to the script's own directory (`hardware/switch-button/switch_cap.mjs:182-184`, `hardware/switch-button/package.json:7-8`). It MUST NOT read any config file or environment variable.

#### Scenario: Default output directory
- GIVEN dependencies are installed with `npm install`
- WHEN `node switch_cap.mjs` is run without arguments
- THEN the system SHALL write `switch_cap.stl` in the script's own directory

#### Scenario: Explicit output directory
- GIVEN an existing directory `out`
- WHEN `node switch_cap.mjs out` is run
- THEN the system SHALL write `out/switch_cap.stl`

#### Scenario: npm script argument (inferido del código)
- GIVEN the npm script `build`
- WHEN the output directory is needed through npm
- THEN the argument MUST be passed as `npm run build -- <dir>` (`inferido del código`: standard npm behavior)

### Requirement: Parameters are source constants without input validation

The system SHALL take all inputs from the constants of object `P` edited in the source, including `switchW`, `socketClearance`, `socketCornerR`, `socketDepth`, `leadIn`, `leadInPlay`, `capD`, `capH`, `holeD`, `stemClearance`, `stemH`, `segments` and `outBase` (`hardware/switch-button/switch_cap.mjs:40-61`). No value MUST be validated on entry.

#### Scenario: Default parameter values
- GIVEN the unmodified source
- WHEN the script runs
- THEN the system SHALL use `switchW` 7.0, `socketClearance` 0.3, `socketDepth` 4.0, `capD` 11.2, `capH` 16.0, `holeD` 6.1, `stemClearance` 0.3, `stemH` 8.0, `segments` 96 and `outBase` `switch_cap`

#### Scenario: Zero or negative depth values (inferido del código)
- GIVEN `P.socketDepth` or `P.leadIn` set to 0 or a negative number
- WHEN the script runs
- THEN the system SHALL accept the value without error (`hardware/switch-button/switch_cap.mjs:112`, `hardware/switch-button/switch_cap.mjs:143-144`, `inferido del código`)

### Requirement: Derived geometry

The system SHALL derive `socket = switchW + socketClearance`, `cornerR = min(socketCornerR, socket/2 - 0.1)`, `stemD = holeD - stemClearance`, `flareH = (capD - stemD) / 2` and `baseZ = stemH + flareH` (`hardware/switch-button/switch_cap.mjs:66-76`). The stem MUST leave 0.15 mm of play per side in the case hole.

#### Scenario: Default derived values
- GIVEN the default parameters
- WHEN the geometry is derived
- THEN the socket SHALL be 7.3 mm wide and the stem SHALL be 5.8 mm wide

#### Scenario: Corner radius cap
- GIVEN `socketCornerR` larger than `socket/2 - 0.1`
- WHEN the geometry is derived
- THEN the system SHALL use `socket/2 - 0.1` as `cornerR`

### Requirement: Solid construction in print orientation

The system SHALL load the `manifold-3d` WASM module, call `setup()` and build the solid with the stem on the bed: a stem cylinder, a 45 degree conical flare from `stemD` to `capD` and a full-width cylinder up to `capH` (`hardware/switch-button/switch_cap.mjs:80-82`, `hardware/switch-button/switch_cap.mjs:102-104`). The flare MUST be 45 degrees so the part prints without supports (`hardware/switch-button/switch_cap.mjs:74`).

#### Scenario: Solid built
- GIVEN the derived geometry
- WHEN the part is built
- THEN the system SHALL produce a closed-top solid whose stem rests on the bed and whose socket opens upward

#### Scenario: Missing dependency (inferido del código)
- GIVEN `manifold-3d` is not installed
- WHEN the script starts
- THEN the top-level import SHALL fail before anything is written (`hardware/switch-button/switch_cap.mjs:32`, `inferido del código`)

### Requirement: Socket and lead-in subtraction

The system SHALL subtract a rounded-square socket `socketDepth` deep from the top face and, only if `leadIn > 0`, a wider rounded-square step of height `leadIn` at the socket mouth (`hardware/switch-button/switch_cap.mjs:88-96`, `hardware/switch-button/switch_cap.mjs:107-116`). `EPS` of 1.0 mm MUST be used as overlap so subtractions cut cleanly (`hardware/switch-button/switch_cap.mjs:78`).

#### Scenario: Lead-in enabled
- GIVEN `P.leadIn` greater than 0
- WHEN the socket is cut
- THEN the system SHALL also subtract the wider step at the mouth

#### Scenario: Lead-in disabled
- GIVEN `P.leadIn` equal to 0 or negative
- WHEN the socket is cut
- THEN the system SHALL skip the lead-in subtraction

### Requirement: Geometry report on stdout

The system SHALL print the manifold status, bounding-box size, volume, estimated PLA mass (volume * 0.00124 g/mm3) and the main dimensions (`hardware/switch-button/switch_cap.mjs:121-133`). Non-manifold or empty results MUST NOT stop the export (`hardware/switch-button/switch_cap.mjs:124`).

#### Scenario: Report printed
- GIVEN a built part
- WHEN the script reaches the report step
- THEN the system SHALL print the status, size, volume and mass lines before the fit result

### Requirement: Fit checks

The system SHALL run five fit checks: corner wall at least 0.8 mm (suggesting `capD >= (diagonal + 0.8) * 2`), flare ending at least 0.6 mm below the socket floor, solid top (`capH - socketDepth`) at least 1.2 mm, `socketDepth` at least 40 percent of `switchW`, and lead-in shallower than the socket (`hardware/switch-button/switch_cap.mjs:136-144`). It SHALL print `FIT PROBLEMS` plus one line per problem, or `fit           : ok` (`hardware/switch-button/switch_cap.mjs:145-150`).

#### Scenario: Default parameters pass
- GIVEN the default parameters
- WHEN the fit checks run
- THEN the system SHALL print `fit           : ok` (corner wall about 1.06 mm, flat wall 1.95 mm)

#### Scenario: Shallow socket
- GIVEN `socketDepth` below 40 percent of `switchW`
- WHEN the fit checks run
- THEN the system SHALL list a problem stating the cap "will rock"

### Requirement: Fit problems do not block the export

The system SHALL write the STL regardless of the fit result and MUST NOT set a process exit code, so a normal finish exits 0 even when fit problems were printed (`hardware/switch-button/switch_cap.mjs:145-150`, `hardware/switch-button/switch_cap.mjs:186-187`; `inferido del código`: no `process.exit` or `process.exitCode`).

#### Scenario: Fit problem present
- GIVEN parameters that fail a fit check
- WHEN the script runs
- THEN the system SHALL print `FIT PROBLEMS`, still write the STL overwriting the previous one and exit with code 0

### Requirement: Lead-in wall is not checked

The system SHALL NOT check the corner wall of the lead-in step; only the socket corner wall is checked against 0.8 mm (`hardware/switch-button/switch_cap.mjs:112-115`, `hardware/switch-button/switch_cap.mjs:136`).

#### Scenario: Default lead-in wall
- GIVEN the default parameters
- WHEN the part is built
- THEN the lead-in step SHALL be 8.1 mm square with radius 1.9 mm and a corner wall of about 0.66 mm, and no problem SHALL be reported

### Requirement: Binary STL output

The system SHALL write a binary STL with `fs.writeFileSync`, overwriting any existing file, made of the 80-byte header `switch cap - generated`, the triangle count and 50 bytes per triangle with one normal computed per triangle (`hardware/switch-button/switch_cap.mjs:155-180`, `hardware/switch-button/switch_cap.mjs:186-187`). It SHALL print `wrote <path> (<n> tris)`.

#### Scenario: STL written
- GIVEN a built part
- WHEN the export step runs
- THEN the system SHALL write `<output-dir>/switch_cap.stl` and print the path and triangle count

#### Scenario: Missing output directory (inferido del código)
- GIVEN an output directory that does not exist
- WHEN the export step runs
- THEN the directory MUST NOT be created and `fs.writeFileSync` SHALL throw `ENOENT` (`hardware/switch-button/switch_cap.mjs:178`, `inferido del código`)
