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

The battery holder in `NCR18650B/` is a custom design rather than a downloaded
model. It is described in [Battery holder](#battery-holder-18650).

## Battery holder (18650)

The stock case carries a loose tray for one 18650 cell
(`NCR18650B/1_Batterie_2.0.stl`). It was replaced with a parametric holder sized
for the cell and for the two solder-tab terminals used in this build.

| Item | Value |
| --- | --- |
| Cell | 1 x 18650 (NCR18650B), 18.5 x 65.8 mm |
| Terminals | 9 x 9 mm spring plate (negative), 10 x 10 mm dome plate (positive), 0.4 mm thick, 4 mm solder tab with a through hole |
| Size | 73.6 x 22.9 x 20.0 mm |
| Cradle | Half cylinder, open above the cell axis |
| Walls | 2.0 mm, floor under the cell 1.3 mm, flat base 7.9 mm wide |
| End walls | 2.0 mm, one per terminal, full height to guide the tabs |
| Seats | 9.4 x 9.4 mm (negative) and 10.4 x 10.4 mm (positive) square pockets, 1.0 mm deep |
| Tab channel | 4.4 mm wide, 1.0 mm deep, exits through the top face of each end wall |
| Inner span | 69.6 mm: cell 65.8 + spring 2.9 + dome 0.9 |
| Mass | about 7 g of PLA |

Design notes:

- The seats are centred on the cell axis, so the cell itself presses each terminal
  plate against its seat floor. No snap feature is needed, and the plates can be
  removed by hand once the cell is out.
- The plate sits 1.0 mm inside the end wall, so the solder joint is recessed and
  cannot touch the cell. The tab channel keeps the positive tab from bending into
  the cell can, which would short the cell.
- The cradle stops at the cell axis. The cell drops straight in with no flex and is
  closed with tape or heat shrink after soldering, so the holder does not retain
  the cell on its own.
- The only dimension that changes the holder length is the spring height once the
  cell is fitted (`springInstalledH`). It is assumed to be 3.5 mm above the plate;
  the cell length plus that figure and the 0.9 mm positive dome set the inner span.

Files, in the parent project folder and not versioned in this repository:

| File | Purpose |
| --- | --- |
| `NCR18650B/holder_18650_tight.stl` | Holder as designed |
| `NCR18650B/holder_18650_tight_mirrored.stl` | Mirror image for the other half |
| `NCR18650B/holder_18650_tight.mjs` | Parametric generator, Node and `manifold-3d` |
| `NCR18650B/1_Batterie_2.0.stl` | Original tray, kept as a reference |

Print with 0.2 mm layers, 4 to 5 perimeters so the 2 mm end walls come out solid,
20 percent infill and a brim. No supports are needed: the seat ceilings are 1.0 mm
ledges that bridge on their own.

## Parts ordered

The following AliExpress items are part of the build. Product descriptions are not
recorded here yet; fill them in when the orders are confirmed.

| # | Link | Description |
| --- | --- | --- |
| 1 | https://www.aliexpress.com/item/1005012075849326.html | TBD |
| 2 | https://www.aliexpress.com/item/1005007232040760.html | TBD |
| 3 | https://www.aliexpress.com/item/1005008789715285.html | TBD |
| 4 | https://www.aliexpress.com/item/1005007557383132.html | TBD |

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
