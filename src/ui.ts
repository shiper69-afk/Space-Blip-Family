import Phaser from 'phaser';
import { FONT } from './theme';

export type UiButton = {
  bg: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  setVisible: (visible: boolean) => void;
};

type ButtonOptions = {
  width?: number;
  height?: number;
  fontSize?: number;
  container?: Phaser.GameObjects.Container;
};

export function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  onClick: () => void,
  options: ButtonOptions = {},
): UiButton {
  const width = options.width ?? 413;
  const height = options.height ?? 68;
  const fontSize = options.fontSize ?? 36;
  const bg = scene.add
    .rectangle(x, y, width, height, 0x000000, 0.705882)
    .setInteractive({ useHandCursor: true });
  const label = scene.add
    .text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${fontSize}px`,
      color: '#ffffff',
    })
    .setOrigin(0.5);

  bg.on('pointerover', () => label.setColor('#f3f310'));
  bg.on('pointerout', () => label.setColor('#ffffff'));
  bg.on('pointerdown', () => label.setColor('#4ef3f3'));
  bg.on('pointerup', () => {
    label.setColor('#f3f310');
    onClick();
  });

  options.container?.add([bg, label]);

  return {
    bg,
    label,
    setVisible(visible: boolean) {
      bg.setVisible(visible);
      label.setVisible(visible);
      if (visible) bg.setInteractive({ useHandCursor: true });
      else bg.disableInteractive();
    },
  };
}
