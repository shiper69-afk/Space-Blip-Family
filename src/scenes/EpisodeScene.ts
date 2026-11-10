import Phaser from 'phaser';
import { CAST_ANIMS, STILLS } from '../episode/assets';
import { EPISODE_SCRIPT, type ScriptLine } from '../episode/script';
import { FONT, HEIGHT, WIDTH } from '../theme';

const BODY = 2.05;
const FLOOR = 820;
const S = WIDTH / 1024;
const SCREEN_X = 599 * S;
const SCREEN_Y = 40 * S;
const SCREEN_W = 145 * S;
const SCREEN_H = 89 * S;
const DOOR_FEET_X = 209 * S;
const DOOR_FEET_Y = 225 * S;

type Mode = 'banner' | 'script' | 'end';

export class EpisodeScene extends Phaser.Scene {
  private mode: Mode = 'banner';
  private armed = false;
  private leaving = false;
  private line = 0;
  private auto?: Phaser.Time.TimerEvent;
  private alanAwake = false;

  private bridge!: Phaser.GameObjects.Image;
  private dim!: Phaser.GameObjects.Rectangle;
  private banner!: Phaser.GameObjects.Container;
  private endCard!: Phaser.GameObjects.Container;
  private location!: Phaser.GameObjects.Text;
  private box!: Phaser.GameObjects.Rectangle;
  private nameText!: Phaser.GameObjects.Text;
  private body!: Phaser.GameObjects.Text;
  private alarm!: Phaser.GameObjects.Rectangle;

  private alanSleep!: Phaser.GameObjects.Sprite;
  private alan!: Phaser.GameObjects.Sprite;
  private naomi!: Phaser.GameObjects.Sprite;
  private joe!: Phaser.GameObjects.Sprite;
  private dandan!: Phaser.GameObjects.Sprite;
  private eithan!: Phaser.GameObjects.Sprite;
  private davdav!: Phaser.GameObjects.Sprite;
  private chaya!: Phaser.GameObjects.Sprite;
  private chayaBg!: Phaser.GameObjects.Image;
  private door!: Phaser.GameObjects.Sprite;
  private zzzAlan!: Phaser.GameObjects.Sprite;

  private incoming!: Phaser.GameObjects.Container;
  private callEnded!: Phaser.GameObjects.Text;
  private sock!: Phaser.GameObjects.Container;
  private sandwich!: Phaser.GameObjects.Container;
  private laundry!: Phaser.GameObjects.Container;

  constructor() {
    super('episode');
  }

  preload(): void {
    this.load.image('bridge0', STILLS.bridge0);
    this.load.image('bridge1', STILLS.bridge1);
    this.load.image('grandma-bg', STILLS.grandmaBg);
    for (const [key, anim] of Object.entries(CAST_ANIMS)) {
      anim.urls.forEach((url, index) => this.load.image(`${key}-${index}`, url));
    }
  }

