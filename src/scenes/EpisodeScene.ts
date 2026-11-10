import Phaser from 'phaser';
import { CAST_ANIMS, STILLS } from '../episode/assets';
import { EPISODE_SCRIPT, type ScriptLine } from '../episode/script';
import { FONT, HEIGHT, WIDTH } from '../theme';

const BODY = 2.05;
const FLOOR = 980;

type Mode = 'banner' | 'script' | 'end';

export class EpisodeScene extends Phaser.Scene {
  private mode: Mode = 'banner';
  private armed = false;
  private leaving = false;
  private line = 0;
  private auto?: Phaser.Time.TimerEvent;
  private alanAwake = false;
  private asleep = false;
  private manualDy = -150;

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
  private pan!: Phaser.GameObjects.Image;
  private mug!: Phaser.GameObjects.Image;
  private manual!: Phaser.GameObjects.Image;
  private zzzJoe!: Phaser.GameObjects.Sprite;
  private zzzDan!: Phaser.GameObjects.Sprite;
  private zzzEithan!: Phaser.GameObjects.Sprite;
  private zzzAlan!: Phaser.GameObjects.Sprite;

  private button!: Phaser.GameObjects.Arc;
  private buttonLabel!: Phaser.GameObjects.Text;
  private incoming!: Phaser.GameObjects.Container;
  private callEnded!: Phaser.GameObjects.Text;
  private fort!: Phaser.GameObjects.Container;
  private crumbs!: Phaser.GameObjects.Container;
  private sock!: Phaser.GameObjects.Container;
  private sandwich!: Phaser.GameObjects.Container;
  private laundry!: Phaser.GameObjects.Container;

  constructor() {
    super('episode');
  }

