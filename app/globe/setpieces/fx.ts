import {
  clamp01,
  easeOut,
  ground,
  hash,
  smooth,
  type Kit,
  type Route,
  type Sample,
} from "./kit";

export function burst(
  kit: Kit,
  t: number,
  t0: number,
  x: number,
  y: number,
  z: number,
  size: number,
  seed: number
) {
  const age = t - t0;
  if (age < 0 || age > 9) return;
  kit.balls.push(
    x,
    y + size * 0.3 * age,
    z,
    size * (1.4 + 2.2 * easeOut(age / 1.1)),
    age / 1.6,
    seed,
    1
  );
  const ring = age / 1.4;
  if (ring < 1) {
    const gy = ground(x, z) + 0.05;
    kit.glow.ring(
      x,
      gy,
      z,
      size * (1 + 9 * easeOut(ring)),
      0.14,
      0.5 * (1 - ring),
      1,
      0.78,
      0.5
    );
  }
  if (age < 0.5)
    kit.glow.disc(
      x,
      ground(x, z) + 0.04,
      z,
      size * 5,
      1 - age * 2,
      1,
      0.55,
      0.2
    );
  for (let i = 0; i < 12; i++) {
    const s = seed * 97 + i;
    const a = hash(s) * Math.PI * 2;
    const spread = size * (0.6 + hash(s + 0.3) * 1.4) * easeOut(age / 2.5);
    const life = clamp01(age / (6 + hash(s + 0.7) * 3));
    kit.smoke.push(
      x + Math.cos(a) * spread + age * 0.25,
      y + size * 0.4 + age * size * (0.35 + hash(s + 0.5) * 0.3),
      z + Math.sin(a) * spread,
      size * (1.2 + 2.6 * easeOut(age / 4)),
      0.85 * smooth(0.05, 0.5, age) * (1 - life),
      Math.max(0, 1 - age * 0.9),
      0.12,
      0,
      hash(s + 0.9)
    );
  }
}

export interface PlumeOptions {
  rise?: number;
  wind?: number;
  shade?: number;
  fire?: number;
  life?: number;
  every?: number;
}

const NO_OPTIONS: PlumeOptions = {};

export function plume(
  kit: Kit,
  t: number,
  t0: number,
  t1: number,
  x: number,
  z: number,
  size: number,
  seed: number,
  options: PlumeOptions = NO_OPTIONS
) {
  const every = options.every ?? 0.32;
  const life = options.life ?? 9;
  const rise = options.rise ?? size * 0.8;
  const wind = options.wind ?? size * 0.35;
  const shade = options.shade ?? 0.07;
  const fire = options.fire ?? 1;
  const first = Math.max(0, Math.ceil((t - life - t0) / every));
  const last = Math.min(
    Math.floor((t - t0) / every),
    Math.floor((t1 - t0) / every)
  );
  const base = ground(x, z);
  for (let k = first; k <= last; k++) {
    const age = t - (t0 + k * every);
    if (age < 0 || age > life) continue;
    const u = age / life;
    const s = seed * 131 + k;
    const jitter = (hash(s) - 0.5) * size * (0.4 + u * 1.6);
    kit.smoke.push(
      x + wind * age + jitter,
      base + rise * age * (1 - u * 0.4) + size * 0.3,
      z + (hash(s + 0.4) - 0.5) * size * (0.4 + u * 1.2) - wind * 0.4 * age,
      size * (0.7 + 2.6 * u),
      0.8 * smooth(0, 0.08, u) * Math.pow(1 - u, 1.3),
      Math.max(0, 0.7 - age * 0.7) * fire,
      shade + u * 0.12,
      0,
      hash(s + 0.8)
    );
    if (fire > 0 && age < 1.1) {
      kit.fire.push(
        x + jitter * 0.3,
        base + size * 0.25 + age * rise * 0.5,
        z,
        size * (0.9 - age * 0.4),
        (1 - age / 1.1) * fire,
        0.7,
        0,
        0,
        hash(s + 0.2)
      );
    }
  }
}

