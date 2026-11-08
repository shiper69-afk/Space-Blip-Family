import '@fontsource/bungee/400.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import { startSpaceView } from '../space/view';
import './start-screen.css';

const SLOT_COUNT = 10;

export type StartHooks = {
  onStart: () => void;
};

/** Full-viewport procedural start screen. Caller must invoke the returned cleanup. */
export function mountStartScreen(hooks: StartHooks): () => void {
  const root = document.createElement('div');
  root.id = 'start-root';
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => `<div class="slot">Slot ${i + 1}  —  empty</div>`).join('');
  root.innerHTML = `
    <canvas id="space" aria-hidden="true"></canvas>
    <div class="vignette" aria-hidden="true"></div>
    <div id="loader" role="status"><div class="orbit"></div><div>CHARTING THE STARS</div><div class="bar"><i id="loadbar"></i></div></div>
    <main class="ui">
      <header class="hero">
        <div class="title-wrap"><h1 class="title">Are We There Yet?</h1></div>
        <p class="subtitle">(Galaxy edition)</p>
      </header>
      <div class="bottom">
        <nav class="menu" role="menu" aria-label="Main menu">
          <button class="btn" type="button" role="menuitem" data-action="start" style="--i:0">Start Game</button>
          <button class="btn" type="button" role="menuitem" data-action="load" style="--i:1">Load Game</button>
        </nav>
        <footer class="foot">
          <p class="keys"><kbd>N</kbd>/<kbd>Enter</kbd> start &nbsp; <kbd>L</kbd> load &nbsp; <kbd>↑</kbd><kbd>↓</kbd> choose</p>
        </footer>
      </div>
    </main>
    <div class="load" id="load-panel" hidden>
      <div class="load-card" role="dialog" aria-modal="true" aria-labelledby="load-heading">
        <h2 id="load-heading">Load Game</h2>
        ${slots}
        <button class="btn" type="button" id="load-back">Back</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.menu .btn'));
  const loadPanel = root.querySelector<HTMLElement>('#load-panel')!;
  const back = root.querySelector<HTMLButtonElement>('#load-back')!;
  const bar = root.querySelector<HTMLElement>('#loadbar');
  const canvas = root.querySelector<HTMLCanvasElement>('#space')!;
  let selected = 0;
  let loadOpen = false;
  let disposed = false;

  const select = (i: number) => {
    selected = (i + buttons.length) % buttons.length;
    buttons.forEach((b, k) => b.classList.toggle('sel', k === selected));
  };

  const setLoad = (open: boolean) => {
    loadOpen = open;
    loadPanel.classList.toggle('open', open);
    loadPanel.hidden = !open;
    if (open) back.focus();
  };

  const activate = (action: string) => {
    if (disposed || loadOpen) return;
    const btn = buttons.find((b) => b.dataset.action === action);
    if (btn) {
      btn.classList.add('pressed');
      window.setTimeout(() => btn.classList.remove('pressed'), 180);
      select(buttons.indexOf(btn));
    }
    if (action === 'start') hooks.onStart();
    else if (action === 'load') setLoad(true);
  };

  const onClick = (event: Event) => {
    const btn = event.currentTarget as HTMLButtonElement;
    activate(btn.dataset.action || '');
  };
  const onEnter = (event: Event) => {
    const btn = event.currentTarget as HTMLButtonElement;
    select(buttons.indexOf(btn));
  };
  buttons.forEach((b) => {
    b.addEventListener('click', onClick);
    b.addEventListener('mouseenter', onEnter);
    b.addEventListener('focus', onEnter);
  });

  const onKey = (e: KeyboardEvent) => {
    if (disposed || e.metaKey || e.ctrlKey || e.altKey) return;
    if (loadOpen) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'Backspace') {
        e.preventDefault();
        setLoad(false);
      }
      return;
    }
    const k = e.key;
    if (k === 'ArrowDown' || k === 's' || k === 'S' || (k === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      select(selected + 1);
    } else if (k === 'ArrowUp' || k === 'w' || k === 'W' || (k === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      select(selected - 1);
    } else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      if (!e.repeat) activate(buttons[selected].dataset.action || '');
    } else if (k === 'n' || k === 'N') activate('start');
    else if (k === 'l' || k === 'L') activate('load');
  };
  const onBack = () => setLoad(false);
  back.addEventListener('click', onBack);
  window.addEventListener('keydown', onKey);
  select(0);

  const stopSpace = startSpaceView(canvas, (p: number) => {
    if (bar) bar.style.width = `${Math.round(p * 100)}%`;
    if (p >= 1) root.classList.add('ready');
  });

  return () => {
    if (disposed) return;
    disposed = true;
    stopSpace();
    window.removeEventListener('keydown', onKey);
    buttons.forEach((b) => {
      b.removeEventListener('click', onClick);
      b.removeEventListener('mouseenter', onEnter);
      b.removeEventListener('focus', onEnter);
    });
    back.removeEventListener('click', onBack);
    root.remove();
  };
}
