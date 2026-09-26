import { Vector3 } from "three";

export type LonLat = [number, number];

const DEG = Math.PI / 180;

export function toVec3(
  lon: number,
  lat: number,
  radius = 1,
  target = new Vector3()
): Vector3 {
  const polar = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  const s = Math.sin(polar);
  return target.set(
    -radius * s * Math.cos(theta),
    radius * Math.cos(polar),
    radius * s * Math.sin(theta)
  );
}

export function toLonLat(v: Vector3): LonLat {
  const n = v.clone().normalize();
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, n.y))) / DEG;
  let lon = Math.atan2(n.z, -n.x) / DEG - 180;
  if (lon < -180) lon += 360;
  return [lon, lat];
}

export function unwrapRing(ring: LonLat[], reference?: number): LonLat[] {
  const out: LonLat[] = [];
  let prev = reference ?? ring[0]![0];
  for (const [lon, lat] of ring) {
    let x = lon;
    while (x - prev > 180) x -= 360;
    while (x - prev < -180) x += 360;
    out.push([x, lat]);
    prev = x;
  }
  return out;
}

export function densify(line: LonLat[], maxStep: number): LonLat[] {
  const out: LonLat[] = [];
  for (let i = 0; i < line.length - 1; i++) {
    const [x0, y0] = line[i]!;
    let [x1, y1] = line[i + 1]!;
    if (x1 - x0 > 180) x1 -= 360;
    else if (x1 - x0 < -180) x1 += 360;
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(x1 - x0, y1 - y0) / maxStep)
    );
    for (let s = 0; s < steps; s++)
      out.push([x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps]);
  }
  if (line.length) out.push(line[line.length - 1]!);
  return out;
}

/** Great-circle path sampled by arc length, used by units and routes. */
export class ArcPath {
  readonly points: Vector3[];
  readonly lengths: number[];
  readonly total: number;

  constructor(path: LonLat[]) {
    this.points = path.map(([lon, lat]) => toVec3(lon, lat));
    this.lengths = [0];
    let sum = 0;
    for (let i = 1; i < this.points.length; i++) {
      sum += this.points[i - 1]!.angleTo(this.points[i]!);
      this.lengths.push(sum);
    }
    this.total = sum;
  }

  at(fraction: number, target: Vector3, tangent?: Vector3): Vector3 {
    const count = this.points.length;
    if (count === 1 || this.total === 0) {
      target.copy(this.points[0]!);
      tangent?.set(0, 0, 0);
      return target;
    }
    const d = Math.max(0, Math.min(1, fraction)) * this.total;
    let i = 1;
    while (i < count - 1 && this.lengths[i]! < d) i++;
    const a = this.points[i - 1]!;
    const b = this.points[i]!;
    const seg = this.lengths[i]! - this.lengths[i - 1]!;
    const u = seg > 0 ? (d - this.lengths[i - 1]!) / seg : 0;
    slerp(a, b, u, target);
    if (tangent) {
      tangent.copy(b).sub(a);
      tangent.addScaledVector(target, -tangent.dot(target)).normalize();
    }
    return target;
  }
}

export function slerp(
  a: Vector3,
  b: Vector3,
  u: number,
  target: Vector3
): Vector3 {
  const omega = a.angleTo(b);
  if (omega < 1e-6) return target.copy(a);
  const s = Math.sin(omega);
  const wa = Math.sin((1 - u) * omega) / s;
  const wb = Math.sin(u * omega) / s;
  return target.set(
    a.x * wa + b.x * wb,
    a.y * wa + b.y * wb,
    a.z * wa + b.z * wb
  );
}

export function easeInOut(u: number): number {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}
