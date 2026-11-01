# Are We There Yet? (Galaxy edition) — project context

Living document for story, cast, tone, and design. Add scenes, puzzle notes, and decisions here as the Project grows. Mark proposals clearly so they can be revised without rewriting canon.

**Game title (canon):** Are We There Yet? (Galaxy edition)  
**GitHub repo name (unchanged):** [Space-Blip-Family](https://github.com/shiper69-afk/Space-Blip-Family)  
**Canon intro script:** [intro-script.md](intro-script.md)

---

## Repository

- GitHub: https://github.com/shiper69-afk/Space-Blip-Family
- Added: 2026-11-01 (Asia/Jerusalem)
- No Cloud Agent environment is linked to this Project yet; code workers will use this repository via `repo_url` once work starts.
- Goals, constraints, and decisions land here as the Project unfolds.

---

## Vision / tone / references

### Pitch
A comedy point-and-click adventure about a dysfunctional-but-loving family stuck on a slightly-too-small spaceship. Think **Space Quest 6** energy: late-90s sci-fi satire, inventory puzzles, hotspots, talk-to-NPC banter, room-to-room exploration, and fail-states that are funny rather than punishing.

### Style reference — Space Quest 6
- **Graphics vibe:** Mid/late-90s adventure look — painted backgrounds, character sprites or puppets, exaggerated expressions, readable hotspots.
- **Gameplay:** Classic Sierra 3rd-person point-and-click — walk, look, talk, use/give inventory items on hotspots and NPCs.
- **Comedy:** Sci-fi parody, family chaos, dumb tech that thinks it’s smart. **Comic death is canon** (classic Sierra: always funny, instant restore, PG, never mean toward the kids).
- **Tone guardrails:** Satire and slapstick over cruelty. DavDav (5) can cause trouble; never punch down. Keep PG–PG-13 unless the user hardens tone later.

### Design pillars *(proposal)*
1. **Family first** — every joke and puzzle eventually loops back to who these people are to each other.
2. **Ship as character** — The Millennium Mini Van is cramped, beloved, and slightly broken.
3. **Readable comedy puzzles** — solutions should feel clever or silly, not pixel-hunt sadism.
4. **SQ6 homage, not clone** — steal the *feel* (verbs, inventory comedy, room logic), invent original story and jokes.

---

## Ship & setting

### The Millennium Mini Van
- **Canon name:** The Millennium Mini Van
- **Role:** Family home + working vessel. Not a warship; more “space station wagon that somehow still flies.”
- **Feel *(proposal)*:** Too many family stickers on the hull. Cupholders that also hold plasma cartridges. A nav computer that still has a “dvd” drawer. Hallways sized for adults who keep bumping into kids’ projects.

### Setting notes *(proposal — revise freely)*
- Era: soft near-future / pulp space satire (SQ6-adjacent), not hard sci-fi.
- The ship is currently **between destinations**, giving a closed-environment Act 1 before opening up to ports, stations, or planetfalls.
- External threats can wait; Act 1 friction is **internal** — broken systems, sibling chaos, parental optimism vs. reality.

---

## Cast / crew bible

Ages and roles below are **canon** from the user unless marked **(proposal)**. Personality hooks marked **(proposal)** are invented seeds for comedy and puzzles — revise anytime.

| Name | Age | Role (canon) | Personality seed |
|------|-----|--------------|------------------|
| **Alan** | 45 | Dad and Captain *(user wrote “Capitan”; intended: Captain)* | **(proposal)** Proud captain energy in a van. Gives pep talks that almost make sense. Believes the ship’s weird noises are “character.” Soft spot for everyone; secretly terrified of asking for directions in hyperspace. |
| **Naomi** | 43 | Mom and second in command | **(proposal)** Actually keeps the ship flying. Dry wit, clipboard energy without a clipboard. Corrects Alan’s plans mid-sentence. Loves the kids; will weaponize sarcasm against malfunctioning appliances. |
| **Joe** | 16 | Head of security | **(proposal)** Takes “security” way too seriously for a family van. Makes badges, writes protocols nobody follows. Soft under the armor — wants to be useful and cool. Teen eye-rolls optional but earned. |
| **DanDan** | 13 | Head chef | **(proposal)** Culinary ambition trapped in a galley the size of a closet. Invents recipes that require “ingredients” the ship doesn’t have. Competitive with the food synthesizer. |
| **Eithan** | 11 | Operations | **(proposal)** Systems kid — reads manuals for fun, patches pipes with gum and genius. Speaks in status updates. Quietly the reason anything still works. |
| **DavDav** | 5 | Just there to have fun and get in trouble | **(proposal)** Chaos engine and comic timer. Pushes buttons, “helps,” hides inventory items in toys. Never mean; always catastrophic in small ways. |
| **Bela** | **(proposal)** ~6 | Family dog | **(proposal)** The bark-first diplomat. Treats every amber light like a squirrel in the wiring. Joe’s unofficial K9. Professional beggar (`bark` / `beg` frames). Sprite folder: `bela_frames`. |
| **Cookie** | **(proposal)** ~3 | Family dog | **(proposal)** Softer, snack-oriented, follows whoever last opened the galley. Head-tilts as a future hint machine. Also has `bark` / `beg` frames. Sprite folder: `cookie_frames`. |
| **Grandma** | TBD | Bridge viewscreen, video call only | **(proposal)** Calls in on the glass. She does not walk the ship. Loops: `talk_down`, `idle`, `judge`. |

### Casting / control notes
- **Player character at start:** **TBD — needs user decision.** The first playable slice starts as **Alan** so rooms can be tested; that is implementation, not a locked PC choice. See [Open questions](#open-questions--tbd). Opening plan below proposes Alan as a default so design can proceed.

---

## Storyline overview

### High-level premise *(proposal)*
The Blip family is mid-trip aboard **The Millennium Mini Van** when a cascade of small disasters (power brownout, “secure” door lockdown, missing breakfast protein, DavDav-shaped surprises) threatens to turn a quiet morning into a full systems meltdown — unless someone walks the ship, talks to everyone, and invents solutions out of junk and family dynamics.

### Acts *(proposal — skeleton only)*
| Act | Focus | Status |
|-----|--------|--------|
| **Act 1 — Morning on the Mini Van** | Closed-ship tutorial: rooms, inventory, talk, first multi-step puzzle chain. | **Planning (this doc)** + playable cockpit/corridor slice |
| **Act 2 — TBD** | Expand beyond the ship (port? distress call? relatives?). | Open |
| **Act 3 — TBD** | Climactic family/ship crisis with payoff for each crew role. | Open |

### Themes *(proposal)*
- Competence vs. confidence (Alan vs. Naomi, Joe vs. reality)
- Creativity under constraints (DanDan’s kitchen, Eithan’s ops hacks)
- Little siblings as both problem and solution (DavDav)

### Open story decisions
- **Act 1 → Act 2 hook:** open. Owner is still working on Act 1. Do not propose or lock a hook.
- Is there a recurring antagonist? (unset)
- Does the player stick to one PC or **swap crew members** for certain puzzles?

---

## Opening sequence / Act 1 start plan

> Everything in this section is a **proposal** unless marked canon. Concrete enough to start design; easy to rewrite.

### Player control *(proposal — default until decided)*
- **Start as Alan (Dad / Captain)** in the **Cockpit / Bridge**.
- Rationale: natural “captain survey the ship” walkthrough; talk trees introduce each family member; inventory comedy fits adult reach/authority without excluding kid-focused puzzles later.
- Alternate options (see Open questions): Naomi; free character select; short prologue as DavDav then handoff.

### Cold open *(implemented — follows canon scripts)*
New Game plays the skippable space intro in [intro-script.md](intro-script.md), then the live Grandma call in [grandma-call-script.md](grandma-call-script.md).

- **Title card (canon):** **Are We There Yet? (Galaxy edition)** / Episode 1: Grandma's Calling.
- Skip: Esc skips the remaining cinematic. LMB / Space / Enter advances lines.
- After the flyby, cut **straight to the bridge** (no crew tour, no recorded leftover, no title before the call): **Alan asleep**, **DavDav next to him**, incoming-call alert. ~10 seconds later DavDav hits the red button; **Chaya** appears only then.
- Door order: Naomi after “Every call is a gift”; Joe after “Kids! Bridge!”; DanDan; Eithan after Naomi’s eyebrow line (full script, no gap). Walk-ins are **empty-handed** (no coffee / manual / frying pan graphics or placeholder labels). Spoken lines that mention a prop stay as dialogue.
- Speakers (Alan, Naomi, Joe, DanDan, Eithan, DavDav) loop Jack’s 4-frame **talk** mouths (`talk_down` / `talk_right` / mirrored `talk_left`; `talk_up` holds idle_up) at 8 fps while a line is up, then idle. Frame 00 matches idle so the body does not jump. Chaya stays on the viewscreen.
- **Title card last:** Are We There Yet? (Galaxy edition) / Episode 1: Grandma's Calling.
- After the call: CALL ENDED, alarms, DavDav “Red means yes”, Naomi’s orders, Alan trips. **No 20:00 countdown / HUD.** Grandma calling back is a later beat. Player controls Alan.

### First 15–20 minutes — beat sheet *(proposal)*

| Beat | Where | What happens | Puzzle / interaction |
|------|--------|--------------|----------------------|
| 1 | Cockpit | Amber “family systems” light won’t clear; Alan can’t leave “Captain Mode” until he acknowledges the alert. | **Look** alert → **Talk** to ship computer *(or use mug on alert for a fail gag)* → get **Alert Token / Printout**. |
| 2 | Corridor | Meet **Joe** on “security patrol.” He won’t open the galley wing until someone “authorizes” the all-clear. | Give printout / talk-persuade Joe; or find Joe’s spare **Security Badge** DavDav stuck on a wall. |
| 3 | Galley | **DanDan** mid-crisis: synthesizer demands a missing **Flavor Coil**; breakfast is hostage. | Learn coil was last seen near Ops / DavDav. |
| 4 | Ops nook | **Eithan** juggling brownout. Needs a **Bypass Jumper** from storage *or* a creative substitute (foil + spoon — comedy option). | Inventory craft / hotspot use; Eithan explains power routing in kid-ops speak. |
| 5 | Family cabin / play corner | **DavDav** “helping.” Has the Flavor Coil inside a toy rocket. Won’t trade without a **Funny Noise Thing** or playtime. | Fetch squeaky valve cap / rattle from corridor maintenance panel. |
| 6 | Galley reprise | Install Flavor Coil; DanDan rewards with **Breakfast Brick** (usable later) or goodwill + hint. | Use coil on synthesizer. |
| 7 | Meet Naomi | **Naomi** in engineering crawl / mid-ship. She’s the one who can clear the amber alert for real — but only after power + breakfast + Joe stand-down. | Multi-condition talk unlock; Naomi becomes Act 1 “quest hub.” |
| 8 | Act 1 button | Full ship “morning green.” **Act 1 → Act 2 hook is open** — owner is still working on Act 1. Do not lock or invent the hook. | Unlocked. |

### Fail / death comedy *(canon)*
- **Classic Sierra comic death.** Always funny. Instant restore. **PG.** Never mean toward the kids.
- Inventory and progress stay; the gag plays, then the player is back.
- Example *shapes* (not locked gags): tasting something you shouldn’t, protocol “arrest,” a button that ends badly for Alan — punchlines land on the captain/tech, not on DavDav or the other kids.

### Who the player talks to first *(proposal order)*
Alan (self-barks) → Joe → DanDan → Eithan → DavDav → Naomi (hub resolve).

---

## Scenes / locations index

Seed list for the **opening ship**. Add rows as rooms come online. Status: `idea` | `outlined` | `specced` | `built`.

| ID | Location | Purpose in Act 1 | Key hotspots *(proposal)* | Characters often here | Status |
|----|----------|------------------|---------------------------|------------------------|--------|
| `R-COCKPIT` | Cockpit / Bridge | Start room after intro; alert; captain fantasy | chair, mug, FAMSYS amber, Grandma viewscreen, red button, aft hatch | Alan | built (painted `bridge_v5` 1024×576 blink frames) |
| `R-COCKPIT` | Cockpit / Bridge | Start room; alert; captain fantasy | chair, mug, amber light, nav screen, aft hatch | Alan; Grandma on the viewscreen during a call | built (640×360 placeholder). Painted bridge resources are ready under `game/bridge/` and Grandma's viewscreen under `game/characters/grandma/`; neither is instanced here yet |
| `R-CORRIDOR` | Mid-ship corridor | Hub between rooms; Joe patrol | wall stickers, maintenance panel, badge sticky-spot, door labels | Joe, DavDav (wandering) | built (placeholder BG) |
| `R-GALLEY` | Galley / Kitchen | DanDan’s domain; coil puzzle | synthesizer, fridge, spice rack, fire extinguisher (gag) | DanDan | outlined |
| `R-OPS` | Ops nook | Eithan’s station; power puzzle | breaker board, manuals pile, gum jar, jumper drawer | Eithan | outlined |
| `R-CABIN` | Family cabin / bunks | DavDav play + item hide | bunks, toy rocket, blanket fort, nightlight | DavDav; others sleeping-in gag | outlined |
| `R-ENGINE` | Engineering crawl | Naomi hub; Act 1 resolve | conduit, wrench, warning labels, crawl hatch | Naomi | outlined |
| `R-CARGO` | Cargo cubby | Optional; Act 1 hook / Act 2 seed | mystery crate, loose bolt, family vacation junk | — | idea |
| `R-EXT` | Exterior / view port only | Title / cutscenes | stars, dented bumper sticker | — | idea |

### Room-writing template *(copy for new scenes)*
```
### [Room ID] — Name
- Mood / joke angle:
- Exits:
- Hotspots:
- Items found / placed:
- NPC scripts:
- Puzzles tied here:
- Fail gags:
- Art notes:
```

---

## Gameplay systems notes

High-level, SQ6-inspired. Implementation: **Godot 4 + Popochiu** (see Implementation readiness).

### Camera & control
- 3rd-person; click-to-move within painted rooms.
- Cursor modes or verb bar: **Walk / Look / Talk / Use** (and **Inventory**).
- Inventory items used on hotspots and NPCs (give/use).

### Dialogue
- Talk trees with short branches; callbacks to family roles.
- Banter when using wrong item on person (especially Joe + “contraband” breakfast).

### Inventory *(proposal starter set)*
| Item | How obtained | Likely use |
|------|--------------|------------|
| Alert Printout | Cockpit computer | Show Joe / Naomi |
| Security Badge | Corridor / DavDav sticky | Soften Joe’s protocol |
| Flavor Coil | DavDav’s toy rocket | Galley synthesizer |
| Funny Noise Cap | Maintenance panel | Trade with DavDav |
| Bypass Jumper (or Foil Spoon) | Ops / craft | Power brownout |
| Breakfast Brick | DanDan reward | Bribe / later gag |

### UI *(proposal)*
- Inventory tray / grid
- Save/load early (classic adventure courtesy)
- Comic-death restore is **canon** (not a “soft fail only” toggle)
- Subtitles for barks

### Accessibility / kindness *(proposal)*
- Hotspot highlight toggle
- No dead-man walking (softlocks avoided; Naomi/Eithan can hint)

---

## Art & audio direction *(proposal stubs)*

- Backgrounds: readable silhouette of a cramped family van-ship; warm practical lights + cool space out the windows.
- Characters: exaggerated proportions OK; each needs a clear idle fidget (Joe salute, DanDan tasting air, DavDav spinning).
- Music: light adventure theme with “sitcom in space” energy; short stingers for fails.
- Avoid: modern UI chrome that breaks SQ6 nostalgia unless user wants a hybrid.
- **Owner frames (repainted):** 80 frames each for Alan (`dad_frames`), Naomi (`mom_frames`), Joe, DanDan, Eithan, DavDav, **Bela**, **Cookie**. Sprites 112×128 RGBA, smooth painted 90s style. Same filenames as the previous set; the PNGs were replaced in place. Ship: 32 frames in `ship_frames`. Originals live in `assets/art/originals/` (folder names kept as delivered, including the `Charechter` spelling). Alan and Joe copies under `game/characters/*/frames/` match those files so existing scene paths stay valid.
- **Bridge source:** `assets/art/originals/bridge/` — `bridge_v5` cockpit background, 1024×576. Full-colour blink plus the **mugless pair** `bridge_v5_00_nomug.png` / `bridge_v5_01_nomug.png` (and `*_nomug_256.png`). `bridge_v5_mugpatch.png` paints the armrest mug back at (500, 135). `bridge_v5_depth.json` is the feet-y scale curve. `.gdignore`d. Playable cockpit uses the nomug blink under `game/rooms/cockpit/props/background/`.
- **Jack Grandma-call pack:** `assets/art/originals/jack/` from `art.zip` (overrides older alan_sleep / door / nomug copies). Sleep/wake + mug + Z’s, pocket door, depth json. Playable: `game/intro/frames/alan_sleep/`, `game/rooms/cockpit/props/door/`, nomug `bridge_v5_00/01.png`. Also copied under `game/bridge/` for room-level props. Notes: [art-notes.md](art-notes.md).
- **Bridge door (source):** `assets/art/originals/door/` and `assets/art/originals/jack/door/` — sliding pocket door, `.gdignore`d. Layout in `door.json`: origin (180, 48), 59×163, 12 fps, threshold y=219, walk-in (209, 225).
- **Alan chair intro (source):** `assets/art/originals/alan_sleep/` and `assets/art/originals/jack/alan_sleep/` — Alan asleep in the chair (`sleep_chair` 8 @ 6 fps, `wake_jolt` 6 @ 10 fps). Placement (462, 70). Mug sticks at (598, 128).
- **Sheets:** `assets/art/originals/sheets/` — character sheets, animation sheets, per-character `*_anims.json`, and `crew_overview.png` (also `.gdignore`d).
- **Grandma (viewscreen only):** Masked 145×89 RGBA frames, top-left at **(599, 40)** on `bridge_v5` (1024×576). The glass is a trapezoid; the frames are already alpha-masked, so the sprite stays axis-aligned. Animations `talk_down` (8), `idle` (2), and `judge` (4) loop at 8 fps. Game files: `game/characters/grandma/frames/`, `grandma_sprite_frames.tres`, `grandma_viewscreen.tscn` (`AnimatedSprite2D`, `centered = false`). Source (1×, 2×, bust layers, mask, sheet, previews, `grandma_anims.json`) is in `assets/art/originals/grandma/` with `.gdignore`. She is not instanced into the 640×360 cockpit.

### Using the painted bridge

The playable cockpit is already **1024×576** with the nomug `bridge_v5` blink. New Game plays the space flyby, then the live Chaya call in `game/intro/grandma_call.tscn` (Jack sleep/door + Grandma viewscreen). `game/bridge/` keeps drop-in props for the room.

| Piece | Ready to instance | What it does |
|-------|-------------------|--------------|
| Background | `game/bridge/background/prop_bridge_v5.tscn` | `bridge_v5_00_nomug` centred at (512, 288). `play_blink()` alternates 00/01. Mug patch at room (500, 135) stays hidden. |
| Door | `game/bridge/door/prop_bridge_door.tscn` | Overlay at (180, 48). SpriteFrames: `open`, `close`, `closed` (`door_open_00`), `open_hold`, 12 fps. Walk-in (209, 225), threshold y=219, inside spot (229, 259). Plays the slide; does not change rooms. |
| Alan asleep | `game/bridge/alan_sleep/alan_chair_sleep.tscn` | Instance at (0, 0). Snores on ready (`sleep_chair`, 8×6 fps, zzz, mug bob). `play_wake()` is the jolt (6×10 fps); the mug follows `alan_sleep.json` and sticks at (598, 128). Say `I'M AWAKE! I'M DRIVING!`. |
| Depth | `game/bridge/bridge_depth_scale.tscn` | `scale = clamp(0.12/104 * feet_y + 1.0, 1.10, 1.70)` for a 104px sprite, feet at the origin. Same numbers as `bridge_v5_depth.json`. |
| Grandma | `game/characters/grandma/grandma_viewscreen.tscn` | Viewscreen at (599, 40). `show_call()` / `hide_call()`. `talk_down`, `idle`, `judge` at 8 fps. |

Steps when the room is ready:

1. Set the cockpit room to **1024×576**. Leave the project viewport at 640×360; Popochiu will scroll.
2. Replace the Background prop with `prop_bridge_v5.tscn`.
3. Instance the door under Props (root stays at 180, 48), `alan_chair_sleep.tscn` at (0, 0) for the intro, and `game/characters/grandma/grandma_viewscreen.tscn` for the call (`show_call()`).
4. Add `bridge_depth_scale.tscn` as a child of the room. Do **not** add it to the placeholder: it would scale Alan with the 1024 curve inside a 640 room.
5. Retune the walkable area, hotspots, and spawn points (door walk-in 209, 225; chair feet around y=190).

`game/bridge/bridge_depth_region.tscn` is the same line as a Popochiu scaling region (1.10 at y≈86.67, 1.70 at y≈606.67). Alan and Joe have a point ScalingPolygon, so that region does not see them. Use `BridgeDepthScale` until those polygons have area. Do not enable both.

The curve targets a **104px** puppet. The walk sprites in `game/characters/` are **128px** tall with feet at the origin. Leave `height_ratio` at 1 to apply the published scale. Set it to `104.0/128.0` only if those taller puppets should match the pixel heights on `bridge_depth_check.png`.

`mug_path` rotations are already drawn into `mug_wake_XX.png` (frame 00 is the upright mug, frame 05 is the stuck mug). The AnimationPlayer moves and swaps those frames; it does not rotate them a second time.

---

## Implementation readiness

| Topic | Status |
|-------|--------|
| Engine / framework | **Locked:** Godot 4 + [Popochiu](https://github.com/carenalgas/popochiu) (2D point-and-click). First slice uses **Godot 4.7** + **Popochiu 2.2.1**. |
| Verbs / UI | Popochiu **Sierra High-Res** GUI: Walk / Look / Interact (Use) / Talk + inventory popup. SQ6-style. |
| Target platforms | **Windows + web** export. |
| Resolution / aspect | Slice uses **1024×576** (16:9, matches `bridge_v5` and startscreen frames). Stretch `canvas_items` + `keep`, nearest filter. Default window 1280×720. |
| Art pipeline | Repainted owner PNG frames (112×128 RGBA, same paths) under `assets/art/originals/`. Alan/Joe copies under `game/characters/` match them. Painted bridge `bridge_v5` (1024×576, blink frames 00/01) is the playable cockpit background (`game/rooms/cockpit/props/background/`). Corridor BG is still a placeholder. Start-screen loop lives in `assets/art/originals/startscreen/` (not `.gdignore`d, so it exports). |
| Start / title screen | First scene. Looping owner frames (360 × 12 fps). Title **Are We There Yet? (Galaxy edition)** is **overlay text**, not painted into the art. Buttons: New Game, Load Game (10 slots), Quit. **New Game → skippable intro → painted bridge.** |
| Intro | Space flyby in [docs/intro-script.md](intro-script.md), then live Chaya call in [docs/grandma-call-script.md](grandma-call-script.md). Click-advance. Esc skips remaining cinematic. |
| Save / load | 10 Popochiu slots (`user://save_%d.json`). Esc opens the in-game menu (save / load / title / quit). Esc still skips the intro and cutscenes. |
| Grandma viewscreen | `game/characters/grandma/grandma_viewscreen.tscn` at (599, 40) on `bridge_v5`. `talk_down` / `idle` / `judge` @ 8 fps. Used in the live Chaya call. Source `.gdignore`d under `assets/art/originals/grandma/`. |
| Repo structure | Godot project at repo root (`project.godot`). Game content in `game/`. Canon docs in `docs/project-context.md`, `docs/intro-script.md`, and `docs/grandma-call-script.md`. |

---

## Open questions / TBD

Decisions that unblock sharper design:

1. **Player character** — Confirm Alan-at-start, or Naomi / kid / swap system? (Slice currently plays as Alan.)
2. **Scope of Act 1** — Ship-only vertical slice, or include one exterior / station tease?
3. **Act 1 → Act 2 hook** — **Open.** Owner is still working on Act 1. Do not propose or lock a hook.
4. **Art style fidelity** — Closest to SQ6 VGA/SVGA painted look, or a cleaner modern homage?
5. **Multi-character puzzles** — Stay single-PC or allow temporary control of Eithan/Joe/etc.?
6. **Bela / Cookie ages and distinct roles** — Canon family dogs; confirm ages and whether one is “Joe’s K9” vs galley mooch, or just both pets.

---

## Decision log

Record choices here so the living doc doesn’t argue with itself.

| Date | Decision | Notes |
|------|----------|-------|
| 2026-11-01 | Canon crew names, ages, roles locked | Alan, Naomi, Joe, DanDan, Eithan, DavDav; ship = The Millennium Mini Van |
| 2026-11-01 | Style reference locked | Space Quest 6 graphics & gameplay feel |
| 2026-11-01 | Opening plan drafted as **proposal** | Alan start; morning systems cascade; see Act 1 section |
| 2026-11-01 | **Game title locked** | **Are We There Yet? (Galaxy edition)**. GitHub repo may stay `Space-Blip-Family`. |
| 2026-11-01 | **Tech locked** | **Godot 4 + Popochiu** (2D, SQ6-style verbs, inventory, dialogue). Target **Windows + web**. First slice: Godot 4.7 + Popochiu 2.2.1, Sierra High-Res verb bar. |
| 2026-11-01 | **Bela and Cookie locked as family dogs** | Canon names + role. Sprite folders `bela_frames` / `cookie_frames` (bark/beg frames). Ages and personality remain **proposals** — owner should confirm. |
| 2026-11-01 | **Fail style locked: comic death** | Classic Sierra. Always funny, instant restore, PG, never mean toward the kids. |
| 2026-11-01 | Act 1 → Act 2 hook stays **open** | Owner still working on Act 1. No hook proposed or locked. |
| 2026-11-01 | Start-screen title is **overlay text** | Not baked into the animated background. Overlay string: **Are We There Yet? (Galaxy edition)**. |
| 2026-11-01 | Repainted characters + bridge source art | Eight characters × 80 frames replaced in place (smooth 90s paint, 112×128 RGBA), including Alan/Joe game copies. `bridge_v5` and sheets added under `assets/art/originals/`. |
| 2026-11-01 | **Canon intro shipped** | New Game plays [intro-script.md](intro-script.md). LMB / Space / Enter advances (first press finishes a typing line). Esc skips the whole intro. Title card uses **Are We There Yet? (Galaxy edition)** + Episode 1: Grandma's Calling. |
| 2026-11-01 | Painted bridge is the playable cockpit | `bridge_v5` 1024×576 blink frames. Hotspots and walkable area remapped. Player is Alan. |
| 2026-11-01 | Live Grandma call is **Chaya**, ~10s after arriving on the bridge | Canon [grandma-call-script.md](grandma-call-script.md). No 20:00 countdown; Grandma calling back is a later beat. |
| 2026-11-01 | Display locked to **1024×576** | Matches painted bridge and startscreen. Stretch keep + nearest. Sierra verb bar shrunk; `experimental_scale_gui` off. |
| 2026-11-01 | Alan walk + intro quality pass | Walk clips no longer restart every physics frame. Intro is click-advanced, nearest-filtered, tweened flyby. |
| 2026-11-01 | Repainted characters + bridge source art | Eight characters × 80 frames replaced in place (smooth 90s paint, 112×128 RGBA), including Alan/Joe game copies. `bridge_v5` and sheets added under `assets/art/originals/`. Cockpit scene still uses the placeholder background. |
| 2026-11-01 | Bridge door, mugless background, Alan chair intro, depth curve | Game resources under `game/bridge/`. Background going forward is `bridge_v5_*_nomug`. Live cockpit stays the 640×360 placeholder until hotspots and the walk polygon are retuned. See [Using the painted bridge](#using-the-painted-bridge). |
| 2026-11-01 | Grandma is a viewscreen character | Video call only, on the bridge glass. Frames and `grandma_viewscreen.tscn` live under `game/characters/grandma/`. Source art in `assets/art/originals/grandma/` (`.gdignore`d). Cockpit scene unchanged. |
| 2026-11-01 | Grandma-call walk-ins empty-handed | No coffee / manual / frying pan sprites or placeholder labels. Dialogue that mentions a prop stays. |
| 2026-11-01 | Grandma-call speakers use Jack mouth frames | Alan, Naomi, Joe, DanDan, Eithan, DavDav loop 4-frame talk mouths (closed/half/open/half) at 8 fps. `talk_left` is mirrored `talk_right`. `talk_up` holds idle_up. Old gesture talk frames removed from talk anims. |

---

## How to expand this doc

- New **rooms** → add a row to the locations index + a filled room template under a `## Scenes` appendix (create when needed).
- New **plot** → update Storyline overview; move settled proposals into Decision log.
- New **puzzles** → attach under the room they live in; keep a one-line entry in the beat sheet if Act-level.
- Never delete canon quietly — strike or move to Decision log with date.
