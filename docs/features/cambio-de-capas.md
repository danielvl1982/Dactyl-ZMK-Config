# F2 - Momentary layer switching (SYM, NAV, NUM)

Ticket: sin ticket (no ticket ids in git log or docs)

## Purpose

Three keys on the base layer hold a temporary layer while pressed: SYM, NAV and NUM. The layer is active only while the key is held and the keyboard returns to the base layer on release. This frees the base layer from numbers, symbols, navigation and function keys (`config/dactyl.keymap:44`, `config/dactyl.keymap:48`, `config/dactyl.keymap:50`, `docs/03-keymap.md:97-103`). The content of each layer is described in [F3](capa-numeros.md), [F4](capa-navegacion-multimedia.md) and [F5](capa-simbolos.md); the base layer is [F1](capa-base-qwerty-es.md).

## Trigger / Entry point

- Config: `&mo LAYER_SYM` at the outer-right key of row 1, position 11 (`config/dactyl.keymap:44`).
- Config: `&mo LAYER_NAV` at the outer-right key of row 3, position 35 (`config/dactyl.keymap:48`).
- Config: `&mo LAYER_NUM` on the `FN` key, third key of the right half bottom row (the board has no thumb cluster), position 44 (`config/dactyl.keymap:50`).
- Positions are counted row-major, 12 per row, left half first (see [F1](capa-base-qwerty-es.md)); the numbers are `inferido del código` from that order (`config/dactyl.keymap:44-50`).
- All three keys are on the right half, so the press travels from the peripheral to the central over BLE (see [F8](matriz-teclado-split.md) and [F7](gestion-perfiles-bluetooth.md)).

## Inputs (payload/config)

- `LAYER_NUM 1`, `LAYER_NAV 2`, `LAYER_SYM 3` — layer indexes, base is 0 (`config/dactyl.keymap:12`, `config/dactyl.keymap:15-17`).
- The order of the layer nodes (`base_layer`, `num_layer`, `nav_layer`, `sym_layer`) must match those constants (`config/dactyl.keymap:41`, `config/dactyl.keymap:54`, `config/dactyl.keymap:64`, `config/dactyl.keymap:77`). Nothing checks it; that ZMK assigns indexes by node order is `inferido del código`.
- No Kconfig key or devicetree property is involved: no `conditional_layers`, `combos` or other layer behavior is defined (`config/dactyl.conf:1-15`, `config/dactyl.keymap:19-90`).

## Steps

1. A key press on position 11, 35 or 44 reaches the keymap as a position event (see [F8](matriz-teclado-split.md)).
2. ZMK looks up the binding in the highest active layer. With no layer held that is `base_layer`, which holds the three `&mo` bindings (`config/dactyl.keymap:44`, `config/dactyl.keymap:48`, `config/dactyl.keymap:50`).
3. `&mo <n>` activates layer `n` on press and deactivates it on release. This is standard ZMK momentary-layer behavior, `inferido del código`: the behavior is only referenced here (`#include <behaviors.dtsi>` at `config/dactyl.keymap:1`).
4. While the layer is active, each later key press is resolved from the highest active layer downward: a non-`&trans` binding wins, `&trans` falls through to the layer below (`config/dactyl.keymap:57-60`, `config/dactyl.keymap:67-73`, `config/dactyl.keymap:80-86`).
   1. Example: holding NAV and pressing `BSPC` gives Backspace because NAV has `&trans` at that position (`config/dactyl.keymap:50`, `config/dactyl.keymap:73`, `docs/03-keymap.md:137-138`).
5. The release of a key is handled by the layer where its press was resolved, so releasing the layer key turns the layer off (standard ZMK behavior, `inferido del código`).
6. The layer keys' own positions are `&trans` on the target layers, so the held key keeps acting as the layer key while the layer is active:
   1. NUM: position 11 `&trans` (`config/dactyl.keymap:57`), position 35 `&trans` (`config/dactyl.keymap:59`), position 44 `&trans` (`config/dactyl.keymap:60`).
   2. NAV: position 11 `&trans` (`config/dactyl.keymap:67`), position 35 `&trans` (`config/dactyl.keymap:71`), position 44 `&trans` (`config/dactyl.keymap:73`).
   3. SYM: position 11 `&trans` (`config/dactyl.keymap:80`), position 35 `&trans` (`config/dactyl.keymap:84`), position 44 `&trans` (`config/dactyl.keymap:86`).
