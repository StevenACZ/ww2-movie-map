import {
  BoxGeometry,
  Color,
  InstancedMesh,
  Matrix4,
  MeshLambertMaterial,
  Quaternion,
  Vector3,
} from "three";
import type { LonLat } from "../../geo";
import { mushroom, plume } from "../fx";
import {
  clamp01,
  ground,
  hash,
  Route,
  sample,
  smooth,
  type CameraKey,
  type Kit,
  type SceneDef,
} from "../kit";
import { FACTION } from "../models";

interface AtomicConfig {
  anchor: LonLat;
  release: number;
  burst: number;
  height: number;
  top: number;
  seed: number;
  flight: [number, number, number][];
  speed: number;
  camera: CameraKey[];
  blocks: (add: (x: number, z: number) => void) => void;
  destroyed: (x: number, z: number, d: number) => number;
  terrain: (kit: Kit) => void;
  water: [number, number][][];
}

const BLOCK = new Color(0xb9ae98);
const CHARRED = new Color(0x2c241f);
const WATER = [0.07, 0.13, 0.15] as const;
const FIRE = { rise: 0.55, wind: 0.12, life: 7, every: 0.45, fire: 0.9 };

export function atomic(config: AtomicConfig): SceneDef {
  return {
    anchor: config.anchor,
    capacity: {
      smoke: 1500,
      fire: 260,
      balls: 4,
      decals: 420,
      glow: 16,
      tracers: 4,
      units: { bomber: 3, bomb: 1 },
    },
    camera: config.camera,
    cues: [[config.burst, "rumble", 1]],
    build(kit) {
      config.terrain(kit);
      const spots: number[] = [];
      config.blocks((x, z) => spots.push(x, z));
      const count = spots.length / 2;
      const geometry = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
      const blocks = new InstancedMesh(
        geometry,
        new MeshLambertMaterial({ emissive: 0x16140f }),
        count
      );
      blocks.frustumCulled = false;
      blocks.renderOrder = 4;
      kit.add(blocks);
      const size = new Float32Array(count * 3);
      const fate = new Float32Array(count);
      const distance = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const x = spots[i * 2]!;
        const z = spots[i * 2 + 1]!;
        size[i * 3] = 0.18 + hash(i * 3.1) * 0.16;
        size[i * 3 + 1] = 0.06 + hash(i * 5.7) * 0.2;
        size[i * 3 + 2] = 0.18 + hash(i * 7.3) * 0.16;
        distance[i] = Math.hypot(x, z);
        fate[i] = config.destroyed(x, z, distance[i]!);
      }
      const matrix = new Matrix4();
      const position = new Vector3();
      const scale = new Vector3();
      const turn = new Quaternion();
      const axis = new Vector3(0, 1, 0);
      const color = new Color();
      const fires: number[] = [];
      for (let i = 0; i < count && fires.length < 32; i += 7) {
        if (fate[i]! > 0.8 && hash(i * 1.7) > 0.35)
          fires.push(spots[i * 2]!, spots[i * 2 + 1]!);
      }
      const water: number[] = [];
      for (const line of config.water) {
        for (let k = 0; k < line.length - 1; k++) {
          const [ax, az] = line[k]!;
          const [bx, bz] = line[k + 1]!;
          const steps = Math.max(
            1,
            Math.ceil(Math.hypot(bx - ax, bz - az) / 0.3)
          );
          for (let s = 0; s < steps; s++)
            water.push(
              ax + ((bx - ax) * s) / steps,
              az + ((bz - az) * s) / steps
            );
        }
      }

      const route = new Route(config.flight);
      const plane = sample();
      const escort = sample();
      const bombStart = sample();
      const along = (t: number) =>
        clamp01(((t - 1) * config.speed) / route.length);
      const gap = 2.6 / route.length;
      route.at(along(config.release), bombStart);

      return (t) => {
        const since = t - config.burst;
        const front = since > 0 ? since * 1.6 : -1;
        for (let i = 0; i < count; i++) {
          const x = spots[i * 2]!;
          const z = spots[i * 2 + 1]!;
          const hit =
            front > distance[i]! ? smooth(0, 0.6, front - distance[i]!) : 0;
          const loss = hit * fate[i]!;
          position.set(x, ground(x, z), z);
          scale.set(
            size[i * 3]!,
            size[i * 3 + 1]! * (1 - loss * 0.85) + 0.01,
            size[i * 3 + 2]!
          );
          turn.setFromAxisAngle(axis, hash(i) * 0.6 + loss * 0.4);
          matrix.compose(position, turn, scale);
          blocks.setMatrixAt(i, matrix);
          color.copy(BLOCK).lerp(CHARRED, loss);
          blocks.setColorAt(i, color);
        }
        blocks.instanceMatrix.needsUpdate = true;
        if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true;

        for (let i = 0; i < water.length; i += 2) {
          const x = water[i]!;
          const z = water[i + 1]!;
          kit.decals.disc(
            x,
            ground(x, z) + 0.02,
            z,
            0.3,
            0.9,
            WATER[0],
            WATER[1],
            WATER[2]
          );
        }

        const f = along(t);
        route.at(f, plane);
        kit.unit("bomber", plane, 1.9, FACTION.allied);
        route.at(clamp01(f - gap), escort);
        escort.x += 1.4;
        escort.y += 0.3;
        kit.unit("bomber", escort, 1.9, FACTION.allied);
        route.at(clamp01(f - gap * 1.8), escort);
        escort.x -= 1.2;
        escort.y -= 0.2;
        kit.unit("bomber", escort, 1.9, FACTION.allied);

        if (t >= config.release && t < config.burst) {
          const u = (t - config.release) / (config.burst - config.release);
          escort.x = bombStart.x * (1 - u);
          escort.z = bombStart.z * (1 - u);
          escort.y = bombStart.y - (bombStart.y - config.height) * u * u;
          escort.yaw = bombStart.yaw;
          escort.pitch = -0.3 - u * 1.1;
          escort.roll = 0;
          kit.unit("bomb", escort, 0.5, FACTION.dark);
        }

        if (since > 0 && since < 0.25) kit.flash = 0.85 * (1 - since / 0.25);
        if (since >= 0) {
          const heat = Math.max(0, 1 - since / 1.2);
          kit.glow.disc(
            0,
            ground(0, 0) + 0.1,
            0,
            3 + since * 6,
            heat,
            1,
            0.85,
            0.6
          );
          mushroom(kit, t, {
            x: 0,
            z: 0,
            burst: config.burst,
            top: config.top,
            seed: config.seed,
          });
          for (let i = 0; i < fires.length; i += 2) {
            plume(
              kit,
              t,
              config.burst + 2.5 + hash(i * 3.3) * 3,
              99,
              fires[i]!,
              fires[i + 1]!,
              0.5,
              config.seed + i,
              FIRE
            );
          }
        }
      };
    },
  };
}

export function grid(
  radius: number,
  step: number,
  keep: (x: number, z: number) => boolean
): (add: (x: number, z: number) => void) => void {
  return (add) => {
    for (let x = -radius; x <= radius; x += step) {
      for (let z = -radius; z <= radius; z += step) {
        const jx = x + (hash(x * 7.1 + z * 3.3) - 0.5) * step * 0.5;
        const jz = z + (hash(x * 1.9 + z * 5.3) - 0.5) * step * 0.5;
        const d = Math.hypot(jx, jz);
        if (d > radius || hash(jx * 3 + jz) > 0.9 - (d / radius) * 0.4)
          continue;
        if (keep(jx, jz)) add(jx, jz);
      }
    }
  };
}

export function nearLine(
  x: number,
  z: number,
  lines: [number, number][][],
  width: number
): boolean {
  for (const line of lines) {
    for (let k = 0; k < line.length - 1; k++) {
      const [ax, az] = line[k]!;
      const [bx, bz] = line[k + 1]!;
      const dx = bx - ax;
      const dz = bz - az;
      const u = clamp01(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz));
      if (Math.hypot(x - ax - dx * u, z - az - dz * u) < width) return true;
    }
  }
  return false;
}
