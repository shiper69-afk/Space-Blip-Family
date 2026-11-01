"""
Drop-in start-screen background for pygame.
Streams the 360 indexed PNG frames from ./frames (decoding one per tick on a small prefetch thread),
so memory stays tiny (the full loop would be ~850 MB as 32-bit surfaces).

    bg = StartBackground('startscreen')          # folder containing startbg.json + frames/
    ...
    bg.update(dt_seconds)                        # call once per game tick
    bg.draw(screen)                              # blit the current frame (1024x576)

Run this file directly for a stand-alone preview:  python play_startscreen_bg.py
"""
import json, os, threading, queue
import pygame


class StartBackground:
    def __init__(self, folder='.', prefetch=6):
        self.folder = folder
        cfg = json.load(open(os.path.join(folder, 'startbg.json')))
        self.fps, self.count = cfg['fps'], cfg['frames']
        self.pattern = os.path.join(folder, 'frames', cfg['pattern'])
        self.t = 0.0
        self.idx = 0
        self.surf = None
        self.q = queue.Queue(maxsize=prefetch)
        self._next = 0
        self._stop = False
        threading.Thread(target=self._loader, daemon=True).start()
        self.surf = self._get(0)

    def _load(self, i):
        return pygame.image.load(self.pattern % (i % self.count))

    def _loader(self):
        while not self._stop:
            i = self._next
            try:
                self.q.put((i, self._load(i)), timeout=0.2)
                self._next = (i + 1) % self.count
            except queue.Full:
                pass

    def _get(self, i):
        return self._load(i)

    def update(self, dt):
        self.t += dt
        want = int(self.t * self.fps) % self.count
        while self.idx != want:
            try:
                i, s = self.q.get(timeout=0.05)
            except queue.Empty:
                break
            self.idx = i
            self.surf = s

    def draw(self, screen, pos=(0, 0)):
        screen.blit(self.surf, pos)

    def close(self):
        self._stop = True


if __name__ == '__main__':
    pygame.init()
    screen = pygame.display.set_mode((1024, 576))
    pygame.display.set_caption('Are We There Yet? (Galactic Edition) - start screen background')
    bg = StartBackground(os.path.dirname(os.path.abspath(__file__)))
    clock = pygame.time.Clock()
    running = True
    while running:
        dt = clock.tick(60) / 1000.0
        for e in pygame.event.get():
            if e.type == pygame.QUIT or (e.type == pygame.KEYDOWN and e.key == pygame.K_ESCAPE):
                running = False
        bg.update(dt)
        bg.draw(screen)
        pygame.display.flip()
    bg.close()