7. Contents resolved while a layer is held are covered in [F3](capa-numeros.md) (NUM), [F4](capa-navegacion-multimedia.md) (NAV) and [F5](capa-simbolos.md) (SYM). Bluetooth profile keys on NAV are covered in [F7](gestion-perfiles-bluetooth.md).

## Exit points

| Salida | Detalle |
|---|---|
| ZMK active layer state (RAM) | Layer set on press and cleared on release of the `&mo` key; never persisted (`config/dactyl.keymap:44`, `config/dactyl.keymap:48`, `config/dactyl.keymap:50`) |

## Business rules

- Layers are momentary only: there is no `&tog`, `&to` or `&sl` binding in the keymap, so no layer stays on after release (`config/dactyl.keymap:41-90`).
- SYM is held with the right pinky at the outer column of row 1, NAV with the right pinky at the outer column of row 3, NUM with the third key of the right half bottom row (`FN`) (`docs/03-keymap.md:78-80`, `docs/03-keymap.md:97-103`).
- Layer indexes are SYM 3, NAV 2, NUM 1, base 0 (`config/dactyl.keymap:12`, `config/dactyl.keymap:15-17`). When several layers are held, the highest index is consulted first, `inferido del código` from ZMK layer resolution.
- Every layer has 48 bindings, with `&trans` wherever the base layer must stay reachable, including the layer keys themselves (`config/dactyl.keymap:54-88`).

## Errors and edge cases

- Two layer keys held at once → both layers are active and the higher index wins on conflicts (SYM over NAV over NUM); `inferido del código`, neither documented nor tested (`config/dactyl.keymap:15-17`).
- Layer key released before a key pressed under the layer → the pressed key's release is still handled by its own layer; `inferido del código` from ZMK behavior.
- Peripheral (right half) disconnected from the central while a layer key is held → the keymap lives on the central, so the layer state depends on the BLE link; `inferido del código` from the split setup (`config/dactyl.conf:9-12`).
- Reordering the layer nodes without updating the constants silently points the `&mo` keys at the wrong layer (`config/dactyl.keymap:12`, `config/dactyl.keymap:15-17`).

## Where to act

| Si hay que cambiar... | Empezar en |
|---|---|
| Which key activates a layer (move a layer key) | `config/dactyl.keymap` → `base_layer` bindings (`config/dactyl.keymap:44`, `config/dactyl.keymap:48`, `config/dactyl.keymap:50`); keep the old and new positions as `&trans` or content on each target layer (`config/dactyl.keymap:57-86`) |
| Layer indexes or names | `config/dactyl.keymap` → `LAYER_NUM`, `LAYER_NAV`, `LAYER_SYM` (`config/dactyl.keymap:15-17`) and the node order (`config/dactyl.keymap:41`, `config/dactyl.keymap:54`, `config/dactyl.keymap:64`, `config/dactyl.keymap:77`) |
| Layer behavior (toggle, sticky, tap-hold, tri-layer) | `config/dactyl.keymap` → replace `&mo`, or add a `behaviors` / `conditional_layers` node under `/` (`config/dactyl.keymap:19`) |
| Fall-through rule | `&trans` entries of the target layers (`config/dactyl.keymap:57-86`) |
| Persistence or scheduling config | No aplica (no config key controls layers, `config/dactyl.conf:1-15`) |
| Documentation of layer access | `docs/03-keymap.md` → `Layer access` table (`docs/03-keymap.md:97-103`) |

## Existing tests

- Ninguno conocido: the repo has no test directory; the only automation is the firmware build workflow (`.github/workflows/build.yml`).
- Manual verification is a roadmap item, still unchecked: "Verify `NUM`, `NAV` and `SYM` as momentary layers (`&mo`) that fall through to the base layer with `&trans`" (`docs/04-roadmap.md:57-58`).

## Coverage / Gaps

- Momentary behavior and fall-through have no automated test and the roadmap check is open; see fragment "Momentary layers not verified on hardware" (`docs/04-roadmap.md:57-58`, `docs/05-build-log.md:20`).
- Multi-layer hold priority is undocumented; see fragment "Behavior with several layer keys held" (`config/dactyl.keymap:15-17`).
- Layer indexes depend on node order with no check; see fragment "Layer indexes rely on node order" (`config/dactyl.keymap:12`, `config/dactyl.keymap:15-17`).
- Layer keys sit on the peripheral half; see fragment "Layer keys are on the peripheral half" (`config/dactyl.keymap:44`, `config/dactyl.keymap:48`, `config/dactyl.keymap:50`).
