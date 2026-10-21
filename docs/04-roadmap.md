# Roadmap

Ordered list of what is left. Tick a box only with evidence in the
[build log](05-build-log.md).

## Phase 1 — Documentation

- [x] Create `README.md` and the `docs/` folder.
- [x] Record the hardware, the current state, the mapping and the plan.
- [ ] Fill in the four AliExpress product descriptions in `01-hardware.md`.
- [ ] Confirm that both nice!nano boards are identical and healthy.

## Phase 2 — Turn the two halves into one split

Today each half is an independent keyboard. The goal is one keymap that governs both.

- [ ] Create the `dactyl_right` shield (mirror of `dactyl_left`).
- [ ] Add `CONFIG_ZMK_SPLIT=y` for both halves and
      `CONFIG_ZMK_SPLIT_ROLE_CENTRAL=y` for the left half in `Kconfig.defconfig`.
- [ ] Fix the mirror: reverse the column order in the right half's transform and set
      `col-offset = <6>`.
- [ ] Move the keymap out of the left shield into `config/dactyl.keymap`.
- [ ] Add both targets to `build.yaml` so CI produces two `.uf2` files.
- [ ] Flash both halves and verify that every physical key produces the expected
      character, in order, across the whole board.

## Phase 3 — Battery and Bluetooth

- [ ] Verify the TRRS pinout does not carry VCC between the halves.
- [ ] Fit one LiPo per half.
- [ ] Enable `CONFIG_ZMK_SLEEP=y`.
- [ ] Optionally enable split battery reporting:
      `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_FETCHING=y` and
      `CONFIG_ZMK_SPLIT_BLE_CENTRAL_BATTERY_LEVEL_PROXY=y`.
- [ ] Flash `settings_reset` on both halves to clear stale bonds.
- [ ] Pair the central half with the host and confirm both halves type over BLE.
- [ ] Measure battery life over a week.

> Safety: with two batteries fitted, the TRRS cable must not connect VCC between the
> halves. For a BLE split the cable is not needed at all.

## Phase 4 — Final keymap

- [ ] Implement `03-keymap.md` as devicetree.
- [ ] Verify `FN1` (numbers and F1-F12) and `FN2` (navigation and symbols) as
      momentary, non-falling-through maps.
- [ ] Type a Spanish test text and verify every accented character:
      `á é í ó ú ü Á É Í Ó Ú Ñ ñ ¿ ¡`.
- [ ] Test the left Shift, lower-right Enter/Space/Backspace cluster, and whether
      modifiers should remain available while a function map is active.
- [ ] Decide the trackball integration in ZMK.

## Phase 5 — Labels

- [ ] Order transparent stickers with the final legend.
- [ ] Apply them on the printed keycaps.
- [ ] Photograph the finished board and add the photo to the project folder.

## Open decisions

| Decision | Options | Status |
| --- | --- | --- |
| Numbers/functions | `FN1` map vs direct number row | v0.2: `FN1` approved, not flashed |
| Navigation/symbols | `FN2` map vs dedicated keys | v0.2: `FN2` approved, not flashed |
| Modifiers | Left Shift and lower-left Ctrl/Win/Alt; repeat on function maps? | Base decided; function-map access open |
| Space | Lower right, between Enter and Backspace | v0.2 approved, to confirm by typing |
| Central half | Left | Planned |
| Trackball | ZMK pointing device vs separate controller | Not started |
