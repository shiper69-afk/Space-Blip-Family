import introUrl from '../../assets/hd/intro/intro-2.mp4';
import sceneUrl from '../../assets/hd/intro/intro-scene-2.mp4';
import './intro.css';

const FADE_MS = 750;

/**
 * Play intro-2, fade to black, then fade in intro-scene-2.
 * play() starts in the Start Game gesture so audio is allowed.
 * Returns a cancel function that does not continue into the episode.
 */
export function playIntro(onDone: () => void): () => void {
  const root = document.createElement('div');
  root.className = 'intro-cutscene';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Intro');

  const first = document.createElement('video');
  const second = document.createElement('video');
  for (const video of [first, second]) {
    video.playsInline = true;
    video.preload = 'auto';
    video.controls = false;
    video.disablePictureInPicture = true;
  }
  first.src = introUrl;
  second.src = sceneUrl;
  second.classList.add('is-out');
  second.muted = true;

  const hint = document.createElement('p');
  hint.className = 'intro-skip';
  hint.textContent = 'Click, Esc, or Space to skip';
  root.append(first, second, hint);
  document.body.appendChild(root);

  const place = () => {
    const canvas = document.querySelector('#game canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      root.style.inset = '0';
      return;
    }
    const rect = canvas.getBoundingClientRect();
    root.style.left = `${rect.left}px`;
    root.style.top = `${rect.top}px`;
    root.style.width = `${rect.width}px`;
    root.style.height = `${rect.height}px`;
  };
  place();

  let finished = false;
  let armed = false;
  let showingSecond = false;
  let fadeTimer = 0;

  const finish = (notify: boolean) => {
    if (finished) return;
    finished = true;
    window.clearTimeout(fadeTimer);
    window.removeEventListener('keydown', onKey);
    root.removeEventListener('pointerdown', onSkip);
    window.removeEventListener('resize', place);
    first.pause();
    second.pause();
    root.remove();
    if (notify) onDone();
  };

  const showSecond = () => {
    if (finished || showingSecond) return;
    showingSecond = true;
    second.classList.remove('is-out');
    second.muted = false;
    void second.play().catch(() => finish(true));
  };

  const fadeToSecond = () => {
    if (finished || showingSecond) return;
    first.pause();
    first.classList.add('is-out');
    fadeTimer = window.setTimeout(showSecond, FADE_MS);
  };

  const onSkip = () => {
    if (armed) finish(true);
  };
  const onKey = (event: KeyboardEvent) => {
    if (!armed || event.repeat) return;
    if (event.key === 'Escape' || event.key === ' ' || event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
      finish(true);
    }
  };

  first.addEventListener('ended', fadeToSecond);
  first.addEventListener('error', fadeToSecond);
  second.addEventListener('ended', () => finish(true));
  second.addEventListener('error', () => finish(true));
  root.addEventListener('pointerdown', onSkip);
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', place);

  void first.play().catch(() => fadeToSecond());
  void second.play().then(() => {
    if (finished || showingSecond) return;
    second.pause();
    if (second.currentTime > 0) second.currentTime = 0;
  }).catch(() => {
    if (!showingSecond) second.muted = false;
  });

  requestAnimationFrame(() => {
    armed = true;
  });

  return () => finish(false);
}
