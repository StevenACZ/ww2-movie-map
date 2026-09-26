import { eruption } from "../fx";
import {
  clamp01,
  easeOut,
  ground,
  hash,
  sample,
  smooth,
  type SceneDef,
} from "../kit";
import { FACTION } from "../models";

const MINES: [number, number][] = [
  [2.928, 50.8236],
  [2.93, 50.8228],
  [2.8903, 50.8126],
  [2.8627, 50.8014],
  [2.8615, 50.8005],
  [2.8638, 50.7998],
  [2.855, 50.797],
  [2.8562, 50.7962],
  [2.852, 50.793],
  [2.854, 50.787],
  [2.8605, 50.7835],
  [2.866, 50.782],
  [2.8672, 50.7812],
  [2.8648, 50.7808],
  [2.873, 50.771],
  [2.902, 50.726],
  [2.9032, 50.7252],
  [2.905, 50.722],
  [2.9062, 50.7212],
];

const START = 9;
const SPREAD = 5.5;
const LONDON: [number, number] = [-0.1276, 51.5072];

const scene: SceneDef = {
  anchor: [2.885, 50.775],
  capacity: {
    smoke: 1400,
    fire: 40,
    balls: 22,
    decals: 520,
    glow: 90,
    tracers: 4,
    units: { squad: 40 },
  },
  camera: [
    [0, 0, 0, 0, 160, -60, 55],
    [5, -1, 0, 0, 45, -75, 22],
    [9, -1, -2, 0.5, 38, -100, 16],
    [13, 0, 1, 1, 40, -60, 18],
    [16, 0, 0, 1, 70, -40, 30],
    [20, -80, -40, 0, 470, -60, 72],
    [24, 0, 0, 0.3, 42, -95, 20],
    [28, 2, 0, 0.3, 58, -120, 30],
  ],
  cues: [
    [START, "boom", 1],
    [START + 1.8, "boom", 0.8],
    [START + 3.6, "boom", 0.9],
    [START + 5.2, "far", 0.6],
  ],
  build(kit) {
    kit.hill(0.9, -0.5, 2.6, 8.5, 0.32, 0x5b5236, 0.18);
    kit.hill(3.2, 3.5, 2.2, 3, 0.2, 0x57503a, 0.3);
    const mines = MINES.map(([lon, lat]) => kit.geo(lon, lat));
    const fire = mines.map((_, i) => START + hash(i * 4.7) * SPREAD);
    const [lx, lz] = kit.geo(LONDON[0], LONDON[1]);
    const london = Math.hypot(lx, lz);
    const line: number[] = [];
    for (let i = 0; i < mines.length - 1; i++) {
      const [ax, az] = mines[i]!;
      const [bx, bz] = mines[i + 1]!;
      const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.18);
      for (let s = 0; s < steps; s++)
        line.push(ax + ((bx - ax) * s) / steps, az + ((bz - az) * s) / steps);
    }
    const squads: number[] = [];
    for (let i = 0; i < line.length && squads.length < 80; i += 6)
      squads.push(line[i]! - 1.1, line[i + 1]!);
    const s = sample();

    return (t) => {
      for (let i = 0; i < line.length; i += 2) {
        const x = line[i]!;
        const z = line[i + 1]!;
        kit.decals.disc(
          x + 0.15,
          kit.surface(x + 0.15, z) + 0.02,
          z,
          0.08,
          0.7,
          0.14,
          0.1,
          0.08
        );
        kit.decals.disc(
          x - 0.55,
          kit.surface(x - 0.55, z) + 0.02,
          z,
          0.07,
          0.55,
          0.12,
          0.12,
          0.1
        );
      }
      const armed =
        smooth(4.5, 6, t) * (1 - smooth(START - 0.2, START + 0.4, t));
      for (let i = 0; i < mines.length; i++) {
        const x = mines[i]![0];
        const z = mines[i]![1];
        if (armed > 0) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 5 + i);
          kit.glow.disc(
            x + 0.2,
            kit.surface(x + 0.2, z) + 0.03,
            z,
            0.35 + pulse * 0.2,
            armed * (0.5 + pulse * 0.4),
            1,
            0.55,
            0.2
          );
        }
        eruption(
          kit,
          t,
          fire[i]!,
          x + 0.2,
          kit.surface(x + 0.2, z) + 0.03,
          z,
          0.62,
          i + 3
        );
        if (t > fire[i]! && t < fire[i]! + 0.4)
          kit.shake = Math.max(kit.shake, 0.25);
      }

      const wave = (t - START - 1) / 6;
      if (wave > 0 && wave < 1) {
        const r = london * 1.08 * easeOut(wave);
        kit.glow.ring(0, 0.4, 0, r, 0.025, 0.7 * (1 - wave), 0.95, 0.75, 0.45);
        kit.glow.ring(
          0,
          0.4,
          0,
          r * 0.93,
          0.02,
          0.35 * (1 - wave),
          0.95,
          0.75,
          0.45
        );
      }
      const heard = clamp01((t - START - 1 - 6 * 0.55) / 1.5);
      if (heard > 0 && t < 24) {
        kit.glow.disc(
          lx,
          ground(lx, lz) + 0.5,
          lz,
          4 + heard * 6,
          0.8 * (1 - smooth(20, 24, t)),
          0.95,
          0.75,
          0.45
        );
        kit.glow.ring(
          lx,
          ground(lx, lz) + 0.5,
          lz,
          6 + heard * 10,
          0.15,
          0.6 * (1 - heard),
          0.95,
          0.75,
          0.45
        );
      }

      const dust = smooth(START + 2, START + 7, t);
      if (dust > 0) {
        for (let i = 0; i < line.length; i += 6) {
          const x = line[i]!;
          const z = line[i + 1]!;
          const k = i * 0.37;
          const drift = (t - START - 2) * 0.12;
          kit.smoke.push(
            x + 0.6 + drift + (hash(k) - 0.5) * 0.8,
            kit.surface(x, z) + 0.5 + hash(k + 0.3) * 0.7,
            z + (hash(k + 0.6) - 0.5) * 0.5,
            1.6 + dust * 1.2,
            0.38 * dust * (1 - smooth(26, 28, t) * 0.4),
            0,
            0.34,
            1,
            hash(k + 0.9)
          );
        }
      }

      const advance = clamp01((t - 20.5) / 7.5);
      if (advance > 0) {
        const barrage = advance * 3.2;
        for (let i = 0; i < line.length; i += 10) {
          const x = line[i]! + 0.2 + barrage;
          const z = line[i + 1]!;
          const blink = hash(i + Math.floor(t * 6) * 0.13);
          const top = kit.surface(x, z);
          if (blink > 0.55)
            kit.glow.disc(x, top + 0.03, z, 0.35, blink - 0.4, 1, 0.7, 0.35);
          kit.smoke.push(x, top + 0.4, z, 0.9, 0.35, 0.2, 0.3, 0.8, hash(i));
          if (hash(i * 3 + Math.floor(t * 4)) > 0.7)
            kit.glow.disc(
              x - 9,
              ground(x - 9, z) + 0.05,
              z,
              0.3,
              0.8,
              1,
              0.8,
              0.5
            );
        }
        for (let i = 0; i < squads.length; i += 2) {
          s.x = squads[i]! + advance * 2.6 + (hash(i) - 0.5) * 0.3;
          s.z = squads[i + 1]! + (hash(i + 1) - 0.5) * 0.4;
          s.y = kit.surface(s.x, s.z);
          s.yaw = Math.PI / 2;
          s.pitch = 0;
          s.roll = 0;
          kit.unit("squad", s, 0.55, FACTION.allied);
        }
      }
    };
  },
};

export default scene;
