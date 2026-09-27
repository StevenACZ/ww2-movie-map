import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  type Object3D,
  type Quaternion,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Vector3,
  type DataTexture,
  type ShaderMaterial,
} from "three";
import { toVec3, type LonLat } from "../geo";
import {
  Decals,
  EARTH_KM,
  Fireballs,
  KM,
  Puffs,
  Tracers,
  puffTexture,
  seaPatch,
} from "./effects";
import { Units, type ModelKind } from "./models";

export type CameraKey = [
  at: number,
  x: number,
  z: number,
  h: number,
  dist: number,
  yaw: number,
  pitch: number,
];

export interface Capacity {
  smoke?: number;
  fire?: number;
  balls?: number;
  decals?: number;
  glow?: number;
  tracers?: number;
  units: Partial<Record<ModelKind, number>>;
}

export function hash(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function smooth(a: number, b: number, v: number): number {
  const u = clamp01((v - a) / (b - a));
  return u * u * (3 - 2 * u);
}

export function easeOut(u: number): number {
  const v = clamp01(u);
  return 1 - (1 - v) * (1 - v) * (1 - v);
}

export function ground(x: number, z: number): number {
  return -(x * x + z * z) / (2 * EARTH_KM);
}

export interface Sample {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
}

export function sample(): Sample {
  return { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0 };
}

export class Route {
  private readonly pts: number[];
  private readonly cum: number[] = [0];
  readonly length: number;

  constructor(points: [number, number, number][]) {
    this.pts = points.flat();
    let sum = 0;
    for (let i = 1; i < points.length; i++) {
      const [ax, ay, az] = points[i - 1]!;
      const [bx, by, bz] = points[i]!;
      sum += Math.hypot(bx - ax, by - ay, bz - az);
      this.cum.push(sum);
    }
    this.length = sum;
  }

  private axis(i: number, k: number, u: number): number {
    const n = this.pts.length / 3;
    const p0 = this.pts[Math.max(0, i - 1) * 3 + k]!;
    const p1 = this.pts[i * 3 + k]!;
    const p2 = this.pts[Math.min(n - 1, i + 1) * 3 + k]!;
    const p3 = this.pts[Math.min(n - 1, i + 2) * 3 + k]!;
    const u2 = u * u;
    const u3 = u2 * u;
    return (
      0.5 *
      (2 * p1 +
        (-p0 + p2) * u +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * u3)
    );
  }

  private point(f: number, out: Sample) {
    const d = clamp01(f) * this.length;
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i]! < d) i++;
    const seg = this.cum[i]! - this.cum[i - 1]!;
    const u = seg > 0 ? (d - this.cum[i - 1]!) / seg : 0;
    out.x = this.axis(i - 1, 0, u);
    out.y = this.axis(i - 1, 1, u);
    out.z = this.axis(i - 1, 2, u);
  }

  at(f: number, out: Sample): Sample {
    const e = 0.004;
    const a = clamp01(f - e);
    const b = clamp01(f + e);
    this.point(b, out);
    const bx = out.x;
    const by = out.y;
    const bz = out.z;
    this.point(a, out);
    const dx = bx - out.x;
    const dy = by - out.y;
    const dz = bz - out.z;
    const yawA = Math.atan2(dx, dz);
    this.point(clamp01(f + 3 * e), out);
    const yawB = Math.atan2(out.x - bx, out.z - bz);
    let turn = yawB - yawA;
    if (turn > Math.PI) turn -= Math.PI * 2;
    if (turn < -Math.PI) turn += Math.PI * 2;
    this.point(f, out);
    out.yaw = Math.atan2(dx, dz);
    out.pitch = Math.atan2(dy, Math.hypot(dx, dz));
    out.roll = Math.max(-1.1, Math.min(1.1, -turn * 18));
    return out;
  }
}

export class Path {
  private readonly pts: number[];

  constructor(points: [number, number, number, number][]) {
    this.pts = points.flat();
  }

