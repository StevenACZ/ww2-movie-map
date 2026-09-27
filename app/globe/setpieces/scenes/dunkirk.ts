import { plume, trail } from "../fx";
import {
  clamp01,
  ground,
  hash,
  Path,
  Route,
  sample,
  smooth,
  WHITE,
  type Kit,
  type Sample,
  type SceneDef,
} from "../kit";
import { BEACH, coast, DECK, MOLE_X } from "./dunkirk-coast";

const TROOP = 0.078;
const SHIPS = [
  { x: MOLE_X - 0.42, z: -8.75, size: 2.7, leave: 56 },
  { x: 3.3, z: -8.8, size: 2.45, leave: 58.5 },
  { x: 11.6, z: -12.2, size: 2.65, leave: 61 },
];
const ATTACKS = [
  { at: 34, x: 4.2, z: -4.8, hit: 38.7 },
  { at: 36.5, x: -5.5, z: -7.4, hit: 41.2 },
  { at: 39, x: 9, z: -9.3, hit: 43.7 },
];

const scene: SceneDef = {
  anchor: [2.3764, 51.0378],
  near: 2,
  pace: 0.68,
  clip: [0.035, 240],
  bare: true,
  night: [
    [0, 0.1],
    [28, 0.08],
    [44, 0.15],
    [56, 0.2],
    [72, 0.45],
  ],
  labels: [
    {
      at: [2.279, 51.108],
      text: { en: "EAST MOLE", es: "ESPIGÓN ESTE" },
      from: 8,
      to: 20,
      lift: 0.4,
    },
    {
      at: [2.433, 51.035],
      text: { en: "THE LITTLE SHIPS", es: "LOS LITTLE SHIPS" },
      from: 20,
      to: 30,
      lift: 0.25,
    },
    {
      at: [2.228, 51.176],
      text: { en: "ACROSS THE CHANNEL", es: "HACIA INGLATERRA" },
      from: 60,
      to: 71,
      lift: 0.3,
    },
  ],
  capacity: {
    smoke: 1800,
    fire: 200,
    balls: 36,
    decals: 1200,
    glow: 100,
    tracers: 650,
    units: {
      "vw-destroyer": 6,
      "dunkirk-yacht": 8,
      "dunkirk-trawler": 8,
      "dunkirk-lifeboat": 8,
      "bef-soldier": 760,
      "spitfire-mk1": 4,
      ju87b: 3,
      bomb: 3,
    },
  },
  camera: [
    [0, 4, 1, 0.45, 15, 218, 21],
    [4, 3, 0.8, 0.3, 10, 212, 18],
    [8, -3.5, -0.3, 0.4, 10, 220, 26],
    [10, -6.8, -3.8, 0.27, 6.4, 235, 25],
    [14, -6.95, -7.3, 0.26, 4.2, 230, 18],
    [18, -7.1, -8.7, 0.25, 4.4, 210, 22],
    [20, -0.5, -3, 0.22, 11, 200, 30],
    [23, 4.2, -0.5, 0.17, 3.7, 205, 20],
    [27, 4.2, -1.7, 0.18, 4.6, 226, 23],
    [31, 3.6, -5.6, 0.3, 6.2, 235, 22],
    [34, 4.5, -3.5, 2.5, 12, 234, 24],
    [37, 4.2, -4.8, 1.5, 9, 219, 28],
    [39.5, 4.2, -4.8, 0.45, 6.9, 218, 20],
    [42, -4.1, -6.9, 0.5, 8.7, 195, 23],
    [45, 7.5, -6.7, 2.5, 10.4, 235, 20],
    [49, 0.4, -9.1, 2.7, 12.5, 236, 21],
    [53, -4, -12.8, 2.2, 15, 207, 24],
    [56, -6.9, -8.6, 0.3, 6.8, 204, 22],
    [61, -8.8, -12.5, 0.3, 10.5, 212, 25],
    [66, -9, -16, 0.7, 17, 215, 24],
    [72, -9, -21, 0.8, 27, 218, 28],
  ],
  cues: [
    [0.3, "surf", 71],
    [5, "far", 0.18, -0.7],
    [12, "engine", 55],
    [29, "far", 0.23, 0.5],
    [33, "drone", 12],
    [38.7, "boom", 0.55, 0.3],
    [41.2, "boom", 0.65, -0.6],
    [43.5, "flyby", 0.85, -0.6],
    [43.7, "boom", 0.48, 0.65],
    [48, "flyby", 0.65, 0.5],
    [51.5, "far", 0.22, -0.8],
  ],
  build(kit) {
    const waterTime = coast(kit);
    const s = sample();
    const p = sample();
    const q = sample();
    const boats = Array.from({ length: 18 }, (_, i) => {
      const lane = i % 6;
      const x = -3.5 + lane * 3.85 + Math.floor(i / 6) * 0.64;
      const ship = SHIPS[lane < 3 ? 1 : 2]!;
      const size = i % 3 === 0 ? 0.66 : i % 3 === 1 ? 0.82 : 0.46;
      const shoreZ = -0.16 - size * 0.5;
      const offshoreX = ship.x + 0.55 + (lane % 3) * 1.05;
      const offshoreZ = ship.z - 0.9 + Math.floor(i / 6) * 1.05;
      const dockX = ship.x + ship.size * 0.052 + size * 0.14 + 0.018;
      const dockZ = ship.z + ((lane % 3) - 1) * 0.78;
      return {
        i,
        ship,
        x,
        size,
        shoreZ,
        offshoreX,
        offshoreZ,
        start: 12 + Math.floor(i / 6) * 4 + (lane === 2 ? 0 : lane * 0.9),
        kind:
          i % 3 === 0
            ? ("dunkirk-yacht" as const)
            : i % 3 === 1
              ? ("dunkirk-trawler" as const)
              : ("dunkirk-lifeboat" as const),
        inbound: new Route([
          [offshoreX, 0, offshoreZ],
          [offshoreX, 0, -5.8],
          [x - 0.65, 0, -3.4],
          [x, 0, shoreZ],
        ]),
        homebound: new Route([
          [offshoreX + 0.5, 0, offshoreZ],
          [offshoreX + 0.8, 0, offshoreZ - 3],
          [offshoreX - 5, 0, offshoreZ - 10],
          [offshoreX - 16, 0, offshoreZ - 24],
        ]),
        clearing: new Route([
          [dockX, 0, dockZ],
          [dockX + 0.4, 0, dockZ - 0.6],
          [offshoreX + 0.5, 0, offshoreZ],
        ]),
        outbound: new Route([
          [x, 0, shoreZ],
          [x + 0.35, 0, shoreZ - 0.55],
          [x + 0.55, 0, -3],
          [dockX + 0.4, 0, -5.8],
          [dockX, 0, dockZ + 0.7],
          [dockX, 0, dockZ],
        ]),
      };
    });
    const destroyers = SHIPS.map(
      (ship, i) =>
        new Route([
          [ship.x, 0, ship.z],
          [ship.x - 0.15, 0, ship.z - 3.3],
          [ship.x - 4.2, 0, ship.z - 8.5],
          [ship.x - 13 - i * 1.4, 0, ship.z - 18],
        ])
    );
    const dives = ATTACKS.map(
      (a) =>
        new Path([
          [a.x + 3, 6.4, a.z + 14, a.at],
          [a.x + 1.1, 4.6, a.z + 5, a.at + 2.2],
          [a.x, 0.95, a.z - 0.3, a.at + 4.25],
          [a.x - 1.7, 1.4, a.z - 5, a.at + 5.5],
          [a.x - 9, 4.3, a.z - 14, a.at + 9],
          [a.x - 20, 5, a.z - 19, a.at + 13],
        ])
    );
    const drops = dives.map((path, i) =>
      path.at(ATTACKS[i]!.hit - 1.8, sample())
    );
    const fighter = new Path([
      [22, 3.1, -3, 43],
      [9, 2.9, -6, 46],
      [-1, 2.7, -10, 49],
      [-8, 3.7, -16, 52],
      [-5, 5, -24, 55],
      [10, 5.5, -30, 59],
    ]);
    const oil = {
      rise: 1.1,
      wind: 0.24,
      shade: 0.14,
      fire: 0.25,
      life: 13,
      every: 0.13,
    };
    const distant = {
      rise: 0.5,
      wind: 0.22,
      shade: 0.32,
      fire: 0.03,
      life: 14,
      every: 0.2,
    };

    return (t) => {
      waterTime.value = t;
      for (let i = 0; i < 4; i++) {
        plume(
          kit,
          t,
          -8,
          74,
          -15 + i * 0.95,
          3.6 + (i % 2) * 0.8,
          0.7,
          10 + i,
          oil
        );
      }
      for (let i = 0; i < 4; i++) {
        plume(kit, t, -10, 74, -9 + i * 6.5, 6.6, 0.48, 40 + i, distant);
      }

      for (let lane = 0; lane < 8; lane++) {
        const x = -3.5 + lane * 2.8;
        const thinning = smooth(18, 65, t);
        const count = Math.round(28 - thinning * 19);
        for (let j = 0; j < count; j++) {
          const shift = (t * 0.048) % 0.12;
          p.x = x + (j % 2) * 0.1 + Math.sin(j * 2.2 + lane) * 0.013;
          p.z = 0.32 + Math.floor(j / 2) * 0.16 - shift;
          p.y = ground(p.x, p.z) + BEACH;
          p.yaw = Math.PI;
          p.pitch = 0;
          p.roll = Math.sin(t * 3.5 + j) * 0.035;
          kit.unit("bef-soldier", p, TROOP, WHITE);
        }
      }
      for (let j = 0; j < 72; j++) {
        const u = (j / 72 + t * 0.009) % 1;
        if (t > 55 && u < smooth(55, 66, t)) continue;
        p.x = MOLE_X + (j % 2 ? -0.055 : 0.055);
        p.z = 0.65 - u * 9.05;
        p.y =
          ground(p.x, p.z) +
          DECK +
          0.008 +
          Math.abs(Math.sin(t * 4.5 + j)) * 0.003;
        p.yaw = Math.PI;
        p.pitch = 0;
        p.roll = Math.sin(t * 4.5 + j) * 0.025;
        kit.unit("bef-soldier", p, TROOP * 0.87, WHITE);
      }

      SHIPS.forEach((ship, i) => {
        const depart = smooth(ship.leave, 76, t);
        destroyers[i]!.at(depart, s);
        bob(s, t, i, 0.007);
        if (depart < 0.001) s.yaw = Math.PI;
        kit.unit("vw-destroyer", s, ship.size, WHITE);
        const loaded = Math.round(12 + smooth(7, 54, t) * 34);
        passengers(kit, s, ship.size, loaded, 0.05, TROOP * 0.6, p);
        foam(kit, s, ship.size, depart > 0.001 ? 0.8 : 0.12, t);
        plume(kit, t, -3, 75, s.x, s.z, 0.12, 90 + i, {
          rise: 0.45,
          wind: 0.22,
          shade: 0.35,
          fire: 0,
          life: 3,
          every: 0.16,
        });
      });

      for (const boat of boats) {
        const local = t - boat.start;
        if (local < 0) continue;
        const phase = Math.min(local, 23.3);
        const home = smooth(boat.ship.leave + 0.6 + boat.i * 0.055, 78, t);
        const approach = clamp01(phase / 4.5);
        const leaving = smooth(10.4, 16.8, phase);
        let load = 0;
        if (home > 0) {
          boat.homebound.at(home, s);
        } else if (phase >= 19.6) {
          boat.clearing.at(smooth(19.6, 23.3, phase), s);
        } else if (phase < 4.5) {
          boat.inbound.at(approach, s);
        } else if (phase < 10.4) {
          s.x = boat.x;
          s.z = boat.shoreZ;
          s.y = 0;
          s.yaw = 0;
          s.pitch = 0;
          s.roll = 0;
          load = Math.min(8, Math.floor((phase - 4.5) / 0.7));
          const march = clamp01(((phase - 4.5) % 0.7) / 0.7);
          if (load < 8) {
            const wading = smooth(0.08, 0.45, march);
            const aboard = smooth(0.68, 1, march);
            p.x = boat.x + 0.025 * Math.sin(load);
            p.z = 0.2 + (boat.shoreZ + boat.size * 0.3 - 0.2) * march;
            p.y =
              ground(p.x, p.z) +
              BEACH * (1 - wading) -
              TROOP * 0.45 * wading * (1 - aboard) +
              boat.size *
                (boat.kind === "dunkirk-lifeboat" ? 0.07 : 0.12) *
                aboard;
            p.yaw = Math.PI;
            p.pitch = -0.12;
            p.roll = Math.sin(phase * 7) * 0.055;
            kit.unit("bef-soldier", p, TROOP * 0.8, WHITE);
            kit.decals.ring(
              p.x,
              ground(p.x, p.z) + 0.007,
              p.z,
              0.065,
              0.2,
              0.5,
              0.7,
              0.75,
              0.74
            );
          }
        } else {
          boat.outbound.at(leaving, s);
          if (phase < 11.2) s.yaw = Math.PI * smooth(10.4, 11.2, phase);
          load =
            phase > 16.8 ? Math.floor(8 * (1 - smooth(16.8, 19.6, phase))) : 8;
        }
        bob(s, t, boat.i, 0.006);
        kit.unit(boat.kind, s, boat.size, WHITE);
        passengers(
          kit,
          s,
          boat.size,
          load,
          boat.kind === "dunkirk-lifeboat" ? 0.07 : 0.12,
          TROOP * 0.72,
          p
        );
        if (local > 16.8 && local < 19.6) {
          const u = ((local - 16.8) % 0.35) / 0.35;
          const fromX = s.x - boat.size * 0.1;
          const toX = boat.ship.x + boat.ship.size * 0.04;
          const fromY = s.y + boat.size * 0.12;
          const toY = ground(toX, s.z) + boat.ship.size * 0.055;
          p.x = fromX + (toX - fromX) * u;
          p.z = s.z + boat.size * 0.3;
          p.y = fromY + (toY - fromY) * u;
          p.yaw = -Math.PI / 2;
          p.pitch = -0.15;
          p.roll = 0;
          kit.tracers.push(
            fromX,
            fromY,
            p.z,
            toX,
            toY,
            p.z,
            0.6,
            0.51,
            0.36,
            0.8
          );
          kit.unit("bef-soldier", p, TROOP * 0.68, WHITE);
        }
        const moving =
          home > 0 ||
          phase < 4.5 ||
          (phase > 10.4 && phase < 16.8) ||
          (phase > 19.6 && phase < 23.3);
        foam(kit, s, boat.size, moving ? 0.7 : 0.08, t + boat.i);
      }

      for (let j = 0; j < 7; j++) {
        const u = (j / 7 + t * 0.009) % 1;
        if (t < 56) {
          p.x = MOLE_X - 0.08 - u * 0.26;
          p.z = -8.35;
          p.y = ground(p.x, p.z) + DECK;
          p.yaw = -Math.PI / 2;
          p.pitch = 0;
          p.roll = Math.sin(t * 6 + j) * 0.035;
          kit.unit("bef-soldier", p, TROOP * 0.75, WHITE);
        }
      }

      ATTACKS.forEach((a, i) => {
        const path = dives[i]!;
        if (t >= a.at && t <= a.at + 13) {
          path.at(t, s);
          s.roll += Math.sin((t - a.at) * 0.5) * 0.12;
          kit.unit("ju87b", s, 0.67, WHITE);
        }
        const release = a.hit - 1.8;
        if (t >= release && t < a.hit) {
          const u = (t - release) / 1.8;
          const drop = drops[i]!;
          p.x = drop.x + (a.x - drop.x) * u;
          p.z = drop.z + (a.z - drop.z) * u;
          p.y = ground(p.x, p.z) + drop.y * (1 - u * u);
          p.yaw = Math.PI;
          p.pitch = -Math.PI / 2;
          p.roll = 0;
          kit.unit("bomb", p, 0.085, WHITE);
        }
        waterHit(kit, t, a.hit, a.x, a.z, 0.9, 170 + i);
        const shock = 1 - smooth(a.hit, a.hit + 0.65, t);
        if (t >= a.hit && t < a.hit + 0.65) {
          kit.shake = Math.max(kit.shake, shock * 0.028);
          kit.flash = Math.max(kit.flash, shock * 0.17);
        }
      });

      if (t >= 43 && t < 59) {
        fighter.at(t, s);
        for (let i = 0; i < 3; i++) {
          q.x = s.x + (i - 1) * 0.9;
          q.y = s.y + i * 0.21;
          q.z = s.z + i * 0.6;
          q.yaw = s.yaw;
          q.pitch = s.pitch;
          q.roll = s.roll + (i - 1) * 0.06;
          kit.unit("spitfire-mk1", q, 0.57, WHITE);
          if (t > 45 && t < 50 && Math.sin(t * 21 + i * 2) > 0.35) {
            const fx = Math.sin(q.yaw),
              fz = Math.cos(q.yaw);
            const rightX = Math.cos(q.yaw),
              rightZ = -Math.sin(q.yaw);
            for (const side of [-1, 1]) {
              const x = q.x + rightX * side * 0.17,
                z = q.z + rightZ * side * 0.17;
              kit.tracers.push(
                x + fx * 0.35,
                q.y,
                z + fz * 0.35,
                x + fx * 2.8,
                q.y - 0.1,
                z + fz * 2.8,
                1,
                0.75,
                0.3,
                0.7
              );
            }
          }
        }
      }
      if (t > 34 && t < 49) {
        for (let i = 0; i < 6; i++) {
          const period = 1.3;
          const n = Math.floor((t + i * 0.2) / period);
          const age = (t + i * 0.2) % period;
          const x = -6 + i * 3 + hash(n + i) * 1.5,
            z = -4 - hash(n + i * 5) * 6;
          const y = 2 + hash(n + i * 7) * 2;
          if (age < 0.6) {
            kit.smoke.push(
              x,
              y + age * 0.3,
              z,
              0.16 + age * 0.35,
              (1 - age / 0.6) * 0.52,
              0,
              0.2,
              0,
              n + i
            );
          }
          if (age < 0.12)
            kit.tracers.push(x - 0.2, 0.25, z + 1, x, y, z, 1, 0.72, 0.3, 0.5);
        }
      }
    };
  },
};

