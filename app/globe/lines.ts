import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  type InterleavedBufferAttribute,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  RingGeometry,
  Vector3,
} from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import type { WorldData } from "~~/types/view";
import { densify, slerp, toVec3, type LonLat } from "./geo";

type Frontline = WorldData["frontlines"][number];

const FRONT_POINTS = 72;

function resample(line: LonLat[], count: number): LonLat[] {
  const dense = densify(line, 0.25);
  const cumulative = [0];
  for (let i = 1; i < dense.length; i++) {
    const [x0, y0] = dense[i - 1]!;
    const [x1, y1] = dense[i]!;
    cumulative.push(cumulative[i - 1]! + Math.hypot(x1 - x0, y1 - y0));
  }
  const total = cumulative[cumulative.length - 1]!;
  const out: LonLat[] = [];
  let j = 1;
  for (let k = 0; k < count; k++) {
    const d = (total * k) / (count - 1);
    while (j < dense.length - 1 && cumulative[j]! < d) j++;
    const seg = cumulative[j]! - cumulative[j - 1]!;
    const u = seg > 0 ? (d - cumulative[j - 1]!) / seg : 0;
    const [x0, y0] = dense[j - 1]!;
    const [x1, y1] = dense[j]!;
    out.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]);
  }
  return out;
}

function lineObject(
  color: string,
  width: number,
  opacity: number,
  additive = false
): Line2 {
  const material = new LineMaterial({
    color: new Color(color).getHex(),
    linewidth: width,
    transparent: true,
    opacity,
    depthWrite: false,
    ...(additive ? { blending: AdditiveBlending } : {}),
  });
  const line = new Line2(new LineGeometry(), material);
  line.frustumCulled = false;
  line.renderOrder = 3;
  return line;
}

function setLine(line: Line2, positions: number[]) {
  line.geometry.dispose();
  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  line.geometry = geometry;
  line.computeLineDistances();
}

interface FrontTrack {
  snapshots: { t: number; line: LonLat[] }[];
  geometry: LineGeometry;
  glow: Line2;
  core: Line2;
  alpha: number;
  index: number;
  u: number;
}

const FRONT_FADE_SECONDS = 0.5;

export class FrontLayer {
  readonly group = new Group();
  private tracks: FrontTrack[];
  private readonly v = new Vector3();
  private readonly prev = new Vector3();
  private lastTime = -1;

  constructor(frontlines: Frontline[]) {
    this.tracks = frontlines.map((front) => {
      const geometry = new LineGeometry();
      geometry.setPositions(new Float32Array(FRONT_POINTS * 3));
      const glow = lineObject("#ff4a26", 8, 0, true);
      const core = lineObject("#ff8a5c", 2.2, 0);
      for (const line of [glow, core]) {
        line.geometry.dispose();
        line.geometry = geometry;
        line.visible = false;
      }
      core.computeLineDistances();
      core.material.dashed = true;
      core.material.dashSize = 0.012;
      core.material.gapSize = 0.006;
      this.group.add(glow, core);
      return {
        snapshots: front.snapshots
          .slice()
          .sort((a, b) => a.t - b.t)
          .map((s) => ({ t: s.t, line: resample(s.line, FRONT_POINTS) })),
        geometry,
        glow,
        core,
        alpha: 0,
        index: -1,
        u: -1,
      };
    });
  }

