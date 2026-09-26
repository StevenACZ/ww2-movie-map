import {
  BufferGeometry,
  Color,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Material,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import type { WorldData } from "~~/types/view";
import { ArcPath, slerp, type LonLat } from "./geo";
import {
  buildDisc,
  buildModel,
  buildWake,
  markMaterial,
  militaryColor,
  unitMaterial,
  type ModelKind,
} from "./models";
import { FACTION_COLORS } from "./palette";

type Operation = WorldData["operations"][number] & { weight?: number };
type UnitKind = Operation["unit"];

export interface UnitHighlight {
  id: string;
  lonLat: LonLat;
  name: [string, string];
  faction: string;
}

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const FADE = 0.6;
const LINGER = 2.5;
const FOLLOW_MIN = 2.5 * DEG;
const FOLLOW_MAX = 14 * DEG;
const JUMP = 16 * DEG;
const VIEW_LIMIT = 70 * DEG;
const LOOP_MIN = 25;
const BANK = 0.42;
const LAND_R = 1.0018;
const SEA_R = 1.0012;
const MARK_R = 1.0015;
const MODEL_KINDS: ModelKind[] = [
  "tank",
  "turret",
  "infantry",
  "ship",
  "carrier",
  "submarine",
  "fighter",
  "bomber",
];
const SLOT = Object.fromEntries(MODEL_KINDS.map((k, i) => [k, i])) as Record<
  ModelKind,
  number
>;
const SHADOW = MODEL_KINDS.length;
const WAKE = SHADOW + 1;
const CAPACITY = 160;
const MARK_CAPACITY = 360;

const SIZE: Record<UnitKind, number> = {
  tank: 0.022,
  infantry: 0.018,
  ship: 0.032,
  carrier: 0.036,
  submarine: 0.028,
  fighter: 0.022,
  bomber: 0.03,
};

const LOOP_SPEED: Record<UnitKind, number> = {
  tank: 0.8 * DEG,
  infantry: 0.6 * DEG,
  ship: 1.2 * DEG,
  carrier: 1.2 * DEG,
  submarine: 1 * DEG,
  fighter: 3 * DEG,
  bomber: 2.5 * DEG,
};

interface Track {
  op: Operation;
  path: ArcPath;
  kind: UnitKind;
  air: boolean;
  sea: boolean;
  closed: boolean;
  seed: number;
  importance: number;
  loopPeriod: number;
  maxForm: number;
  color: Color;
  anchor: Vector3;
  heading: Vector3;
  target: Vector3;
  targetTan: Vector3;
  headings: Vector3[];
  slots: Float32Array;
  want: number;
  presence: number;
  alive: boolean;
  inRange: boolean;
  placed: boolean;
  jumping: boolean;
  bornAt: number;
  moving: number;
  loopPhase: number;
  orbitPeriod: number;
  score: number;
  sortieAt: number;
  sortieStart: number;
  sortieLength: number;
  sortieSlot: number;
  sortieTarget: Vector3;
}

function smoothstep(a: number, b: number, x: number): number {
  const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
}

function approach(value: number, target: number, step: number): number {
  return value < target
    ? Math.min(target, value + step)
    : Math.max(target, value - step);
}

function hash(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export class UnitLayer {
  readonly group = new Group();
  private readonly tracks: Track[];
  private readonly meshes: InstancedMesh[] = [];
  private readonly counts: number[] = [];
  private readonly materials: Material[] = [];
  private readonly budget: number;
  private readonly order: Track[] = [];
  private orderCount = 0;
  private readonly active: Operation[] = [];
  private readonly picked: UnitHighlight[] = [];
  private readonly highlightPool: UnitHighlight[];
  private visible = 0;
  private last = 0;
  private clock = 0;
  private zoom = 1;
  private still = false;
  private readonly eyeDir = new Vector3(0, 0, 1);
  private readonly lightDir = new Vector3(0.45, -0.7, 0.55).normalize();
  private readonly m = new Matrix4();
  private readonly basis = new Matrix4();
  private readonly q = new Quaternion();
  private readonly qTurn = new Quaternion();
  private readonly scale = new Vector3();
  private readonly axisX = new Vector3(1, 0, 0);
  private readonly axisY = new Vector3(0, 1, 0);
  private readonly up = new Vector3();
  private readonly fwd = new Vector3();
  private readonly side = new Vector3();
  private readonly center = new Vector3();
  private readonly pos = new Vector3();
  private readonly pos2 = new Vector3();
  private readonly lead = new Vector3();
  private readonly leadFwd = new Vector3();
  private readonly dir = new Vector3();
  private readonly tmp = new Vector3();
  private readonly tmp2 = new Vector3();
  private readonly tmp3 = new Vector3();

  constructor(
    operations: WorldData["operations"],
    options: { mobile?: boolean } = {}
  ) {
    this.budget = options.mobile ? 40 : 70;
    this.tracks = (operations as Operation[]).map((op, i) => {
      const path = new ArcPath(op.path);
      const first = op.path[0]!;
      const last = op.path[op.path.length - 1]!;
      const closed =
        Math.abs(first[0] - last[0]) < 0.01 &&
        Math.abs(first[1] - last[1]) < 0.01;
      const air = op.unit === "fighter" || op.unit === "bomber";
      const sea =
        op.unit === "ship" || op.unit === "carrier" || op.unit === "submarine";
      const months = Math.max(0, op.end - op.start);
      const travel = (closed ? 1 : 2) * (path.total / LOOP_SPEED[op.unit]);
      const maxForm =
        sea && op.unit !== "carrier"
          ? op.count
          : Math.max(1, Math.ceil(op.count / 2));
      return {
        op,
        path,
        kind: op.unit,
        air,
        sea,
        closed,
        seed: hash(i + 1),
        importance:
          (op.weight ?? 1) *
          (0.7 + 0.1 * op.count) *
          (1 + 0.25 * Math.log2(1 + months)),
        loopPeriod: Math.max(LOOP_MIN, travel),
        maxForm,
        color: militaryColor(
          FACTION_COLORS[op.faction] ?? FACTION_COLORS.neutral!
        ),
        anchor: new Vector3(),
        heading: new Vector3(),
        target: new Vector3(),
        targetTan: new Vector3(),
        headings: Array.from({ length: maxForm }, () => new Vector3()),
        slots: new Float32Array(maxForm),
        want: 0,
        presence: 0,
        alive: false,
        inRange: false,
        placed: false,
        jumping: false,
        bornAt: 0,
        moving: 0,
        loopPhase: hash(i + 7),
        orbitPeriod: 14 + 10 * hash(i + 3),
        score: 0,
        sortieAt: 6 + 12 * hash(i + 5),
        sortieStart: -1,
        sortieLength: 8,
        sortieSlot: 0,
        sortieTarget: new Vector3(),
      };
    });

    const solid = unitMaterial();
    this.materials.push(solid);
    for (const kind of MODEL_KINDS)
      this.instanced(buildModel(kind), solid, CAPACITY, true).renderOrder = 5;
    const shade = markMaterial(0x0b0a07, 0.42);
    const foam = markMaterial(0xe8e4d6, 0.4);
    this.materials.push(shade, foam);
    this.instanced(buildDisc(), shade, MARK_CAPACITY, false).renderOrder = 4;
    this.instanced(buildWake(), foam, CAPACITY, false).renderOrder = 4;
    this.highlightPool = Array.from({ length: 3 }, () => ({
      id: "",
      lonLat: [0, 0] as LonLat,
      name: ["", ""] as [string, string],
      faction: "",
    }));
  }

  private instanced(
    geometry: BufferGeometry,
    material: Material,
    capacity: number,
    colored: boolean
  ): InstancedMesh {
    geometry.setAttribute(
      "aOpacity",
      new InstancedBufferAttribute(new Float32Array(capacity), 1)
    );
    const mesh = new InstancedMesh(geometry, material, capacity);
    if (colored)
      mesh.instanceColor = new InstancedBufferAttribute(
        new Float32Array(capacity * 3),
        3
      );
    mesh.count = 0;
    mesh.frustumCulled = false;
    this.meshes.push(mesh);
    this.counts.push(0);
    this.group.add(mesh);
    return mesh;
  }

  get activeCount(): number {
    return this.visible;
  }

  get activeOperations(): Operation[] {
    return this.active;
  }

  highlights(): UnitHighlight[] {
    this.picked.length = 0;
    for (let i = 0; i < this.orderCount && this.picked.length < 3; i++) {
      const track = this.order[i]!;
      if (!track.inRange || track.want === 0 || track.presence < 0.5) continue;
      const item = this.highlightPool[this.picked.length]!;
      const a = track.anchor;
      item.id = track.op.id;
      item.name = track.op.name;
      item.faction = track.op.faction;
      item.lonLat[1] = 90 - Math.acos(Math.max(-1, Math.min(1, a.y))) / DEG;
      let lon = Math.atan2(a.z, -a.x) / DEG - 180;
      if (lon < -180) lon += 360;
      item.lonLat[0] = lon;
      this.picked.push(item);
    }
    return this.picked;
  }

  update(t: number, time: number, zoom: number, still: boolean, eye?: Vector3) {
    const dt = this.last ? Math.max(0, Math.min(0.1, time - this.last)) : 0;
    this.last = time;
    this.clock = still ? 0 : time;
    this.zoom = zoom;
    this.still = still;
    const distance = eye ? Math.max(1.01, eye.length()) : 3;
    if (eye) this.eyeDir.copy(eye).normalize();
    const horizon = 1 / distance;
    const viewCos = Math.cos(
      Math.min(VIEW_LIMIT, Math.acos(horizon) + 6 * DEG)
    );

    this.active.length = 0;
    this.orderCount = 0;
    for (const track of this.tracks) {
      const op = track.op;
      const inRange = t >= op.start && t <= op.end;
      track.inRange = inRange;
      if (inRange) this.active.push(op);
      if (inRange && !track.alive) {
        track.alive = true;
        track.bornAt = time;
      } else if (!inRange && track.alive && time - track.bornAt >= LINGER) {
        track.alive = false;
      }
      if (!track.alive && track.presence <= 0) continue;
      this.advance(track, t, dt);
      if (!track.placed) continue;
      const facing = track.anchor.dot(this.eyeDir);
      if (!track.alive || facing < viewCos) {
        track.score = 0;
      } else {
        const proximity = 0.35 + (0.65 * (facing - viewCos)) / (1 - viewCos);
        const recency = time - track.bornAt < 3 ? 1.4 : 1;
        track.score =
          track.importance * proximity * recency * (inRange ? 1 : 0.4);
      }
      this.insert(track);
    }

    this.allocate(zoom);

    this.counts.fill(0);
    this.visible = 0;
    for (let i = 0; i < this.orderCount; i++) {
      const track = this.order[i]!;
      let shown = false;
      for (let j = 0; j < track.maxForm; j++) {
        const target = j < track.want ? 1 : 0;
        track.slots[j] = approach(track.slots[j]!, target, dt / FADE);
        const alpha = track.slots[j]! * track.presence;
        if (alpha <= 0.001) continue;
        shown = true;
        this.formation(track, j, alpha, horizon);
      }
      if (shown) this.visible++;
    }

    for (let i = 0; i < this.meshes.length; i++) {
      const mesh = this.meshes[i]!;
      mesh.count = this.counts[i]!;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.geometry.getAttribute("aOpacity").needsUpdate = true;
    }
  }

  private insert(track: Track) {
    let i = this.orderCount++;
    while (i > 0 && this.order[i - 1]!.score < track.score) {
      this.order[i] = this.order[i - 1]!;
      i--;
    }
    this.order[i] = track;
  }

  private perFormation(kind: UnitKind, tier: number): number {
    switch (kind) {
      case "infantry":
        return 3 + tier;
      case "tank":
        return tier === 0 ? 2 : 3;
      case "fighter":
        return 2;
      case "bomber":
        return 3;
      case "carrier":
        return 1 + tier;
      default:
        return 1;
    }
  }

  private allocate(zoom: number) {
    const tier = zoom >= 0.85 ? 0 : zoom >= 0.45 ? 1 : 2;
    let used = 0;
    for (let i = 0; i < this.orderCount; i++) {
      const track = this.order[i]!;
      const per = this.perFormation(track.kind, tier);
      track.want = 0;
      if (track.score > 0 && used + per <= this.budget) {
        track.want = 1;
        used += per;
      }
    }
    for (let i = 0; i < this.orderCount; i++) {
      const track = this.order[i]!;
      if (track.want === 0) continue;
      const per = this.perFormation(track.kind, tier);
      const desired =
        tier === 0
          ? 1
          : tier === 1
            ? Math.min(track.maxForm, zoom < 0.65 ? 3 : 2)
            : track.maxForm;
      while (track.want < desired && used + per <= this.budget) {
        track.want++;
        used += per;
      }
    }
  }

  private advance(track: Track, t: number, dt: number) {
    const op = track.op;
    const target = track.alive && !track.jumping ? 1 : 0;
    if (op.loop) {
      if (!this.still)
        track.loopPhase = (track.loopPhase + dt / track.loopPeriod) % 1;
      this.loopPoint(track, track.loopPhase, track.anchor, track.targetTan);
      if (!track.placed) {
        track.slots.fill(0);
        track.heading.copy(track.targetTan);
        for (let j = 0; j < track.maxForm; j++)
          this.loopPoint(
            track,
            track.loopPhase + j / track.maxForm,
            this.tmp,
            track.headings[j]!
          );
        track.placed = true;
      }
      track.moving = 1;
    } else {
      const span = op.end - op.start;
      const fraction =
        span > 0 ? Math.max(0, Math.min(1, (t - op.start) / span)) : 1;
      track.path.at(fraction, track.target, track.targetTan);
      if (!track.placed) {
        track.slots.fill(0);
        track.anchor.copy(track.target);
        track.heading.copy(track.targetTan);
        track.jumping = false;
        track.moving = 0;
        track.placed = true;
      } else {
        const gap = track.anchor.angleTo(track.target);
        let moved = 0;
        if (this.still) {
          track.anchor.copy(track.target);
        } else if (track.jumping || gap > JUMP) {
          track.jumping = true;
          if (track.presence <= 0.02) {
            track.anchor.copy(track.target);
            track.heading.copy(track.targetTan);
            track.jumping = false;
          }
        } else if (gap > 1e-7) {
          const rate = Math.min(FOLLOW_MAX, Math.max(FOLLOW_MIN, gap * 1.2));
          const step = Math.min(1, (rate * dt) / gap);
          slerp(track.anchor, track.target, step, track.anchor).normalize();
          moved = gap * step;
        }
        const speed = dt > 0 ? moved / dt : 0;
        track.moving = approach(
          track.moving,
          speed > 0.15 * DEG ? 1 : 0,
          dt * 1.5
        );
      }
      this.steer(track.heading, track.targetTan, track.anchor, dt * 2.5);
    }
    track.presence = approach(track.presence, target, dt / FADE);
    if (track.presence <= 0 && !track.alive) track.placed = false;
  }

  private loopPoint(track: Track, phase: number, out: Vector3, tan: Vector3) {
    const u = phase - Math.floor(phase);
    const f = track.closed ? u : u < 0.5 ? 2 * u : 2 - 2 * u;
    track.path.at(f, out, tan);
    if (!track.closed && u >= 0.5) tan.negate();
  }

  private steer(h: Vector3, desired: Vector3, normal: Vector3, k: number) {
    if (desired.lengthSq() > 1e-8) {
      if (h.dot(desired) < -0.9) this.tmp3.crossVectors(normal, h);
      else this.tmp3.copy(desired);
      h.lerp(this.tmp3, Math.min(1, this.still ? 1 : k));
    }
    h.addScaledVector(normal, -h.dot(normal));
    if (h.lengthSq() < 1e-8) {
      h.set(0, 1, 0).addScaledVector(normal, -normal.y);
      if (h.lengthSq() < 1e-8)
        h.set(1, 0, 0).addScaledVector(normal, -normal.x);
    }
    h.normalize();
  }

  private offset(
    base: Vector3,
    heading: Vector3,
    forward: number,
    lateral: number,
    out: Vector3
  ): Vector3 {
    this.tmp2.crossVectors(heading, base);
    return out
      .copy(base)
      .addScaledVector(heading, forward)
      .addScaledVector(this.tmp2, lateral)
      .normalize();
  }

  private formation(track: Track, j: number, alpha: number, horizon: number) {
    const size = SIZE[track.kind] * this.zoom;
    let base = track.anchor;
    let heading = track.heading;
    if (track.op.loop) {
      const h = track.headings[j]!;
      this.loopPoint(
        track,
        track.loopPhase + j / track.maxForm,
        this.center,
        this.dir
      );
      this.steer(h, this.dir, this.center, 0.12);
      base = this.center;
      heading = h;
    } else if (!track.air && j > 0) {
      const rank = Math.ceil(j / 2);
      const sign = j % 2 ? 1 : -1;
      const spacing = size * (track.sea ? 2.6 : 3.4);
      this.offset(
        track.anchor,
        track.heading,
        -0.6 * rank * spacing,
        sign * rank * spacing,
        this.center
      );
      base = this.center;
    }
    switch (track.kind) {
      case "infantry":
        this.infantry(track, j, base, heading, size, alpha, horizon);
        break;
      case "tank":
        this.tanks(track, j, base, heading, size, alpha, horizon);
        break;
      case "fighter":
      case "bomber":
        this.planes(track, j, base, heading, size, alpha, horizon);
        break;
      default:
        this.ships(track, j, base, heading, size, alpha, horizon);
    }
  }

  private fadeAt(p: Vector3, horizon: number): number {
    return smoothstep(horizon, horizon + 0.14, p.dot(this.eyeDir));
  }

  private put(
    index: number,
    p: Vector3,
    radius: number,
    forward: Vector3,
    sx: number,
    sy: number,
    sz: number,
    opacity: number,
    color: Color | null,
    roll = 0,
    yaw = 0
  ) {
    const mesh = this.meshes[index]!;
    const n = this.counts[index]!;
    if (n >= mesh.instanceMatrix.count || opacity <= 0.002) return;
    this.up.copy(p).normalize();
    this.fwd
      .copy(forward)
      .addScaledVector(this.up, -forward.dot(this.up))
      .normalize();
    this.side.crossVectors(this.fwd, this.up);
    this.basis.makeBasis(this.fwd, this.up, this.side);
    this.q.setFromRotationMatrix(this.basis);
    if (roll) this.q.multiply(this.qTurn.setFromAxisAngle(this.axisX, roll));
    if (yaw) this.q.multiply(this.qTurn.setFromAxisAngle(this.axisY, yaw));
    this.pos2.copy(this.up).multiplyScalar(radius);
    this.scale.set(sx, sy, sz);
    this.m.compose(this.pos2, this.q, this.scale);
    mesh.setMatrixAt(n, this.m);
    if (color) mesh.setColorAt(n, color);
    (mesh.geometry.getAttribute("aOpacity") as InstancedBufferAttribute).setX(
      n,
      opacity
    );
    this.counts[index] = n + 1;
  }

  private infantry(
    track: Track,
    j: number,
    base: Vector3,
    heading: Vector3,
    size: number,
    alpha: number,
    horizon: number
  ) {
    const count = 3 + (this.zoom >= 0.85 ? 0 : this.zoom >= 0.45 ? 1 : 2);
    const pitch = size * 0.95;
    const m = track.moving;
    const period = 16 + 4 * track.seed;
    const rx = pitch * count * 0.45;
    const rz = pitch * 1.1;
    for (let k = 0; k < count; k++) {
      const phi =
        (TAU * this.clock) / period + track.seed * TAU + j * 1.7 - k * 0.55;
      const cx = rx * Math.cos(phi);
      const cz = rz * Math.sin(phi);
      const hx = -rx * Math.sin(phi);
      const hz = rz * Math.cos(phi);
      const dx = cx + (-k * pitch - cx) * m;
      const dz = cz * (1 - m);
      this.offset(base, heading, dx, dz, this.pos);
      this.tmp2.crossVectors(heading, base);
      const len = Math.hypot(hx, hz) || 1;
      this.dir
        .copy(heading)
        .multiplyScalar((hx / len) * (1 - m) + m)
        .addScaledVector(this.tmp2, (hz / len) * (1 - m));
      if (this.dir.lengthSq() < 1e-8) this.dir.copy(heading);
      const a = alpha * this.fadeAt(this.pos, horizon);
      const s = size * (0.5 + 0.5 * a);
      const bob = this.still
        ? 0
        : Math.abs(Math.sin(this.clock * 7 + k * 1.3 + j)) * size * 0.07;
      this.put(
        SLOT.infantry,
        this.pos,
        LAND_R + bob,
        this.dir,
        s,
        s,
        s,
        a,
        track.color
      );
      this.put(
        SHADOW,
        this.pos,
        MARK_R,
        this.dir,
        s * 0.55,
        1,
        s * 0.45,
        a,
        null
      );
    }
  }

  private tanks(
    track: Track,
    j: number,
    base: Vector3,
    heading: Vector3,
    size: number,
    alpha: number,
    horizon: number
  ) {
    const count = this.zoom >= 0.85 ? 2 : 3;
    const pitch = size * 1.6;
    for (let k = 0; k < count; k++) {
      this.offset(
        base,
        heading,
        -k * pitch,
        (k % 2 ? 0.18 : 0) * size,
        this.pos
      );
      const a = alpha * this.fadeAt(this.pos, horizon);
      const s = size * (0.5 + 0.5 * a);
      const sweep = this.still
        ? 0
        : Math.sin(this.clock * 0.45 + track.seed * 9 + k * 1.9 + j) *
          0.7 *
          (1 - track.moving);
      this.put(SLOT.tank, this.pos, LAND_R, heading, s, s, s, a, track.color);
      this.put(
        SLOT.turret,
        this.pos,
        LAND_R,
        heading,
        s,
        s,
        s,
        a,
        track.color,
        0,
        sweep
      );
      this.put(
        SHADOW,
        this.pos,
        MARK_R,
        heading,
        s * 1.2,
        1,
        s * 0.75,
        a,
        null
      );
    }
  }

  private ships(
    track: Track,
    j: number,
    base: Vector3,
    heading: Vector3,
    size: number,
    alpha: number,
    horizon: number
  ) {
    const m = track.op.loop ? 1 : track.moving;
    const period = 38 + 10 * track.seed;
    const phi = (TAU * this.clock) / period + track.seed * TAU + j * 2.1;
    const rx = size * 1.8;
    const rz = size * 1.1;
    const cx = rx * Math.cos(phi) * (1 - m);
    const cz = rz * Math.sin(phi) * (1 - m);
    this.offset(base, heading, cx, cz, this.lead);
    this.tmp2.crossVectors(heading, base);
    this.leadFwd
      .copy(heading)
      .multiplyScalar(-rx * Math.sin(phi) * (1 - m) + m * size * 4)
      .addScaledVector(this.tmp2, rz * Math.cos(phi) * (1 - m));
    if (this.leadFwd.lengthSq() < 1e-12) this.leadFwd.copy(heading);
    this.leadFwd.normalize();

    let dive = 0;
    if (track.kind === "submarine" && !this.still) {
      const c = Math.sin(TAU * (this.clock / 22 + track.seed + j * 0.31));
      dive = smoothstep(-0.2, 0.6, c);
    }
    const a = alpha * this.fadeAt(this.lead, horizon);
    const s = size * (0.5 + 0.5 * a);
    const hullOpacity = a * (1 - 0.62 * dive);
    this.put(
      SLOT[track.kind],
      this.lead,
      SEA_R,
      this.leadFwd,
      s,
      s * (1 - 0.72 * dive),
      s,
      hullOpacity,
      track.color
    );
    const wake = (0.35 + 0.65 * m) * (1 - dive);
    this.put(
      WAKE,
      this.lead,
      MARK_R - 0.0002,
      this.leadFwd,
      s * (0.6 + 0.6 * wake),
      1,
      s * 0.9,
      a * wake,
      null
    );

    if (track.kind !== "carrier") return;
    const escorts = this.zoom >= 0.85 ? 1 : 2;
    const ship = SIZE.ship * this.zoom;
    for (let e = 1; e <= escorts; e++) {
      const side = e === 1 ? 1 : -1;
      this.offset(
        this.lead,
        this.leadFwd,
        (e === 1 ? -0.15 : 0.55) * size,
        side * 0.95 * size,
        this.pos
      );
      const ea = alpha * this.fadeAt(this.pos, horizon);
      const es = ship * (0.5 + 0.5 * ea) * 0.8;
      this.put(
        SLOT.ship,
        this.pos,
        SEA_R,
        this.leadFwd,
        es,
        es,
        es,
        ea,
        track.color
      );
      this.put(
        WAKE,
        this.pos,
        MARK_R - 0.0002,
        this.leadFwd,
        es * (0.6 + 0.6 * wake),
        1,
        es * 0.9,
        ea * wake,
        null
      );
    }
  }

  private planePosition(
    track: Track,
    j: number,
    base: Vector3,
    heading: Vector3,
    time: number,
    out: Vector3
  ): number {
    const radius =
      (0.5 + Math.max(0, Math.min(1.05, this.zoom - 0.2)) / 1.05) *
      DEG *
      (1 + 0.12 * ((j % 3) - 1));
    const theta =
      TAU * (time / track.orbitPeriod + j / track.maxForm + track.seed);
    this.offset(
      base,
      heading,
      radius * Math.cos(theta),
      radius * Math.sin(theta),
      out
    );
    if (track.sortieStart < 0 || track.sortieSlot !== j) return 0;
    const u = (time - track.sortieStart) / track.sortieLength;
    if (u <= 0 || u >= 1) return 0;
    const reach = Math.sin(Math.PI * u);
    const distance = out.angleTo(track.sortieTarget);
    this.tmp3.crossVectors(out, track.sortieTarget);
    slerp(out, track.sortieTarget, reach, out);
    if (this.tmp3.lengthSq() > 1e-10)
      out.addScaledVector(
        this.tmp3.normalize(),
        distance * 0.22 * Math.sin(TAU * u)
      );
    out.normalize();
    return reach;
  }

  private scheduleSortie(track: Track, base: Vector3, heading: Vector3) {
    const time = this.clock;
    if (track.sortieStart >= 0 && time < track.sortieStart + track.sortieLength)
      return;
    if (track.sortieStart >= 0) {
      track.sortieStart = -1;
      track.sortieAt = time + 10 + 15 * hash(time + track.seed);
    }
    if (time < track.sortieAt || track.want === 0) return;
    const path = track.path;
    let goal: Vector3 | null = null;
    if (!track.op.loop) {
      for (let i = 0; i < path.points.length; i++) {
        const p = path.points[i]!;
        if (p.dot(heading) > 0 && p.angleTo(base) > 1.5 * DEG) {
          goal = p;
          break;
        }
      }
    }
    if (goal) track.sortieTarget.copy(goal);
    else this.offset(base, heading, 3 * DEG, 0, track.sortieTarget);
    const distance = base.angleTo(track.sortieTarget);
    if (distance > 6 * DEG)
      slerp(base, track.sortieTarget, (6 * DEG) / distance, track.sortieTarget);
    const reach = Math.min(distance, 6 * DEG);
    track.sortieLength = Math.max(8, (2 * reach) / (3 * DEG) + 2);
    track.sortieSlot = Math.floor(hash(time * 3.1 + track.seed) * track.want);
    track.sortieStart = time;
  }

  private planes(
    track: Track,
    j: number,
    base: Vector3,
    heading: Vector3,
    size: number,
    alpha: number,
    horizon: number
  ) {
    const altitude = 0.012 + 0.012 * this.zoom;
    const bob = this.still
      ? 0
      : Math.sin(this.clock * 0.9 + j * 2.3 + track.seed * 7) * size * 0.25;
    let roll = 0;
    if (track.op.loop) {
      this.lead.copy(base);
      this.leadFwd.copy(heading);
    } else {
      if (j === 0 && !this.still)
        this.scheduleSortie(track, track.anchor, track.heading);
      const reach = this.planePosition(
        track,
        j,
        base,
        heading,
        this.clock,
        this.lead
      );
      this.planePosition(track, j, base, heading, this.clock + 0.08, this.pos);
      this.leadFwd.copy(this.pos).sub(this.lead);
      if (this.leadFwd.lengthSq() < 1e-14)
        this.leadFwd.crossVectors(this.lead, heading).negate();
      roll = BANK * (1 - Math.min(1, reach * 2));
    }
    const bomber = track.kind === "bomber";
    const members = bomber ? 3 : 2;
    const radius = 1 + altitude + bob;
    for (let k = 0; k < members; k++) {
      if (k === 0) {
        this.pos.copy(this.lead);
      } else {
        const back = bomber ? -1.15 : -1.3;
        const lateral = (k === 1 ? 1 : -1) * (bomber ? 1.05 : 0.9);
        this.fwd
          .copy(this.leadFwd)
          .addScaledVector(this.lead, -this.leadFwd.dot(this.lead))
          .normalize();
        this.offset(this.lead, this.fwd, back * size, lateral * size, this.pos);
      }
      const a = alpha * this.fadeAt(this.pos, horizon);
      const s = size * (0.5 + 0.5 * a);
      this.put(
        SLOT[track.kind],
        this.pos,
        radius + (k ? -size * 0.1 : 0),
        this.leadFwd,
        s,
        s,
        s,
        a,
        track.color,
        roll
      );
      this.tmp
        .copy(this.lightDir)
        .addScaledVector(this.pos, -this.lightDir.dot(this.pos));
      this.pos.addScaledVector(this.tmp, altitude * 0.9).normalize();
      this.put(
        SHADOW,
        this.pos,
        MARK_R,
        this.leadFwd,
        s * 0.8,
        1,
        s * 0.8,
        a * 0.4,
        null
      );
    }
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.geometry.dispose();
      mesh.dispose();
    }
    for (const material of this.materials) material.dispose();
  }
}