  private axis(i: number, k: number, u: number): number {
    const n = this.pts.length / 4;
    const p0 = this.pts[Math.max(0, i - 1) * 4 + k]!;
    const p1 = this.pts[i * 4 + k]!;
    const p2 = this.pts[Math.min(n - 1, i + 1) * 4 + k]!;
    const p3 = this.pts[Math.min(n - 1, i + 2) * 4 + k]!;
    const u2 = u * u;
    const u3 = u2 * u;
    return (
      0.5 *
      (2 * p1 +
        (-p0 + p2) * u +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * u3)
    );
  }

  private point(t: number, out: Sample) {
    const pts = this.pts;
    const n = pts.length / 4;
    if (t <= pts[3]!) {
      out.x = pts[0]!;
      out.y = pts[1]!;
      out.z = pts[2]!;
      return;
    }
    let i = 0;
    while (i < n - 2 && pts[(i + 1) * 4 + 3]! <= t) i++;
    const span = pts[(i + 1) * 4 + 3]! - pts[i * 4 + 3]!;
    const u = clamp01(span > 0 ? (t - pts[i * 4 + 3]!) / span : 1);
    out.x = this.axis(i, 0, u);
    out.y = this.axis(i, 1, u);
    out.z = this.axis(i, 2, u);
  }

  get start(): number {
    return this.pts[3]!;
  }

  get finish(): number {
    return this.pts[this.pts.length - 1]!;
  }

  at(t: number, out: Sample): Sample {
    const e = 0.05;
    const tt = Math.max(this.start + e, Math.min(this.finish - e, t));
    this.point(tt + e, out);
    const bx = out.x;
    const by = out.y;
    const bz = out.z;
    this.point(tt - e, out);
    const dx = bx - out.x;
    const dy = by - out.y;
    const dz = bz - out.z;
    this.point(tt + 3 * e, out);
    const yawA = Math.atan2(dx, dz);
    let turn = Math.atan2(out.x - bx, out.z - bz) - yawA;
    if (turn > Math.PI) turn -= Math.PI * 2;
    if (turn < -Math.PI) turn += Math.PI * 2;
    this.point(t, out);
    out.yaw = yawA;
    out.pitch = Math.atan2(dy, Math.hypot(dx, dz));
    out.roll = Math.max(-1.1, Math.min(1.1, -turn * 6));
    return out;
  }
}

export function offset(s: Sample, right: number, back: number, up: number) {
  const c = Math.cos(s.yaw);
  const n = Math.sin(s.yaw);
  s.x += c * right * -1 - n * back;
  s.z += n * right - c * back;
  s.y += up;
  return s;
}

const cameraEye = new Vector3();
const cameraTarget = new Vector3();
const cameraUp = new Vector3();
const lookMatrix = new Matrix4();

function hermite(keys: CameraKey[], index: number, t: number): number {
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1]![0] <= t) i++;
  const a = keys[i]!;
  const b = keys[Math.min(i + 1, keys.length - 1)]!;
  if (a === b || t <= a[0]) return a[index]!;
  if (t >= b[0] && i + 1 >= keys.length - 1) return b[index]!;
  const span = b[0] - a[0];
  const u = clamp01((t - a[0]) / span);
  const prev = keys[i - 1];
  const next = keys[i + 2];
  const m0 = prev ? ((b[index]! - prev[index]!) / (b[0] - prev[0])) * span : 0;
  const m1 = next ? ((next[index]! - a[index]!) / (next[0] - a[0])) * span : 0;
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * a[index]! +
    (u3 - 2 * u2 + u) * m0 +
    (-2 * u3 + 3 * u2) * b[index]! +
    (u3 - u2) * m1
  );
}

export interface Pose {
  position: Vector3;
  quaternion: Quaternion;
  target: Vector3;
}

export class Kit {
  readonly root = new Group();
  readonly stage = new Group();
  readonly smoke: Puffs;
  readonly fire: Puffs;
  readonly balls: Fireballs;
  readonly decals: Decals;
  readonly glow: Decals;
  readonly tracers: Tracers;
  readonly units: Units;
  readonly anchor: LonLat;
  readonly up = new Vector3();
  flash = 0;
  shake = 0;
  private readonly texture: DataTexture;
  private readonly lat0: number;
  private readonly timed: ShaderMaterial[] = [];
  private readonly hills: number[] = [];

