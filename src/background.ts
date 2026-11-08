import Phaser from 'phaser';
import bgUrl from '../assets/hd/startscreen/start-bg.mp4';
import posterUrl from '../assets/hd/startscreen/start-poster.png';
import { HEIGHT, WIDTH } from './theme';

export function queueStartArt(loader: Phaser.Loader.LoaderPlugin): void {
  loader.image('poster', posterUrl);
  loader.video('bg', bgUrl, true);
}

/** Looping ship / space plate. Poster shows until the video actually plays. */
export function addBackground(scene: Phaser.Scene): void {
  const poster = scene.add.image(WIDTH / 2, HEIGHT / 2, 'poster');
  const video = scene.add.video(WIDTH / 2, HEIGHT / 2, 'bg');
  video.setMute(true);
  const play = () => {
    if (!video.isPlaying()) video.play(true);
  };
  play();
  video.on('play', () => poster.setVisible(false));
  scene.input.on('pointerdown', play);
}
