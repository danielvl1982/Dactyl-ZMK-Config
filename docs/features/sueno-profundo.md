# F10 - Deep sleep on idle with key wake-up

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

Both halves of the keyboard enter deep sleep after a period without key activity, to save battery on the 18650 cells, and wake when any key is pressed. The behavior is configured entirely through Kconfig and one devicetree property; the repository contains no sleep code. The current timeout is 5 minutes (`config/dactyl.conf:6`); that line is an uncommitted working-tree change, the committed file keeps the ZMK default of 15 minutes (`config/dactyl.conf:3`, `docs/04-roadmap.md:41`).

## Trigger / Entry point

- Config: `CONFIG_ZMK_SLEEP=y` enables the ZMK sleep feature (`config/dactyl.conf:5`).
- Config: `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT=300000` sets the inactivity time before sleeping (`config/dactyl.conf:6`). Uncommitted at the time of writing.
- Config: `wakeup-source;` on the `kscan0` node lets key presses wake the MCU (`config/boards/shields/dactyl/dactyl.dtsi:12`).
- Runtime trigger: the idle timer firing is implemented inside ZMK, not in this repo (`inferido del código`: inferred from the Kconfig name and the comment at `config/dactyl.conf:3`).

## Inputs (payload/config)

- `CONFIG_ZMK_SLEEP` — bool, `y`; shared file applied to both halves (`config/dactyl.conf:1`, `config/dactyl.conf:5`).
- `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT` — integer in milliseconds, `300000` (5 min). ZMK default is 15 min (`config/dactyl.conf:3`, `config/dactyl.conf:6`). The unit (ms) is `inferido del código`, deduced from 300000 = 5 min in the file's own comment.
- `wakeup-source` — boolean devicetree property, present on `kscan0` (`config/boards/shields/dactyl/dactyl.dtsi:12`).
- Matrix scanned by `kscan0`: `zmk,kscan-gpio-matrix`, `col2row`, rows with pull-down (`config/boards/shields/dactyl/dactyl.dtsi:10-19`). See [F8](matriz-teclado-split.md).

## Steps

1. At build time the shared `config/dactyl.conf` applies to both halves and turns on ZMK sleep (`config/dactyl.conf:1`, `config/dactyl.conf:5`).
   1. The idle timeout is overridden to 300000 ms (`config/dactyl.conf:6`).
2. At build time the `kscan0` node is marked as a wakeup source for both halves, since both include the shared dtsi (`config/boards/shields/dactyl/dactyl.dtsi:9-12`).
3. At runtime, after `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT` ms without activity, ZMK puts the MCU into deep sleep (`inferido del código`: behavior is in ZMK, not in this repo; comment at `config/dactyl.conf:3`).
4. A key press on the scanned matrix wakes the half (`config/dactyl.conf:4`, `config/boards/shields/dactyl/dactyl.dtsi:12`). The matrix wiring and scan belong to [F8](matriz-teclado-split.md).

## Exit points

| Salida | Detalle |
|---|---|
| MCU power state | Active to deep sleep after the idle timeout (300000 ms in the working tree); deep sleep to active on any key press (`config/dactyl.conf:5-6`, `config/boards/shields/dactyl/dactyl.dtsi:12`). |

## Business rules

- Deep sleep is enabled on both halves because the setting lives in the shared conf file (`config/dactyl.conf:1`, `config/dactyl.conf:5`).
- Idle timeout is 5 minutes in the working tree (`config/dactyl.conf:6`); the committed value is the ZMK default of 15 minutes (`config/dactyl.conf:3`).
- Any key of the matrix wakes the half, because the whole `kscan0` is a wakeup source and no per-key filter exists (`config/boards/shields/dactyl/dactyl.dtsi:12`).
- What counts as "activity" that resets the timer is defined by ZMK, not by this repo (`inferido del código`).

## Errors and edge cases

- Wake does not preserve volatile state such as the active momentary layer: RAM state is lost on sleep (`inferido del código`; `docs/datos.md:12`, `docs/datos.md:59`).
- The 5 min value is only in the working tree; a build from the last commit still uses 15 min (`config/dactyl.conf:3`, `config/dactyl.conf:6`).
- The sleep setting was built in CI at `2bdfcf7` but "not flashed yet" per the roadmap, so real on-device behavior is unverified (`docs/04-roadmap.md:41-42`).
- Each half sleeps on its own idle timer; whether the peripheral half and the central stay in sync after wake is not defined in this repo (`inferido del código`). See [F9](roles-split-ble.md) for the split roles.

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Idle time before sleep (scheduling/config) | `config/dactyl.conf` → `CONFIG_ZMK_IDLE_SLEEP_TIMEOUT` (`config/dactyl.conf:6`) |
| Turn deep sleep on or off | `config/dactyl.conf` → `CONFIG_ZMK_SLEEP` (`config/dactyl.conf:5`) |
| Which input wakes the half (input selection) | `config/boards/shields/dactyl/dactyl.dtsi` → `kscan0` `wakeup-source` (`config/boards/shields/dactyl/dactyl.dtsi:12`) |
| Matrix pins that carry the wake signal (input validation/wiring) | `config/boards/shields/dactyl/dactyl.dtsi` → `kscan0` `row-gpios` (`config/boards/shields/dactyl/dactyl.dtsi:15-20`) |
| Business rule: sleep per half rather than shared | `config/dactyl.conf` is shared; split it into per-half conf files named after the shield (`config/dactyl.conf:1`) |
| Output / power state | Not in this repo; implemented by ZMK sleep (`inferido del código`) |

## Existing tests

- Ninguno conocido. The repo has no tests for firmware behavior; CI only builds (see [F12](build-firmware-ci.md)).

## Coverage / Gaps

- No automated or documented on-device test of sleep and wake (`docs/04-roadmap.md:41-42`).
- Timeout change uncommitted and unflashed; catalog entry still says "not set in repo" (fragments in `docs/.work/questions/sueno-profundo.md`).
- ZMK default of 15 min is stated only in a comment, not provable from this repo.