  preload(): void {
    this.load.image('bridge0', STILLS.bridge0);
    this.load.image('bridge1', STILLS.bridge1);
    this.load.image('prop-pan', STILLS.pan);
    this.load.image('prop-coffee', STILLS.coffee);
    this.load.image('prop-manual', STILLS.manual);
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

    this.input.on('pointerdown', () => this.advance());
    this.input.keyboard?.on('keydown-SPACE', (event: KeyboardEvent) => {
      event.preventDefault();
      this.advance();
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.auto?.remove(false));
    this.time.delayedCall(2800, () => {
      if (this.mode === 'banner') this.begin();
    });
    this.time.delayedCall(280, () => {
      this.armed = true;
    });
  }

  update(): void {
    if (this.dandan.visible) this.pan.setPosition(this.dandan.x + 40, this.dandan.y - 100).setVisible(true).setDepth(9);
    else this.pan.setVisible(false);
    if (this.eithan.visible) this.manual.setPosition(this.eithan.x + 8, this.eithan.y + this.manualDy).setVisible(true).setDepth(9);
    else this.manual.setVisible(false);
    if (!this.alanAwake && this.alanSleep.visible) this.mug.setPosition(this.alanSleep.x + 20, this.alanSleep.y - 70);
    const snooze = this.asleep && this.mode === 'script';
    this.zzzJoe.setPosition(this.joe.x, this.joe.y - 230).setVisible(snooze && this.joe.visible);
    this.zzzDan.setPosition(this.dandan.x + 10, this.dandan.y - 230).setVisible(snooze && this.dandan.visible);
    this.zzzEithan.setPosition(this.eithan.x, this.eithan.y - 240).setVisible(snooze && this.eithan.visible);
    this.zzzAlan.setPosition(this.alanSleep.x + 30, this.alanSleep.y - 200).setVisible(this.alanSleep.visible && !this.alanAwake);
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
    this.alanSleep = make('alan-sleep', 980, 640, 2.2);
    this.alan = make('alan-idle', 980, 640);
    this.davdav = make('davdav-idle', 200, FLOOR, 1.7);
    this.chaya = this.add.sprite(1425, 230, 'chaya-talk-0').setScale(1.35).setVisible(false).setDepth(6);
    const mask = this.make.graphics({ x: 0, y: 0 }, false);
    mask.fillStyle(0xffffff);
    mask.fillRect(1165, 70, 520, 290);
    this.chaya.setMask(mask.createGeometryMask());

    this.pan = this.add.image(0, 0, 'prop-pan').setScale(1.15).setVisible(false);
    this.mug = this.add.image(0, 0, 'prop-coffee').setScale(1.5).setVisible(false).setDepth(9);
    this.manual = this.add.image(0, 0, 'prop-manual').setScale(1.2).setVisible(false);
    const zzz = (x: number, y: number) => this.add.sprite(x, y, 'zzz-0').setScale(1.4).setVisible(false).setDepth(10);
    this.zzzJoe = zzz(0, 0);
    this.zzzDan = zzz(0, 0);
    this.zzzEithan = zzz(0, 0);
    this.zzzAlan = zzz(0, 0);
    for (const sprite of [this.zzzJoe, this.zzzDan, this.zzzEithan, this.zzzAlan]) sprite.play('zzz');
  }

  private buildPlaceholders(): void {
    this.button = this.add.circle(1688, 700, 48, 0xc41818).setStrokeStyle(6, 0xffe9b0).setVisible(false).setDepth(7);
    this.button.setName('placeholder-big-red-button');
    this.buttonLabel = this.add
      .text(1688, 612, 'DO NOT PRESS.\nSERIOUSLY. — MOM.', {
        fontFamily: FONT,
        fontSize: '18px',
        color: '#ffe9b0',
        align: 'center',
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(7);
    this.buttonLabel.setName('placeholder-big-red-button-label');

    const incomingBg = this.add.rectangle(0, 0, 500, 150, 0x120818, 0.92).setStrokeStyle(4, 0xff5fa8);
    const incomingText = this.add
      .text(0, 0, 'INCOMING CALL: GRANDMA ❤️ ❤️ ❤️', {
        fontFamily: FONT,
        fontSize: '26px',
        color: '#ffd0e6',
        align: 'center',
        wordWrap: { width: 460 },
      })
      .setOrigin(0.5);
    this.incoming = this.add.container(1425, 210, [incomingBg, incomingText]).setVisible(false).setDepth(7);
    this.incoming.setName('placeholder-incoming-call');

    this.callEnded = this.add
      .text(1425, 300, 'CALL ENDED', { fontFamily: FONT, fontSize: '36px', color: '#ff5a5a' })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(7);
    this.callEnded.setName('placeholder-call-ended');

    const fortBg = this.add.rectangle(0, 0, 220, 90, 0x243056, 0.9).setStrokeStyle(3, 0x9eb4ff);
    const fortLabel = this.add.text(0, 0, 'BLANKET FORT', { fontFamily: FONT, fontSize: '20px', color: '#d5e2ff' }).setOrigin(0.5);
    this.fort = this.add.container(430, 860, [fortBg, fortLabel]).setVisible(false).setDepth(4);
    this.fort.setName('placeholder-blanket-fort');

    this.crumbs = this.add.container(0, 0).setDepth(4).setVisible(false);
    this.crumbs.setName('placeholder-cookie-crumbs');
    for (let i = 0; i < 8; i += 1) {
      this.crumbs.add(this.add.circle(260 + i * 42, 900 - (i % 3) * 10, 5, 0xd8b07a));
    }

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
    if (line.action) this.run(line.action);
    this.showLine(line);
    const ms = line.text ? Math.min(7200, 1000 + line.text.length * 40) : 1200;
    this.auto = this.time.delayedCall(ms, () => this.advance());
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
    const anim: Record<string, string> = {
      Alan: 'alan-talk',
      Naomi: 'naomi-talk',
      Joe: 'joe-talk',
      DanDan: 'dandan-talk',
      Eithan: 'eithan-talk',
      DavDav: 'davdav-talk',
      Chaya: 'chaya-talk',
    };
    const sprite = name ? map[name] : undefined;
    const key = name ? anim[name] : undefined;
    if (sprite?.visible && key) sprite.play(key);
  }

  private enter(sprite: Phaser.GameObjects.Sprite, x: number, walk: string, idle: string): void {
    sprite.setVisible(true).setX(120).setFlipX(false).setDepth(8);
    sprite.play(walk);
    this.tweens.add({
      targets: sprite,
      x,
      duration: 900,
      onComplete: () => sprite.play(idle),
    });
  }

  private run(action: string): void {
    switch (action) {
      case 'loc-quarters':
        this.location.setText('INT. MINI VAN — A QUICK TOUR');
        break;
      case 'loc-cockpit':
        this.asleep = false;
        this.location.setText('INT. COCKPIT');
        this.joe.setVisible(false);
        this.dandan.setVisible(false);
        this.eithan.setVisible(false);
        this.naomi.setVisible(false);
        this.fort.setVisible(false);
        this.crumbs.setVisible(false);
        this.button.setVisible(true);
        this.buttonLabel.setVisible(true);
        break;
      case 'crew-rest':
        this.asleep = true;
        break;
      case 'joe-sleep':
        this.joe.setVisible(true).play('joe-idle');
        break;
      case 'dandan-sleep':
        this.dandan.setVisible(true).play('dandan-idle');
        break;
      case 'eithan-sleep':
        this.eithan.setVisible(true).play('eithan-idle');
        break;
      case 'naomi-up':
        this.naomi.setPosition(700, 720).setVisible(true).play('naomi-idle');
        break;
      case 'alan-snore':
        if (!this.alanAwake) this.alanSleep.setVisible(true).play('alan-sleep');
        this.mug.setVisible(!this.alanAwake);
        break;
      case 'empty-bed':
        this.fort.setVisible(true);
        this.crumbs.setVisible(true);
        break;
      case 'davdav-creep':
        this.davdav.setPosition(180, FLOOR).setVisible(true).play('davdav-walk');
        this.tweens.add({
          targets: this.davdav,
          x: 1560,
          duration: 1600,
          onComplete: () => this.davdav.play('davdav-idle'),
        });
        break;
      case 'davdav-look':
        this.davdav.play('davdav-idle');
        this.tweens.add({ targets: this.davdav, y: this.davdav.y - 16, yoyo: true, duration: 280 });
        break;
      case 'davdav-wave':
        this.davdav.play('davdav-wave');
        break;
      case 'incoming-call':
        this.incoming.setVisible(true).setAlpha(1);
        this.tweens.add({ targets: this.incoming, alpha: 0.45, yoyo: true, repeat: 4, duration: 140 });
        break;
      case 'press-button':
        this.tweens.add({ targets: this.button, scale: 0.86, yoyo: true, duration: 90 });
        this.incoming.setVisible(false);
        this.chaya.setVisible(true).setY(230).play('chaya-talk');
        break;
      case 'grandma-lean':
        this.chaya.play('chaya-idle');
        this.tweens.add({ targets: this.chaya, y: 250, duration: 400 });
        break;
      case 'grandma-chin':
        this.tweens.add({ targets: this.chaya, y: 390, duration: 500 });
        break;
      case 'grandma-reset':
        this.chaya.play('chaya-talk');
        this.tweens.add({ targets: this.chaya, y: 230, duration: 400 });
        break;
      case 'chaya-sigh':
      case 'chaya-jab':
        this.chaya.play('chaya-judge');
        this.tweens.add({ targets: this.chaya, scale: 1.5, yoyo: true, duration: 160 });
        break;
      case 'alan-jolt':
        this.alanAwake = true;
        this.alanSleep.setVisible(false);
        this.alan.setVisible(true).setPosition(this.alanSleep.x, this.alanSleep.y).play('alan-jolt');
        this.tweens.add({ targets: this.mug, x: 1180, y: 460, duration: 420 });
        break;
      case 'alan-call':
        this.tweens.add({ targets: this.alan, scale: BODY * 1.06, yoyo: true, duration: 140 });
        break;
      case 'footsteps':
        this.cameras.main.shake(420, 0.0025);
        break;
      case 'naomi-enter':
        this.enter(this.naomi, 900, 'naomi-walk', 'naomi-idle');
        break;
      case 'joe-enter':
        this.enter(this.joe, 520, 'joe-walk', 'joe-idle');
        break;
      case 'dandan-enter':
        this.enter(this.dandan, 700, 'dandan-walk', 'dandan-idle');
        break;
      case 'eithan-enter':
        this.enter(this.eithan, 1160, 'eithan-walk', 'eithan-idle');
        break;
      case 'eithan-book':
        this.manualDy = -110;
        break;
      case 'show-mess':
        this.sock.setVisible(true);
        this.sandwich.setVisible(true);
        this.laundry.setVisible(true);
        break;
      case 'naomi-elbow':
        this.tweens.add({ targets: this.naomi, x: this.dandan.x + 70, yoyo: true, duration: 180 });
        break;
      case 'call-ended':
        this.chaya.stop();
        this.chaya.setTint(0x9aa0b0);
        this.callEnded.setVisible(true);
        break;
      case 'alarms':
        this.tweens.add({ targets: this.alarm, alpha: 0.38, yoyo: true, repeat: 7, duration: 90 });
        for (const sprite of [this.joe, this.dandan, this.naomi, this.eithan, this.alan]) {
          if (!sprite.visible) continue;
          const toward = Math.sign(this.davdav.x - sprite.x) * 28;
          this.tweens.add({ targets: sprite, x: sprite.x + toward, duration: 500 });
        }
        break;
      case 'alan-hero':
        this.alan.setVisible(true).play('alan-hero');
        this.tweens.add({ targets: this.alan, x: 1040, y: 760, duration: 500 });
        break;
      case 'alan-trip':
        this.alan.play('alan-fall');
        this.tweens.add({ targets: this.alan, x: 1160, y: 900, duration: 380 });
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
    this.auto = this.time.delayedCall(2600, () => this.leave());
  }

  private leave(): void {
    if (this.leaving) return;
    this.leaving = true;
    this.scene.start('start');
  }
}
