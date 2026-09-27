import {
  BoxGeometry,
  BufferAttribute,
  type BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Shape,
  SphereGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export interface At {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  sx?: number;
  sy?: number;
  sz?: number;
}

export type Part = [BufferGeometry, Color];

export const HALF_PI = Math.PI / 2;

export function part(geometry: BufferGeometry, hex: number, at: At = {}): Part {
  const {
    x = 0,
    y = 0,
    z = 0,
    rx = 0,
    ry = 0,
    rz = 0,
    sx = 1,
    sy = 1,
    sz = 1,
  } = at;
  if (sx !== 1 || sy !== 1 || sz !== 1) geometry.scale(sx, sy, sz);
  if (rx) geometry.rotateX(rx);
  if (ry) geometry.rotateY(ry);
  if (rz) geometry.rotateZ(rz);
  geometry.translate(x, y, z);
  return [geometry, new Color(hex)];
}

export function box(
  w: number,
  h: number,
  l: number,
  hex: number,
  at?: At
): Part {
  return part(new BoxGeometry(w, h, l), hex, at);
}

export function tube(
  rear: number,
  front: number,
  l: number,
  hex: number,
  at?: At,
  segments = 10
): Part {
  const geometry = new CylinderGeometry(front, rear, l, segments);
  geometry.rotateX(HALF_PI);
  return part(geometry, hex, at);
}

export function rod(
  r: number,
  h: number,
  hex: number,
  at?: At,
  segments = 10,
  top = r
): Part {
  return part(new CylinderGeometry(top, r, h, segments), hex, at);
}

export function wheel(r: number, w: number, hex: number, at?: At): Part {
  const geometry = new CylinderGeometry(r, r, w, 10);
  geometry.rotateZ(HALF_PI);
  return part(geometry, hex, at);
}

export function ball(r: number, hex: number, at?: At, detail = 10): Part {
  return part(new SphereGeometry(r, detail, Math.max(4, detail - 2)), hex, at);
}

export function dome(r: number, hex: number, at?: At, detail = 12): Part {
  return part(
    new SphereGeometry(r, detail, 5, 0, Math.PI * 2, 0, HALF_PI),
    hex,
    at
  );
}

export function cone(r: number, h: number, hex: number, at?: At, sides = 10) {
  return part(new ConeGeometry(r, h, sides), hex, at);
}

function outline(points: [number, number][]): Shape {
  const shape = new Shape();
  points.forEach(([u, v], i) => (i ? shape.lineTo(u, v) : shape.moveTo(u, v)));
  return shape;
}

export function profile(
  points: [z: number, y: number][],
  width: number,
  hex: number,
  at?: At
): Part {
  const geometry = new ExtrudeGeometry(outline(points), {
    depth: width,
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -width / 2);
  geometry.rotateY(-HALF_PI);
  return part(geometry, hex, at);
}

export function plan(
  points: [x: number, z: number][],
  height: number,
  hex: number,
  at?: At
): Part {
  const geometry = new ExtrudeGeometry(outline(points), {
    depth: height,
    bevelEnabled: false,
  });
  geometry.rotateX(HALF_PI);
  geometry.translate(0, height, 0);
  return part(geometry, hex, at);
}

export function mirror(points: [number, number][]): [number, number][] {
  const back = points
    .slice()
    .reverse()
    .filter(([x]) => x !== 0)
    .map(([x, z]) => [-x, z] as [number, number]);
  return [...points, ...back];
}

export function star(r: number, hex: number, at?: At): Part {
  const points: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + HALF_PI;
    const k = i % 2 ? r * 0.4 : r;
    points.push([Math.cos(a) * k, Math.sin(a) * k]);
  }
  const geometry = new ExtrudeGeometry(outline(points), {
    depth: r * 0.05,
    bevelEnabled: false,
  });
  return part(geometry, hex, at);
}

export function model(parts: Part[]): BufferGeometry {
  const pieces = parts.map(([geometry, color]) => {
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    flat.deleteAttribute("uv");
    flat.deleteAttribute("normal");
    const count = flat.getAttribute("position").count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) color.toArray(colors, i * 3);
    flat.setAttribute("color", new BufferAttribute(colors, 3));
    return flat;
  });
  const merged = mergeGeometries(pieces, false)!;
  for (const piece of pieces) piece.dispose();
  merged.computeVertexNormals();
  return merged;
}
