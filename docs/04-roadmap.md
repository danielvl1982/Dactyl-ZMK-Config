# Roadmap

Ordered list of what is left. Tick a box only with evidence in the
[build log](05-build-log.md).

## Phase 1 â€” Documentation

- [x] Create `README.md` and the `docs/` folder.
- [x] Record the hardware, the current state, the mapping and the plan.
- [x] Fill in the four AliExpress product descriptions in `01-hardware.md` ("Parts ordered").
- [ ] Confirm that both nice!nano boards are identical and healthy.

## Phase 2 â€” Turn the two halves into one split

Today each half is an independent keyboard. The goal is one keymap that governs both.

- [x] Create the `dactyl_right` shield (mirror of `dactyl_left`).
- [x] Add `CONFIG_ZMK_SPLIT=y` for both halves and
      `CONFIG_ZMK_SPLIT_ROLE_CENTRAL=y` for the left half in `Kconfig.defconfig`.
- [x] Fix the mirror: reverse the column order in the right half's transform and set
      `col-offset = <6>`.
- [x] Move the keymap out of the left shield into `config/dactyl.keymap`.
- [x] Add both targets to `build.yaml` so CI produces two `.uf2` files.
- [ ] Flash both halves and verify that every physical key produces the expected
      character, in order, across the whole board.

## Phase 3 â€” Battery and Bluetooth

- [x] Decision: no TRRS cable. The halves talk over BLE only, so no VCC is shared.
- [x] Design the 18650 holder (`hardware/18650-holder/`) and the switch cap
      (`hardware/switch-button/`). Generated and versioned; neither is printed or
      tested yet.
- [ ] Print and test the holder: cell drops in, plates seat in their pockets, solder
      joints and heat shrink fit the wire slot.
- [ ] Print and test the switch cap on the 7 x 7 x 14 mm switch.
- [ ] Fit one 18650 per half with a cut-off switch on the positive lead. The
      nice!nano charges the cell but has no low-voltage cut-off: switch off for
      storage and do not leave it discharging for weeks.
- [ ] Build the other two keyboards later with the spare cells; the 4S board is
      retired (a 4S boost charger is unsafe for single 18650 cells).
- [x] Enable `CONFIG_ZMK_SLEEP=y` in `config/dactyl.conf`. CI build green on `2bdfcf7`;
      not flashed yet.
- [x] Split battery reporting (`..._FETCHING` and `..._PROXY`) in
      `config/dactyl.conf`. CI build green on `2bdfcf7`; not flashed yet.
- [x] Bluetooth profile keys (`&bt BT_SEL 0..2`, `BT_CLR`) on `NAV`. CI build green on
      `2bdfcf7`; not flashed yet.
- [ ] Flash `settings_reset` on both halves to clear stale bonds (`build.yaml`
      now builds it).
- [ ] Pair the central half with the host and confirm both halves type over BLE.
- [ ] Measure battery life over a week.

> Safety: the TRRS cable is not used, so the two batteries never share a rail.

## Phase 4 â€” Final keymap

- [x] Implement `03-keymap.md` as devicetree.
- [ ] Verify `NUM`, `NAV` and `SYM` as momentary layers (`&mo`) that fall through
      to the base layer with `&trans`.
- [ ] Type a Spanish test text and verify every accented character:
      `Ã¡ Ã© Ã­ Ã³ Ãº Ã¼ Ã Ã‰ Ã Ã“ Ãš Ã‘ Ã± Â¿ Â¡`.
- [ ] Test the left Shift, the left bottom row (Space, Ctrl, Win), the right bottom
      row (Enter, Backspace, Alt) and the three held outer-right keys.
- [ ] Decide the trackball integration in ZMK.

## Phase 5 â€” Labels

- [ ] Order transparent stickers with the final legend.
- [ ] Apply them on the printed keycaps.
- [ ] Photograph the finished board and add the photo to the project folder.

## Open decisions

| Decision | Options | Status |
| --- | --- | --- |
| Numbers | `NUM` layer (hold `FN`) vs direct number row | v1.0: `NUM` layer, not flashed |
| Navigation and symbols | `NAV` and `SYM` layers vs dedicated keys | v1.0: both layers, not flashed |
| Modifiers | Left Shift; Ctrl/Win lower left; Alt lower right | v1.0 decided, to confirm by typing |
| Space | Left inner bottom (`index2`); `Alt` displaced to the right | v1.0 decided, to confirm by typing |
| `HOME` | Base right outer vs `NAV` | v1.0: moves to `NAV`; `END` stays on base |
| Central half | Left | Planned |
| Trackball | ZMK pointing device vs separate controller | Not started |
