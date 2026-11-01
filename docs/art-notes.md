# Art notes — Jack bridge / sleep / door (2026-11-01)

Source zip (overrides older repo copies): `/cursor/stores/self/internal/art.zip`
(`alan_sleep/`, `door/`, `bridge/`, including json fps/positions).
Playable copies live under `game/`. Full zip tree under `assets/art/originals/jack/`.

## `alan_sleep/` (`alan_sleep.json`)
- Sleep loop: 8 frames @ **6 fps**, sprite **144×134** at **(462, 70)** (top-left). Draw **above** the painted chair.
- Wake jolt: 6 frames @ **10 fps**, mug flight path then `mug_stuck_console.png` at **(598, 128)**.
- Belly mug bob per sleep frame (`mug_pos`). Z’s at **(540, 66)** @ 6 fps.
- Yoke is baked into the sleep/wake frames.

## `door/` (`door.json`)
- Open / close: 8 frames each @ **12 fps**, sprite **59×163** at **(180, 48)**.
- Pocket door slides left. `door_open_00` = closed. `door_open_hold` while someone walks through.
- Threshold y **219**. Walk-in feet **(209, 225)**. Inside spot **(229, 259)**.

## `bridge/` (`bridge_v5_depth.json`)
- Playable blink frames are the **no-armrest-mug** pair (`bridge_v5_00_nomug` / `01_nomug`).
- Mug patch `bridge_v5_mugpatch.png` at **(500, 135)** if the armrest mug needs restoring; live scene uses the flying mug instead.
- Depth: `scale = clamp(0.0011538 * feet_y + 1.0, 1.10, 1.70)` for a **104px** sprite. Game sprites are 112×128, so that scale is multiplied by `104/128`.

## Walk-ins
Naomi, Joe, DanDan, and Eithan walk in **empty-handed** (no coffee / manual / frying pan sprites, no placeholder labels). Spoken lines that mention a prop stay in dialogue (e.g. Chaya “put that book down”). Stage directions about holding coffee, a manual, or a pan are not staged.
Alan still trips on the painted floor rocket. Unique walk-in clothes still missing.

Cast talk loops use the 80-frame sheet ranges: `talk_down` is **8** frames (closed / shrug / closed / open / open / closed / shrug / open). Speakers play the **mouth** poses (0, 3, 4, 7), not the shrug, while their line types/displays, then idle. `talk_right` is **4** (already a mouth loop). Chaya stays on the viewscreen.

Chaya uses the viewscreen frames (`talk_down` / `idle` / `judge` at (599, 40)).
Canon dialogue is complete in [grandma-call-script.md](grandma-call-script.md) (DanDan/Eithan gap filled). No 20:00 countdown.