function bob(s: Sample, t: number, seed: number, amount: number) {
  s.y = ground(s.x, s.z) + Math.sin(t * 1.7 + seed * 2.3) * amount;
  s.pitch = Math.sin(t * 1.2 + seed) * 0.013;
  s.roll = Math.sin(t * 1.5 + seed * 3) * 0.02;
}

function passengers(
  kit: Kit,
  ship: Sample,
  size: number,
  count: number,
  deck: number,
  height: number,
  p: Sample
) {
  const sn = Math.sin(ship.yaw),
    cs = Math.cos(ship.yaw);
  for (let j = 0; j < count; j++) {
    const across = ((j % 2) - 0.5) * size * 0.075;
    const along =
      -size * 0.36 + Math.floor(j / 2) * Math.min(size * 0.052, height * 0.72);
    p.x = ship.x + across * cs + along * sn;
    p.z = ship.z - across * sn + along * cs;
    p.y =
      ship.y +
      size * deck +
      along * Math.sin(ship.pitch) +
      across * Math.sin(ship.roll);
    p.yaw = ship.yaw;
    p.pitch = ship.pitch;
    p.roll = ship.roll;
    kit.unit("bef-soldier", p, height, WHITE);
  }
}

function foam(kit: Kit, s: Sample, size: number, strength: number, t: number) {
  trail(kit, s, size * 1.7, size * 0.11, strength, 7);
  const sn = Math.sin(s.yaw),
    cs = Math.cos(s.yaw);
  for (const side of [-1, 1]) {
    for (let j = 0; j < 7; j++) {
      const a = j / 7,
        b = (j + 0.8) / 7;
      const start = size * 0.42;
      const ax =
        s.x - sn * a * size * 2 + cs * side * (size * 0.08 + a * size * 0.37);
      const az =
        s.z - cs * a * size * 2 - sn * side * (size * 0.08 + a * size * 0.37);
      const bx =
        s.x - sn * b * size * 2 + cs * side * (size * 0.08 + b * size * 0.37);
      const bz =
        s.z - cs * b * size * 2 - sn * side * (size * 0.08 + b * size * 0.37);
      kit.tracers.push(
        ax + sn * start,
        ground(ax, az) + 0.008,
        az + cs * start,
        bx + sn * start,
        ground(bx, bz) + 0.008,
        bz + cs * start,
        0.75,
        0.87,
        0.85,
        (1 - a) * strength * (0.55 + Math.sin(t * 3 + j) * 0.08)
      );
    }
  }
}

