// Procedural start-screen generators, adapted from the approved sharp start screen.
// Ocean specular highlight is not applied; diffuse day/night shading stays.
// @ts-nocheck
const root = {};
/* Start screen - core generators (pure pixel code, no DOM) */
(function (root) {
'use strict';
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0; while (u === 0) u = r(); const v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); }
function createNoise(seed) {
  const r = rng(seed), perm = new Uint8Array(256); for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; const t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
  const p = new Uint8Array(512); for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const grad = (h, x, y, z) => { h &= 15; const u = h < 8 ? x : y, v = h < 4 ? y : (h === 12 || h === 14 ? x : z); return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
  const lerp = (t, a, b) => a + t * (b - a);
  return function (x, y, z) {
    const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z); x -= X; y -= Y; z -= Z;
    const xi = X & 255, yi = Y & 255, zi = Z & 255;
    const u = x * x * x * (x * (x * 6 - 15) + 10), v = y * y * y * (y * (y * 6 - 15) + 10), w = z * z * z * (z * (z * 6 - 15) + 10);
    const A = p[xi] + yi, AA = p[A] + zi, AB = p[A + 1] + zi, B = p[xi + 1] + yi, BA = p[B] + zi, BB = p[B + 1] + zi;
    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)), lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
                    lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)), lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
  };
}
function fbm(n, x, y, z, oct, lac, gain) { let s = 0, a = 1, f = 1, nm = 0; for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f, z * f); nm += a; a *= gain; f *= lac; } return s / nm; }
function ramp(stops, t, out) {                       // stops: [[t,r,g,b],...] ascending
  if (t <= stops[0][0]) { out[0] = stops[0][1]; out[1] = stops[0][2]; out[2] = stops[0][3]; return; }
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) { const a = stops[i - 1], b = stops[i], k = (t - a[0]) / (b[0] - a[0]); out[0] = a[1] + (b[1] - a[1]) * k; out[1] = a[2] + (b[2] - a[2]) * k; out[2] = a[3] + (b[3] - a[3]) * k; return; }
  }
  const l = stops[stops.length - 1]; out[0] = l[1]; out[1] = l[2]; out[2] = l[3];
}
const SUN = (function () { const v = [-0.70, -0.46, 0.55], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();   // direction TO the sun, view space (x right, y down, z toward viewer)

/* ------------------------------------------------------------------ the home planet: equirectangular textures, generated in time-sliced chunks */
class PlanetTexture {
  constructor(w, h, seed) {
    this.w = w; this.h = h; this.row = 0; this.done = false;
    this.albedo = new Uint8ClampedArray(w * h * 4); this.clouds = new Uint8ClampedArray(w * h); this.lights = new Uint8ClampedArray(w * h);
    this.n1 = createNoise(seed); this.n2 = createNoise(seed + 101); this.n3 = createNoise(seed + 202); this.n4 = createNoise(seed + 303);
    this.sinLon = new Float64Array(w); this.cosLon = new Float64Array(w);
    for (let i = 0; i < w; i++) { const lon = ((i + 0.5) / w - 0.5) * TAU; this.sinLon[i] = Math.sin(lon); this.cosLon[i] = Math.cos(lon); }
    this.tmp = [0, 0, 0];
  }
  step(budgetMs, now) {
    const t0 = now();
    while (this.row < this.h) { this.genRow(this.row++); if (now() - t0 > budgetMs) break; }
    if (this.row >= this.h) this.done = true; return this.done;
  }
  genRow(j) {
    const w = this.w, h = this.h, n1 = this.n1, n2 = this.n2, n3 = this.n3, n4 = this.n4, tmp = this.tmp;
    const lat = (0.5 - (j + 0.5) / h) * PI, cl = Math.cos(lat), sl = Math.sin(lat), alat = Math.abs(lat);
    for (let i = 0; i < w; i++) {
      const x = cl * this.sinLon[i], y = sl, z = cl * this.cosLon[i], idx = j * w + i;
      const big = n1(x * 0.9 + 3.1, y * 0.9, z * 0.9);
      const hg = fbm(n1, x * 1.7, y * 1.7, z * 1.7, 5, 2.05, 0.5);
      const H = 0.55 * hg + 0.45 * big, land = H + 0.055;
      const iceN = n4(x * 4, y * 4, z * 4), ice = alat > 1.20 + 0.10 * iceN;
      const m = fbm(n2, x * 2.4 + 7, y * 2.4, z * 2.4, 3, 2.0, 0.5);
      let r, g, b, spec = 0;
      if (ice) { r = 236; g = 244; b = 252; const sh = 0.94 + 0.06 * n3(x * 14, y * 14, z * 14); r *= sh; g *= sh; }
      else if (land < 0) {
        const d = clamp(-land / 0.50, 0, 1);
        ramp([[0, 54, 170, 196], [0.08, 36, 130, 188], [0.35, 16, 78, 160], [1, 5, 26, 84]], d, tmp); r = tmp[0]; g = tmp[1]; b = tmp[2]; spec = 255;
      } else {
        const alt = land;
        if (alt < 0.011) { r = 206; g = 190; b = 136; }
        else {
          const dry = smooth(0.02, -0.28, m) * (1 - smooth(0.5, 1.0, alat));
          ramp([[0, 96, 156, 62], [0.5, 52, 120, 52], [1, 28, 84, 40]], smooth(-0.25, 0.4, m), tmp); r = tmp[0]; g = tmp[1]; b = tmp[2];
          r = mix(r, 208, dry); g = mix(g, 170, dry); b = mix(b, 104, dry);
          const tun = smooth(0.85, 1.15, alat); r = mix(r, 150, tun * 0.7); g = mix(g, 160, tun * 0.7); b = mix(b, 138, tun * 0.7);
          const rock = smooth(0.26, 0.46, alt); r = mix(r, 124, rock); g = mix(g, 104, rock); b = mix(b, 80, rock);
          const gr = smooth(0.46, 0.60, alt); r = mix(r, 158, gr); g = mix(g, 156, gr); b = mix(b, 150, gr);
          const sn = smooth(0.58, 0.70, alt); r = mix(r, 244, sn); g = mix(g, 246, sn); b = mix(b, 250, sn);
        }
      }
      const micro = 1 + 0.10 * fbm(n3, x * 9, y * 9, z * 9, 2, 2.2, 0.5);
      const a4 = idx * 4; this.albedo[a4] = r * micro; this.albedo[a4 + 1] = g * micro; this.albedo[a4 + 2] = b * micro; this.albedo[a4 + 3] = spec;
      // clouds: warped, banded
      const wx = n3(x * 2.1, y * 2.1, z * 2.1), wy = n3(x * 2.1 + 5.2, y * 2.1 + 1.3, z * 2.1), wz = n3(x * 2.1 + 2.4, y * 2.1 + 8.1, z * 2.1);
      let c = fbm(n3, (x + 0.45 * wx) * 2.6 + 11, (y + 0.45 * wy) * 2.6, (z + 0.45 * wz) * 2.6, 5, 2.1, 0.5); c += 0.16 * Math.sin(lat * 7 + wx * 2.2);
      this.clouds[idx] = smooth(0.02, 0.50, c) * 245;
      // city lights on the night side
      if (land > 0.02 && !ice && alat < 1.1) {
        const cityN = fbm(n4, x * 10 + 2, y * 10, z * 10, 2, 2.2, 0.5), spot = n4(x * 38, y * 38, z * 38);
        this.lights[idx] = smooth(0.18, 0.55, cityN) * smooth(0.15, 0.6, spot) * (1 - smooth(0.30, 0.6, land)) * 255;
      }
    }
  }
}
function buildPlanetLUT(D, tilt) {
  const r = D / 2, nx0 = D * D, pix = new Int32Array(nx0), u0 = new Float32Array(nx0), v16 = new Uint16Array(nx0);
  const cov = new Uint8Array(nx0), lightA = new Uint8Array(nx0), spc = new Uint8Array(nx0), rim = new Uint8Array(nx0), nfA = new Uint8Array(nx0), tmA = new Uint8Array(nx0);
  const L = SUN, Hx = L[0], Hy = L[1], Hz = L[2] + 1, Hl = Math.hypot(Hx, Hy, Hz), ct = Math.cos(tilt), st = Math.sin(tilt); let n = 0;
  for (let py = 0; py < D; py++) for (let px = 0; px < D; px++) {
    let nx = (px + 0.5 - r) / r, ny = (py + 0.5 - r) / r, rho2 = nx * nx + ny * ny, rho = Math.sqrt(rho2);
    if (rho > 1 + 1.2 / r) continue;
    let nz; if (rho >= 1) { nx /= rho; ny /= rho; nz = 0; } else nz = Math.sqrt(1 - rho2);
    const xo = nx * ct + ny * st, yo = -nx * st + ny * ct, lon = Math.atan2(xo, nz), lat = Math.asin(clamp(-yo, -1, 1));
    pix[n] = py * D + px; u0[n] = lon / TAU + 0.5; v16[n] = clamp(0.5 - lat / PI, 0, 0.99999) * 65536;
    const df = nx * L[0] + ny * L[1] + nz * L[2]; spc[n] = Math.pow(Math.max(0, (nx * Hx + ny * Hy + nz * Hz) / Hl), 110) * 255;
    rim[n] = clamp(Math.pow(1 - nz, 3.2) * (0.30 + 0.70 * clamp(df + 0.35, 0, 1)), 0, 1) * 255; cov[n] = clamp(((1 - rho) * r + 0.5), 0, 1) * 255;
    const lam = Math.pow(clamp((df + 0.12) / 1.12, 0, 1), 1.1); lightA[n] = (0.035 + 0.965 * lam) * 255; nfA[n] = (1 - smooth(-0.02, 0.22, df)) * 255;
    const q = (df - 0.05) / 0.11; tmA[n] = Math.exp(-q * q) * 255; n++;
  }
  return { D, n, pix, u0, v16, cov, lightA, spc, rim, nfA, tmA };
}
function renderPlanet(lut, tex, rot, cloudRot, out) {
  const d = out.data, n = lut.n, Wt = tex.w, Ht = tex.h, A = tex.albedo, C = tex.clouds, LT = tex.lights, pix = lut.pix, u0 = lut.u0, v16 = lut.v16, rim = lut.rim, cov = lut.cov, lightA = lut.lightA, nfA = lut.nfA, tmA = lut.tmA, k255 = 1 / 255;
  for (let k = 0; k < n; k++) {
    let u = u0[k] + rot; u -= (u | 0); const fx = u * Wt, i0 = fx | 0, fr = fx - i0; let i1 = i0 + 1; if (i1 >= Wt) i1 = 0;
    const row = ((v16[k] * Ht) >> 16) * Wt, a0 = (row + i0) * 4, a1 = (row + i1) * 4, ifr = 1 - fr;
    const r = A[a0] * ifr + A[a1] * fr, g = A[a0 + 1] * ifr + A[a1 + 1] * fr, b = A[a0 + 2] * ifr + A[a1 + 2] * fr;
    let uc = u0[k] + cloudRot; uc -= (uc | 0); const fc = uc * Wt, c0 = fc | 0, cf = fc - c0; let c1 = c0 + 1; if (c1 >= Wt) c1 = 0;
    const cl = (C[row + c0] * (1 - cf) + C[row + c1] * cf) * k255, lights = LT[row + i0] * k255, light = lightA[k] * k255, night = 1 - (light - 0.035) * 1.0363;
    let R = r * light + 4 * night, G = g * light * 0.97 + 9 * night, B = b * light * 0.92 + 24 * night;
    const cc = cl * 0.93, cLit = 0.06 + 0.94 * (1 - night), icc = 1 - cc; R = R * icc + 250 * cLit * cc; G = G * icc + 252 * cLit * cc; B = B * icc + 255 * cLit * cc;
    const nf = nfA[k] * k255 * lights * (1 - cc * 0.85); R += 255 * nf; G += 190 * nf; B += 96 * nf;
    const tm = tmA[k] * k255 * 0.20 * (1 - cc * 0.5); R += 255 * tm; G += 108 * tm; B += 40 * tm;
    const rm = rim[k] * k255; R += 70 * rm; G += 130 * rm; B += 230 * rm;
    const o = pix[k] * 4; d[o] = R; d[o + 1] = G; d[o + 2] = B; d[o + 3] = cov[k];
  }
}
function makeAtmosphere(size, rCore) {
  const w = size, h = size, data = new Uint8ClampedArray(w * h * 4), c = size / 2, L2 = Math.hypot(SUN[0], SUN[1]), lx = SUN[0] / L2, ly = SUN[1] / L2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.hypot(dx, dy), rho = d / rCore; let v = 0;
    if (rho > 0.985) { const e = rho - 1; const g = Math.exp(-Math.max(0, e) / 0.055) * 0.9 + Math.exp(-Math.max(0, e) / 0.22) * 0.35; const sun = clamp((dx * lx + dy * ly) / (d + 1e-6) * 0.5 + 0.62, 0.12, 1); v = g * sun * (1 - smooth(0.985, 1.0, 2 - rho) * 0) * smooth(0.985, 1.01, rho); }
    const o = (y * w + x) * 4; data[o] = 70 * v + 20 * v * v; data[o + 1] = 140 * v + 30 * v * v; data[o + 2] = 255 * v; data[o + 3] = 255;
  }
  return { w, h, data };
}
/* ------------------------------------------------------------------ other planets: lit sprites (source-over, anti-aliased edge) */
function hash3(ix, iy, iz, k) { let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(iz, 1274126177) + Math.imul(k, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function craters(lon, lat, cs, rmin, rmax, k) {      // 2D cellular crater field in (lon, lat) space, stretched to stay round; returns a shading offset
  const sx = 1 / Math.max(0.25, Math.cos(lat)), x = lon * 1.0 / cs, y = lat / cs, ix = Math.floor(x), iy = Math.floor(y); let best = 0;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
    const cx = ix + a, cy = iy + b; if (hash3(cx, cy, 7, k) > 0.58) continue;
    const px = cx + hash3(cx, cy, 7, k + 1), py = cy + hash3(cx, cy, 7, k + 2), rr = mix(rmin, rmax, hash3(cx, cy, 7, k + 4)) / cs;
    const d = Math.hypot((x - px) / sx, y - py) / rr; if (d > 1.6) continue;
    const bowl = d < 1 ? -0.34 * (1 - d * d) : 0, rimv = 0.30 * Math.exp(-((d - 1.05) / 0.16) * ((d - 1.05) / 0.16)); const v = bowl + rimv; if (Math.abs(v) > Math.abs(best)) best = v;
  }
  return best;
}
function makeBody(size, seed, type) {
  const w = size, h = size, data = new Uint8ClampedArray(w * h * 4), n = createNoise(seed), n2 = createNoise(seed + 7), r = size / 2, L = SUN, tmp = [0, 0, 0];
  const tilt = type === 'gas' ? -0.22 : type === 'ice' ? 0.35 : -0.4, ct = Math.cos(tilt), st = Math.sin(tilt);
  const atm = type === 'gas' ? [255, 190, 120] : type === 'ice' ? [120, 230, 255] : type === 'rust' ? [255, 150, 90] : [0, 0, 0], atmK = type === 'moon' ? 0 : type === 'gas' ? 0.5 : type === 'ice' ? 0.95 : 0.55;
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    let nx = (px + 0.5 - r) / r, ny = (py + 0.5 - r) / r; const rho2 = nx * nx + ny * ny, rho = Math.sqrt(rho2); if (rho > 1 + 1.2 / r) continue;
    let nz; if (rho >= 1) { nx /= rho; ny /= rho; nz = 0; } else nz = Math.sqrt(1 - rho2);
    const ox = nx * ct + ny * st, oy = -(-nx * st + ny * ct), oz = nz;       // oy = up
    let cr, cg, cb;
    if (type === 'gas') {
      const t1 = n(ox * 2.2, oy * 1.0, oz * 2.2), t2 = n2(ox * 6.0, oy * 2.4, oz * 6.0), v = oy * 6.2 + 0.20 * t1 + 0.07 * t2, band = 0.5 + 0.5 * Math.sin(v * PI * 1.0);
      ramp([[0, 128, 84, 58], [0.3, 200, 150, 104], [0.6, 238, 212, 164], [0.85, 186, 124, 80], [1, 150, 100, 70]], clamp(band + 0.15 * t2, 0, 1), tmp); cr = tmp[0]; cg = tmp[1]; cb = tmp[2];
      const lon = Math.atan2(ox, oz), dl = (lon + 0.30) / 0.34, dla = (oy + 0.26) / 0.13, dd = Math.sqrt(dl * dl + dla * dla), sp = 1 - smooth(0.45, 1.0, dd);          // the great spot
      cr = mix(cr, 206, sp); cg = mix(cg, 96, sp); cb = mix(cb, 62, sp); const rg = Math.exp(-((dd - 1.05) / 0.12) * ((dd - 1.05) / 0.12)) * 0.5; cr = mix(cr, 244, rg); cg = mix(cg, 224, rg); cb = mix(cb, 200, rg);
    } else if (type === 'rust') {
      const e = fbm(n, ox * 2.2 + 3, oy * 2.2, oz * 2.2, 5, 2.05, 0.5);
      ramp([[0, 84, 36, 26], [0.45, 168, 88, 50], [1, 224, 156, 100]], clamp(0.5 + e * 0.9, 0, 1), tmp); cr = tmp[0]; cg = tmp[1]; cb = tmp[2];
      const lat_ = Math.asin(clamp(oy, -1, 1)), lon_ = Math.atan2(ox, oz), cs = craters(lon_, lat_, 0.55, 0.07, 0.24, 11); cr *= 1 + cs; cg *= 1 + cs; cb *= 1 + cs;
      const cap = smooth(0.86, 0.94, Math.abs(oy) + 0.06 * n2(ox * 6, oy * 6, oz * 6)); cr = mix(cr, 238, cap); cg = mix(cg, 236, cap); cb = mix(cb, 244, cap);
    } else if (type === 'ice') {
      const t1 = n(ox * 2.0, oy * 1.4, oz * 2.0), v = oy * 5.0 + 0.6 * t1, band = 0.5 + 0.5 * Math.sin(v * PI);
      ramp([[0, 38, 104, 138], [0.35, 86, 184, 208], [0.7, 166, 228, 240], [1, 70, 150, 190]], clamp(band, 0, 1), tmp); cr = tmp[0]; cg = tmp[1]; cb = tmp[2];
      const wx = n2(ox * 2.4, oy * 2.4, oz * 2.4), c = fbm(n2, (ox + 0.5 * wx) * 3.0 + 4, oy * 3.4, (oz + 0.5 * wx) * 3.0, 4, 2.1, 0.5), cl = smooth(0.10, 0.50, c) * 0.85; cr = mix(cr, 246, cl); cg = mix(cg, 252, cl); cb = mix(cb, 255, cl);
    } else {
      const e = fbm(n, ox * 3, oy * 3, oz * 3, 4, 2.1, 0.5), g = 150 + 50 * e; cr = g; cg = g * 0.98; cb = g * 0.94; const lat_ = Math.asin(clamp(oy, -1, 1)), lon_ = Math.atan2(ox, oz), cs = craters(lon_, lat_, 0.42, 0.06, 0.20, 31); cr *= 1 + cs; cg *= 1 + cs; cb *= 1 + cs;
    }
    const df = nx * L[0] + ny * L[1] + nz * L[2]; let lam = clamp((df + 0.10) / 1.10, 0, 1); lam = Math.pow(lam, 1.05); const light = 0.03 + 0.97 * lam, night = 1 - lam, limb = 0.62 + 0.38 * Math.pow(nz, 0.5);
    let R = cr * light * 1.0 * limb + 3 * night, G = cg * light * 0.97 * limb + 7 * night, B = cb * light * 0.92 * limb + 18 * night;
    const rim = Math.pow(1 - nz, 3.0) * (0.25 + 0.75 * clamp(df + 0.35, 0, 1)) * atmK; R += atm[0] * rim * 0.55; G += atm[1] * rim * 0.55; B += atm[2] * rim * 0.55;
    const o = (py * w + px) * 4; data[o] = R; data[o + 1] = G; data[o + 2] = B; data[o + 3] = clamp((1 - rho) * r + 0.5, 0, 1) * 255;
  }
  return { w, h, data };
}
function makeRing(size, seed) {
  const w = size, h = size, data = new Uint8ClampedArray(w * h * 4), n = createNoise(seed), c = size / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x + 0.5 - c, dy = y + 0.5 - c, rho = Math.hypot(dx, dy) / c; if (rho > 1.02 || rho < 0.55) continue;
    let a = smooth(0.60, 0.625, rho) * (1 - smooth(0.975, 1.0, rho)); a *= 1 - 0.95 * Math.exp(-((rho - 0.80) / 0.014) * ((rho - 0.80) / 0.014));
    const bands = 0.62 + 0.20 * Math.sin(rho * 46 + 3 * n(rho * 5, 0.5, 1.2)) + 0.10 * Math.sin(rho * 118 + 1.3); const grain = 0.92 + 0.08 * n(dx * 0.08, dy * 0.08, 3.3); a *= clamp(bands, 0.15, 1) * grain;
    const t = smooth(0.6, 1.0, rho), o = (y * w + x) * 4; data[o] = mix(226, 192, t); data[o + 1] = mix(204, 168, t); data[o + 2] = mix(168, 138, t); data[o + 3] = clamp(a * 0.92, 0, 1) * 255;
  }
  return { w, h, data };
}
/* ------------------------------------------------------------------ galaxies, nebula, lights (additive sprites: black = nothing) */
function boxBlur(src, w, h, ch) {                 // separable 3-tap blur
  const t = new Float32Array(src.length), out = new Float32Array(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const xl = x > 0 ? x - 1 : x, xr = x < w - 1 ? x + 1 : x; for (let k = 0; k < ch; k++) t[(y * w + x) * ch + k] = (src[(y * w + xl) * ch + k] + src[(y * w + x) * ch + k] + src[(y * w + xr) * ch + k]) / 3; }
  for (let y = 0; y < h; y++) { const yu = y > 0 ? y - 1 : y, yd = y < h - 1 ? y + 1 : y; for (let x = 0; x < w; x++) for (let k = 0; k < ch; k++) out[(y * w + x) * ch + k] = (t[(yu * w + x) * ch + k] + t[(y * w + x) * ch + k] + t[(yd * w + x) * ch + k]) / 3; }
  return out;
}
function makeGalaxy(size, seed, o) {
  o = Object.assign({ arms: 2, winds: 0.95, N: 110000, scatter: 0.40, bar: 0, core: [255, 226, 168], arm: [150, 190, 255], knot: [255, 128, 190], exposure: 1.0, bulge: 0.14, dust: 1.0, weight: 0.30 }, o || {});
  const r = rng(seed), w = size, h = size, acc = new Float32Array(w * h * 3), dust = new Float32Array(w * h), cx = size / 2, cy = size / 2, R = size * 0.44, hs = 0.30 * R;
  const splat = (buf, ch, x, y, c0, c1, c2, wt) => { const x0 = Math.floor(x), y0 = Math.floor(y); if (x0 < 0 || y0 < 0 || x0 >= w - 1 || y0 >= h - 1) return; const fx = x - x0, fy = y - y0, ws = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy], of = [0, 1, w, w + 1];
    for (let q = 0; q < 4; q++) { const i = (y0 * w + x0 + of[q]); if (ch === 3) { buf[i * 3] += c0 * ws[q] * wt; buf[i * 3 + 1] += c1 * ws[q] * wt; buf[i * 3 + 2] += c2 * ws[q] * wt; } else buf[i] += ws[q] * wt; } };
  const cmax = 1 - Math.exp(-R / hs), barA = r() * TAU;
  for (let i = 0; i < o.N; i++) {
    const f = clamp(-hs * Math.log(1 - r() * cmax) / R, 0, 1), isArm = r() < 0.58, tt = smooth(0.0, 0.85, f);
    let th, wgt;
    if (isArm) { const arm = (r() * o.arms) | 0; th = arm * TAU / o.arms + o.winds * TAU * Math.pow(f, 0.85) + gauss(r) * o.scatter * (1.1 - 0.55 * f); wgt = o.weight * 1.25; }
    else { th = r() * TAU; wgt = o.weight * 0.55; }                                                                            // the diffuse disk between the arms
    const rad = f * R; let x = cx + rad * Math.cos(th), y = cy + rad * Math.sin(th);
    splat(acc, 3, x, y, mix(o.core[0], o.arm[0], tt), mix(o.core[1], o.arm[1], tt), mix(o.core[2], o.arm[2], tt), wgt);
    if (isArm && r() < 0.03 && f > 0.22) splat(acc, 3, x, y, o.knot[0], o.knot[1], o.knot[2], o.weight * 3.0);                       // glowing star-forming knots
    if (isArm && r() < 0.15 && f > 0.15 && f < 0.85) { const td = th - 0.20 + gauss(r) * 0.06; splat(dust, 1, cx + rad * Math.cos(td), cy + rad * Math.sin(td), 0, 0, 0, 1); }   // dust lanes
  }
  if (o.bar) for (let i = 0; i < o.N * 0.16; i++) { const s2 = gauss(r) * 0.15 * R, wdt = gauss(r) * 0.040 * R; splat(acc, 3, cx + s2 * Math.cos(barA) - wdt * Math.sin(barA), cy + s2 * Math.sin(barA) + wdt * Math.cos(barA), o.core[0], o.core[1], o.core[2], o.weight * 0.75); }     // a soft central bar
  for (let i = 0; i < o.N * 0.22; i++) { const rr = Math.abs(gauss(r)) * o.bulge * R, a = r() * TAU; splat(acc, 3, cx + rr * Math.cos(a), cy + rr * Math.sin(a) * (o.bar ? 0.8 : 1), o.core[0], o.core[1], o.core[2], o.weight * 0.5); }
  let a1 = boxBlur(acc, w, h, 3); a1 = boxBlur(a1, w, h, 3); let d1 = boxBlur(dust, w, h, 1); d1 = boxBlur(d1, w, h, 1);
  const data = new Uint8ClampedArray(w * h * 4), rs = rng(seed + 99);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, dxx = x + 0.5 - cx, dyy = y + 0.5 - cy, rho = Math.hypot(dxx, dyy) / (size / 2), dm = Math.exp(-d1[i] * 0.050 * o.dust);
    const glow = Math.exp(-(rho / 0.10) * (rho / 0.10)) * 0.34 + Math.exp(-(rho / 0.5) * (rho / 0.5)) * 0.04, edge = 1 - smooth(0.78, 1.0, rho);
    let R_ = (a1[i * 3] * dm) * o.exposure / 255 * 1.6 + glow * o.core[0] / 255, G_ = (a1[i * 3 + 1] * dm) * o.exposure / 255 * 1.6 + glow * o.core[1] / 255, B_ = (a1[i * 3 + 2] * dm) * o.exposure / 255 * 1.6 + glow * o.core[2] / 255;
    const sp = rs() < 0.0035 * Math.exp(-rho * 2.5) ? 0.55 : 0;                                                                // a few individual bright stars
    R_ = R_ / (1 + R_ * 0.7) + sp; G_ = G_ / (1 + G_ * 0.7) + sp; B_ = B_ / (1 + B_ * 0.7) + sp;
    const o4 = i * 4; data[o4] = 255 * R_ * edge * 1.05; data[o4 + 1] = 255 * G_ * edge * 1.05; data[o4 + 2] = 255 * B_ * edge * 1.05; data[o4 + 3] = 255;
  }
  return { w, h, data };
}
function makeNebula(w, h, seed, pal) {
  const n1 = createNoise(seed), n2 = createNoise(seed + 5), n3 = createNoise(seed + 9), data = new Uint8ClampedArray(w * h * 4), asp = w / h, S = 2.3;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = x / w, v = y / h, sx = u * asp * S, sy = v * S;
    const warpx = n1(sx * 0.8 + 4.3, sy * 0.8 + 1.1, 1.7), warpy = n1(sx * 0.8 + 9.7, sy * 0.8 + 3.3, 5.1);
    const a = fbm(n2, sx + warpx * 0.9 + 0.31, sy + warpy * 0.9 + 0.17, 0.43, 6, 2.1, 0.55) * 0.5 + 0.5, b = fbm(n3, sx * 1.3 + 7.3 - warpy * 0.6, sy * 1.3 + warpx * 0.6 + 0.7, 2.37, 5, 2.0, 0.55) * 0.5 + 0.5, c = fbm(n1, sx * 2.4 + 2.2, sy * 2.4 + 0.6, 8.83, 4, 2.2, 0.5) * 0.5 + 0.5;
    let m1 = 0; for (const mass of pal.masses) { const dx = (u - mass[0]) / mass[2], dy = (v - mass[1]) / mass[3]; m1 += mass[4] * Math.exp(-(dx * dx + dy * dy)); }
    const d1 = smooth(0.30, 0.80, a) * m1, d2 = smooth(0.34, 0.82, b) * m1 * 0.9, d3 = Math.pow(smooth(0.45, 0.95, c), 1.6) * m1 * 0.8;
    const o = (y * w + x) * 4;
    data[o] = clamp(pal.c1[0] * d1 + pal.c2[0] * d2 + pal.c3[0] * d3, 0, 255); data[o + 1] = clamp(pal.c1[1] * d1 + pal.c2[1] * d2 + pal.c3[1] * d3, 0, 255); data[o + 2] = clamp(pal.c1[2] * d1 + pal.c2[2] * d2 + pal.c3[2] * d3, 0, 255); data[o + 3] = 255;
  }
  return { w, h, data };
}
function makeBackdrop(w, h) {                    // deep-space gradient with a faint warm haze toward the sun (upper left); ordered dither to keep it band-free
  const data = new Uint8ClampedArray(w * h * 4), bay = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = x / w, v = y / h, d = Math.hypot((u - 0.5) * 1.15, (v - 0.46)), sun = (function (q) { return Math.exp(-q * q); })(Math.hypot(u + 0.04, (v + 0.06) * 0.8) / 0.55), vg = smooth(0.25, 0.95, d), dt = (bay[(y & 3) * 4 + (x & 3)] / 16 - 0.5);
    const R = 7 + 12 * (1 - vg) * 0.7 + 22 * sun - 6 * vg, G = 9 + 14 * (1 - vg) * 0.7 + 14 * sun - 7 * vg, B = 24 + 30 * (1 - vg) * 0.8 + 16 * sun - 14 * vg;
    const o = (y * w + x) * 4; data[o] = clamp(R + dt, 0, 255); data[o + 1] = clamp(G + dt, 0, 255); data[o + 2] = clamp(B + dt, 0, 255); data[o + 3] = 255;
  }
  return { w, h, data };
}
function makeGlow(size, col, power, core) {      // soft round glow (additive)
  const w = size, h = size, data = new Uint8ClampedArray(w * h * 4), c = size / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.hypot(x + 0.5 - c, y + 0.5 - c) / c; let v = d >= 1 ? 0 : Math.pow(1 - d, power) * (1 - smooth(0.0, 1.0, d) * 0.0); v += core * Math.exp(-(d / 0.07) * (d / 0.07)); v = Math.min(1, v); const o = (y * w + x) * 4; data[o] = col[0] * v; data[o + 1] = col[1] * v; data[o + 2] = col[2] * v; data[o + 3] = 255; }
  return { w, h, data };
}
function makeFlare(size, col) {                  // a bright star: round core + 4 thin diffraction spikes (additive)
  const w = size, h = size, data = new Uint8ClampedArray(w * h * 4), c = size / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (x + 0.5 - c) / c, dy = (y + 0.5 - c) / c, d = Math.hypot(dx, dy); let v = Math.exp(-(d / 0.10) * (d / 0.10)) + 0.35 * Math.exp(-(d / 0.30) * (d / 0.30));
    const sx = Math.exp(-(dy / 0.018) * (dy / 0.018)) * Math.pow(Math.max(0, 1 - Math.abs(dx)), 2.4), sy = Math.exp(-(dx / 0.018) * (dx / 0.018)) * Math.pow(Math.max(0, 1 - Math.abs(dy)), 2.4); v = Math.min(1, v + 0.8 * (sx + sy));
    const o = (y * w + x) * 4; data[o] = col[0] * v; data[o + 1] = col[1] * v; data[o + 2] = col[2] * v; data[o + 3] = 255;
  }
  return { w, h, data };
}
function makeRays(size, seed) {                  // sun rays: angular streaks falling off with distance (additive)
  const w = size, h = size, data = new Uint8ClampedArray(w * h * 4), c = size / 2, n = createNoise(seed);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (x + 0.5 - c) / c, dy = (y + 0.5 - c) / c, d = Math.hypot(dx, dy); if (d >= 1) continue; const a = Math.atan2(dy, dx);
    const ray = smooth(0.15, 0.95, 0.5 + 0.5 * n(Math.cos(a) * 3.2 + 5, Math.sin(a) * 3.2, 0.7) + 0.25 * n(Math.cos(a) * 9, Math.sin(a) * 9, 2.1)), v = ray * Math.pow(1 - d, 2.0) * 0.55 * smooth(0.0, 0.08, d); const o = (y * w + x) * 4; data[o] = 255 * v; data[o + 1] = 206 * v; data[o + 2] = 140 * v; data[o + 3] = 255;
  }
  return { w, h, data };
}
function makeStreak(w, h) {                      // shooting star: bright head on the right, tail fading to the left (additive)
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = x / w, v = (y + 0.5 - h / 2) / (h / 2); const t = Math.pow(u, 2.6) * Math.exp(-v * v * 4.0) * (0.25 + 0.75 * u); const hq = (u - 0.985) / 0.02, hd = Math.exp(-hq * hq) * Math.exp(-v * v * 1.5); const k = Math.min(1, t + hd); const o = (y * w + x) * 4; data[o] = 255 * k; data[o + 1] = 240 * k; data[o + 2] = 220 * k; data[o + 3] = 255; }
  return { w, h, data };
}
function makeShip(w, h) {                        // the GCD 13 ship, flying left: mustard hull, purple stripe, blue glass, duct tape, grey engine (source-over)
  const data = new Uint8ClampedArray(w * h * 4), L = SUN, cx = w * 0.52, cy = h * 0.5, rx = w * 0.40, ry = h * 0.30, set = (x, y, r, g, b, a) => { const o = (y * w + x) * 4; data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = a; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const px = x + 0.5, py = y + 0.5;
    const ex = w * 0.14, ey = h * 0.50, er = h * 0.19;                                                          // engine nacelle
    const en = (px - ex) / (w * 0.13), eyy = (py - ey) / er; if (en * en + eyy * eyy < 1) { const nz = Math.sqrt(1 - en * en - eyy * eyy), l = clamp(-0.6 * en - 0.55 * eyy + 0.6 * nz, 0, 1); const g = 70 + 130 * l; set(x, y, g, g + 4, g + 10, 255); if (Math.abs(en) < 0.25 && Math.abs(eyy) < 0.55) set(x, y, 220, 220, 200, 255); }
    const nx = (px - cx) / rx, ny = (py - cy) / ry, d2 = nx * nx + ny * ny;
    if (d2 < 1) {                                                                                               // hull
      const nz = Math.sqrt(1 - d2), l = clamp(-0.55 * nx - 0.7 * ny + 0.55 * nz, 0, 1), s = 0.35 + 0.75 * l; let r = 236 * s, g = 190 * s, b = 60 * s;
      if (Math.abs(ny + 0.05) < 0.16) { r = 120 * s; g = 50 * s; b = 160 * s; }                                    // purple stripe
      if (nx > 0.28 && nx < 0.62 && ny < -0.05 && ny > -0.75) { const gl = clamp(1 - Math.hypot(nx - 0.45, ny + 0.40) / 0.30, 0, 1); if (gl > 0) { r = mix(r, 70 + 120 * gl, 0.9); g = mix(g, 150 + 100 * gl, 0.9); b = mix(b, 230, 0.9); } }
      if (nx > -0.3 && nx < -0.05 && Math.abs(ny - 0.35) < 0.14) { r = 160; g = 160; b = 158; }                  // duct tape
      set(x, y, r, g, b, clamp((1 - Math.sqrt(d2)) * ry * 1.6, 0, 1) * 255);
    }
  }
  return { w, h, data };
}
root.SB = { TAU, PI, clamp, mix, smooth, rng, gauss, createNoise, fbm, ramp, SUN, PlanetTexture, buildPlanetLUT, renderPlanet, makeAtmosphere, makeBody, makeRing, makeGalaxy, makeNebula, makeBackdrop, makeGlow, makeFlare, makeRays, makeStreak, makeShip };
})(root);
export const SB = root.SB;
