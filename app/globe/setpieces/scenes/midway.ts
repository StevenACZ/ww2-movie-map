import { burst, plume, splash, trail } from "../fx";
import {
  clamp01,
  ground,
  hash,
  Path,
  sample,
  smooth,
  type Sample,
  type SceneDef,
} from "../kit";
import { FACTION } from "../models";

const JAPAN: [number, number, number][] = [
  [-190, -200, 17.8],
  [-181, -191, 18.2],
  [-199, -188, 18.5],
  [-176, -228, 27.2],
];
const US: [number, number][] = [
  [200, -262],
  [212, -252],
  [186, -230],
];
const YORKTOWN_HIT = 25.2;
const HEADING = Math.atan2(1, -1);
const SPEED = 0.35;

const scene: SceneDef = {
  anchor: [-177.37, 28.21],
  capacity: {
    smoke: 1500,
    fire: 220,
    balls: 22,
    decals: 400,
    glow: 90,
    tracers: 140,
    units: {
      carrier: 7,
      battleship: 2,
      destroyer: 12,
      diver: 30,
      fighter: 10,
      bomb: 6,
    },
  },
  camera: [
    [0, 0, -150, 0, 560, -180, 70],
    [5, -120, -200, 0, 150, -130, 34],
    [9, -178, -196, 0.5, 42, -110, 18],
    [12.5, -182, -196, 2, 50, -60, 30],
    [15.5, -188, -196, 1.5, 42, -35, 24],
    [18.5, -188, -196, 0.8, 36, -5, 20],
    [22, -186, -200, 0.8, 55, 25, 26],
    [25, 186, -230, 0.5, 40, 60, 24],
    [28, -60, -215, 0, 470, 10, 62],
    [32, -20, -200, 0, 600, 0, 74],
  ],
  cues: [
    [5, "drone", 9],
    [13, "drone", 6],
    [17.8, "boom", 0.9],
    [18.2, "boom", 0.9],
    [18.5, "boom", 0.9],
    [YORKTOWN_HIT, "far", 0.7],
    [27.2, "far", 0.8],
  ],
  build(kit) {
    kit.sea(460, -20, -170);
    const [ax, az] = kit.geo(-177.37, 28.21);
    kit.land(
      [
        [ax - 4.2, az + 1.6],
        [ax - 2.2, az + 0.6],
        [ax - 1.6, az + 2.4],
        [ax - 3.6, az + 3.2],
      ],
      0.2,
      0xb9ad8a
    );
    kit.land(
      [
        [ax + 1.4, az + 2.4],
        [ax + 3.4, az + 1.6],
        [ax + 3.6, az + 3.2],
        [ax + 1.8, az + 3.6],
      ],
      0.2,
      0xb9ad8a
    );

    const s = sample();
    const target = sample();
    const carrierAt = (i: number, t: number, out: Sample) => {
      out.x = JAPAN[i]![0] + Math.sin(HEADING) * SPEED * t;
      out.z = JAPAN[i]![1] + Math.cos(HEADING) * SPEED * t;
      out.y = ground(out.x, out.z);
      out.yaw = HEADING;
      out.pitch = 0;
      out.roll = 0;
      return out;
    };

    const torpedo: Path[] = [];
    for (let j = 0; j < 8; j++) {
      const lane = (j - 3.5) * 1.6;
      torpedo.push(
        new Path([
          [-120, 0.25, -175 + lane, 5 + j * 0.08],
          [-160, 0.12, -184 + lane, 7.6],
          [-176, 0.1, -190 + lane * 0.6, 9],
          [-200, 0.6, -200 + lane, 10.4],
          [-230, 1.5, -210 + lane, 12],
        ])
      );
    }
    const downed = [7.2, 7.7, 8.1, 8.4, 8.8, 9.2, 99, 99];
    const zeros: number[] = [];
    for (let j = 0; j < 10; j++)
      zeros.push(
        hash(j) * Math.PI * 2,
        6 + hash(j + 0.5) * 7,
        0.4 + hash(j + 0.9) * 0.8
      );

    const dive: Path[] = [];
    const diveTarget = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2];
    for (let j = 0; j < diveTarget.length; j++) {
      const k = diveTarget[j]!;
      const [x, z, hit] = JAPAN[k]!;
      const tx = x + Math.sin(HEADING) * SPEED * hit;
      const tz = z + Math.cos(HEADING) * SPEED * hit;
      const slot = j % 6;
      const drop = hit - 0.45 + slot * 0.12;
      const from = k === 2 ? [150, -230] : [170, -250];
      dive.push(
        new Path([
          [from[0]! + slot * 2, 6, from[1]! + slot * 1.5, 1],
          [-40 + slot * 2, 6.2, -215 + k * 6 + slot, 9],
          [tx + 12 + slot * 1.2, 6, tz - 6 + slot, drop - 2.6],
          [tx + 3, 5.2, tz - 1, drop - 1.6],
          [tx + 0.6, 1.2, tz, drop],
          [tx - 3, 0.3, tz + 2, drop + 0.7],
          [tx - 20, 1.5, tz + 16, drop + 3.5],
        ])
      );
    }
    const counter: Path[] = [];
    for (let j = 0; j < 8; j++) {
      const lane = (j - 3.5) * 1.3;
      counter.push(
        new Path([
          [-176 + lane, 0.3, -228, 20.5 + j * 0.1],
          [-40 + lane, 4, -226, 22.4],
          [150 + lane, 4, -228 + lane, 24],
          [186 + lane * 0.3, 0.8, -230, YORKTOWN_HIT - 0.2 + j * 0.05],
          [196 + lane, 1, -250, YORKTOWN_HIT + 1.4],
        ])
      );
    }

    return (t) => {
      kit.decals.ring(
        ax,
        ground(ax, az) + 0.02,
        az + 2,
        5,
        0.3,
        0.7,
        0.55,
        0.82,
        0.8
      );
      const halo = 1 - smooth(4, 6, t) + smooth(27, 29, t);
      if (halo > 0) {
        carrierAt(0, t, target);
        kit.glow.disc(
          target.x,
          target.y + 0.1,
          target.z,
          26,
          halo * 0.35,
          0.95,
          0.45,
          0.3
        );
        kit.glow.ring(
          target.x,
          target.y + 0.1,
          target.z,
          28,
          0.06,
          halo * 0.6,
          0.95,
          0.45,
          0.3
        );
        kit.glow.disc(
          US[0]![0],
          ground(US[0]![0], US[0]![1]) + 0.1,
          US[0]![1],
          26,
          halo * 0.35,
          0.45,
          0.65,
          0.95
        );
        kit.glow.ring(
          US[0]![0],
          ground(US[0]![0], US[0]![1]) + 0.1,
          US[0]![1],
          28,
          0.06,
          halo * 0.6,
          0.45,
          0.65,
          0.95
        );
        kit.glow.ring(
          ax,
          ground(ax, az) + 0.1,
          az,
          16,
          0.08,
          halo * 0.6,
          0.95,
          0.8,
          0.5
        );
      }
      for (let i = 0; i < JAPAN.length; i++) {
        carrierAt(i, t, s);
        const hit = JAPAN[i]![2];
        kit.unit(
          "carrier",
          s,
          3.2,
          FACTION.japan,
          smooth(hit + 4, hit + 14, t) * 0.8
        );
        trail(kit, s, 5, 0.4, 1 - smooth(hit, hit + 3, t));
        plume(kit, t, hit + 0.2, 99, s.x, s.z, 0.9, i * 11 + 3, FIRES);
        burst(kit, t, hit, s.x + 0.3, s.y + 0.2, s.z, 1, i + 5);
        burst(kit, t, hit + 0.8, s.x - 0.6, s.y + 0.2, s.z + 0.4, 0.8, i + 25);
      }
      for (let e = 0; e < 8; e++) {
        carrierAt(e % 3, t, s);
        const a = (e / 8) * Math.PI * 2 + 0.3;
        s.x += Math.cos(a) * 11;
        s.z += Math.sin(a) * 11;
        s.y = ground(s.x, s.z);
        kit.unit(
          e < 2 ? "battleship" : "destroyer",
          s,
          e < 2 ? 2.8 : 1.5,
          FACTION.japan
        );
        trail(kit, s, 3.5, 0.25);
      }
      for (let i = 0; i < US.length; i++) {
        s.x = US[i]![0] + Math.sin(-0.8) * 0.2 * t;
        s.z = US[i]![1] + Math.cos(-0.8) * 0.2 * t;
        s.y = ground(s.x, s.z);
        s.yaw = -0.8;
        s.pitch = 0;
        s.roll = 0;
        const yorktown = i === 2;
        kit.unit(
          "carrier",
          s,
          3.2,
          FACTION.allied,
          yorktown ? smooth(YORKTOWN_HIT + 2, YORKTOWN_HIT + 9, t) * 0.4 : 0
        );
        trail(kit, s, 5, 0.4);
        if (yorktown) {
          burst(kit, t, YORKTOWN_HIT, s.x, s.y + 0.2, s.z, 0.9, 71);
          plume(kit, t, YORKTOWN_HIT + 0.2, 99, s.x, s.z, 0.7, 72, FIRES);
        }
        for (let e = 0; e < 2; e++) {
          target.x = s.x + (e ? 7 : -6);
          target.z = s.z + (e ? 4 : -5);
          target.y = ground(target.x, target.z);
          target.yaw = s.yaw;
          target.pitch = 0;
          target.roll = 0;
          kit.unit("destroyer", target, 1.5, FACTION.allied);
        }
      }

      for (let j = 0; j < torpedo.length; j++) {
        const path = torpedo[j]!;
        if (t < path.start) continue;
        path.at(Math.min(t, downed[j]!), s);
        const down = downed[j]!;
        if (t > down) {
          const fall = t - down;
          if (fall > 1.2) {
            splash(
              kit,
              t,
              down + 1.2,
              s.x + Math.sin(s.yaw) * 1.5,
              s.z + Math.cos(s.yaw) * 1.5,
              0.3,
              j + 90
            );
            continue;
          }
          s.x += Math.sin(s.yaw) * fall * 1.2;
          s.z += Math.cos(s.yaw) * fall * 1.2;
          s.y = Math.max(ground(s.x, s.z), s.y - fall * fall * 0.2);
          s.pitch = -0.5 * fall;
          s.roll = fall * 1.5;
          kit.fire.push(s.x, s.y + 0.1, s.z, 0.5, 0.8, 0.8, 0, 0, hash(j));
          kit.smoke.push(
            s.x - Math.sin(s.yaw) * 0.6,
            s.y + 0.15,
            s.z - Math.cos(s.yaw) * 0.6,
            0.6,
            0.6,
            0.3,
            0.1,
            0,
            hash(j + 1)
          );
        } else if (t > path.finish) continue;
        kit.unit("diver", s, 0.95, FACTION.allied);
      }
      if (t > 5 && t < 24) {
        for (let j = 0; j < 10; j++) {
          const a =
            zeros[j * 3]! + t * (0.35 + (j % 3) * 0.08) * (j % 2 ? 1 : -1);
          const r = zeros[j * 3 + 1]!;
          carrierAt(j % 3, t, target);
          s.x = target.x + Math.cos(a) * r;
          s.z = target.z + Math.sin(a) * r;
          s.y = ground(s.x, s.z) + zeros[j * 3 + 2]!;
          s.yaw = j % 2 ? -a : Math.PI - a;
          s.pitch = 0;
          s.roll = j % 2 ? -0.7 : 0.7;
          kit.unit("fighter", s, 0.8, FACTION.japan);
        }
      }

      for (let j = 0; j < dive.length; j++) {
        const path = dive[j]!;
        if (t < path.start || t > path.finish) continue;
        path.at(t, s);
        kit.unit("diver", s, 0.95, FACTION.allied);
      }
      for (let i = 0; i < 3; i++) {
        const hit = JAPAN[i]![2];
        if (t > hit - 0.6 && t < hit) {
          carrierAt(i, hit, target);
          target.y = ground(target.x, target.z) + 1.2 * ((hit - t) / 0.6);
          target.pitch = -1.3;
          kit.unit("bomb", target, 0.25, FACTION.dark);
        }
        if (t > hit - 3 && t < hit + 1.5) {
          carrierAt(i, t, target);
          for (let a = 0; a < 10; a++) {
            const phase = t * 2.5 + a * 0.41;
            const cycle = phase - Math.floor(phase);
            const ang = hash(a * 3.7 + i) * Math.PI * 2;
            const len = 1 + cycle * 5;
            kit.tracers.push(
              target.x + Math.cos(ang) * len * 0.3,
              target.y + len * 0.8,
              target.z + Math.sin(ang) * len * 0.3,
              target.x + Math.cos(ang) * len * 0.36,
              target.y + len,
              target.z + Math.sin(ang) * len * 0.36,
              1,
              0.7,
              0.3,
              (1 - cycle) * 0.9
            );
            if (cycle > 0.85)
              kit.smoke.push(
                target.x + Math.cos(ang) * len * 0.4,
                target.y + len * 1.05,
                target.z + Math.sin(ang) * len * 0.4,
                0.4,
                0.55,
                0,
                0.1,
                0,
                hash(a)
              );
          }
        }
      }
      for (let j = 0; j < counter.length; j++) {
        const path = counter[j]!;
        if (t < path.start || t > path.finish) continue;
        path.at(t, s);
        kit.unit("diver", s, 0.95, FACTION.japan);
      }
      const hiryu = JAPAN[3]![2];
      if (t > hiryu - 2.4 && t < hiryu + 1) {
        carrierAt(3, hiryu, target);
        for (let j = 0; j < 4; j++) {
          const u = clamp01((t - (hiryu - 2.4) - j * 0.15) / 2.4);
          s.x = target.x + 30 * (1 - u) + j;
          s.z = target.z - 10 * (1 - u);
          s.y = ground(s.x, s.z) + 0.6 + 5 * (1 - u);
          s.yaw = -1.9;
          s.pitch = -0.9 * (1 - u);
          s.roll = 0;
          if (u < 1) kit.unit("diver", s, 0.95, FACTION.allied);
        }
      }
    };
  },
};

const FIRES = { rise: 0.55, wind: 0.35, life: 9, every: 0.26, fire: 1 };

export default scene;
