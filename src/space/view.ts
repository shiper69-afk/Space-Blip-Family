// Scene loop for the procedural start screen. Drawing matches the approved reference.
// @ts-nocheck
import { SB } from './generators';

const TAU = SB.TAU;
const clamp = SB.clamp;
const mix = SB.mix;

const PAL = {
  c1: [150, 50, 200],
  c2: [50, 100, 235],
  c3: [60, 215, 205],
  masses: [[0.08, 0.9, 0.32, 0.38, 0.95], [0.95, 0.1, 0.32, 0.34, 0.85], [0.55, 0.45, 0.30, 0.24, 0.22]],
};
const STAR_COLORS = [[207, 224, 255], [255, 255, 255], [255, 241, 208], [255, 217, 176], [255, 183, 160], [185, 208, 255]];
const STAGES = [[1024, 512], [1536, 768]];
const TILT = -0.38;

let sharedAssets = null;

function toCanvas(img) {
  const c = document.createElement('canvas');
  c.width = img.w;
  c.height = img.h;
  const x = c.getContext('2d');
  const id = x.createImageData(img.w, img.h);
  id.data.set(img.data);
  x.putImageData(id, 0, 0);
  return c;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

async function buildAssets(onProgress) {
  const A = {};
  const jobs = [
    ['backdrop', () => toCanvas(SB.makeBackdrop(640, 360))],
    ['nebula', () => toCanvas(SB.makeNebula(480, 270, 3, PAL))],
    ['gal1', () => toCanvas(SB.makeGalaxy(512, 11, { arms: 2, winds: 0.95 }))],
    ['gal2', () => toCanvas(SB.makeGalaxy(512, 23, { arms: 2, bar: 1, winds: 0.8, core: [255, 214, 150], arm: [255, 196, 140], knot: [255, 160, 120], dust: 1.3 }))],
    ['gal3', () => toCanvas(SB.makeGalaxy(512, 5, { arms: 3, winds: 0.7, arm: [255, 160, 205], knot: [255, 205, 232], core: [255, 232, 222] }))],
    ['sun', () => toCanvas(SB.makeGlow(512, [255, 208, 140], 2.3, 0.55))],
    ['rays', () => toCanvas(SB.makeRays(512, 3))],
    ['atmos', () => toCanvas(SB.makeAtmosphere(640, 200))],
    ['gas', () => toCanvas(SB.makeBody(256, 3, 'gas'))],
    ['rust', () => toCanvas(SB.makeBody(256, 9, 'rust'))],
    ['ice', () => toCanvas(SB.makeBody(256, 5, 'ice'))],
    ['moon', () => toCanvas(SB.makeBody(128, 2, 'moon'))],
    ['ring', () => toCanvas(SB.makeRing(512, 4))],
    ['streak', () => toCanvas(SB.makeStreak(256, 8))],
    ['ship', () => toCanvas(SB.makeShip(160, 80))],
    ['smoke', () => toCanvas(SB.makeGlow(48, [190, 180, 170], 1.8, 0.1))],
    ['flame', () => toCanvas(SB.makeGlow(48, [255, 150, 60], 1.6, 0.4))],
  ];
  A.flares = STAR_COLORS.map((c) => toCanvas(SB.makeFlare(96, c)));
  const base = new SB.PlanetTexture(512, 256, 7);
  base.step(1e9, () => performance.now());
  for (let i = 0; i < jobs.length; i++) {
    await tick();
    A[jobs[i][0]] = jobs[i][1]();
    onProgress((i + 1) / jobs.length);
  }
  await tick();
  return { A, base };
}

export function startSpaceView(canvas, onProgress) {
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const SPEED = reduceMotion ? 0.3 : 1;
  const ease = (x) => { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); };
  const ctx = canvas.getContext('2d', { alpha: false });
  let dead = false;
  let raf = 0;
  let resizeTimer = 0;

  let W = 0, H = 0, dpr = 1, CX = 0, CY = 0, R = 0, quality = 1, D = 0;
  let lut = null, pcanvas = null, pimg = null, planetMsEMA = 4, planetEvery = 1, planetFrame = 0;
  let stars = [];
  let bodies = [];
  let planetTex = null, pendingTex = null, nextStage = 0;
  let A = null;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let T0 = 0, last = 0, tShoot = 7, shoot = null, frameN = 0;
  let crossing = [], nextCross = 1.4;

  const GAL = [
    { img: 'gal1', x: 0.14, y: 0.66, d: 0.64, squash: 0.60, rot: -0.55, alpha: 0.95, spin: 0.040, ph: 0.3 },
    { img: 'gal2', x: 0.87, y: 0.27, d: 0.52, squash: 0.42, rot: 0.35, alpha: 0.9, spin: -0.035, ph: 1.9 },
    { img: 'gal3', x: 0.78, y: 0.85, d: 0.32, squash: 0.80, rot: 1.1, alpha: 0.8, spin: 0.055, ph: 4.0 },
  ];

  function rebuildPlanetTarget() {
    const want = Math.round(Math.min(2 * R * dpr, 640) * quality);
    D = Math.max(240, want);
    lut = SB.buildPlanetLUT(D, TILT);
    pcanvas = document.createElement('canvas');
    pcanvas.width = D;
    pcanvas.height = D;
    pimg = pcanvas.getContext('2d').createImageData(D, D);
  }

  function makeStars() {
    const r = SB.rng(1234);
    const cnt = (div) => Math.max(40, Math.round(W * H / div));
    stars = [];
    const spec = [
      { n: cnt(1500), size: [0.7, 1.15], a: [0.25, 0.75], speed: 1.6, par: 4 },
      { n: cnt(6500), size: [1.1, 1.8], a: [0.45, 0.95], speed: 4.0, par: 9 },
    ];
    for (const sp of spec) {
      const L = { speed: sp.speed, par: sp.par, byColor: STAR_COLORS.map(() => []) };
      for (let i = 0; i < sp.n; i++) {
        const ci = r() < 0.55 ? 0 : (r() * STAR_COLORS.length) | 0;
        L.byColor[ci].push({
          x: r() * (W + 40), y: r() * (H + 40),
          s: mix(sp.size[0], sp.size[1], r()),
          a: mix(sp.a[0], sp.a[1], r()),
          tw: mix(0.4, 2.6, r()), ph: r() * TAU,
        });
      }
      stars.push(L);
    }
    const flares = [];
    for (let i = 0; i < Math.max(10, Math.round(W * H / 52000)); i++) {
      flares.push({
        x: r() * (W + 40), y: r() * (H + 40),
        s: mix(16, 40, r() * r()), a: mix(0.5, 1, r()),
        tw: mix(0.5, 1.6, r()), ph: r() * TAU, c: (r() * STAR_COLORS.length) | 0,
      });
    }
    stars.flares = flares;
  }

  function layout() {
    if (dead) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    CX = W * 0.5;
    CY = H * 0.44;
    R = Math.min(H * 0.176, W * 0.2);
    const fit = Math.min(1, (W * 0.47) / (R * 3.25));
    bodies = [
      { kind: 'gas', a: 2.50 * R * fit, b: 0.62 * R * fit, rot: -0.16, per: 54, ph: 0.9, d: 0.62 * R, ring: true },
      { kind: 'rust', a: 1.82 * R * fit, b: 0.46 * R * fit, rot: 0.10, per: 33, ph: 3.5, d: 0.34 * R, moon: true },
      { kind: 'ice', a: 3.20 * R * fit, b: 0.86 * R * fit, rot: -0.05, per: 92, ph: 5.3, d: 0.44 * R },
    ];
    rebuildPlanetTarget();
    makeStars();
  }

  function onPointerMove(e) {
    mouse.tx = e.clientX / Math.max(1, W) - 0.5;
    mouse.ty = e.clientY / Math.max(1, H) - 0.5;
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 140);
  }

  function drawStars(t, layerIdx, par) {
    const L = stars[layerIdx];
    const pad = 20, WP = W + pad * 2, HP = H + pad * 2;
    ctx.globalCompositeOperation = 'lighter';
    for (let ci = 0; ci < STAR_COLORS.length; ci++) {
      const arr = L.byColor[ci];
      if (!arr.length) continue;
      const c = STAR_COLORS[ci];
      ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
      for (let i = 0; i < arr.length; i++) {
        const s = arr[i];
        const x = (((s.x - t * L.speed * SPEED) % WP) + WP) % WP - pad + par.x * L.par;
        const y = ((s.y % HP) + HP) % HP - pad + par.y * L.par;
        ctx.globalAlpha = s.a * (0.72 + 0.28 * Math.sin(t * s.tw * SPEED + s.ph));
        ctx.fillRect(x, y, s.s, s.s);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFlares(t, par) {
    const pad = 30, WP = W + pad * 2, HP = H + pad * 2;
    ctx.globalCompositeOperation = 'lighter';
    for (const s of stars.flares) {
      const x = (((s.x - t * 7.0 * SPEED) % WP) + WP) % WP - pad + par.x * 22;
      const y = ((s.y % HP) + HP) % HP - pad + par.y * 22;
      ctx.globalAlpha = s.a * (0.7 + 0.3 * Math.sin(t * s.tw * SPEED + s.ph));
      ctx.drawImage(A.flares[s.c], x - s.s, y - s.s, s.s * 2, s.s * 2);
    }
    ctx.globalAlpha = 1;
  }

  function orbitPos(b, ang, par) {
    const x = b.a * Math.cos(ang), y = b.b * Math.sin(ang), cr = Math.cos(b.rot), sr = Math.sin(b.rot);
    return {
      x: CX + par.x * 8 + x * cr - y * sr,
      y: CY + par.y * 8 + x * sr + y * cr,
      z: Math.sin(ang),
    };
  }

  function drawOrbitDots(par, front) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgb(150,176,255)';
    for (const b of bodies) {
      for (let i = 0; i < 200; i++) {
        const ang = (i / 200) * TAU, z = Math.sin(ang);
        if ((z >= 0) !== front) continue;
        const p = orbitPos(b, ang, par);
        ctx.globalAlpha = 0.05 + 0.13 * (z * 0.5 + 0.5);
        ctx.fillRect(p.x - 0.6, p.y - 0.6, 1.2, 1.2);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawBody(b, ang, t, par, front) {
    const p = orbitPos(b, ang, par);
    if ((p.z >= 0) !== front) return;
    const s = 1 + 0.30 * p.z, d = b.d * s, img = A[b.kind];
    ctx.globalCompositeOperation = 'source-over';
    const fade = 0.80 + 0.20 * (p.z * 0.5 + 0.5);
    let ringS = 0;
    if (b.ring) {
      ringS = d * 2.05;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(-0.30);
      ctx.scale(1, 0.27);
      ctx.globalAlpha = fade;
      ctx.drawImage(A.ring, 0, 0, 512, 256, -ringS / 2, -ringS / 2, ringS, ringS / 2);
      ctx.restore();
    }
    let moon = null;
    if (b.moon) {
      const ma = t * 0.9 * SPEED + 1.0;
      moon = {
        x: p.x + Math.cos(ma) * d * 0.95,
        y: p.y + Math.sin(ma) * d * 0.26 - Math.cos(ma) * d * 0.05,
        z: Math.sin(ma),
        d: d * 0.30,
      };
      if (moon.z < 0) ctx.drawImage(A.moon, moon.x - moon.d / 2, moon.y - moon.d / 2, moon.d, moon.d);
    }
    ctx.globalAlpha = fade;
    ctx.drawImage(img, p.x - d / 2, p.y - d / 2, d, d);
    if (b.ring) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(-0.30);
      ctx.scale(1, 0.27);
      ctx.globalAlpha = fade;
      ctx.drawImage(A.ring, 0, 256, 512, 256, -ringS / 2, 0, ringS, ringS / 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (moon && moon.z >= 0) ctx.drawImage(A.moon, moon.x - moon.d / 2, moon.y - moon.d / 2, moon.d, moon.d);
  }

  function governor() {
    planetEvery = planetMsEMA > 9 ? 3 : planetMsEMA > 4.5 ? 2 : 1;
    if (planetMsEMA > 7 && quality > 0.55) {
      quality *= 0.86;
      rebuildPlanetTarget();
      planetMsEMA *= 0.78;
    } else if (planetMsEMA < 2.2 && quality < 1) {
      quality = Math.min(1, quality * 1.12);
      rebuildPlanetTarget();
    }
  }

  function drawPlanet(t, par, intro) {
    const sc = 1 + 0.10 * (1 - intro), px = CX + par.x * 6, py = CY + par.y * 6;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.95 * intro;
    const g = 3.2 * R * sc;
    ctx.drawImage(A.atmos, px - g / 2, py - g / 2, g, g);
    ctx.globalAlpha = 1;
    if (pendingTex) {
      if (pendingTex.step(3.5, () => performance.now())) { planetTex = pendingTex; pendingTex = null; }
    } else if (nextStage < STAGES.length && frameN > 45) {
      pendingTex = new SB.PlanetTexture(STAGES[nextStage][0], STAGES[nextStage][1], 7);
      nextStage++;
    }
    planetFrame++;
    if (planetFrame % planetEvery === 0 || planetFrame < 3) {
      const t0 = performance.now();
      SB.renderPlanet(lut, planetTex, t * 0.0075 * SPEED, t * 0.0095 * SPEED, pimg);
      pcanvas.getContext('2d').putImageData(pimg, 0, 0);
      const ms = performance.now() - t0;
      planetMsEMA = planetMsEMA * 0.9 + ms * 0.1;
      if (planetFrame % 45 === 0) governor();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = intro;
    ctx.drawImage(pcanvas, px - R * sc, py - R * sc, 2 * R * sc, 2 * R * sc);
    ctx.globalAlpha = 1;
  }

  function launchShip(t) {
    const faceLeft = Math.random() < 0.5;
    crossing.push({
      t0: t,
      dur: mix(3.2, 4.4, Math.random()),
      y: H * mix(0.30, 0.56, Math.random()),
      drift: H * mix(-0.08, 0.08, Math.random()),
      w: clamp(W * mix(0.045, 0.075, Math.random()), 56, 120),
      faceLeft,
      front: Math.random() < 0.8,
      wobble: mix(6, 11, Math.random()),
    });
    nextCross = t + mix(3.6, 6.4, Math.random());
  }

  function drawShips(t, par, front) {
    if (reduceMotion) return;
    if (t >= nextCross && crossing.length < 2) launchShip(t);
    for (let i = crossing.length - 1; i >= 0; i--) {
      const s = crossing[i];
      if (s.front !== front) continue;
      const p = (t - s.t0) / s.dur;
      if (p >= 1) { crossing.splice(i, 1); continue; }
      if (p < 0) continue;
      const x = (s.faceLeft ? W * (1.12 - 1.24 * p) : W * (-0.12 + 1.24 * p)) + par.x * 14;
      const y = s.y + s.drift * p + Math.sin(p * s.wobble) * H * 0.008 + par.y * 10;
      const w = s.w, h = w / 2, bank = Math.sin(p * s.wobble) * 0.07;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((s.faceLeft ? -1 : 1) * 0.12 + bank);
      ctx.scale(s.faceLeft ? -1 : 1, 1);
      const sput = (Math.floor(t * 2.4 + i) % 5) === 4;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = sput ? 0 : 0.55 + 0.25 * Math.sin(t * 31 + i);
      ctx.drawImage(A.flame, -w * 0.52 - w * 0.22, -h * 0.25, w * 0.34, h * 0.5);
      for (let k = 0; k < 6; k++) {
        const age = ((t * 1.5 + k / 6) % 1);
        const px = -w * 0.5 - age * w * 1.15;
        const py = -h * 0.05 + Math.sin(age * 5 + k) * h * 0.1;
        const sz = h * (0.22 + age * 0.85);
        ctx.globalAlpha = (1 - age) * 0.32;
        ctx.drawImage(A.smoke, px - sz / 2, py - sz / 2, sz, sz);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.drawImage(A.ship, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawShoot(t, dt) {
    if (reduceMotion) return;
    if (!shoot && t > tShoot) {
      const a = mix(0.45, 0.75, Math.random()), sp = mix(900, 1300, Math.random());
      shoot = {
        x: W * mix(0.45, 1.05, Math.random()),
        y: H * mix(-0.05, 0.35, Math.random()),
        vx: -Math.cos(a) * sp, vy: Math.sin(a) * sp,
        age: 0, life: mix(0.7, 1.1, Math.random()), len: mix(160, 280, Math.random()),
      };
      tShoot = t + mix(6, 13, Math.random());
    }
    if (!shoot) return;
    shoot.age += dt;
    shoot.x += shoot.vx * dt;
    shoot.y += shoot.vy * dt;
    const f = shoot.age / shoot.life;
    if (f >= 1) { shoot = null; return; }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(shoot.x, shoot.y);
    ctx.rotate(Math.atan2(shoot.vy, shoot.vx));
    ctx.globalAlpha = Math.sin(Math.PI * Math.min(1, f * 1.1)) * 0.95;
    ctx.drawImage(A.streak, -shoot.len, -2.5, shoot.len, 5);
    ctx.restore();
  }

  function draw(t, dt) {
    const intro = ease((t - 0.2) / 2.4);
    const par = { x: mouse.x + Math.sin(t * 0.05) * 0.12, y: mouse.y + Math.cos(t * 0.04) * 0.08 };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(A.backdrop, 0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.62;
    {
      const w = W * 1.16, h = H * 1.16;
      ctx.drawImage(A.nebula, -(w - W) / 2 + par.x * -10 + Math.sin(t * 0.05) * 8, -(h - H) / 2 + par.y * -10 + Math.cos(t * 0.04) * 6, w, h);
    }
    ctx.globalAlpha = 0.24;
    {
      const w = W * 1.4, h = H * 1.4;
      ctx.save();
      ctx.translate(W / 2 + par.x * 16, H / 2 + par.y * 16);
      ctx.rotate(Math.PI);
      ctx.drawImage(A.nebula, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    drawStars(t, 0, par);
    for (const g of GAL) {
      const d = g.d * H;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = g.alpha * intro;
      ctx.translate(g.x * W + par.x * 12, g.y * H + par.y * 12);
      ctx.rotate(g.rot);
      ctx.scale(1, g.squash);
      ctx.rotate(g.ph + t * g.spin * SPEED);
      ctx.drawImage(A[g.img], -d / 2, -d / 2, d, d);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.95 * intro;
    {
      const s = H * 1.5;
      ctx.drawImage(A.sun, -0.03 * W - s / 2 + par.x * 4, -0.07 * H - s / 2 + par.y * 4, s, s);
    }
    ctx.globalAlpha = 0.5 * intro;
    {
      const s = H * 2.6;
      ctx.save();
      ctx.translate(-0.03 * W, -0.07 * H);
      ctx.rotate(t * 0.006 * SPEED);
      ctx.drawImage(A.rays, -s / 2, -s / 2, s, s);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    drawStars(t, 1, par);
    drawShips(t, par, false);
    const off = (1 - intro) * 1.3;
    drawOrbitDots(par, false);
    for (const b of bodies) drawBody(b, b.ph + off + t * TAU / b.per * SPEED, t, par, false);
    drawPlanet(t, par, intro);
    drawOrbitDots(par, true);
    for (const b of bodies) drawBody(b, b.ph + off + t * TAU / b.per * SPEED, t, par, true);
    drawShips(t, par, true);
    drawFlares(t, par);
    drawShoot(t, dt);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(ts) {
    if (dead) return;
    raf = window.requestAnimationFrame(frame);
    if (!T0) { T0 = ts; last = ts; }
    const t = (ts - T0) / 1000;
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    frameN++;
    const k = 1 - Math.exp(-dt * 3.2);
    mouse.x += (mouse.tx - mouse.x) * k;
    mouse.y += (mouse.ty - mouse.y) * k;
    draw(t, dt);
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize);
  layout();

  const boot = (async () => {
    if (!sharedAssets) {
      sharedAssets = buildAssets((p) => { if (!dead) onProgress(p); });
    } else {
      onProgress(1);
    }
    const built = await sharedAssets;
    if (dead) return;
    A = built.A;
    planetTex = built.base;
    window.requestAnimationFrame(frame);
  })();

  return function stop() {
    dead = true;
    cancelAnimationFrame(raf);
    clearTimeout(resizeTimer);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    void boot;
  };
}