export function splash(
  kit: Kit,
  t: number,
  t0: number,
  x: number,
  z: number,
  size: number,
  seed: number
) {
  const age = t - t0;
  if (age < 0 || age > 3.5) return;
  const y = ground(x, z);
  for (let i = 0; i < 6; i++) {
    const s = seed * 17 + i;
    const up = size * (2.2 + hash(s) * 1.6);
    const height =
      up * Math.sin(Math.min(Math.PI, age * 1.4 + hash(s + 0.2) * 0.3));
    kit.smoke.push(
      x + (hash(s + 0.4) - 0.5) * size,
      y + Math.max(0, height),
      z + (hash(s + 0.6) - 0.5) * size,
      size * (0.9 + age * 0.6),
      0.75 * (1 - age / 3.5),
      0,
      0.95,
      0,
      hash(s + 0.9)
    );
  }
  kit.decals.ring(
    x,
    y + 0.02,
    z,
    size * (0.6 + age * 1.4),
    0.3,
    0.6 * (1 - age / 3.5),
    0.85,
    0.9,
    0.9
  );
}

export function wake(
  kit: Kit,
  route: Route,
  f: number,
  speed: number,
  width: number,
  s: Sample,
  points = 10
) {
  for (let k = 1; k <= points; k++) {
    const back = f - (k * speed) / route.length;
    if (back < 0) break;
    route.at(back, s);
    const fade = 1 - k / (points + 1);
    kit.decals.disc(
      s.x,
      ground(s.x, s.z) + 0.03,
      s.z,
      width * (0.6 + k * 0.18),
      0.32 * fade,
      0.88,
      0.92,
      0.9
    );
  }
}

export function eruption(
  kit: Kit,
  t: number,
  t0: number,
  x: number,
  y: number,
  z: number,
  size: number,
  seed: number
) {
  const age = t - t0;
  if (age < 0) return;
  kit.decals.disc(
    x,
    y + 0.03,
    z,
    size * 1.3 * smooth(0, 0.4, age),
    0.85,
    0.12,
    0.09,
    0.07
  );
  if (age > 14) return;
  kit.balls.push(
    x,
    y + size * (0.4 + age * 0.8),
    z,
    size * (1.5 + age * 2.2),
    age / 1.3,
    seed,
    0.9
  );
  for (let i = 0; i < 18; i++) {
    const s = seed * 53 + i;
    const a = hash(s) * Math.PI * 2;
    const lift = size * (3 + hash(s + 0.1) * 4.5);
    const out = size * (0.3 + hash(s + 0.2) * 1.6);
    const u = clamp01(age / (5 + hash(s + 0.3) * 6));
    const climb =
      lift * Math.min(1, easeOut(age / 1.4)) -
      Math.max(0, age - 2) * lift * 0.05;
    kit.smoke.push(
      x + Math.cos(a) * out * easeOut(age / 1.8) + age * 0.4,
      y + Math.max(0.2, climb),
      z + Math.sin(a) * out * easeOut(age / 1.8),
      size * (1.1 + 3 * easeOut(age / 5)),
      0.9 * smooth(0, 0.25, age) * (1 - u),
      Math.max(0, 0.9 - age * 0.9),
      0.3,
      1,
      hash(s + 0.5)
    );
  }
  const ring = age / 1.6;
  if (ring < 1)
    kit.glow.ring(
      x,
      y + 0.05,
      z,
      size * (1 + 7 * easeOut(ring)),
      0.2,
      0.8 * (1 - ring),
      1,
      0.7,
      0.45
    );
}

export interface Mushroom {
  x: number;
  z: number;
  burst: number;
  top: number;
  seed: number;
  capR?: number;
}

