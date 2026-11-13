export type Point = { x: number; y: number };

export type Walkable = {
  polygon: Point[];
  holes: Point[][];
};

const EDGE = 1.5;

export function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function pointInPolygon(p: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y) {
      const x = ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x;
      if (p.x < x) inside = !inside;
    }
  }
  return inside;
}

function closestOnSegment(p: Point, a: Point, b: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = dx * dx + dy * dy;
  if (len === 0) return { x: a.x, y: a.y };
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len));
  return { x: a.x + t * dx, y: a.y + t * dy };
}

function nearRing(p: Point, poly: Point[]): boolean {
  for (let i = 0; i < poly.length; i++) {
    const q = closestOnSegment(p, poly[i], poly[(i + 1) % poly.length]);
    if (dist(p, q) <= EDGE) return true;
  }
  return false;
}

/** Inside the outer ring, and not strictly inside a hole. Edges count as walkable. */
export function inWalkable(p: Point, area: Walkable): boolean {
  if (!pointInPolygon(p, area.polygon) && !nearRing(p, area.polygon)) return false;
  for (const hole of area.holes) {
    if (pointInPolygon(p, hole) && !nearRing(p, hole)) return false;
  }
  return true;
}

/** Clicks outside the floor, or inside an obstacle, land on the nearest walkable edge. */
export function nearestWalkable(p: Point, area: Walkable): Point {
  if (inWalkable(p, area)) return { x: p.x, y: p.y };
  let best: Point | null = null;
  let bestD = Infinity;
  for (const ring of [area.polygon, ...area.holes]) {
    for (let i = 0; i < ring.length; i++) {
      const q = closestOnSegment(p, ring[i], ring[(i + 1) % ring.length]);
      if (!inWalkable(q, area)) continue;
      const d = dist(p, q);
      if (d < bestD) {
        bestD = d;
        best = q;
      }
    }
  }
  return best ?? { x: area.polygon[0].x, y: area.polygon[0].y };
}

function orient(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function crosses(a: Point, b: Point, c: Point, d: Point): boolean {
  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);
  return o1 * o2 < 0 && o3 * o4 < 0;
}

/** True when the whole segment stays on the walkable floor. */
export function segmentClear(a: Point, b: Point, area: Walkable): boolean {
  if (dist(a, b) <= 0.01) return true;
  for (const ring of [area.polygon, ...area.holes]) {
    for (let i = 0; i < ring.length; i++) {
      if (crosses(a, b, ring[i], ring[(i + 1) % ring.length])) return false;
    }
  }
  for (let i = 1; i < 8; i++) {
    const t = i / 8;
    const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    if (!inWalkable(p, area)) return false;
  }
  return true;
}

function smooth(path: Point[], area: Walkable): Point[] {
  if (path.length < 3) return path;
  const out: Point[] = [path[0]];
  let i = 0;
  while (i < path.length - 1) {
    let j = path.length - 1;
    while (j > i + 1 && !segmentClear(path[i], path[j], area)) j -= 1;
    out.push(path[j]);
    i = j;
  }
  return out;
}

/** A* on the visibility graph of the floor polygon, then string-pulled. */
export function findPath(area: Walkable, from: Point, to: Point): Point[] {
  const start = nearestWalkable(from, area);
  const goal = nearestWalkable(to, area);
  if (segmentClear(start, goal, area)) return [start, goal];

  const nodes: Point[] = [start, goal, ...area.polygon];
  for (const hole of area.holes) nodes.push(...hole);
  const n = nodes.length;
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!segmentClear(nodes[i], nodes[j], area)) continue;
      const w = dist(nodes[i], nodes[j]);
      adj[i].push({ to: j, w });
      adj[j].push({ to: i, w });
    }
  }

  const open = [0];
  const g = new Array<number>(n).fill(Infinity);
  const prev = new Array<number>(n).fill(-1);
  const used = new Array<boolean>(n).fill(false);
  g[0] = 0;
  while (open.length > 0) {
    let best = 0;
    for (let i = 1; i < open.length; i++) {
      const f = g[open[i]] + dist(nodes[open[i]], goal);
      const bf = g[open[best]] + dist(nodes[open[best]], goal);
      if (f < bf) best = i;
    }
    const cur = open.splice(best, 1)[0];
    if (used[cur]) continue;
    used[cur] = true;
    if (cur === 1) break;
    for (const edge of adj[cur]) {
      const next = g[cur] + edge.w;
      if (next >= g[edge.to]) continue;
      g[edge.to] = next;
      prev[edge.to] = cur;
      open.push(edge.to);
    }
  }
  if (!Number.isFinite(g[1])) return [start];
  const raw: Point[] = [];
  for (let i = 1; i !== -1; i = prev[i]) raw.push(nodes[i]);
  raw.reverse();
  return smooth(raw, area);
}