  create(): void {
    for (const [key, anim] of Object.entries(CAST_ANIMS)) {
      if (!anim.urls.length) continue;
      this.anims.create({
        key,
        frames: anim.urls.map((_, index) => ({ key: `${key}-${index}` })),
        frameRate: anim.rate,
        repeat: anim.repeat,
      });
    }
    for (const key of this.textures.getTextureKeys()) {
      if (key.startsWith('prop-') || key.includes('-')) {
        this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }

    this.bridge = this.add.image(WIDTH / 2, HEIGHT / 2, 'bridge0').setDisplaySize(WIDTH, HEIGHT);
    this.time.addEvent({
      delay: 650,
      loop: true,
      callback: () => this.bridge.setTexture(this.bridge.texture.key === 'bridge0' ? 'bridge1' : 'bridge0'),
    });

    this.buildCast();
    this.buildPlaceholders();
    this.buildCaptions();
    this.dim = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.45).setDepth(30);
    this.buildBanner();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0) this.advance();
    });
    this.input.keyboard?.on('keydown-ESC', () => this.leave());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.auto?.remove(false));
    this.time.delayedCall(280, () => {
      this.armed = true;
    });
  }

  update(): void {
    this.zzzAlan.setPosition(540 * S, 66 * S).setOrigin(0, 0).setScale(S).setVisible(this.alanSleep.visible && !this.alanAwake);
  }

  private buildCast(): void {
    const make = (anim: string, x: number, y: number, scale = BODY) => {
      const sprite = this.add.sprite(x, y, `${anim}-0`).setOrigin(0.5, 1).setScale(scale).setVisible(false).setDepth(8);
      return sprite;
    };
    this.joe = make('joe-idle', 340, FLOOR);
    this.dandan = make('dandan-idle', 560, FLOOR);
    this.eithan = make('eithan-idle', 780, FLOOR - 10);
    this.naomi = make('naomi-idle', 700, 700);
    this.alanSleep = this.add
      .sprite(462 * S, 70 * S, 'alan-sleep-0')
      .setOrigin(0, 0)
      .setScale(S)
      .setVisible(false)
      .setDepth(8);
    this.alan = make('alan-idle', 960, 640);
    this.davdav = make('davdav-idle', 960, 760, S * 1.35);
    this.chayaBg = this.add
      .image(SCREEN_X, SCREEN_Y, 'grandma-bg')
      .setOrigin(0, 0)
      .setDisplaySize(SCREEN_W, SCREEN_H)
      .setVisible(false)
      .setDepth(5);
    this.chayaBg.setName('grandma-viewscreen-bg');
    this.chaya = this.add
      .sprite(SCREEN_X, SCREEN_Y, 'chaya-idle-0')
      .setOrigin(0, 0)
      .setDisplaySize(SCREEN_W, SCREEN_H)
      .setVisible(false)
      .setDepth(6);
    const screenMask = this.make.graphics({ x: 0, y: 0 }, false);
    screenMask.fillStyle(0xffffff);
    screenMask.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);
    this.chaya.setMask(screenMask.createGeometryMask());
    this.door = this.add
      .sprite(180 * S, 48 * S, 'door-open-0')
      .setOrigin(0, 0)
      .setScale(S)
      .setDepth(4);

    this.zzzAlan = this.add.sprite(540 * S, 66 * S, 'zzz-0').setOrigin(0, 0).setScale(S).setVisible(false).setDepth(10);
    this.zzzAlan.play('zzz');
  }

  private buildPlaceholders(): void {
    const incomingBg = this.add.rectangle(SCREEN_W / 2, SCREEN_H / 2, SCREEN_W, SCREEN_H, 0x120818, 0.94).setStrokeStyle(3, 0xff5fa8);
    const incomingText = this.add
      .text(SCREEN_W / 2, SCREEN_H / 2, 'INCOMING CALL:\nGRANDMA ❤️ ❤️ ❤️', {
        fontFamily: FONT,
        fontSize: '18px',
        color: '#ffd0e6',
        align: 'center',
        wordWrap: { width: SCREEN_W - 12 },
      })
      .setOrigin(0.5);
    this.incoming = this.add.container(SCREEN_X, SCREEN_Y, [incomingBg, incomingText]).setVisible(false).setDepth(7);
    this.incoming.setName('placeholder-incoming-call');

    this.callEnded = this.add
      .text(SCREEN_X + SCREEN_W / 2, SCREEN_Y + SCREEN_H + 18, 'CALL ENDED', { fontFamily: FONT, fontSize: '28px', color: '#ff5a5a' })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(7);
    this.callEnded.setName('placeholder-call-ended');

    const sockShape = this.add.ellipse(0, -8, 54, 28, 0x6b4a32).setAngle(-20);
    const sockLabel = this.add.text(0, 22, 'SOCK', { fontFamily: FONT, fontSize: '16px', color: '#f0d2b0' }).setOrigin(0.5);
    this.sock = this.add.container(1140, 900, [sockShape, sockLabel]).setVisible(false).setDepth(7);
    this.sock.setName('placeholder-sock');

    const bread = this.add.rectangle(0, 0, 90, 28, 0xe2c48a);
    const fill = this.add.rectangle(0, 0, 78, 10, 0x6aaa3a);
    const sandwichLabel = this.add.text(0, 28, 'SANDWICH', { fontFamily: FONT, fontSize: '16px', color: '#f3e2b0' }).setOrigin(0.5);
    this.sandwich = this.add.container(1240, 78, [bread, fill, sandwichLabel]).setVisible(false).setDepth(7);
    this.sandwich.setName('placeholder-sandwich');

    const pile = this.add.rectangle(0, 0, 120, 54, 0x3d4d88, 0.95).setStrokeStyle(2, 0xffd35e);
    const light = this.add.circle(28, -6, 8, 0xffb000);
    const laundryLabel = this.add.text(0, 0, 'LAUNDRY', { fontFamily: FONT, fontSize: '16px', color: '#d5e2ff' }).setOrigin(0.5);
    this.laundry = this.add.container(1320, 860, [pile, light, laundryLabel]).setVisible(false).setDepth(5);
    this.laundry.setName('placeholder-laundry');
    this.tweens.add({ targets: light, alpha: 0.2, yoyo: true, repeat: -1, duration: 280 });

    this.alarm = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xff8a00, 0).setDepth(16);
  }

  private buildCaptions(): void {
    this.location = this.add
      .text(WIDTH / 2, 36, '', { fontFamily: FONT, fontSize: '28px', color: '#ffd35e' })
      .setOrigin(0.5, 0)
      .setDepth(20);
    this.box = this.add.rectangle(WIDTH / 2, 980, 1760, 140, 0x070b18, 0.88).setStrokeStyle(3, 0xd9b338).setDepth(20).setVisible(false);
    this.nameText = this.add.text(150, 900, '', { fontFamily: FONT, fontSize: '26px', color: '#ffd35e' }).setDepth(21).setVisible(false);
    this.body = this.add
      .text(150, 938, '', {
        fontFamily: FONT,
        fontSize: '28px',
        color: '#f4f7ff',
        wordWrap: { width: 1620 },
      })
      .setDepth(21)
      .setVisible(false);
  }

  private buildBanner(): void {
    const panel = this.add.rectangle(0, 0, 1100, 200, 0x0a0d1a, 0.94).setStrokeStyle(4, 0xd9b338);
    const title = this.add
      .text(0, 0, 'Episode 1: Grandma is calling', {
        fontFamily: FONT,
        fontSize: '52px',
        color: '#ffdb47',
      })
      .setOrigin(0.5);
    this.banner = this.add.container(WIDTH / 2, HEIGHT / 2, [panel, title]).setDepth(40);
    const endPanel = this.add.rectangle(0, 0, 760, 160, 0x0a0d1a, 0.94).setStrokeStyle(4, 0xd9b338);
    const endText = this.add.text(0, 0, 'To be continued...', { fontFamily: FONT, fontSize: '48px', color: '#ffdb47' }).setOrigin(0.5);
    this.endCard = this.add.container(WIDTH / 2, HEIGHT / 2, [endPanel, endText]).setDepth(40).setVisible(false);
  }

  private advance(): void {
    if (!this.armed || this.leaving) return;
    if (this.mode === 'banner') {
      this.begin();
      return;
    }
    if (this.mode === 'end') {
      this.leave();
      return;
    }
    this.auto?.remove(false);
    this.line += 1;
    this.present();
  }

  private begin(): void {
    this.mode = 'script';
    this.tweens.add({ targets: [this.banner, this.dim], alpha: 0, duration: 280, onComplete: () => this.banner.setVisible(false) });
    this.line = 0;
    this.present();
  }

  private present(): void {
    const line = EPISODE_SCRIPT[this.line];
    if (!line || line.action === 'end') {
      if (line?.action) this.run(line.action);
      this.endCardShow();
      return;
    }
    this.standTalkers();
    if (line.action) this.run(line.action);
    this.showLine(line);
  }

  private showLine(line: ScriptLine): void {
    if (!line.text || line.speaker === 'CAPTION') {
      this.box.setVisible(false);
      this.nameText.setVisible(false);
      this.body.setVisible(false);
      return;
    }
    const kind = line.speaker === 'Narrator' ? 'narrator' : line.speaker === 'Ship Computer' ? 'computer' : 'dialogue';
    this.talk(line.speaker);
    this.body.setText(line.text);
    this.body.setColor(kind === 'computer' ? '#d9ffe8' : kind === 'narrator' ? '#d7e6ff' : '#f4f7ff');
    this.body.setAlign(kind === 'dialogue' ? 'left' : 'center');
    this.body.setOrigin(kind === 'dialogue' ? 0 : 0.5, 0);
    this.body.setX(kind === 'dialogue' ? 150 : WIDTH / 2);
    const top = HEIGHT - 36 - this.body.height - (kind === 'dialogue' ? 42 : 16);
    this.body.setY(top + (kind === 'dialogue' ? 40 : 12));
    this.nameText.setVisible(kind === 'dialogue');
    if (kind === 'dialogue') {
      this.nameText.setText(line.speaker ?? '');
      this.nameText.setY(top + 6);
    }
    this.box.setVisible(true);
    this.box.setFillStyle(kind === 'computer' ? 0x062018 : kind === 'narrator' ? 0x10182e : 0x070b18, 0.9);
    this.box.setStrokeStyle(3, kind === 'computer' ? 0x3dff9a : kind === 'narrator' ? 0x8eb4ff : 0xd9b338);
    const boxH = this.body.height + (kind === 'dialogue' ? 64 : 36);
    this.box.setSize(1760, boxH);
    this.box.setY(top + boxH / 2);
    this.body.setVisible(true);
  }

  private talk(speaker?: string): void {
    const name = speaker?.split(' ')[0];
    const map: Record<string, Phaser.GameObjects.Sprite | undefined> = {
      Alan: this.alanAwake ? this.alan : undefined,
      Naomi: this.naomi,
      Joe: this.joe,
      DanDan: this.dandan,
      Eithan: this.eithan,
      DavDav: this.davdav,
      Chaya: this.chaya,
    };
    const ids: Record<string, string> = {
      Alan: 'alan',
      Naomi: 'naomi',
      Joe: 'joe',
      DanDan: 'dandan',
      Eithan: 'eithan',
      DavDav: 'davdav',
    };
    if (name === 'Chaya' && this.chaya.visible) {
      this.chaya.play('chaya-talk');
      return;
    }
    if (this.chaya.visible && this.chaya.anims.currentAnim?.key === 'chaya-talk') this.chaya.play('chaya-idle');
    const id = name ? ids[name] : undefined;
    const sprite = name ? map[name] : undefined;
    if (sprite?.visible && id) {
      sprite.setFlipX(false);
      sprite.play(`${id}-talk-down`);
    }
  }

  /** Closed-mouth standing pose. Talk frames share this canvas, so only the mouth changes. */
  private standTalkers(): void {
    const bodies: [string, Phaser.GameObjects.Sprite][] = [
      ['alan', this.alan],
      ['naomi', this.naomi],
      ['joe', this.joe],
      ['dandan', this.dandan],
      ['eithan', this.eithan],
      ['davdav', this.davdav],
    ];
    for (const [id, sprite] of bodies) {
      const current = sprite.anims.currentAnim?.key ?? '';
      if (!sprite.visible || !current.includes('talk')) continue;
      sprite.anims.stop();
      sprite.setFlipX(false);
      sprite.setTexture(`${id}-idle-0`);
    }
    if (this.chaya.visible && this.chaya.anims.currentAnim?.key === 'chaya-talk') this.chaya.play('chaya-idle');
  }

  private openDoor(): void {
    this.door.setVisible(true).play('door-open');
  }

  private closeDoor(): void {
    this.time.delayedCall(700, () => {
      if (this.door.anims.currentAnim?.key !== 'door-open' || !this.door.anims.isPlaying) this.door.play('door-close');
    });
  }

  private pose(sprite: Phaser.GameObjects.Sprite, id: string): void {
    sprite.anims.stop();
    sprite.setFlipX(false);
    sprite.setTexture(`${id}-idle-0`);
  }

  private enter(id: string, sprite: Phaser.GameObjects.Sprite, x: number, y: number, walk: string): void {
    this.openDoor();
    sprite.setVisible(true).setPosition(DOOR_FEET_X, DOOR_FEET_Y).setScale(S).setFlipX(x < DOOR_FEET_X).setDepth(DOOR_FEET_Y);
    sprite.play(walk);
    this.tweens.add({
      targets: sprite,
      x,
      y,
      scale: 1.85,
      duration: 900,
      onUpdate: () => sprite.setDepth(sprite.y),
      onComplete: () => {
        this.pose(sprite, id);
        sprite.setDepth(sprite.y);
      },
    });
  }

  private run(action: string): void {
    switch (action) {
      case 'opening':
        this.location.setText('INT. COCKPIT');
        this.joe.setVisible(false);
        this.dandan.setVisible(false);
        this.eithan.setVisible(false);
        this.naomi.setVisible(false);
        this.alan.setVisible(false);
        this.alanSleep.setVisible(true).play('alan-sleep');
        this.davdav.setPosition(1040, 780).setScale(1.85).setDepth(780).setVisible(true);
        this.pose(this.davdav, 'davdav');
        break;
      case 'davdav-run':
        this.davdav.setFlipX(false).play('davdav-walk');
        this.tweens.add({
          targets: this.davdav,
          x: 1280,
          y: 560,
          scale: 1.7,
          duration: 700,
          onUpdate: () => this.davdav.setDepth(this.davdav.y),
          onComplete: () => {
            this.pose(this.davdav, 'davdav');
            this.davdav.setDepth(this.davdav.y);
          },
        });
        break;
      case 'davdav-wave':
        this.davdav.play('davdav-wave');
        break;
      case 'incoming-call':
        this.incoming.setVisible(true).setAlpha(1);
        this.tweens.add({ targets: this.incoming, alpha: 0.45, yoyo: true, repeat: 4, duration: 140 });
        break;
      case 'press-console':
        this.tweens.add({ targets: this.davdav, y: this.davdav.y - 18, yoyo: true, duration: 90 });
        this.incoming.setVisible(false);
        this.chayaBg.setVisible(true);
        this.chaya.setVisible(true).setPosition(SCREEN_X, SCREEN_Y).play('chaya-talk');
        break;
      case 'grandma-lean':
        this.chaya.play('chaya-idle');
        this.tweens.add({ targets: this.chaya, y: SCREEN_Y + 12, duration: 400 });
        break;
      case 'grandma-chin':
        this.tweens.add({ targets: this.chaya, y: SCREEN_Y + SCREEN_H * 0.42, duration: 500 });
        break;
      case 'grandma-reset':
        this.chaya.play('chaya-talk');
        this.tweens.add({ targets: this.chaya, y: SCREEN_Y, duration: 400 });
        break;
      case 'chaya-sigh':
      case 'chaya-jab':
        this.chaya.play('chaya-judge');
        break;
      case 'alan-jolt':
        this.alanAwake = true;
        this.alanSleep.setVisible(true).play('alan-jolt');
        this.alanSleep.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.alanSleep.setVisible(false);
          this.alan.setVisible(true).setPosition(820, 900).setScale(1.85).setDepth(900);
          this.pose(this.alan, 'alan');
        });
        break;
      case 'alan-call':
        this.tweens.add({ targets: this.alan, scale: BODY * 1.06, yoyo: true, duration: 140 });
        break;
      case 'footsteps':
        this.openDoor();
        this.cameras.main.shake(420, 0.0025);
        break;
      case 'naomi-enter':
        this.enter('naomi', this.naomi, 1420, 880, 'naomi-walk');
        break;
      case 'joe-enter':
        this.enter('joe', this.joe, 520, 880, 'joe-walk');
        break;
      case 'dandan-enter':
        this.enter('dandan', this.dandan, 1120, 920, 'dandan-walk');
        break;
      case 'eithan-enter':
        this.enter('eithan', this.eithan, 1720, 880, 'eithan-walk');
        this.closeDoor();
        break;
      case 'show-mess':
        this.sock.setVisible(true);
        this.sandwich.setVisible(true);
        this.laundry.setVisible(true);
        break;
      case 'naomi-elbow':
        this.tweens.add({ targets: this.naomi, x: this.naomi.x - 36, yoyo: true, duration: 180 });
        break;
      case 'call-ended':
        this.chaya.stop();
        this.chaya.setTint(0x9aa0b0);
        this.chayaBg.setTint(0x9aa0b0);
        this.callEnded.setVisible(true);
        break;
      case 'alarms':
        this.tweens.add({ targets: this.alarm, alpha: 0.38, yoyo: true, repeat: 7, duration: 90 });
        for (const sprite of [this.joe, this.dandan, this.naomi, this.eithan, this.alan]) {
          if (!sprite.visible) continue;
          const toward = Math.sign(this.davdav.x - sprite.x) * 20;
          this.tweens.add({ targets: sprite, x: sprite.x + toward, duration: 500 });
        }
        break;
      case 'alan-hero':
        this.alan.setVisible(true).play('alan-hero');
        this.tweens.add({
          targets: this.alan,
          x: 820,
          y: 860,
          duration: 500,
          onUpdate: () => this.alan.setDepth(this.alan.y),
        });
        break;
      case 'alan-trip':
        this.alan.play('alan-fall');
        this.tweens.add({
          targets: this.alan,
          x: 900,
          y: 940,
          duration: 380,
          onUpdate: () => this.alan.setDepth(this.alan.y),
        });
        this.cameras.main.shake(320, 0.01);
        break;
      default:
        break;
    }
  }

  private endCardShow(): void {
    this.mode = 'end';
    this.box.setVisible(false);
    this.nameText.setVisible(false);
    this.body.setVisible(false);
    this.endCard.setVisible(true);
  }

  private leave(): void {
    if (this.leaving) return;
    this.leaving = true;
    this.scene.start('start');
  }
}