function waterHit(
  kit: Kit,
  t: number,
  at: number,
  x: number,
  z: number,
  size: number,
  seed: number
) {
  const dt = t - at;
  if (dt < 0 || dt > 3.3) return;
  const base = ground(x, z);
  const fade = 1 - dt / 3.3;
  for (let i = 0; i < 50; i++) {
    const angle = hash(seed + i) * Math.PI * 2;
    const speed = 0.13 + hash(seed + i + 9) * 0.34;
    const radius = dt * speed * size;
    const top =
      Math.max(0, dt * (4.5 + hash(seed + i + 20)) - dt * dt * 2.5) * size;
    const y = top * (0.15 + hash(seed + i + 34) * 0.85);
    const px = x + Math.cos(angle) * radius;
    const pz = z + Math.sin(angle) * radius;
    kit.smoke.push(
      px,
      base + y,
      pz,
      (0.08 + dt * 0.08) * size,
      fade * 0.72,
      0,
      0.97,
      0,
      seed + i
    );
    if (i % 3 === 0 && dt < 1.5) {
      kit.tracers.push(
        px,
        base + y,
        pz,
        px,
        base + Math.max(0, y - 0.14),
        pz,
        0.78,
        0.9,
        0.92,
        fade * 0.7
      );
    }
  }
  for (let i = 0; i < 2; i++) {
    const age = dt - i * 0.32;
    if (age < 0) continue;
    kit.decals.ring(
      x,
      base + 0.016,
      z,
      (0.2 + age * 0.85) * size,
      0.04,
      fade * 0.37,
      0.76,
      0.85,
      0.86
    );
  }
}

export default scene;
