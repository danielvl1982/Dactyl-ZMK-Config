# Hardware

## Summary

| Item | Value |
| --- | --- |
| Model | Dactyl Manuform 4x6, split, trackball on the right half |
| Matrix | 4 rows x 6 columns per half, col2row diodes |
| Switches | 23 per half, hand-wired |
| Controllers | 2 x nice!nano (nRF52840) |
| Firmware | ZMK |
| Interface | TRRS cable today, BLE split planned |
| Power | USB today, one 18650 per half planned (custom holder designed) |

There are **23 switch positions per half**, not 24. The bottom row has five keys:
the position at the bottom of the outer column is not populated on either half.

```
LEFT half (23)                                RIGHT half (23)
outer  .  .  .  .  .  inner              inner  .  .  .  .  .  outer
  [ ] [ ] [ ] [ ] [ ] [ ]                  [ ] [ ] [ ] [ ] [ ] [ ]
  [ ] [ ] [ ] [ ] [ ] [ ]                  [ ] [ ] [ ] [ ] [ ] [ ]
  [ ] [ ] [ ] [ ] [ ] [ ]                  [ ] [ ] [ ] [ ] [ ] [ ]
      [ ] [ ] [ ] [ ] [ ]                  [ ] [ ] [ ] [ ] [ ]
```

The right half is a **mirror image** of the left, both mechanically and in the PCB
column order. This is the origin of the reversed letters described in
[02-current-state.md](02-current-state.md).

## Controllers

- Two nice!nano boards, one per half.
- ZMK `nice_nano//zmk` board definition.
- Each half will get its own LiPo battery. The nice!nano board definition already
  includes the battery voltage divider, so no extra wiring is required for
  battery level reporting.

## Wiring (per half)

From `config/boards/shields/dactyl_left/dactyl_left.overlay`:

| Signal | Pro Micro pin | nRF pin |
| --- | --- | --- |
| Column 0 | 2 | D1 |
| Column 1 | 3 | D0 |
| Column 2 | 4 | D4 |
| Column 3 | 5 | C6 |
| Column 4 | 6 | D7 |
| Column 5 | 7 | E6 |
| Row 0 | 21 | F4 |
| Row 1 | 20 | F5 |
| Row 2 | 19 | F6 |
| Row 3 | 18 | F7 |

Diode direction: `col2row`.

Both halves use the same pinout. The right half is only mirrored mechanically, so
its matrix is read with `col-offset = <6>` and a reversed column order in the shared
transform.