  update(t: number, time: number) {
    const dt =
      this.lastTime < 0 ? 0 : Math.min(0.1, Math.max(0, time - this.lastTime));
    this.lastTime = time;
    for (const track of this.tracks) {
      const { snapshots } = track;
      const first = snapshots[0]!;
      const last = snapshots[snapshots.length - 1]!;
      const target = t >= first.t && t <= last.t ? 1 : 0;
      const step = dt / FRONT_FADE_SECONDS;
      track.alpha =
        target > track.alpha
          ? Math.min(1, track.alpha + step)
          : Math.max(0, track.alpha - step);
      const visible = track.alpha > 0;
      track.glow.visible = visible;
      track.core.visible = visible;
      if (!visible) continue;
      const at = Math.max(first.t, Math.min(last.t, t));
      let i = 0;
      while (i < snapshots.length - 2 && snapshots[i + 1]!.t <= at) i++;
      const a = snapshots[i]!;
      const b = snapshots[Math.min(i + 1, snapshots.length - 1)]!;
      const linear =
        b.t > a.t ? Math.max(0, Math.min(1, (at - a.t) / (b.t - a.t))) : 0;
      const u = linear * linear * (3 - 2 * linear);
      if (track.index !== i || track.u !== u) {
        track.index = i;
        track.u = u;
        this.write(track, a.line, b.line, u);
      }
      const eased = track.alpha * track.alpha * (3 - 2 * track.alpha);
      track.core.material.opacity = 0.9 * eased;
      track.glow.material.opacity =
        (0.13 + 0.05 * Math.sin(time * 2.4)) * eased;
      track.core.material.dashOffset = -time * 0.02;
    }
  }

  private write(track: FrontTrack, from: LonLat[], to: LonLat[], u: number) {
    const segments = (
      track.geometry.attributes.instanceStart as InterleavedBufferAttribute
    ).data;
    const distances = (
      track.geometry.attributes
        .instanceDistanceStart as InterleavedBufferAttribute
    ).data;
    const positions = segments.array as Float32Array;
    const lengths = distances.array as Float32Array;
    let total = 0;
    for (let k = 0; k < FRONT_POINTS; k++) {
      const pa = from[k]!;
      const pb = to[k]!;
      let lonB = pb[0];
      if (lonB - pa[0] > 180) lonB -= 360;
      else if (lonB - pa[0] < -180) lonB += 360;
      toVec3(
        pa[0] + (lonB - pa[0]) * u,
        pa[1] + (pb[1] - pa[1]) * u,
        1.0022,
        this.v
      );
      if (k > 0) {
        const o = (k - 1) * 6;
        positions[o] = this.prev.x;
        positions[o + 1] = this.prev.y;
        positions[o + 2] = this.prev.z;
        positions[o + 3] = this.v.x;
        positions[o + 4] = this.v.y;
        positions[o + 5] = this.v.z;
        lengths[(k - 1) * 2] = total;
        total += this.prev.distanceTo(this.v);
        lengths[(k - 1) * 2 + 1] = total;
      }
      this.prev.copy(this.v);
    }
    segments.needsUpdate = true;
    distances.needsUpdate = true;
  }

  dispose() {
    for (const track of this.tracks) {
      track.geometry.dispose();
      track.glow.material.dispose();
      track.core.material.dispose();
    }
  }
}

/** Arced route through a title's stops, drawn progressively. */
export class JourneyLayer {
  readonly group = new Group();
  private glow = lineObject("#f3d78e", 7, 0.18, true);
  private core = lineObject("#f3d78e", 2.2, 1);
  private total = 0;
  private drawStart = 0;
  private stopEnds: number[] = [];
  private revealFrom = 0;
  private revealTo = 0;
  private revealStart = 0;
  private readonly v = new Vector3();

  constructor() {
    this.core.material.dashed = true;
    this.core.material.dashSize = 0.02;
    this.core.material.gapSize = 0.012;
    this.group.add(this.glow, this.core);
    this.group.visible = false;
  }

  set(stops: LonLat[] | null, time: number) {
    if (!stops || stops.length < 2) {
      this.group.visible = false;
      return;
    }
    const positions: number[] = [];
    const a = new Vector3();
    const b = new Vector3();
    this.stopEnds = [0];
    for (let i = 0; i < stops.length - 1; i++) {
      toVec3(stops[i]![0], stops[i]![1], 1, a);
      toVec3(stops[i + 1]![0], stops[i + 1]![1], 1, b);
      const angle = a.angleTo(b);
      const steps = Math.max(8, Math.ceil(angle / 0.02));
      const lift = Math.min(0.12, 0.02 + angle * 0.14);
      for (let s = i === 0 ? 0 : 1; s <= steps; s++) {
        const u = s / steps;
        slerp(a, b, u, this.v)
          .normalize()
          .multiplyScalar(1.003 + Math.sin(Math.PI * u) * lift);
        positions.push(this.v.x, this.v.y, this.v.z);
      }
      this.stopEnds.push(positions.length / 3 - 1);
    }
    setLine(this.core, positions);
    setLine(this.glow, positions);
    this.total = positions.length / 3 - 1;
    this.drawStart = time;
    this.revealFrom = this.revealTo = this.total;
    this.group.visible = true;
  }

