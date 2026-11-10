import intro1Url from '../../assets/hd/intro/intro-1.mp4';
import intro2Url from '../../assets/hd/intro/intro-2.mp4';
import './intro.css';

/**
 * Play intro-1 then intro-2. play() runs in the Start Game gesture so audio is allowed.
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
  first.src = intro1Url;
  second.src = intro2Url;
  second.classList.add('is-idle');
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

  const finish = (notify: boolean) => {
    if (finished) return;
    finished = true;
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
    first.classList.add('is-idle');
    first.pause();
    second.classList.remove('is-idle');
    second.muted = false;
    void second.play().catch(() => finish(true));
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

  first.addEventListener('ended', showSecond);
  first.addEventListener('error', showSecond);
  second.addEventListener('ended', () => finish(true));
  second.addEventListener('error', () => finish(true));
  root.addEventListener('pointerdown', onSkip);
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', place);

  // Same user gesture as Start Game. Prime the second clip so its later play() keeps sound.
  void first.play().catch(() => showSecond());
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