  constructor(
    anchor: LonLat,
    readonly scale: number,
    capacity: Capacity
  ) {
    this.anchor = anchor;
    this.lat0 = anchor[1];
    const center = toVec3(anchor[0], anchor[1], 1);
    const up = center.clone().normalize();
    const east = new Vector3(0, 1, 0).cross(up).normalize();
    if (east.lengthSq() < 1e-6) east.set(1, 0, 0);
    const south = east.clone().cross(up).normalize();
    this.root.matrixAutoUpdate = false;
    this.root.matrix
      .makeBasis(east, up, south)
      .scale(new Vector3(KM, KM, KM))
      .setPosition(center);
    this.root.matrixWorldNeedsUpdate = true;
    this.up.copy(up);

    this.texture = puffTexture();
    this.smoke = new Puffs(capacity.smoke ?? 1200, this.texture, false, 6);
    this.fire = new Puffs(capacity.fire ?? 300, this.texture, true, 7);
    this.balls = new Fireballs(capacity.balls ?? 24);
    this.decals = new Decals(capacity.decals ?? 400, false, 3);
    this.glow = new Decals(capacity.glow ?? 120, true, 5);
    this.tracers = new Tracers(capacity.tracers ?? 160);
    this.units = new Units(capacity.units);
    this.root.add(
      this.stage,
      this.units.group,
      this.decals.mesh,
      this.glow.mesh,
      this.smoke.mesh,
      this.fire.mesh,
      this.balls.mesh,
      this.tracers.mesh
    );
  }

  geo(lon: number, lat: number): [number, number] {
    const x =
      (lon - this.anchor[0]) *
      111.32 *
      Math.cos((this.lat0 * Math.PI) / 180) *
      this.scale;
    const z = -(lat - this.anchor[1]) * 110.57 * this.scale;
    return [x, z];
  }

  add(object: Object3D) {
    this.root.add(object);
    return object;
  }

  sea(radius: number, x = 0, z = 0, level?: number) {
    const mesh = seaPatch(radius, x, z, level);
    mesh.position.set(x, 0, z);
    this.timed.push(mesh.material);
    this.stage.add(mesh);
    return mesh;
  }

