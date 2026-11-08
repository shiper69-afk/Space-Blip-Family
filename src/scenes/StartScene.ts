import Phaser from 'phaser';
import { addBackground, queueStartArt } from '../background';
import { FONT, HEIGHT, TITLE, WIDTH, s } from '../theme';
import { addButton, type UiButton } from '../ui';

const SLOT_COUNT = 10;

export class StartScene extends Phaser.Scene {
  private menu: UiButton[] = [];
  private loadRoot?: Phaser.GameObjects.Container;

  constructor() {
    super('start');
  }

  preload(): void {
    queueStartArt(this.load);
  }

  create(): void {
    addBackground(this);

    const band = this.add.rectangle(WIDTH / 2, s(68), WIDTH - s(80), s(80), 0x000000, 0.45);
    band.setDepth(2);
    const title = this.add
      .text(WIDTH / 2, s(68), TITLE, {
        fontFamily: FONT,
        fontSize: `${s(32)}px`,
        color: '#ffdb47',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(3);
    title.setShadow(s(2), s(2), '#000000', 0.85, false, true);

    const newGameY = s(426);
    const loadGameY = s(470);
    this.menu = [
      addButton(this, WIDTH / 2, newGameY, 'Start Game', () => this.scene.start('episode')),
      addButton(this, WIDTH / 2, loadGameY, 'Load Game', () => this.showLoad(true)),
    ];
    for (const button of this.menu) {
      button.bg.setDepth(3);
      button.label.setDepth(4);
    }

    this.loadRoot = this.buildLoadMenu();
    this.showLoad(false);
  }

  private buildLoadMenu(): Phaser.GameObjects.Container {
    const panelW = s(440);
    const panelH = s(360);
    const root = this.add.container(WIDTH / 2, HEIGHT / 2).setDepth(10);
    const dim = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.45);
    const panel = this.add
      .rectangle(0, 0, panelW, panelH, 0x0a0d1a, 0.92)
      .setStrokeStyle(s(2), 0xd9b338, 0.9);
    const heading = this.add
      .text(0, -panelH / 2 + s(28), 'Load Game', {
        fontFamily: FONT,
        fontSize: `${s(22)}px`,
        color: '#ffd947',
      })
      .setOrigin(0.5);

    const rows: Phaser.GameObjects.GameObject[] = [];
    const firstY = -panelH / 2 + s(62);
    const step = s(26);
    for (let slot = 1; slot <= SLOT_COUNT; slot += 1) {
      const y = firstY + (slot - 1) * step;
      rows.push(
        this.add.rectangle(0, y, panelW - s(28), s(24), 0x000000, 0.55),
        this.add
          .text(-panelW / 2 + s(22), y, `Slot ${slot}  —  empty`, {
            fontFamily: FONT,
            fontSize: `${s(16)}px`,
            color: '#7b7b7b',
          })
          .setOrigin(0, 0.5),
      );
    }

    const back = addButton(this, 0, panelH / 2 - s(28), 'Back', () => this.showLoad(false), {
      width: panelW - s(28),
      height: s(32),
      fontSize: s(18),
    });

    root.add([dim, panel, heading, ...rows, back.bg, back.label]);
    dim.setInteractive();
    return root;
  }

  private showLoad(open: boolean): void {
    this.loadRoot?.setVisible(open);
    for (const button of this.menu) button.setVisible(!open);
  }
}