  /** Lights the route up to a stop; null lights all of it. */
  reveal(stop: number | null, time: number) {
    if (!this.group.visible) return;
    this.revealFrom = this.revealed(time);
    this.revealTo =
      stop === null
        ? this.total
        : (this.stopEnds[Math.min(stop, this.stopEnds.length - 1)] ?? 0);
    this.revealStart = time;
  }

  private revealed(time: number): number {
    const u = Math.min(1, (time - this.revealStart) / 1.5);
    const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    return this.revealFrom + (this.revealTo - this.revealFrom) * e;
  }

  /** Returns true while the route is still being drawn or revealed. */
  update(time: number, still: boolean): boolean {
    if (!this.group.visible) return false;
    const progress = still ? 1 : Math.min(1, (time - this.drawStart) / 1.6);
    const drawn = this.total * (1 - Math.pow(1 - progress, 3));
    const lit = still ? this.revealTo : this.revealed(time);
    this.glow.geometry.instanceCount = Math.max(1, Math.round(drawn));
    this.core.geometry.instanceCount = Math.round(Math.min(drawn, lit));
    this.core.material.dashOffset = still ? 0 : -time * 0.05;
    return !still && (progress < 1 || time - this.revealStart < 1.5);
  }

  get animating(): boolean {
    return this.group.visible;
  }

  dispose() {
    for (const line of [this.glow, this.core]) {
      line.geometry.dispose();
      line.material.dispose();
    }
  }
}

export interface PulseInput {
  id: string;
  lonLat: LonLat;
  t: number;
  major: boolean;
}

/** Expanding rings on events close to the current date. */
export class PulseLayer {
  readonly group = new Group();
  private rings: Mesh<RingGeometry, MeshBasicMaterial>[] = [];
  private events: PulseInput[] = [];
  private readonly q = new Quaternion();
  private readonly up = new Vector3(0, 0, 1);
  private readonly v = new Vector3();
  current: PulseInput[] = [];

  constructor() {
    const geometry = new RingGeometry(0.72, 1, 48);
    for (let i = 0; i < 10; i++) {
      const ring = new Mesh(
        geometry,
        new MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          depthWrite: false,
          side: DoubleSide,
          blending: AdditiveBlending,
        })
      );
      ring.visible = false;
      ring.renderOrder = 5;
      this.rings.push(ring);
      this.group.add(ring);
    }
  }

  setEvents(events: PulseInput[]) {
    this.events = events;
  }

  update(t: number, time: number, zoom: number, still: boolean) {
    this.current = this.events
      .filter((e) => t >= e.t - 0.25 && t <= e.t + 1.5)
      .sort((a, b) => Number(b.major) - Number(a.major))
      .slice(0, this.rings.length / 2);
    this.rings.forEach((ring) => (ring.visible = false));
    this.current.forEach((event, i) => {
      toVec3(event.lonLat[0], event.lonLat[1], 1.0026, this.v);
      this.q.setFromUnitVectors(this.up, this.v.clone().normalize());
      for (let k = 0; k < 2; k++) {
        const ring = this.rings[i * 2 + k]!;
        const phase = still ? 0.5 : (time * 0.55 + k * 0.5) % 1;
        const size = (event.major ? 0.05 : 0.034) * zoom * (0.25 + phase);
        ring.position.copy(this.v);
        ring.quaternion.copy(this.q);
        ring.scale.set(size, size, size);
        ring.material.color.set(event.major ? "#ff5a3c" : "#f3d78e");
        ring.material.opacity = (1 - phase) * 0.85;
        ring.visible = true;
      }
    });
  }

  dispose() {
    this.rings[0]?.geometry.dispose();
    this.rings.forEach((ring) => ring.material.dispose());
  }
}
