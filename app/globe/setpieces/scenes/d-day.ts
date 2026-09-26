import { burst, splash, trail, plume } from "../fx";
import {
  clamp01,
  easeOut,
  ground,
  hash,
  offset,
  Path,
  sample,
  smooth,
  type SceneDef,
} from "../kit";
import { FACTION, type ModelKind } from "../models";

const BEACHES: [number, number, number][] = [
  [-1.176, 49.415, -Math.PI / 2],
  [-0.88, 49.37, 0],
  [-0.6, 49.34, 0],
  [-0.43, 49.335, 0],
  [-0.3, 49.295, 0],
];
const OMAHA = 1;
const V: [number, number][] = [
  [0, 0],
  [-0.9, 0.9],
  [0.9, 0.9],
  [-1.8, 1.8],
  [1.8, 1.8],
  [-2.7, 2.7],
  [2.7, 2.7],
  [0, 2.2],
  [0, 3.6],
];

const scene: SceneDef = {
  anchor: [-0.75, 49.55],
  capacity: {
    smoke: 1300,
    fire: 200,
    balls: 24,
    decals: 520,
    glow: 110,
    tracers: 150,
    units: {
      twin: 18,
      transport: 30,
      destroyer: 12,
      battleship: 4,
      landing: 40,
      squad: 60,
    },
  },
  camera: [
    [0, -40, 10, 1, 70, -140, 32],
    [5, -5, 12, 2, 150, -165, 48],
    [8.5, 0, -35, 0, 170, -160, 56],
    [12, -2, -2, 0, 95, -168, 32],
    [15, -9, 12, 0, 44, -125, 22],
    [18.5, -9, 17, 0, 30, -168, 18],
    [22, -9, 19, 0, 26, -205, 16],
    [25.5, 4, 20, 0, 115, -178, 42],
    [32, 4, 15, 0, 195, -180, 62],
  ],
  cues: [
    [0.5, "drone", 6],
    [12.6, "far", 0.6],
    [13.4, "far", 0.6],
    [14.2, "boom", 0.6],
    [15.5, "far", 0.6],
    [21, "far", 0.5],
  ],
  build(kit) {
    kit.sea(170, 0, -50);
    const beaches = BEACHES.map(
      ([lon, lat, yaw]) =>
        [...kit.geo(lon, lat), yaw] as [number, number, number]
    );
    const [ux, uz] = kit.geo(-1.316, 49.408);
    const [bx, bz] = kit.geo(-0.26, 49.23);
    const lifts = [
      new Path([
        [ux - 60, 1.5, uz - 30, 0],
        [ux - 12, 1.3, uz - 5, 2],
        [ux + 4, 1.2, uz + 3, 3.2],
        [ux + 30, 1.6, uz + 20, 6],
      ]),
      new Path([
        [bx - 20, 1.5, bz - 60, 0.3],
        [bx - 4, 1.3, bz - 14, 2.4],
        [bx + 1, 1.2, bz + 2, 3.6],
        [bx + 10, 1.6, bz + 35, 6.5],
      ]),
    ];

    const fleet: {
      kind: ModelKind;
      x: number;
      z: number;
      delay: number;
      size: number;
    }[] = [];
    for (let i = 0; i < 46; i++) {
      const lane = i % 9;
      const kind: ModelKind =
        i < 4 ? "battleship" : i < 14 ? "destroyer" : "transport";
      fleet.push({
        kind,
        x: -38 + lane * 9 + (hash(i) - 0.5) * 4,
        z:
          i < 4
            ? 6
            : i < 14
              ? 11 + (hash(i + 1) - 0.5) * 2
              : -2 + hash(i + 2) * 6,
        delay: hash(i + 3) * 1.8,
        size: kind === "battleship" ? 2.6 : kind === "destroyer" ? 1.5 : 1.9,
      });
    }
    const shells: number[] = [];
    for (let k = 0; k < 36; k++) {
      const ship = k % 8;
      const beach = beaches[1 + (k % 4)]!;
      shells.push(
        12.2 + k * 0.17,
        ship,
        beach[0] + (hash(k) - 0.5) * 7,
        beach[1] + 1.2 + hash(k + 0.5) * 1.6
      );
    }
    const s = sample();
    const p = sample();

    const shipAt = (i: number, t: number) => {
      const ship = fleet[i]!;
      const k = clamp01((t - ship.delay) / 12.5);
      s.x = ship.x;
      s.z = ship.z - 85 * (1 - easeOut(k));
      s.y = ground(s.x, s.z);
      s.yaw = 0;
      s.pitch = 0;
      s.roll = 0;
      return k;
    };

    return (t) => {
      for (let g = 0; g < 2; g++) {
        const path = lifts[g]!;
        if (t > path.finish + 0.5) continue;
        for (let j = 0; j < 9; j++) {
          path.at(t - j * 0.12, s);
          offset(s, V[j]![0] * 0.9, V[j]![1] * 0.9, 0);
          kit.unit("twin", s, 0.8, FACTION.allied);
        }
      }
      for (let g = 0; g < 2; g++) {
        const drop = g ? 3.6 : 3.2;
        for (let c = 0; c < 54; c++) {
          const j = c % 9;
          const at = drop - 0.7 + (c / 54) * 1.4;
          const age = t - at;
          if (age < 0 || age > 6) continue;
          lifts[g]!.at(at - j * 0.12, p);
          offset(p, V[j]![0] * 0.9, V[j]![1] * 0.9, 0);
          const y = Math.max(ground(p.x, p.z) + 0.05, p.y - 0.1 - age * 0.2);
          kit.smoke.push(
            p.x + age * 0.1 + (hash(c) - 0.5) * 0.3,
            y,
            p.z + (hash(c + 1) - 0.5) * 0.3,
            0.2,
            0.9 * (1 - smooth(4.5, 6, age)),
            0,
            0.97,
            0,
            hash(c + 2)
          );
        }
        const cx = g ? bx : ux;
        const cz = g ? bz : uz;
        if (t < 6.5) {
          for (let a = 0; a < 14; a++) {
            const phase = t * 2.2 + a * 0.29;
            const cycle = phase - Math.floor(phase);
            const fx = cx + (hash(a + g * 20) - 0.5) * 16;
            const fz = cz + (hash(a + g * 20 + 0.4) - 0.5) * 12;
            const len = 0.3 + cycle * 1.6;
            kit.tracers.push(
              fx,
              ground(fx, fz) + len * 0.6,
              fz,
              fx + 0.1,
              ground(fx, fz) + len,
              fz - 0.1,
              1,
              0.55,
              0.25,
              1 - cycle
            );
            if (hash(a + Math.floor(phase)) > 0.8)
              kit.glow.disc(
                fx,
                ground(fx, fz) + 1.3,
                fz,
                0.35,
                1 - cycle,
                1,
                0.75,
                0.4
              );
          }
        }
      }

      for (let i = 0; i < fleet.length; i++) {
        const k = shipAt(i, t);
        const ship = fleet[i]!;
        kit.unit(ship.kind, s, ship.size, FACTION.allied);
        if (k < 1) trail(kit, s, 4, 0.3, 1 - k * k);
      }

      for (let q = 0; q < shells.length; q += 4) {
        const fired = shells[q]!;
        const age = t - fired;
        if (age < -0.1 || age > 5) continue;
        shipAt(shells[q + 1]!, t);
        const tx = shells[q + 2]!;
        const tz = shells[q + 3]!;
        if (age < 0.18 && age > 0) {
          kit.glow.disc(s.x, s.y + 0.2, s.z, 1.2, 1 - age / 0.18, 1, 0.8, 0.5);
          kit.fire.push(
            s.x,
            s.y + 0.3,
            s.z + 0.5,
            1,
            1 - age / 0.18,
            1,
            0,
            0,
            hash(q)
          );
        }
        const flight = 1.4;
        if (age > 0 && age < flight) {
          const u0 = Math.max(0, age / flight - 0.07);
          const u1 = age / flight;
          const y0 = s.y + Math.sin(Math.PI * u0) * 3;
          const y1 = s.y + Math.sin(Math.PI * u1) * 3;
          kit.tracers.push(
            s.x + (tx - s.x) * u0,
            y0,
            s.z + (tz - s.z) * u0,
            s.x + (tx - s.x) * u1,
            y1,
            s.z + (tz - s.z) * u1,
            1,
            0.85,
            0.55,
            0.9
          );
        }
        burst(kit, t, fired + flight, tx, ground(tx, tz) + 0.1, tz, 0.4, q + 3);
      }

      for (let c = 0; c < 40; c++) {
        const b = c % 5;
        const beach = beaches[b]!;
        const n = Math.floor(c / 5);
        const yaw = beach[2];
        const across = (n - 3.5) * 0.9;
        const start = 17.6 + (hash(c) * 0.8 + (b > 1 ? 0.6 : 0));
        const k = clamp01((t - start) / 3.6);
        const reach = 14 * (1 - easeOut(k)) + 0.3;
        const sx = Math.sin(yaw);
        const sz = Math.cos(yaw);
        s.x = beach[0] + sz * across - sx * reach;
        s.z = beach[1] - sx * across - sz * reach;
        s.y = ground(s.x, s.z);
        s.yaw = yaw;
        s.pitch = 0;
        s.roll = 0;
        if (t < start - 6) continue;
        kit.unit("landing", s, 0.7, FACTION.allied);
        if (k > 0 && k < 1) trail(kit, s, 1.6, 0.14, 1, 5);
        if (k >= 1) {
          const walk = clamp01((t - start - 3.6) / 5);
          p.x = s.x + sx * (0.3 + walk * 1.1);
          p.z = s.z + sz * (0.3 + walk * 1.1);
          p.y = ground(p.x, p.z);
          p.yaw = yaw;
          p.pitch = 0;
          p.roll = 0;
          kit.unit("squad", p, 0.3, FACTION.allied);
        }
        if (b === OMAHA && t > 19 && t < 30) {
          const phase = t * 2.6 + n * 0.37;
          const cycle = phase - Math.floor(phase);
          const gx = beach[0] + across * 1.2;
          const gz = beach[1] + 1.4;
          kit.tracers.push(
            gx + (s.x - gx) * cycle * 0.8,
            ground(gx, gz) + 0.25 - cycle * 0.2,
            gz + (s.z - gz) * cycle * 0.8,
            gx + (s.x - gx) * (cycle * 0.8 + 0.12),
            ground(gx, gz) + 0.2 - cycle * 0.2,
            gz + (s.z - gz) * (cycle * 0.8 + 0.12),
            1,
            0.6,
            0.3,
            0.9
          );
          splash(
            kit,
            t,
            19.5 + n * 1.3 + hash(c) * 0.6,
            s.x + (hash(c) - 0.5) * 1.6,
            s.z - 0.6,
            0.18,
            c + 70
          );
        }
      }
      for (let b = 1; b < 5; b++) {
        const beach = beaches[b]!;
        plume(
          kit,
          t,
          13.8 + b * 0.3,
          99,
          beach[0] + 1.5,
          beach[1] + 1.6,
          0.8,
          b + 90,
          SHORE
        );
      }
    };
  },
};

const SHORE = {
  rise: 0.3,
  wind: 0.35,
  life: 11,
  every: 0.45,
  fire: 0.6,
  shade: 0.12,
};

export default scene;
