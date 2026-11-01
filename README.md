# Are We There Yet? (Galaxy edition)

A comedy point-and-click adventure about a family stuck aboard **The Millennium Mini Van**.  
Space Quest 6 energy: walk, look, talk, use, inventory, and rooms that argue back.

The GitHub repository is still named **Space-Blip-Family**.

## Playable slice (this PR)

- **Engine:** Godot **4.7** + [Popochiu](https://github.com/carenalgas/popochiu) **2.2.1**
- **Rooms:** Cockpit (`R-COCKPIT`) and mid-ship corridor (`R-CORRIDOR`)
- **Player:** Alan (Dad / Captain) using the owner `dad_frames`
- **NPC:** Joe in the corridor using `joe_frames`
- **Verbs:** Walk / Look / Talk / Interact (Use) — Sierra-style top bar
- **Puzzle:** amber-alert hotspot in the cockpit → **Alert Printout** → give it to Joe
- **Exports targeted:** Windows and web (export from the Godot editor; templates required)
- **Start screen:** looping owner background (`startscreen` 360 frames). Title **Are We There Yet? (Galaxy edition)** is **text overlaid** on that animation — it is not painted into the art.
- **Save / load:** 10 slots (timestamp + room). **New Game / Load Game / Quit** on the title screen; **Esc** opens the same slots in-game (Resume / Save / Load / Return to Title / Quit). Esc still skips cutscenes.
- **Intro:** New Game plays the skippable canon intro ([docs/intro-script.md](docs/intro-script.md)). Click or Esc skips. Title card is **Are We There Yet? (Galaxy edition)** / Episode 1: Grandma's Calling.
- **Art:** character frames are the repainted 90s owner set (112×128). The cockpit uses the painted `bridge_v5` (1024×576, blink frames). Corridor background is still a placeholder.
- **Bela and Cookie** are canon family dogs (frames in `bela_frames` / `cookie_frames`). They are not on stage in this slice.

Living canon: [`docs/project-context.md`](docs/project-context.md)

## How a beginner opens and runs this on Windows

1. **Install Godot 4.7**
   - Go to [https://godotengine.org/download](https://godotengine.org/download)
   - Download **Godot 4.7.x** (standard, not .NET / C#)
   - Unzip it anywhere. You get `Godot_v4.7.x-stable_win64.exe`
   - You do **not** need to “install” it. Double-click the exe.

2. **Get this project**
   - Clone or download this repository
   - You want the folder that contains `project.godot`

3. **Open it**
   - Run Godot
   - Click **Import**
   - Browse to this folder, select `project.godot`, click **Import & Edit**
   - The first open imports textures. Wait until the spinner in the bottom-right stops.

4. **If Popochiu asks to set up**
   - This project is already set up (Sierra High-Res GUI, Alan as the player, start screen as the main scene)
   - If a setup wizard appears, close it. Do not recreate rooms.

5. **Play**
   - Press **F5** (or the Play button in the top-right)
   - The start screen plays the looping space background with the title drawn on top
   - **New Game** plays the intro, then the painted bridge with Alan. **Load Game** opens 10 slots (no intro). **Quit** exits
   - In-game, press **Esc** for save / load / return to title
   - Move the mouse to the **top of the window** to show the verb bar
   - **Walk / Look / Talk / Interact** (Interact = Use)
   - Left-click uses the selected verb. Right-click cycles verbs
   - Open **Inventory** from the top bar after you take the printout

6. **What to do in the slice**
   - In the cockpit: **Look** or **Interact** the blinking amber light → get the **Alert Printout**
   - **Interact** the aft hatch (right side) to reach the corridor
   - **Talk** to Joe. He wants authorization
   - Open inventory, select the printout, **Interact** / use it on Joe
   - He accepts it. You can walk back to the cockpit through the left hatch

7. **Export later (Windows + web)**
   - In Godot: **Editor → Manage Export Templates** and download templates for 4.7
   - **Project → Export…** → add **Windows Desktop** and **Web**
   - Web builds need to be served over HTTP (not a raw `file://` open)

## Art

Owner frames live at:

`assets/art/originals/Charechter Animation/`  
`assets/art/originals/Non Charechter Animation/ship_frames/`  
`assets/art/originals/startscreen/`  
`assets/art/originals/bridge/` (`bridge_v5`, 1024×576, full colour + 256-colour, blink frames 00/01, plus preview)  
`assets/art/originals/sheets/` (character sheets, animation sheets, `*_anims.json`)

The eight character sets were **repainted** (smooth 90s style, 112×128 RGBA) and replaced in place. Folder and file names match the original delivery (including the `Charechter` spelling). Do not rename those files.

`bridge/` and `sheets/` are `.gdignore`d source art, same as the character originals. Playable blink copies of `bridge_v5_00` / `01` live under `game/rooms/cockpit/props/background/`.

Working copies used by Alan and Joe animations live under `game/characters/*/frames/` and were updated to the same PNGs. Scene paths are unchanged.

## License notes

Popochiu is MIT-licensed and vendored in `addons/popochiu/`.
