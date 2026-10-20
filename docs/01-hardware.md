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
| Power | USB today, LiPo battery per half planned |

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

The matrix exposes 4 x 6 = 24 positions; position `RC(3,0)` on the left half
(`RC(3,5)` after mirroring on the right half) has no switch.

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
