# Are We There Yet? (Galaxy edition)

A comedy point-and-click about a family stuck aboard **The Millennium Mini Van**.

The playable build is an HTML5 game (Vite, TypeScript, Blip Engine) at **1920×1080**. The canvas letterboxes to the window and stays sharp on high-DPI screens. Press **F3** for the debug overlay (FPS, hit areas, mouse).

The Godot 4.7 game is unchanged on tag **`godot-final`** and branch **`godot-archive`**. On this branch the engine files live in `archive/godot/` and are not a standalone project — the art stayed in `assets/art/`. Check out `godot-archive` to open `project.godot`.

## Run locally

```bash
npm install
npm run dev
```

Vite prints a local URL (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

`npm run build` typechecks and writes `dist/`.

## Start screen

The menu is a procedural canvas (rotating Earth, orbiting planets, galaxies, crossing ships) with **Start Game** and **Load Game**. Start Game plays `assets/hd/intro/intro-2.mp4`, fades to black, then fades in `intro-scene-2.mp4` (both fitted inside the 1920×1080 frame, with sound). Click, Esc, or Space skips the intro. A title card, **Episode 1: Grandma is calling**, then the opening scene on the bridge. Load Game shows ten empty slots. There is no Quit control.

Design notes still live in `docs/`.