export function mushroom(kit: Kit, t: number, m: Mushroom) {
  const age = t - m.burst;
  if (age < 0) return;
  const gy = ground(m.x, m.z);
  const top = m.top;
  const rise = 1 - Math.exp(-age / 5.5);
  const h = 0.9 + top * rise;
  const capR = (m.capR ?? top * 0.26) * (0.35 + 0.65 * smooth(0, 12, age));
  const tube = capR * 0.46;
  const warm = Math.max(0, 1 - age / 7);
  const settle = smooth(1.5, 9, age);

  kit.balls.push(
    m.x,
    gy + 0.9 + Math.min(age, 3) * 0.9,
    m.z,
    3.2 + easeOut(age / 1.2) * 4,
    age / 4,
    m.seed,
    1.25
  );
  if (age < 3)
    kit.fire.push(
      m.x,
      gy + 0.9,
      m.z,
      9 - age * 2,
      (1 - age / 3) * 0.8,
      1,
      0,
      0,
      0.4
    );

  const ring = age / 3.2;
  if (ring < 1) {
    kit.glow.ring(
      m.x,
      gy + 0.08,
      m.z,
      1.5 + 16 * easeOut(ring),
      0.12,
      0.85 * (1 - ring),
      1,
      0.92,
      0.78
    );
    kit.decals.ring(
      m.x,
      gy + 0.06,
      m.z,
      1.2 + 15 * easeOut(ring),
      0.2,
      0.5 * (1 - ring),
      0.85,
      0.8,
      0.7
    );
  }

  const stem = 44;
  for (let i = 0; i < stem; i++) {
    const s = m.seed * 211 + i;
    const f = i / stem;
    const hy = gy + 0.6 + (h - 0.8) * f * smooth(0.2, 2.4, age);
    const neck = 0.55 + 0.6 * Math.abs(f - 0.55) + f * f * 0.9;
    const a = hash(s) * Math.PI * 2 + age * 0.3;
    const r = neck * (0.5 + hash(s + 0.2) * 0.7) * smooth(0.3, 3, age);
    kit.smoke.push(
      m.x + Math.cos(a) * r,
      hy,
      m.z + Math.sin(a) * r,
      1.6 + neck * 1.3 + f * 1.4,
      0.75 * smooth(0.2, 1.4, age),
      warm * (1 - f) * 0.9,
      0.5 + settle * 0.12,
      0.25,
      hash(s + 0.6)
    );
  }

  const rings = 28;
  const around = 9;
  for (let j = 0; j < around; j++) {
    for (let i = 0; i < rings; i++) {
      const s = m.seed * 977 + j * rings + i;
      const theta = (i / rings) * Math.PI * 2 + hash(s) * 0.25;
      const phi = (j / around) * Math.PI * 2 + age * 0.35 + hash(s + 0.1) * 0.4;
      const radial = capR + Math.cos(phi) * tube;
      const lift = Math.sin(phi) * tube * 0.75;
      const below = clamp01(-Math.sin(phi));
      kit.smoke.push(
        m.x + Math.cos(theta) * radial,
        gy + h + lift,
        m.z + Math.sin(theta) * radial,
        tube * (1.05 + hash(s + 0.3) * 0.6),
        0.82 * smooth(0.1, 1.2, age),
        warm * (0.35 + below * 0.9),
        0.62 + (1 - below) * 0.18 * settle,
        0.12,
        hash(s + 0.7)
      );
    }
  }
  for (let i = 0; i < 26; i++) {
    const s = m.seed * 331 + i;
    const a = hash(s) * Math.PI * 2;
    const r = capR * Math.sqrt(hash(s + 0.4)) * 0.9;
    kit.smoke.push(
      m.x + Math.cos(a) * r,
      gy + h + tube * (0.55 + hash(s + 0.2) * 0.5),
      m.z + Math.sin(a) * r,
      tube * 1.3,
      0.8 * smooth(0.1, 1.2, age),
      warm * 0.3,
      0.78,
      0.1,
      hash(s + 0.9)
    );
  }

  const wilson = (age - 0.6) / 3.2;
  if (wilson > 0 && wilson < 1) {
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2;
      const r = 3 + 9 * easeOut(wilson);
      kit.smoke.push(
        m.x + Math.cos(a) * r,
        gy + h * 0.55,
        m.z + Math.sin(a) * r,
        2.4 + wilson * 2,
        0.5 * Math.sin(Math.PI * wilson),
        0,
        0.97,
        0,
        hash(m.seed + i * 3.1)
      );
    }
  }

  for (let i = 0; i < 40; i++) {
    const s = m.seed * 613 + i;
    const a = (i / 40) * Math.PI * 2 + hash(s) * 0.2;
    const r = 1 + 11 * easeOut(age / 7) * (0.7 + hash(s + 0.3) * 0.5);
    kit.smoke.push(
      m.x + Math.cos(a) * r,
      gy + 0.5 + hash(s + 0.5) * 0.8 * smooth(0, 4, age),
      m.z + Math.sin(a) * r,
      1.6 + easeOut(age / 8) * 2.6,
      0.6 * smooth(0.4, 2.2, age),
      0,
      0.42,
      0.7,
      hash(s + 0.8)
    );
  }
}

export function trail(
  kit: Kit,
  s: Sample,
  length: number,
  width: number,
  strength = 1,
  count = 7
) {
  const fx = Math.sin(s.yaw);
  const fz = Math.cos(s.yaw);
  for (let k = 1; k <= count; k++) {
    const back = (k / count) * length;
    const x = s.x - fx * back;
    const z = s.z - fz * back;
    const fade = 1 - k / (count + 1);
    kit.decals.disc(
      x,
      ground(x, z) + 0.03,
      z,
      width * (0.7 + (k / count) * 1.6),
      0.4 * fade * strength,
      0.88,
      0.92,
      0.9
    );
  }
}
