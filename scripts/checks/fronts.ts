import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Frontline, LonLat } from "../../types/data";

const ROOT = join(import.meta.dir, "..", "..");
const { frontlines } = JSON.parse(
  readFileSync(join(ROOT, "data/fronts.json"), "utf8")
) as { frontlines: Frontline[] };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_SPREAD = 25;
const errors: string[] = [];

function dist(a: LonLat, b: LonLat): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function cross(o: LonLat, a: LonLat, b: LonLat): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function onSegment(p: LonLat, a: LonLat, b: LonLat): boolean {
  return (
    Math.min(a[0], b[0]) <= p[0] &&
    p[0] <= Math.max(a[0], b[0]) &&
    Math.min(a[1], b[1]) <= p[1] &&
    p[1] <= Math.max(a[1], b[1])
  );
}

function intersects(a: LonLat, b: LonLat, c: LonLat, d: LonLat): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  if (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  )
    return true;
  return (
    (d1 === 0 && onSegment(a, c, d)) ||
    (d2 === 0 && onSegment(b, c, d)) ||
    (d3 === 0 && onSegment(c, a, b)) ||
    (d4 === 0 && onSegment(d, a, b))
  );
}

function closed(line: LonLat[]): boolean {
  return line.length > 3 && dist(line[0]!, line[line.length - 1]!) === 0;
}

function signedArea(line: LonLat[]): number {
  let sum = 0;
  for (let i = 0; i < line.length - 1; i++)
    sum += line[i]![0] * line[i + 1]![1] - line[i + 1]![0] * line[i]![1];
  return sum / 2;
}

function selfIntersection(line: LonLat[]): string | null {
  const ring = closed(line);
  const n = line.length - 1;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (ring && i === 0 && j === n - 1) continue;
      if (intersects(line[i]!, line[i + 1]!, line[j]!, line[j + 1]!))
        return `segments ${i} and ${j}`;
    }
  }
  return null;
}

const ids = new Set<string>();
for (const front of frontlines) {
  const where = front.id;
  if (!KEBAB.test(front.id)) errors.push(`${where}: id must be kebab-case`);
  if (ids.has(front.id)) errors.push(`${where}: duplicate id`);
  ids.add(front.id);
  if (front.snapshots.length < 2) errors.push(`${where}: needs 2+ snapshots`);

  const all = front.snapshots.flatMap((s) => s.line);
  const center: LonLat = [
    all.reduce((sum, p) => sum + p[0], 0) / all.length,
    all.reduce((sum, p) => sum + p[1], 0) / all.length,
  ];

  front.snapshots.forEach((snapshot, i) => {
    const at = `${where} ${snapshot.date}`;
    if (!DATE.test(snapshot.date) || Number.isNaN(Date.parse(snapshot.date)))
      errors.push(`${at}: invalid date`);
    const prev = front.snapshots[i - 1];
    if (prev && snapshot.date <= prev.date)
      errors.push(`${at}: dates not strictly increasing after ${prev.date}`);
    if (snapshot.line.length < 2) errors.push(`${at}: needs 2+ points`);
    snapshot.line.forEach((p, k) => {
      const [lon, lat] = p;
      if (
        !Number.isFinite(lon) ||
        !Number.isFinite(lat) ||
        Math.abs(lon) > 180 ||
        Math.abs(lat) > 90
      )
        errors.push(`${at}: point ${k} out of range`);
      else if (
        lat <= 0 ||
        (Math.sign(lon) !== Math.sign(center[0]) && Math.abs(lon) > 5)
      )
        errors.push(
          `${at}: point ${k} [${lon}, ${lat}] in the wrong hemisphere`
        );
      else if (dist(p, center) > MAX_SPREAD)
        errors.push(
          `${at}: point ${k} [${lon}, ${lat}] is ${dist(p, center).toFixed(1)} deg from the front centre`
        );
      if (
        Math.abs(lon * 100 - Math.round(lon * 100)) > 1e-6 ||
        Math.abs(lat * 100 - Math.round(lat * 100)) > 1e-6
      )
        errors.push(`${at}: point ${k} has more than 2 decimals`);
    });
    const hit = selfIntersection(snapshot.line);
    if (hit) errors.push(`${at}: self-intersection (${hit})`);

    if (prev && prev.line.length > 1 && snapshot.line.length > 1) {
      const a0 = prev.line[0]!;
      const a1 = prev.line[prev.line.length - 1]!;
      const b0 = snapshot.line[0]!;
      const b1 = snapshot.line[snapshot.line.length - 1]!;
      if (closed(prev.line) !== closed(snapshot.line))
        errors.push(`${at}: open/closed shape differs from ${prev.date}`);
      else if (closed(snapshot.line)) {
        if (
          Math.sign(signedArea(prev.line)) !==
          Math.sign(signedArea(snapshot.line))
        )
          errors.push(`${at}: ring winding flips after ${prev.date}`);
      } else if (dist(a0, b0) + dist(a1, b1) > dist(a0, b1) + dist(a1, b0))
        errors.push(
          `${at}: direction flips after ${prev.date} (endpoints swapped)`
        );
    }
  });
}

for (const front of frontlines) {
  const first = front.snapshots[0]?.date;
  const last = front.snapshots[front.snapshots.length - 1]?.date;
  const points = front.snapshots.reduce((sum, s) => sum + s.line.length, 0);
  console.log(
    `${front.id.padEnd(22)} ${String(front.snapshots.length).padStart(2)} snapshots  ${first} -> ${last}  ${points} points`
  );
}

if (errors.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  console.error(`${errors.length} error(s)`);
  process.exit(1);
}
console.log(`fronts ok: ${frontlines.length} fronts`);
