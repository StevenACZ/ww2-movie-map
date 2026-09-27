import { burst, plume, splash, trail } from "../fx";
import {
  ground,
  hash,
  Path,
  Route,
  sample,
  smooth,
  type SceneDef,
} from "../kit";
import { FACTION } from "../models";

const BEACHES: [number, number][] = [
  [2.41, 51.056],
  [2.45, 51.066],
  [2.49, 51.075],
  [2.53, 51.086],
  [2.57, 51.096],
];

const scene: SceneDef = {
  anchor: [1.85, 51.1],
  capacity: {
    smoke: 1300,
    fire: 160,
    balls: 16,
    decals: 520,
    glow: 40,
    tracers: 30,
    units: {
      destroyer: 10,
      transport: 6,
      boat: 44,
      squad: 60,
      diver: 6,
      fighter: 4,
      bomb: 6,
    },
  },
  camera: [
    [0, 30, 4, 0, 130, -130, 50],
    [5, 8, 0, 0, 110, -160, 40],
    [10, 43, 5, 0, 26, -165, 22],
    [15, 34, 5, 1, 34, -120, 18],
    [20, 38, 1, 1, 30, -200, 22],
    [26, 5, 0, 0, 170, -175, 55],
    [30, 0, 0, 0, 125, -180, 52],
  ],
  cues: [
    [19.5, "drone", 5],
    [21.2, "far", 0.6],
    [21.8, "boom", 0.8],
    [22.6, "far", 0.5],
  ],
  build(kit) {
    kit.sea(150, 0, -10);
    const [dx, dz] = kit.geo(2.366, 51.05);
    const [ox, oz] = kit.geo(2.33, 51.036);
    const [vx, vz] = kit.geo(1.32, 51.12);
    const [rx, rz] = kit.geo(1.42, 51.33);
    kit.land(
      [
        [dx - 0.15, dz],
        [dx + 0.15, dz],
        [dx + 0.45, dz - 2.6],
        [dx + 0.2, dz - 2.7],
      ],
      0.12,
      0x8a8570
    );
    const moleX = dx + 0.3;
    const moleZ = dz - 2.5;
    const dover = new Route([
      [moleX - 0.8, 0, moleZ - 0.6],
      [dx - 12, 0, dz - 7],
      [dx - 40, 0, dz - 10],
      [vx + 8, 0, vz - 1],
      [vx + 1, 0, vz - 0.5],
      [vx + 8, 0, vz - 3],
      [dx - 40, 0, dz - 13],
      [dx - 12, 0, dz - 9],
      [moleX - 0.8, 0, moleZ - 0.8],
    ]);
    const ramsgate = new Route([
      [moleX - 0.4, 0, moleZ - 1],
      [dx - 8, 0, dz - 16],
      [rx + 20, 0, rz + 6],
      [rx + 2, 0, rz + 1],
      [rx + 20, 0, rz + 3],
      [dx - 8, 0, dz - 19],
      [moleX - 0.4, 0, moleZ - 1.2],
    ]);
    const beaches = BEACHES.map(([lon, lat]) => kit.geo(lon, lat));
    const offshore: number[] = [];
    for (let i = 0; i < beaches.length; i++)
      offshore.push(beaches[i]![0] - 0.3, beaches[i]![1] - 4.2);
    const stukas: Path[] = [];
    const bombs = [21.2, 21.8, 22.6, 23.1, 23.7, 24.2];
    for (let j = 0; j < 6; j++) {
      const bx = j < 3 ? offshore[(j * 2) % 10]! : dx - 10 - j * 3;
      const bz = j < 3 ? offshore[((j * 2) % 10) + 1]! : dz - 8.5;
      stukas.push(
        new Path([
          [bx + 40, 4.5, bz - 25, 17],
          [bx + 8, 4, bz - 5, bombs[j]! - 1.8],
          [bx + 1.2, 1, bz - 0.8, bombs[j]! - 0.4],
          [bx - 2, 0.4, bz + 1.4, bombs[j]! + 0.4],
          [bx - 20, 2.5, bz + 6, bombs[j]! + 4],
        ])
      );
    }
    const s = sample();
    const u = sample();

    return (t) => {
      for (let i = 0; i < 3; i++) {
        plume(
          kit,
          t,
          -12 + i * 0.4,
          99,
          ox + i * 0.9,
          oz + (i % 2) * 0.5,
          1.3,
          i + 1,
          OIL
        );
      }
      for (let i = 0; i < 3; i++) {
        plume(
          kit,
          t,
          -8 + i,
          99,
          dx + 1 + i * 1.3,
          dz + 1 + i * 0.3,
          0.6,
          i + 9,
          TOWN
        );
      }

      for (let i = 0; i < 6; i++) {
        const f = (i / 6 + t * 0.012) % 1;
        dover.at(f, s);
        s.y = ground(s.x, s.z);
        kit.unit(
          i % 3 === 2 ? "transport" : "destroyer",
          s,
          i % 3 === 2 ? 2 : 1.6,
          FACTION.allied
        );
        trail(kit, s, 4, 0.3);
      }
      for (let i = 0; i < 5; i++) {
        const f = (i / 5 + 0.1 + t * 0.009) % 1;
        ramsgate.at(f, s);
        s.y = ground(s.x, s.z);
        kit.unit(
          i % 2 ? "transport" : "destroyer",
          s,
          i % 2 ? 2 : 1.6,
          FACTION.allied
        );
        trail(kit, s, 4, 0.3);
      }
      for (let i = 0; i < 5; i++) {
        s.x = offshore[i * 2]!;
        s.z = offshore[i * 2 + 1]!;
        s.y = ground(s.x, s.z);
        s.yaw = -1.9;
        s.pitch = 0;
        s.roll = 0;
        const sunk = i === 1 ? smooth(22.2, 27, t) * 6 : 0;
        kit.unit("destroyer", s, 1.5, FACTION.allied, sunk);
      }

      for (let b = 0; b < 44; b++) {
        const i = b % 5;
        const bx = beaches[i]![0];
        const bz = beaches[i]![1];
        const lane = (Math.floor(b / 5) - 4) * 0.35;
        const phase = hash(b) + t * (0.09 + hash(b + 0.5) * 0.05);
        const cycle = phase - Math.floor(phase);
        const go = cycle < 0.5;
        const k = go ? cycle * 2 : (1 - cycle) * 2;
        const e = k * k * (3 - 2 * k);
        const sx = bx + lane - 0.2;
        const sz = bz - 0.35;
        const tx = offshore[i * 2]! + lane * 0.6;
        const tz = offshore[i * 2 + 1]! + 0.4;
        s.x = sx + (tx - sx) * e;
        s.z = sz + (tz - sz) * e;
        s.y = ground(s.x, s.z);
        s.yaw = go
          ? Math.atan2(tx - sx, tz - sz)
          : Math.atan2(sx - tx, sz - tz);
        s.pitch = 0;
        s.roll = 0;
        kit.unit("boat", s, 0.55, FACTION.neutral);
        if (k > 0.05 && k < 0.95) trail(kit, s, 1.2, 0.08, 0.8, 4);
      }
      for (let q = 0; q < 60; q++) {
        const i = q % 5;
        const n = Math.floor(q / 5);
        u.x = beaches[i]![0] + (n % 4) * 0.35 - 0.5;
        u.z = beaches[i]![1] + 0.2 - Math.floor(n / 4) * 0.28;
        u.y = ground(u.x, u.z);
        u.yaw = Math.PI;
        u.pitch = 0;
        u.roll = 0;
        kit.unit("squad", u, 0.3, FACTION.allied);
      }
      for (let q = 0; q < 12; q++) {
        u.x = moleX - 0.05 + (q % 2) * 0.1;
        u.z = moleZ + 0.2 + q * 0.2;
        u.y = ground(u.x, u.z) + 0.08;
        u.yaw = Math.PI;
        u.pitch = 0;
        u.roll = 0;
        kit.unit("squad", u, 0.2, FACTION.allied);
      }

      for (let j = 0; j < stukas.length; j++) {
        const path = stukas[j]!;
        if (t < path.start || t > path.finish) continue;
        path.at(t, s);
        kit.unit("diver", s, 0.8, FACTION.axis);
      }
      for (let j = 0; j < bombs.length; j++) {
        const path = stukas[j]!;
        const at = bombs[j]!;
        path.at(at - 0.4, u);
        const bx = u.x - 1;
        const bz = u.z + 0.6;
        if (t > at - 0.4 && t < at) {
          const k = (t - (at - 0.4)) / 0.4;
          s.x = u.x + (bx - u.x) * k;
          s.z = u.z + (bz - u.z) * k;
          s.y = u.y * (1 - k * k);
          s.yaw = u.yaw;
          s.pitch = -1.2;
          s.roll = 0;
          kit.unit("bomb", s, 0.2, FACTION.dark);
        }
        if (j === 1) {
          burst(kit, t, at, bx, ground(bx, bz) + 0.1, bz, 0.8, 31);
          plume(kit, t, at + 0.3, 99, bx, bz, 0.6, 33, WRECK);
        } else {
          splash(kit, t, at, bx, bz, 0.35, j + 50);
        }
      }
      if (t > 18 && t < 27) {
        for (let j = 0; j < 4; j++) {
          const k = (t - 18) / 9;
          s.x = dx - 60 + k * 90 + j * 1.2;
          s.z = dz - 14 - j * 0.8 + k * 6;
          s.y = ground(s.x, s.z) + 5;
          s.yaw = 1.45;
          s.pitch = 0;
          s.roll = 0;
          kit.unit("fighter", s, 0.7, FACTION.allied);
        }
      }
    };
  },
};

const OIL = {
  rise: 0.35,
  wind: -0.55,
  life: 16,
  every: 0.3,
  fire: 1,
  shade: 0.03,
};
const TOWN = { rise: 0.3, wind: -0.45, life: 12, every: 0.4, fire: 0.7 };
const WRECK = { rise: 0.35, wind: -0.3, life: 8, every: 0.35, fire: 0.9 };

export default scene;
