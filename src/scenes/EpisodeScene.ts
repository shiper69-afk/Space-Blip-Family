import Phaser from 'phaser';
import { addBackground, queueStartArt } from '../background';
import { FONT, HEIGHT, WIDTH, s } from '../theme';
import { addButton } from '../ui';

export class EpisodeScene extends Phaser.Scene {
  constructor() {
    super('episode');
  }

  preload(): void {
    queueStartArt(this.load);
  }

  create(): void {
    addBackground(this);
    const panelW = s(520);
    const panelH = s(180);
    this.add
      .rectangle(WIDTH / 2, HEIGHT / 2, panelW, panelH, 0x0a0d1a, 0.92)
      .setStrokeStyle(s(2), 0xd9b338, 0.9)
      .setDepth(2);
    this.add
      .text(WIDTH / 2, HEIGHT / 2 - s(28), 'Episode 1 coming soon', {
        fontFamily: FONT,
        fontSize: `${s(28)}px`,
        color: '#ffdb47',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(3);
    const back = addButton(this, WIDTH / 2, HEIGHT / 2 + s(36), 'Back', () => this.scene.start('start'), {
      width: s(220),
      height: s(36),
      fontSize: s(20),
    });
    back.bg.setDepth(3);
    back.label.setDepth(4);
  }
}
