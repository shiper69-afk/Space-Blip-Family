import Phaser from 'phaser';
import openSansUrl from '../archive/godot/addons/popochiu/engine/objects/gui/fonts/open_sans_regular.ttf';
import { EpisodeScene } from './scenes/EpisodeScene';
import { StartScene } from './scenes/StartScene';
import './style.css';
import { HEIGHT, WIDTH } from './theme';

async function boot(): Promise<void> {
  try {
    const style = document.createElement('style');
    style.textContent = `@font-face{font-family:"Open Sans";src:url(${JSON.stringify(openSansUrl)}) format("truetype");font-display:swap;}`;
    document.head.appendChild(style);
    await document.fonts.load('32px "Open Sans"');
  } catch {
    // Verdana / generic sans in the font stack still draws the title.
  }

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: '#000000',
    banner: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: WIDTH,
      height: HEIGHT,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    audio: { noAudio: true },
    scene: [StartScene, EpisodeScene],
  });
}

void boot();
