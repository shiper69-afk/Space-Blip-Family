import introUrl from '../../assets/hd/intro/intro-2.mp4';
import './intro.css';

/**
 * Play intro-2. play() runs in the Start Game gesture so audio is allowed.
 * Returns a cancel function that does not continue into the episode.
 */
export function playIntro(onDone: () => void): () => void {
  const root = document.createElement('div');
  root.className = 'intro-cutscene';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-label', 'Intro');

  const video = document.createElement('video');
  video.playsInline = true;
  video.preload = 'auto';
  video.controls = false;
  video.disablePictureInPicture = true;
  video.src = introUrl;

  const hint = document.createElement('p');
  hint.className = 'intro-skip';
  hint.textContent = 'Click, Esc, or Space to skip';
  root.append(video, hint);
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

  const finish = (notify: boolean) => {
    if (finished) return;
    finished = true;
    window.removeEventListener('keydown', onKey);
    root.removeEventListener('pointerdown', onSkip);
    window.removeEventListener('resize', place);
    video.pause();
    root.remove();
    if (notify) onDone();
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

  video.addEventListener('ended', () => finish(true));
  video.addEventListener('error', () => finish(true));
  root.addEventListener('pointerdown', onSkip);
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', place);

  void video.play().catch(() => finish(true));
  requestAnimationFrame(() => {
    armed = true;
  });

  return () => finish(false);
}
