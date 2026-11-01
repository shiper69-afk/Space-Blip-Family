START SCREEN BACKGROUND  -  "Are We There Yet? (Galactic Edition)"

frames/startbg_0000.png ... startbg_0359.png   1024x576, 256-colour indexed PNG, one shared palette
startbg.json                                   fps, frame count, warp event times, ship stop positions
play_startscreen_bg.py                         pygame helper (streams frames, tiny memory footprint)
startbg_timeline_contact_sheet.png             16 key frames across the warp cycle
preview_first_10s.gif                          half-res preview of the first cycle (not for use in game)
bg_gen.py                                      generator (needs the ship sprite sets from ship_gen.py, see below)

TIMING   12 fps, 360 frames = 30 s seamless loop = three 10-second warp cycles
         per 10 s cycle (120 frames):  0-65 idle | 66-77 warp charge | 78-85 jump | 86-90 empty sky
                                       91-92 arrival flash | 93-100 drop out of warp | 101-119 idle
         warp #1 at 5.5 s (stop 0 -> 1), #2 at 15.5 s (1 -> 2), #3 at 25.5 s (2 -> 0)

LAYERS   starfield (twinkling), nebula, 3 spiral galaxies (1, -2, 2 turns per loop),
         ringed gas giant (1 turn per loop), ocean world with orbiting moon (-2 turns per loop), family ship

REGENERATE   python3 bg_gen.py <outdir>      (expects ship sets rendered with SHIP_K=0.673 / 0.596 / 0.50:
             SHIP_K=0.673 python3 ship_gen.py /path/shipset_0.673 ... and the paths in bg_gen.py load_ship)
