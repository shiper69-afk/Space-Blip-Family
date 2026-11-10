# Are We There Yet? (Galaxy edition)

A comedy point-and-click about a family stuck aboard **The Millennium Mini Van**.

The playable build is an HTML5 game (Vite, TypeScript, Phaser 3) at **1920×1080**. It scales to fit the window and keeps a 16:9 frame. Phaser is there so later rooms, verbs, and inventory have a scene and input model instead of a one-off canvas.

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

The menu is a procedural canvas (rotating Earth, orbiting planets, galaxies, crossing ships) with **Start Game** and **Load Game**. Start Game plays `assets/hd/intro/intro-2.mp4` (fitted inside the 1920×1080 frame, with sound), then the “Episode 1 coming soon” card. Click, Esc, or Space skips the intro. Load Game shows ten empty slots. There is no Quit control. Original frames remain in `assets/art/originals/startscreen/`. The episode card still uses `assets/hd/startscreen/`.

Design notes still live in `docs/`.
