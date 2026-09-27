import {
  CircleGeometry,
  CatmullRomCurve3,
  DoubleSide,
  Euler,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
} from "three";
import type { LonLat } from "../../geo";
import { box, model } from "../../arsenal/parts";
import { plume } from "../fx";
import {
  clamp01,
  ground,
  hash,
  offset,
  Path,
  sample,
  smooth,
  WHITE,
  type CameraKey,
  type Kit,
  type SceneDef,
} from "../kit";
import { atomicCity, type AtomicCity } from "./atomic-city";
import { atomicCloud } from "./atomic-cloud";

interface AtomicConfig {
  city: AtomicCity;
  anchor: LonLat;
  release: number;
  burst: number;
  height: number;
  top: number;
  seed: number;
  flight: [at: number, x: number, y: number, z: number][];
  camera: CameraKey[];
  blocks: (add: (x: number, z: number) => void) => void;
  destroyed: (x: number, z: number, d: number) => number;
  terrain: (kit: Kit) => void;
  water: [number, number][][];
}

const FIRE = { rise: 0.32, wind: 0.08, life: 9, every: 0.7, fire: 0.55 };

export function atomic(config: AtomicConfig): SceneDef {
  const hiroshima = config.city === "hiroshima";
  return {
    anchor: config.anchor,
    near: 1,
    pace: 0.75,
    clip: [0.025, 260],
    bare: true,
    night: [
      [0, 0],
      [25.8, 0],
      [29, 0.14],
      [43, 0.2],
      [60, 0.16],
    ],
    capacity: {
      smoke: 1500,
      fire: 180,
      balls: 6,
      decals: 160,
      glow: 24,
      tracers: 1,
      units: { b29: 3, "little-boy": 1, "fat-man": 1 },
    },
    camera: config.camera,
    cues: [
      [6, "heavy-prop", 20],
      [config.burst + 0.7, "blast", 0.9],
      [config.burst + 2, "blast-tail", 0.85],
    ],
    build(kit) {
      kit.terrain(
        [
          [-85, -75],
          [85, -75],
          [85, 80],
          [-85, 80],
        ],
        0.015,
        [0x777c63, 0x878873, 0x6f765e],
        7
      );
      config.terrain(kit);
      const spots: number[] = [];
      config.blocks((x, z) => {
        const landmark = hiroshima ? [-0.18, -0.05] : [0.7, -0.45];
        if (Math.hypot(x - landmark[0]!, z - landmark[1]!) > 0.45)
          spots.push(x, z);
      });
      const cityTime = atomicCity(
        kit,
        config.city,
        spots,
        config.burst,
        config.destroyed
      );
      for (const line of config.water) {
        const curve = new CatmullRomCurve3(
          line.map(([x, z]) => new Vector3(x, 0, z))
        );
        const river = curve
          .getPoints(36)
          .map((p): [number, number] => [p.x, p.z]);
        kit.strip(river, hiroshima ? 0.32 : 0.22, 0x626a5d, 0.033);
        kit.strip(river, hiroshima ? 0.26 : 0.16, 0x36565a, 0.037);
        kit.strip(river, 0.018, 0x67827c, 0.038);
      }
      const cloudTime = atomicCloud(
        kit,
        config.burst,
        config.height,
        config.top,
        config.seed
      );
      const route = new Path(
        config.flight.map(([at, x, y, z]) => [x, y, z, at])
      );
      const plane = sample();
      const escort = sample();
      const falling = sample();
      const bombStart = sample();
      route.at(config.release, bombStart);
      const fires: number[] = [];
      for (let i = 0; i < spots.length && fires.length < 48; i += 14) {
        const x = spots[i]!;
        const z = spots[i + 1]!;
        if (config.destroyed(x, z, Math.hypot(x, z)) > 0.5) fires.push(x, z);
      }
      const props = new InstancedMesh(
        new CircleGeometry(1, 16),
        new MeshBasicMaterial({
          color: 0xb8bfc0,
          transparent: true,
          opacity: 0.19,
          side: DoubleSide,
          depthWrite: false,
        }),
        12
      );
      props.frustumCulled = false;
      props.renderOrder = 5;
      kit.stage.add(props);
      const blades = new InstancedMesh(
        model([
          box(0.019, 0.176, 0.009, 0x3f484b),
          box(0.176, 0.019, 0.009, 0x3f484b),
        ]),
        new MeshBasicMaterial({ vertexColors: true }),
        12
      );
      blades.frustumCulled = false;
      blades.renderOrder = 4;
      kit.stage.add(blades);
      const matrix = new Matrix4();
      const position = new Vector3();
      const planeSize = 1.7;
      const size = new Vector3(0.15, 0.15, 0.15);
      const rotation = new Quaternion();
      const spin = new Quaternion();
      const rotor = new Quaternion();
      const rotorAxis = new Vector3(0, 0, 1);
      const rotorSize = new Vector3(planeSize, planeSize, planeSize);
      const angles = new Euler(0, 0, 0, "YXZ");
      const engines = [
        [-0.455, 0.195],
        [-0.234, 0.274],
        [0.234, 0.274],
        [0.455, 0.195],
      ];
      return (t) => {
        const since = t - config.burst;
        cityTime(t);
        cloudTime(t);
        props.count = 0;
        blades.count = 0;
        if (t < 42) {
          route.at(t, plane);
          for (let i = 0; i < (hiroshima ? 3 : 2); i++) {
            Object.assign(escort, plane);
            if (i) offset(escort, i === 1 ? 5.2 : -5.4, 5 + i, i * 0.32);
            kit.unit("b29", escort, planeSize, WHITE);
            angles.set(-escort.pitch, escort.yaw, escort.roll);
            rotation.setFromEuler(angles);
            for (const [x, z] of engines) {
              position
                .set(x! * planeSize, 0, z! * planeSize)
                .applyQuaternion(rotation);
              position.x += escort.x;
              position.y += escort.y;
              position.z += escort.z;
              matrix.compose(position, rotation, size);
              props.setMatrixAt(props.count++, matrix);
              spin.setFromAxisAngle(rotorAxis, t * 85 + props.count * 1.7);
              rotor.copy(rotation).multiply(spin);
              matrix.compose(position, rotor, rotorSize);
              blades.setMatrixAt(blades.count++, matrix);
            }
          }
          props.instanceMatrix.needsUpdate = true;
          blades.instanceMatrix.needsUpdate = true;
        }
        if (t >= config.release && t < config.burst) {
          const u = (t - config.release) / (config.burst - config.release);
          falling.x = bombStart.x * (1 - u);
          falling.z = bombStart.z * (1 - u);
          falling.y =
            bombStart.y - 0.11 - (bombStart.y - 0.11 - config.height) * u * u;
          falling.yaw = bombStart.yaw;
          falling.pitch = -0.15 - smooth(0, 0.65, u) * 1.42;
          falling.roll = Math.sin(u * 8) * 0.025;
          kit.unit(
            hiroshima ? "little-boy" : "fat-man",
            falling,
            hiroshima ? 0.32 : 0.36,
            WHITE
          );
        }
        if (!hiroshima && since < 2) {
          for (let i = 0; i < 26; i++) {
            const a = i * 2.39996;
            const r = 7 + hash(i) * 10;
            kit.smoke.push(
              Math.cos(a) * r,
              4.1 + hash(i + 2) * 1.1,
              Math.sin(a) * r,
              3.5 + hash(i + 9) * 3,
              0.25 * (1 - smooth(-1, 2, since)),
              0,
              0.9,
              0.05,
              hash(i + 3)
            );
          }
        }
        if (since >= 0 && since < 0.5)
          kit.flash = 0.65 * (1 - smooth(0, 0.5, since));
        if (since >= 0) {
          const heat = 1 - smooth(0.2, 2.3, since);
          if (heat > 0) {
            kit.balls.push(
              0,
              config.height + since * 0.35,
              0,
              0.35 + smooth(0, 1.4, since) * 3.2,
              since / 3,
              config.seed,
              1.1
            );
            kit.glow.disc(0, 0.05, 0, 1 + since * 4, heat * 0.72, 1, 0.8, 0.48);
          }
          kit.shake = Math.sin(since * 21) * Math.exp(-since * 1.8) * 0.045;
          for (let i = 0; i < fires.length; i += 2) {
            plume(
              kit,
              t,
              config.burst + 2 + hash(i) * 3,
              60,
              fires[i]!,
              fires[i + 1]!,
              0.17 + hash(i + 2) * 0.13,
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