  strip(points: [number, number][], width: number, color: number, y: number) {
    const positions: number[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, az] = points[i]!;
      const [bx, bz] = points[i + 1]!;
      const len = Math.hypot(bx - ax, bz - az) || 1;
      const nx = (-(bz - az) / len) * (width / 2);
      const nz = ((bx - ax) / len) * (width / 2);
      const quad = [
        [ax - nx, az - nz],
        [ax + nx, az + nz],
        [bx + nx, bz + nz],
        [bx - nx, bz - nz],
      ].map(([qx, qz]) => [qx!, y + ground(qx!, qz!), qz!]);
      for (const k of [0, 1, 2, 0, 2, 3]) positions.push(...quad[k]!);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(positions), 3)
    );
    geometry.computeVertexNormals();
    const mesh = new Mesh(
      geometry,
      new MeshLambertMaterial({ color, emissive: 0x14130e, side: DoubleSide })
    );
    mesh.renderOrder = 3;
    this.stage.add(mesh);
    return mesh;
  }

  terrain(
    points: [number, number][],
    height: number,
    palette: number[],
    maxEdge = 1.5
  ) {
    const shape = new Shape();
    points.forEach(([x, z], i) =>
      i ? shape.lineTo(x, z) : shape.moveTo(x, z)
    );
    const flat = new ShapeGeometry(shape);
    const source = flat.getAttribute("position");
    const index = flat.index!;
    const out: number[] = [];
    const split = (tri: number[], depth: number) => {
      const [ax, az, bx, bz, cx, cz] = tri as [
        number,
        number,
        number,
        number,
        number,
        number,
      ];
      const edge = Math.max(
        Math.hypot(bx - ax, bz - az),
        Math.hypot(cx - bx, cz - bz),
        Math.hypot(ax - cx, az - cz)
      );
      if (edge <= maxEdge || depth > 9) {
        out.push(...tri);
        return;
      }
      const abx = (ax + bx) / 2;
      const abz = (az + bz) / 2;
      const bcx = (bx + cx) / 2;
      const bcz = (bz + cz) / 2;
      const cax = (cx + ax) / 2;
      const caz = (cz + az) / 2;
      split([ax, az, abx, abz, cax, caz], depth + 1);
      split([abx, abz, bx, bz, bcx, bcz], depth + 1);
      split([cax, caz, bcx, bcz, cx, cz], depth + 1);
      split([abx, abz, bcx, bcz, cax, caz], depth + 1);
    };
    for (let i = 0; i < index.count; i += 3) {
      const tri: number[] = [];
      for (let k = 0; k < 3; k++) {
        const v = index.getX(i + k);
        tri.push(source.getX(v), source.getY(v));
      }
      split(tri, 0);
    }
    flat.dispose();
    const colors = palette.map((hex) => new Color(hex));
    const mixed = new Color();
    const count = out.length / 2;
    const positions = new Float32Array(count * 3);
    const tints = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = out[i * 2]!;
      const z = out[i * 2 + 1]!;
      positions[i * 3] = x;
      positions[i * 3 + 1] = height + ground(x, z);
      positions[i * 3 + 2] = z;
      const n = clamp01(
        0.5 +
          0.28 * Math.sin(x * 0.31 + Math.sin(z * 0.19) * 2.4) +
          0.22 * Math.sin(z * 0.37 + x * 0.11) +
          (hash(Math.round(x * 3) * 7.1 + Math.round(z * 3) * 3.3) - 0.5) * 0.35
      );
      const f = n * (colors.length - 1);
      const k = Math.min(colors.length - 2, Math.floor(f));
      mixed.copy(colors[k]!).lerp(colors[k + 1]!, f - k);
      mixed.toArray(tints, i * 3);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(tints, 3));
    geometry.computeVertexNormals();
    const mesh = new Mesh(
      geometry,
      new MeshLambertMaterial({
        vertexColors: true,
        emissive: 0x14130e,
        side: DoubleSide,
      })
    );
    mesh.renderOrder = 2;
    this.stage.add(mesh);
    return mesh;
  }

  land(points: [number, number][], height: number, color: number) {
    const shape = new Shape();
    points.forEach(([x, z], i) =>
      i ? shape.lineTo(x, -z) : shape.moveTo(x, -z)
    );
    const geometry = new ExtrudeGeometry(shape, {
      depth: height + 1,
      bevelEnabled: false,
      curveSegments: 1,
    });
    geometry.rotateX(-Math.PI / 2);
    const position = geometry.getAttribute("position");
    for (let i = 0; i < position.count; i++) {
      position.setY(
        i,
        position.getY(i) - 1 + ground(position.getX(i), position.getZ(i))
      );
    }
    geometry.computeVertexNormals();
    const mesh = new Mesh(
      geometry,
      new MeshLambertMaterial({ color, emissive: 0x14130e })
    );
    mesh.renderOrder = 2;
    return this.add(mesh);
  }

  hill(
    x: number,
    z: number,
    rx: number,
    rz: number,
    height: number,
    color: number,
    yaw = 0
  ) {
    const mesh = new Mesh(
      new SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      new MeshLambertMaterial({ color, emissive: 0x14130e })
    );
    mesh.scale.set(rx, height, rz);
    mesh.rotation.y = yaw;
    mesh.position.set(x, ground(x, z) - 0.05, z);
    mesh.renderOrder = 2;
    this.hills.push(x, z, rx, rz, height, yaw);
    return this.add(mesh);
  }

  surface(x: number, z: number): number {
    let top = 0;
    const hills = this.hills;
    for (let i = 0; i < hills.length; i += 6) {
      const dx = x - hills[i]!;
      const dz = z - hills[i + 1]!;
      const c = Math.cos(hills[i + 5]!);
      const s = Math.sin(hills[i + 5]!);
      const lx = (dx * c - dz * s) / hills[i + 2]!;
      const lz = (dx * s + dz * c) / hills[i + 3]!;
      const q = 1 - lx * lx - lz * lz;
      if (q > 0) top = Math.max(top, hills[i + 4]! * Math.sqrt(q) - 0.05);
    }
    return ground(x, z) + top;
  }

  begin(time: number) {
    this.flash = 0;
    this.shake = 0;
    this.smoke.begin();
    this.fire.begin();
    this.balls.begin(time);
    this.decals.begin();
    this.glow.begin();
    this.tracers.begin();
    this.units.begin();
    for (const material of this.timed) material.uniforms.uTime!.value = time;
  }

  end() {
    this.smoke.end();
    this.fire.end();
    this.balls.end();
    this.decals.end();
    this.glow.end();
    this.tracers.end();
    this.units.end();
  }

  get live() {
    return this.smoke.live + this.fire.live + this.decals.live + this.glow.live;
  }

  unit(kind: ModelKind, s: Sample, length: number, color: Color, sink = 0) {
    this.units.put(
      kind,
      s.x,
      s.y,
      s.z,
      s.yaw,
      length,
      color,
      s.pitch,
      s.roll,
      sink
    );
  }

  pose(keys: CameraKey[], t: number, out: Pose, near = 4) {
    const x = hermite(keys, 1, t);
    const z = hermite(keys, 2, t);
    const h = hermite(keys, 3, t);
    const dist = Math.max(near, hermite(keys, 4, t));
    const yaw =
      ((hermite(keys, 5, t) + Math.sin(t * 0.37) * 0.6) * Math.PI) / 180;
    const pitch =
      (Math.max(
        4,
        Math.min(84, hermite(keys, 6, t) + Math.sin(t * 0.29 + 1) * 0.5)
      ) *
        Math.PI) /
      180;
    const cp = Math.cos(pitch);
    const jitter = this.shake;
    const shakeX = (Math.sin(t * 47) + Math.sin(t * 83 + 2) * 0.5) * 0.67;
    const shakeY = (Math.sin(t * 61 + 1) + Math.sin(t * 97 + 4) * 0.5) * 0.67;
    cameraTarget.set(x, ground(x, z) + h, z);
    cameraEye.set(
      x + Math.sin(yaw) * cp * dist + shakeX * jitter,
      cameraTarget.y + Math.sin(pitch) * dist + shakeY * jitter,
      z + Math.cos(yaw) * cp * dist
    );
    cameraTarget.applyMatrix4(this.root.matrix);
    cameraEye.applyMatrix4(this.root.matrix);
    cameraUp.copy(this.up);
    lookMatrix.lookAt(cameraEye, cameraTarget, cameraUp);
    out.position.copy(cameraEye);
    out.quaternion.setFromRotationMatrix(lookMatrix);
    out.target.copy(cameraTarget);
  }

  dispose() {
    this.root.removeFromParent();
    this.root.traverse((object) => {
      if (object instanceof Mesh && object.parent !== this.units.group) {
        if (object instanceof InstancedMesh) object.dispose();
        object.geometry.dispose();
        const material = object.material as
          ShaderMaterial | MeshLambertMaterial;
        material.dispose();
      }
    });
    this.tracers.mesh.geometry.dispose();
    this.tracers.mesh.material.dispose();
    this.units.dispose();
    this.texture.dispose();
  }
}

export const WHITE = new Color(1, 1, 1);

export type Cue = [
  at: number,
  kind: "boom" | "far" | "drone" | "rumble",
  level: number,
];

export interface Label {
  at: [number, number];
  text: string | { en: string; es: string };
  flags?: string[];
  lift?: number;
  from: number;
  to: number;
}

export interface SceneDef {
  anchor: LonLat;
  scale?: number;
  near?: number;
  pace?: number;
  clip?: [near: number, far: number];
  bare?: boolean;
  labels?: Label[];
  night?: [at: number, value: number][];
  capacity: Capacity;
  camera: CameraKey[];
  cues: Cue[];
  build(kit: Kit): (t: number) => void;
}
