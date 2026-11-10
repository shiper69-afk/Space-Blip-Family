/** Frame lists for the episode. Each glob is a literal so Vite can pack it. */

function frames(glob: Record<string, unknown>): string[] {
  return Object.keys(glob)
    .sort()
    .map((key) => glob[key] as string);
}

function load(glob: Record<string, unknown>, rate: number, repeat: number) {
  return { urls: frames(glob), rate, repeat };
}

export const CAST_ANIMS = {
  'alan-idle': load(import.meta.glob('../../assets/art/originals/Charechter Animation/dad_frames/idle_down_*.png', { eager: true, query: '?url', import: 'default' }), 6, -1),
  'alan-talk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/dad_frames/talk_down_*.png', { eager: true, query: '?url', import: 'default' }), 8, -1),
  'alan-walk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/dad_frames/walk_right_*.png', { eager: true, query: '?url', import: 'default' }), 10, -1),
  'alan-hero': load(import.meta.glob('../../assets/art/originals/Charechter Animation/dad_frames/hands_on_hips_*.png', { eager: true, query: '?url', import: 'default' }), 4, 0),
  'alan-fall': load(import.meta.glob('../../assets/art/originals/Charechter Animation/dad_frames/fall_right_*.png', { eager: true, query: '?url', import: 'default' }), 12, 0),
  'alan-sleep': load(import.meta.glob('../../assets/art/originals/alan_sleep/alan_frames_sleep_chair_*.png', { eager: true, query: '?url', import: 'default' }), 5, -1),
  'alan-jolt': load(import.meta.glob('../../assets/art/originals/alan_sleep/alan_frames_wake_jolt_*.png', { eager: true, query: '?url', import: 'default' }), 12, 0),
  'naomi-idle': load(import.meta.glob('../../assets/art/originals/Charechter Animation/mom_frames/idle_down_*.png', { eager: true, query: '?url', import: 'default' }), 6, -1),
  'naomi-talk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/mom_frames/talk_down_*.png', { eager: true, query: '?url', import: 'default' }), 8, -1),
  'naomi-walk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/mom_frames/walk_right_*.png', { eager: true, query: '?url', import: 'default' }), 10, -1),
  'joe-idle': load(import.meta.glob('../../assets/art/originals/Charechter Animation/joe_frames/idle_down_*.png', { eager: true, query: '?url', import: 'default' }), 4, -1),
  'joe-talk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/joe_frames/talk_down_*.png', { eager: true, query: '?url', import: 'default' }), 8, -1),
  'joe-walk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/joe_frames/walk_right_*.png', { eager: true, query: '?url', import: 'default' }), 10, -1),
  'dandan-idle': load(import.meta.glob('../../assets/art/originals/Charechter Animation/dandan_frames/idle_down_*.png', { eager: true, query: '?url', import: 'default' }), 5, -1),
  'dandan-talk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/dandan_frames/talk_down_*.png', { eager: true, query: '?url', import: 'default' }), 8, -1),
  'dandan-walk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/dandan_frames/walk_right_*.png', { eager: true, query: '?url', import: 'default' }), 10, -1),
  'eithan-idle': load(import.meta.glob('../../assets/art/originals/Charechter Animation/eithan_frames/idle_down_*.png', { eager: true, query: '?url', import: 'default' }), 4, -1),
  'eithan-talk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/eithan_frames/talk_down_*.png', { eager: true, query: '?url', import: 'default' }), 8, -1),
  'eithan-walk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/eithan_frames/walk_right_*.png', { eager: true, query: '?url', import: 'default' }), 10, -1),
  'davdav-idle': load(import.meta.glob('../../assets/art/originals/Charechter Animation/davdav_frames/idle_down_*.png', { eager: true, query: '?url', import: 'default' }), 6, -1),
  'davdav-talk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/davdav_frames/talk_down_*.png', { eager: true, query: '?url', import: 'default' }), 8, -1),
  'davdav-walk': load(import.meta.glob('../../assets/art/originals/Charechter Animation/davdav_frames/walk_right_*.png', { eager: true, query: '?url', import: 'default' }), 10, -1),
  'davdav-wave': load(import.meta.glob('../../assets/art/originals/Charechter Animation/davdav_frames/wave_a_*.png', { eager: true, query: '?url', import: 'default' }), 8, 2),
  'chaya-talk': load(import.meta.glob('../../assets/art/originals/grandma/grandma_frames_talk_down_*_2x.png', { eager: true, query: '?url', import: 'default' }), 8, -1),
  'chaya-idle': load(import.meta.glob('../../assets/art/originals/grandma/grandma_frames_idle_*_2x.png', { eager: true, query: '?url', import: 'default' }), 4, -1),
  'chaya-judge': load(import.meta.glob('../../assets/art/originals/grandma/grandma_frames_judge_*_2x.png', { eager: true, query: '?url', import: 'default' }), 6, 0),
  zzz: load(import.meta.glob('../../assets/art/originals/alan_sleep/zzz_*.png', { eager: true, query: '?url', import: 'default' }), 6, -1),
};

import bridge0 from '../../assets/art/originals/bridge/bridge_v5_00_nomug.png';
import bridge1 from '../../assets/art/originals/bridge/bridge_v5_01_nomug.png';
import panUrl from '../../assets/art/originals/jack/props/frying_pan@4x.png';
import coffeeUrl from '../../assets/art/originals/jack/props/coffee@4x.png';
import manualUrl from '../../assets/art/originals/jack/props/manual@4x.png';

export const STILLS = {
  bridge0,
  bridge1,
  pan: panUrl,
  coffee: coffeeUrl,
  manual: manualUrl,
};