The matrix exposes 4 x 6 = 24 positions per half. The bottom position of the outer
column (`RC(3,0)` in each half's own matrix) has no
switch. In the shared 12-column transform the left gap is `RC(3,0)` and the right
gap is `RC(3,6)`.

## Printed parts

The case and the keycaps are 3D printed. The models were downloaded from
Thingiverse and live in the parent project folder under `files/`:

| File | Purpose |
| --- | --- |
| `4x6_MINIDOX_left_nonHS.stl` | Left case, no heat-set inserts |
| `4x6_MINIDOX_right_nonHS.stl` | Right case, no heat-set inserts |
| `4x6_MINIDOX_right_nonHS_trackball.stl` | Right case with trackball mount |
| `_4x6_MINIDOX_left.stl` | Left case, heat-set inserts |
| `_4x6_MINIDOX_right.stl` | Right case, heat-set inserts |
| `_4x6_MINIDOX_right_trackball.stl` | Right case with trackball mount, inserts |
| `bot_nomal.stl` | Bottom plate |
| `pro_micro_adapter.stl` | Controller adapter |
| `blankkeycap.STL` | Blank keycap |

The battery holder in `hardware/18650-holder/` is a custom design rather than a
downloaded model. It is described in [Battery holder](#battery-holder-18650).

## Battery holder (18650)

The stock case carries a loose tray for one 18650 cell
(`NCR18650B/1_Batterie_2.0.stl`). It was replaced with a parametric holder sized
for the cell and for the two solder-tab terminals used in this build.

| Item | Value |
| --- | --- |
| Cell | 1 x 18650 (NCR18650B), 18.5 x 65.8 mm |
| Terminals | 9 x 9 mm spring plate (negative), 10 x 10 mm dome plate (positive), 0.4 mm thick, 4 mm solder tab with a through hole |
| Size | 73.6 x 22.9 x 17.75 mm (the cradle itself is 10.75 mm, the ears add the rest) |
| Cradle | Half cylinder, open above the cell axis |
| Walls | 2.0 mm, floor under the cell 1.3 mm, flat base 7.9 mm wide |
| End walls | 2.0 mm, one per terminal, trimmed flush with the cradle rim |
| Seats | 9.4 x 9.4 mm (negative) and 10.4 x 10.4 mm (positive) square pockets, 1.0 mm deep |
| Ears | One per end wall, 11.8 mm (negative) and 12.8 mm (positive) wide, rising 2 mm above the plate |
| Tab channel | As wide as the seat (9.4 / 10.4 mm), so it follows the plate square up through the ear; the folded tab lies in a 4.4 mm groove on the ear top |
| Wire slot | 5.0 mm wide, 4.0 mm below the ear top, for the soldered wire and heat shrink |
| Inner span | 69.6 mm: cell 65.8 + spring 2.9 + dome 0.9 |
| Mass | about 6.4 g of PLA |

Design notes:

- The seats are centred on the cell axis, so the cell itself presses each terminal
  plate against its seat floor.
- The plate sits 1.0 mm inside the end wall, so the solder joint is recessed and
  cannot touch the cell. The walls now end at the cell axis, so each plate sits in a
  half-pocket and its upper half stands above the rim: glue the plate to its seat
  floor and wrap the assembly with tape or heat shrink before fitting the cell. With
  the ears keep the tab from bending into the cell can.
- `endWallAboveAxis` brings the walls back up if the holder is ever used unwrapped.
  At the cell top (9.25 mm) the seat becomes a full pocket again and the tab channel
  is cut automatically.
- The cradle stops at the cell axis. The cell drops straight in with no flex and is
  closed with tape or heat shrink after soldering. A centered retaining ring was
  tried and removed: it broke the first time the cell was inserted.
- The only dimension that changes the holder length is the spring height once the
  cell is fitted (`springInstalledH`). It is assumed to be 3.5 mm above the plate;
  the cell length plus that figure and the 0.9 mm positive dome set the inner span.

Files, versioned in this repository under `hardware/18650-holder/`:

| File | Purpose |
| --- | --- |
| `holder_18650_tight.mjs` | Parametric generator, the source of truth |
| `holder_18650_tight.stl` | Holder as designed |
| `holder_18650_tight_mirrored.stl` | Mirror image for the other half |
| `package.json` | Pins `manifold-3d` |

`NCR18650B/1_Batterie_2.0.stl`, the original tray, stays in the parent project
folder as a reference and is not versioned.

Print with 0.2 mm layers, 4 to 5 perimeters so the 2 mm end walls come out solid,
20 percent infill and a brim. No supports are needed: the seat ceilings are 1.0 mm
ledges that bridge on their own.

To change a dimension, edit the parameter block at the top of the generator and run:

```bash
cd hardware/18650-holder
npm install
npm run build
```

The script rewrites both STLs in place and prints the size, the mass and the derived
dimensions, so a change is checked as soon as it is made. It needs Node 22 or newer
because `manifold-3d` is an ES module.
## Switch button

The power switch is a 7 x 7 x 14 mm push switch that came without its cap. It sits
inside the case, so a printed cap gives it both a button and the reach to come out
through the shell. The cap is a hollow shell: its socket receives the original
square head and its flat top is pressed from outside. There is no extra spring —
the square head keeps the cap aligned and the switch's own spring returns the
travel.

| Item | Value |
| --- | --- |
| Cap | 11.2 mm diameter, 12.0 mm tall |
| Socket | 7.3 mm square, 1.5 mm corner radius, 4.0 mm deep |
| Lead-in | 0.6 mm step, 0.8 mm wider, at the mouth |
| Walls | 1.95 mm flat, 1.06 mm at the corners |
| Mass | about 1.3 g of PLA |

The socket is square, so the shell has to be wider than its diagonal
(`switchW * 1.414`). A round cap narrower than that lets the socket corners break
through the wall, which is why the generator reports the corner wall and refuses a
`capD` that is too small. The rounded socket corners buy that margin and let the
cap centre itself on the head instead of jamming on its corners.

Two parameters depend on the build:

- `switchW`: the square head across flats, measured with a caliper.
- `capH`: total height, i.e. how far the cap has to stand out of the case.

`socketClearance` sets the fit: 0.2-0.3 mm total for a press fit, more if the cap
will be glued. Print one test piece before running a full plate.

The STL is exported in print orientation: closed top on the bed and the socket
opening up, so the cavity has no ceiling to bridge. Flip the part after printing.

Files, versioned in this repository under `hardware/switch-button/`:

| File | Purpose |
| --- | --- |
| `switch_cap.mjs` | Parametric generator, the source of truth |
| `switch_cap.stl` | Cap as designed |
| `package.json` | Pins `manifold-3d` |

Print with 0.2 mm layers, 3 perimeters, 20 percent infill and a brim. No supports.
To change a dimension, edit the parameter block and run:

```bash
cd hardware/switch-button
npm install
npm run build
```

## Parts ordered

The following AliExpress items are part of the build.

| # | Link | Description | Option / quantity |
| --- | --- | --- | --- |
| 1 | https://www.aliexpress.com/item/1005012075849326.html | 3-pin plastic tactile switch, replacement keyboard push buttons (sold in 20/50/100 pieces) | 100 pieces |
| 2 | https://www.aliexpress.com/item/1005007232040760.html | Kailh hot-swap PCB socket for Outemu / Cherry MX mechanical keyboard switches (sold in 110/70 pieces) | 2 x 70 pieces |
| 3 | https://www.aliexpress.com/item/1005008789715285.html | 1N4148 high-speed switching diodes, DO-35 package, new and original | 100 pieces |
| 4 | https://www.aliexpress.com/item/1005007557383132.html | NRF52840 development board, Nice!Nano V2.0 compatible, Bluetooth, charge management, Pro Micro form factor | 2 pieces (same listing, one per half) |

## Keycaps and labels

- Commercial keycaps were bought, but the **printed blank keycaps are preferred**.
- Once the mapping is final, **transparent stickers with the character of each key
  (letter, number, function)** will be applied on top of the printed caps.

## Photos

The build photos are in the parent project folder and are not versioned in this
repository:

| File | Contents |
| --- | --- |
| `current_status.png` | Hand-wired matrix of one half, before closing the case |
| `board_front_bluetooth.jpg` | Assembled board, front |
| `board_back_bluetooth.jpg` | Assembled board, back |
| `captura.png` | Vendor firmware (`CURRENT.UF2`) as shipped |
