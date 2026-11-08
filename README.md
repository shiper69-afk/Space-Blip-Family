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

Original frames stay in `assets/art/originals/startscreen/` (1024×576, 360 frames, 12 fps). The upscale is `assets/hd/startscreen/start-bg.mp4` (and `start-poster.png`): RGB Lanczos to 1920×1080, packed as one H.264 loop so the repo is not 360 loose 1080p PNGs. This machine has no GPU, so Real-ESRGAN was not used. The title is drawn on top, as in the Godot screen. **Start Game** opens an “Episode 1 coming soon” card. **Load Game** shows ten empty slots.

Design notes still live in `docs/`.
