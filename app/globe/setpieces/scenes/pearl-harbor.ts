import { burst, plume, splash, trail } from "../fx";
import {
  clamp01,
  ground,
  hash,
  offset,
  Path,
  Route,
  sample,
  smooth,
  type SceneDef,
} from "../kit";
import { FACTION } from "../models";

const OAHU: [number, number][] = [
  [-158.28, 21.575],
  [-158.11, 21.595],
  [-157.99, 21.71],
  [-157.92, 21.65],
  [-157.85, 21.555],
  [-157.8, 21.43],
  [-157.72, 21.46],
  [-157.7, 21.34],
  [-157.65, 21.31],
  [-157.71, 21.27],
  [-157.81, 21.255],
  [-157.87, 21.305],
  [-157.945, 21.318],
  [-157.952, 21.34],
  [-157.938, 21.357],
  [-157.93, 21.378],
  [-157.955, 21.392],
  [-157.985, 21.382],
  [-157.995, 21.36],
  [-157.978, 21.342],
  [-157.972, 21.318],
  [-158.02, 21.3],
  [-158.11, 21.3],
  [-158.13, 21.35],
  [-158.19, 21.44],
  [-158.22, 21.48],
];

const FORD: [number, number][] = [
  [-157.968, 21.357],
  [-157.955, 21.36],
  [-157.951, 21.366],
  [-157.958, 21.372],
  [-157.968, 21.369],
];

const CARRIERS_X = -60;
const CARRIERS_Z = -330;
const ARIZONA = 3;

