import openSansUrl from '../archive/godot/addons/popochiu/engine/objects/gui/fonts/open_sans_regular.ttf';
import { Blip } from './engine/game';
import { startScene } from './game/scenes';
import './style.css';

async function boot(): Promise<void> {
  try {
    const style = document.createElement('style');
    style.textContent = `@font-face{font-family:"Open Sans";src:url(${JSON.stringify(openSansUrl)}) format("truetype");font-display:swap;}`;
    document.head.appendChild(style);
    await document.fonts.load('32px "Open Sans"');
  } catch {
    // Verdana still draws the title card.
  }

  const parent = document.getElementById('game');
  if (!parent) throw new Error('Missing #game');
  const game = new Blip(parent);
  game.replace(startScene());
}

void boot();