const scene: SceneDef = {
  anchor: [-157.95, 21.36],
  scale: 2.5,
  capacity: {
    smoke: 1500,
    fire: 220,
    balls: 22,
    decals: 420,
    glow: 90,
    tracers: 150,
    units: {
      carrier: 6,
      battleship: 10,
      destroyer: 12,
      transport: 2,
      diver: 18,
      fighter: 9,
      bomb: 10,
    },
  },
  camera: [
    [0, CARRIERS_X, CARRIERS_Z, 0, 70, -150, 35],
    [5, -64, -326, 1, 55, -162, 24],
    [9, -32, -160, 3, 70, -170, 18],
    [11.5, -14, -50, 2, 62, -178, 22],
    [13.5, 0, 0, 0.5, 30, -290, 20],
    [16, 0, 0, 0.5, 26, -265, 22],
    [19, 0, 0, 0.8, 30, -240, 26],
    [24, 0, 0, 1, 44, -195, 32],
    [28, -4, -2, 1, 62, -170, 38],
    [32, -4, -2, 0.5, 96, -150, 46],
  ],
  cues: [
    [1, "drone", 12],
    [15.4, "boom", 0.7],
    [16.2, "boom", 0.6],
    [18.6, "boom", 0.7],
    [19.2, "boom", 1],
    [20.4, "far", 0.6],
  ],
  build(kit) {
    kit.sea(420, -30, -160);
    kit.land(
      OAHU.map(([lon, lat]) => kit.geo(lon, lat)),
      0.5,
      0x6f7250
    );
    kit.land(
      FORD.map(([lon, lat]) => kit.geo(lon, lat)),
      0.6,
      0x7c7d5a
    );
    kit.hill(...kit.geo(-158.14, 21.47), 9, 30, 1.8, 0x5f6546, 0.55);
    kit.hill(...kit.geo(-157.84, 21.45), 10, 45, 2.1, 0x5f6546, 0.62);

    const [fx, fz] = kit.geo(-157.962, 21.3645);
    const dx = 0.707;
    const dz = -0.707;
    const px = 0.707;
    const pz = 0.707;
    const baseX = fx + px * 2.4;
    const baseZ = fz + pz * 2.4;
    const shipYaw = Math.atan2(-dx, -dz);
    const row: number[] = [];
    for (let k = 0; k < 5; k++)
      row.push(baseX + dx * (k - 2) * 1.9, baseZ + dz * (k - 2) * 1.9);
    const hits = [15.4, 15.6, 15.8, 16.2, 16.4, 18.6, 18.8, 19.2, 19.5, 20.1];
    const targets = [1, 1, 2, 3, 0, 2, 1, 3, 4, 0];
    const outboard = [
      false,
      true,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ];

    const torpedo: Path[] = [];
    for (let j = 0; j < 8; j++) {
      const k = targets[j % 5]!;
      const tx = row[k * 2]! + px * (outboard[j % 5] ? 0.9 : 0);
      const tz = row[k * 2 + 1]! + pz * (outboard[j % 5] ? 0.9 : 0);
      const lane = (j - 3.5) * 1.1;
      torpedo.push(
        new Path([
          [
            CARRIERS_X + (j % 3) * 4,
            0.3,
            CARRIERS_Z + Math.floor(j / 3) * 5,
            0.8 + j * 0.25,
          ],
          [CARRIERS_X + 8, 2, CARRIERS_Z + 40, 3 + j * 0.1],
          [-40 + lane, 3, -200, 6.4],
          [-26 + lane, 3, -110, 9],
          [-6 + lane, 2, -45, 11.4],
          [tx + px * 16 + dx * lane, 0.6, tz + pz * 16 + dz * lane, 13.2],
          [tx + px * 4, 0.15, tz + pz * 4, 14.2 + j * 0.05],
          [tx - px * 5, 1.2, tz - pz * 5, 15.2 + j * 0.05],
          [tx - px * 26, 3, tz - pz * 26, 17.5],
        ])
      );
    }
    const divers: Path[] = [];
    for (let j = 0; j < 10; j++) {
      const k = targets[5 + (j % 5)]!;
      const tx = row[k * 2]!;
      const tz = row[k * 2 + 1]!;
      const lane = (j - 4.5) * 1.3;
      const drop = hits[5 + (j % 5)]! - 0.7;
      divers.push(
        new Path([
          [
            CARRIERS_X + (j % 3) * 5,
            0.3,
            CARRIERS_Z - 6 + Math.floor(j / 3) * 5,
            1.2 + j * 0.25,
          ],
          [CARRIERS_X, 3, CARRIERS_Z + 50, 4 + j * 0.1],
          [-44 + lane, 4.5, -200, 7],
          [-30 + lane, 4.5, -110, 10],
          [-16 + lane, 4.5, -40, 13],
          [tx - dx * 6 + lane * 0.3, 4.4, tz - dz * 6 - 4, drop - 1.2],
          [tx - dx * 1.2, 1, tz - dz * 1.2, drop],
          [tx + dx * 2 + px * 2, 0.6, tz + dz * 2 + pz * 2, drop + 0.7],
          [tx + dx * 20 + px * 16, 3, tz + dz * 20 + pz * 16, drop + 4],
        ])
      );
    }
    const fighters: Path[] = [];
    const [wx, wz] = kit.geo(-158.04, 21.48);
    const [hx, hz] = kit.geo(-157.94, 21.335);
    for (let j = 0; j < 9; j++) {
      const lane = (j - 4) * 1.4;
      const field = j < 5;
      const ax = field ? wx : hx;
      const az = field ? wz : hz;
      fighters.push(
        new Path([
          [CARRIERS_X + 10 + (j % 3) * 4, 0.3, CARRIERS_Z + 8, 0.6 + j * 0.2],
          [-36 + lane, 5, -200, 6.2],
          [-22 + lane, 5, -110, 9],
          [ax + lane, 2.5, az - 18, 12],
          [ax + lane * 0.4, 0.3, az - 2, 13.2],
          [ax + lane * 0.4 + 3, 0.3, az + 8, 14],
          [ax + 20, 2, az + 30, 17],
          [ax - 10, 3, az + 40, 22],
        ])
      );
    }
    const route = new Route([
      [CARRIERS_X - 20, 0, CARRIERS_Z - 30],
      [CARRIERS_X + 20, 0, CARRIERS_Z + 30],
    ]);
    const s = sample();

    const shipAt = (k: number, out: boolean) => {
      s.x = row[k * 2]! + (out ? px * 0.9 : 0);
      s.z = row[k * 2 + 1]! + (out ? pz * 0.9 : 0);
      s.y = ground(s.x, s.z);
      s.yaw = shipYaw;
      s.pitch = 0;
      s.roll = 0;
      return s;
    };

    return (t) => {
      for (let c = 0; c < 6; c++) {
        const f = clamp01(0.3 + t * 0.004) - (c % 2) * 0.12;
        route.at(f, s);
        s.x += (c % 2) * 9 + Math.floor(c / 2) * 3;
        s.z += Math.floor(c / 2) * 9;
        s.y = ground(s.x, s.z);
        kit.unit("carrier", s, 3.2, FACTION.japan);
        trail(kit, s, 5, 0.35, 0.8);
      }
      for (let c = 0; c < 6; c++) {
        route.at(0.32 + t * 0.004, s);
        const a = (c / 6) * Math.PI * 2;
        s.x += 4 + Math.cos(a) * 16;
        s.z += 9 + Math.sin(a) * 18;
        s.y = ground(s.x, s.z);
        kit.unit(
          c < 2 ? "battleship" : "destroyer",
          s,
          c < 2 ? 2.8 : 1.6,
          FACTION.japan
        );
      }

      for (let k = 0; k < 5; k++) {
        const sinking =
          k === ARIZONA
            ? smooth(19.3, 24, t)
            : k === 1
              ? smooth(16, 21, t) * 0.6
              : 0;
        shipAt(k, false);
        kit.unit("battleship", s, 2, FACTION.allied, sinking * 5);
        if (k === 1 || k === 2) {
          shipAt(k, true);
          if (k === 1) {
            s.roll = -smooth(16, 21, t) * 2.2;
            kit.unit("battleship", s, 2, FACTION.allied, smooth(16, 22, t) * 4);
          } else {
            kit.unit(
              "battleship",
              s,
              2,
              FACTION.allied,
              smooth(16.5, 23, t) * 2
            );
          }
        }
        if (k === ARIZONA) {
          shipAt(k, true);
          kit.unit("transport", s, 1.4, FACTION.allied);
        }
      }
      for (let d = 0; d < 6; d++) {
        s.x = fx - 5 + d * 1.2;
        s.z = fz + 6 + (d % 2) * 0.6;
        s.y = ground(s.x, s.z);
        s.yaw = 0.3;
        s.pitch = 0;
        s.roll = 0;
        kit.unit("destroyer", s, 1.2, FACTION.allied);
      }

      for (let j = 0; j < torpedo.length; j++) {
        const path = torpedo[j]!;
        if (t < path.start || t > path.finish) continue;
        path.at(t, s);
        kit.unit("diver", s, 0.9, FACTION.japan);
      }
      for (let j = 0; j < divers.length; j++) {
        const path = divers[j]!;
        if (t < path.start || t > path.finish) continue;
        path.at(t, s);
        kit.unit("diver", s, 0.9, FACTION.japan);
        const drop = hits[5 + (j % 5)]! - 0.7;
        if (t > drop && t < drop + 0.7 && j < 5) {
          const u = (t - drop) / 0.7;
          const k = targets[5 + j]!;
          shipAt(k, false);
          s.y = ground(s.x, s.z) + 1 * (1 - u * u);
          s.pitch = -1.2;
          kit.unit("bomb", s, 0.25, FACTION.dark);
        }
      }
      for (let j = 0; j < fighters.length; j++) {
        const path = fighters[j]!;
        if (t < path.start || t > path.finish) continue;
        path.at(t, s);
        kit.unit("fighter", s, 0.75, FACTION.japan);
        if (t > 12.9 && t < 14 && hash(j + Math.floor(t * 10)) > 0.4) {
          const c = Math.cos(s.pitch);
          const vx = Math.sin(s.yaw) * c;
          const vz = Math.cos(s.yaw) * c;
          kit.tracers.push(
            s.x + vx * 0.5,
            s.y,
            s.z + vz * 0.5,
            s.x + vx * 2.4,
            s.y - 0.2,
            s.z + vz * 2.4,
            1,
            0.8,
            0.4,
            0.9
          );
        }
      }

      for (let i = 0; i < 8; i++) {
        const k = targets[i % 5]!;
        const out = outboard[i % 5]!;
        const launch = 14.2 + i * 0.05;
        const hit = hits[i % 5]!;
        if (t > launch && t < hit) {
          shipAt(k, out);
          const u = (t - launch) / (hit - launch);
          const sx = s.x + px * (4 - 4 * u) + dx * (i - 3.5) * 0.12;
          const sz = s.z + pz * (4 - 4 * u) + dz * (i - 3.5) * 0.12;
          for (let q = 0; q < 6; q++) {
            const back = q * 0.18;
            kit.decals.disc(
              sx + px * back,
              ground(sx, sz) + 0.03,
              sz + pz * back,
              0.1 + q * 0.03,
              0.6 - q * 0.08,
              0.9,
              0.95,
              0.95
            );
          }
        }
      }
      for (let i = 0; i < hits.length; i++) {
        const k = targets[i]!;
        const out = i < 5 && outboard[i]!;
        shipAt(k, out);
        const hx0 = s.x + (i < 5 ? px * 0.35 : 0);
        const hz0 = s.z + (i < 5 ? pz * 0.35 : 0);
        const y = ground(hx0, hz0);
        if (i < 5) splash(kit, t, hits[i]!, hx0, hz0, 0.35, i + 40);
        const big = k === ARIZONA && i === 7;
        burst(kit, t, hits[i]!, hx0, y + 0.1, hz0, big ? 1.5 : 0.45, i + 7);
        if (big) {
          burst(kit, t, hits[i]! + 0.25, s.x, y + 0.5, s.z, 2.4, 91);
          if (t > hits[i]! && t < hits[i]! + 0.5) kit.shake = 0.08;
        }
        plume(
          kit,
          t,
          hits[i]! + 0.3,
          99,
          hx0,
          hz0,
          big ? 1.1 : 0.55,
          i + 60,
          big ? BIG : SMALL
        );
      }

      if (t > 14.5) {
        for (let a = 0; a < 26; a++) {
          const k = a % 5;
          const phase = t * 3 + a * 0.37;
          const cycle = phase - Math.floor(phase);
          if (hash(a + Math.floor(phase)) < 0.35) continue;
          shipAt(k, false);
          const ang = hash(a * 1.3) * Math.PI * 2;
          const len = 1.5 + cycle * 4;
          const ox = Math.cos(ang) * len * 0.5;
          const oz = Math.sin(ang) * len * 0.5;
          const base = ground(s.x, s.z) + 0.3;
          kit.tracers.push(
            s.x + ox * 0.7,
            base + len * 0.7,
            s.z + oz * 0.7,
            s.x + ox,
            base + len,
            s.z + oz,
            1,
            0.75,
            0.35,
            1 - cycle
          );
          if (cycle > 0.8) {
            kit.smoke.push(
              s.x + ox * 1.2,
              base + len * 1.1,
              s.z + oz * 1.2,
              0.35,
              0.6,
              0,
              0.1,
              0,
              hash(a)
            );
          }
        }
      }
    };
  },
};

const SMALL = { rise: 0.45, wind: 0.25, life: 8, every: 0.35, fire: 0.9 };
const BIG = { rise: 0.8, wind: 0.3, life: 10, every: 0.22, fire: 1 };

export default scene;
