import {
  BoxGeometry,
  BufferAttribute,
  type BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Group,
  InstancedMesh,
  Matrix4,
  MeshLambertMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ARSENAL, type ArsenalId } from "../arsenal";

type LegacyKind =
  | "carrier"
  | "battleship"
  | "destroyer"
  | "transport"
  | "landing"
  | "boat"
  | "fighter"
  | "diver"
  | "bomber"
  | "twin"
  | "bomb"
  | "squad";

export type ModelKind = LegacyKind | ArsenalId;

export const FACTION = {
  allied: new Color(0x86a6c8),
  axis: new Color(0xc9765a),
  japan: new Color(0xd09a6a),
  neutral: new Color(0xd8d0bc),
  dark: new Color(0x3a3a36),
  burnt: new Color(0x4a3c32),
} as const;

type Part = [BufferGeometry, number];

function part(
  geometry: BufferGeometry,
  shade: number,
  x = 0,
  y = 0,
  z = 0
): Part {
  geometry.translate(x, y, z);
  return [geometry, shade];
}

function box(
  w: number,
  h: number,
  l: number,
  shade: number,
  x = 0,
  y = 0,
  z = 0
): Part {
  return part(new BoxGeometry(w, h, l), shade, x, y, z);
}

function tube(
  r0: number,
  r1: number,
  l: number,
  shade: number,
  x = 0,
  y = 0,
  z = 0,
  segments = 8
): Part {
  const geometry = new CylinderGeometry(r1, r0, l, segments);
  geometry.rotateX(Math.PI / 2);
  return part(geometry, shade, x, y, z);
}

function stack(r: number, h: number, shade: number, x = 0, y = 0, z = 0): Part {
  return part(new CylinderGeometry(r, r, h, 8), shade, x, y, z);
}

function prow(
  w: number,
  h: number,
  l: number,
  shade: number,
  z: number,
  y = 0
): Part {
  const geometry = new ConeGeometry(w / 2, l, 4);
  geometry.rotateY(Math.PI / 4);
  geometry.scale(1, 1, h / w);
  geometry.rotateX(Math.PI / 2);
  return part(geometry, shade, 0, y, z);
}

function build(parts: Part[]): BufferGeometry {
  const pieces = parts.map(([geometry, shade]) => {
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    flat.deleteAttribute("uv");
    const count = flat.getAttribute("position").count;
    const colors = new Float32Array(count * 3).fill(shade);
    flat.setAttribute("color", new BufferAttribute(colors, 3));
    return flat;
  });
  const merged = mergeGeometries(pieces, false)!;
  for (const piece of pieces) piece.dispose();
  merged.computeVertexNormals();
  return merged;
}

function hull(width: number, height: number, shade: number): Part[] {
  return [
    box(width, height, 0.82, shade, 0, 0, -0.06),
    prow(width, height, 0.22, shade, 0.46),
  ];
}

const BUILDERS: Record<LegacyKind, () => BufferGeometry> = {
  carrier: () =>
    build([
      ...hull(0.12, 0.05, 0.62),
      box(0.16, 0.012, 0.98, 1, 0, 0.034, 0),
      box(0.03, 0.06, 0.12, 0.8, 0.07, 0.07, 0.06),
      stack(0.012, 0.04, 0.45, 0.075, 0.11, 0.02),
    ]),
  battleship: () =>
    build([
      ...hull(0.14, 0.05, 0.62),
      box(0.12, 0.012, 0.78, 0.85, 0, 0.03, -0.04),
      box(0.07, 0.08, 0.16, 0.9, 0, 0.07, 0.02),
      box(0.045, 0.06, 0.05, 0.95, 0, 0.13, 0.05),
      stack(0.02, 0.07, 0.5, 0, 0.1, -0.08),
      box(0.06, 0.03, 0.07, 0.8, 0, 0.05, 0.24),
      box(0.06, 0.03, 0.07, 0.8, 0, 0.065, 0.15),
      box(0.06, 0.03, 0.07, 0.8, 0, 0.05, -0.28),
      tube(0.006, 0.006, 0.1, 0.5, -0.012, 0.05, 0.31),
      tube(0.006, 0.006, 0.1, 0.5, 0.012, 0.05, 0.31),
      tube(0.006, 0.006, 0.1, 0.5, -0.012, 0.05, -0.35),
      tube(0.006, 0.006, 0.1, 0.5, 0.012, 0.05, -0.35),
    ]),
  destroyer: () =>
    build([
      ...hull(0.1, 0.045, 0.62),
      box(0.06, 0.05, 0.18, 0.92, 0, 0.05, 0.1),
      stack(0.018, 0.08, 0.5, 0, 0.07, -0.04),
      stack(0.018, 0.08, 0.5, 0, 0.07, -0.13),
      box(0.05, 0.03, 0.06, 0.8, 0, 0.04, 0.3),
      box(0.05, 0.03, 0.06, 0.8, 0, 0.04, -0.32),
    ]),
  transport: () =>
    build([
      ...hull(0.15, 0.07, 0.55),
      box(0.12, 0.07, 0.2, 0.95, 0, 0.07, -0.18),
      stack(0.025, 0.08, 0.4, 0, 0.13, -0.18),
      box(0.012, 0.18, 0.012, 0.5, 0, 0.1, 0.2),
      box(0.13, 0.03, 0.3, 0.7, 0, 0.04, 0.16),
    ]),
  landing: () =>
    build([
      box(0.34, 0.1, 0.84, 0.7, 0, 0, -0.06),
      box(0.3, 0.13, 0.05, 0.85, 0, 0.02, 0.38),
      box(0.12, 0.08, 0.14, 0.9, 0, 0.09, -0.38),
      box(0.24, 0.02, 0.62, 0.35, 0, 0.051, 0.02),
    ]),
  boat: () =>
    build([
      ...hull(0.3, 0.1, 0.8),
      box(0.18, 0.12, 0.3, 1, 0, 0.1, -0.1),
      box(0.02, 0.35, 0.02, 0.5, 0, 0.2, 0.08),
    ]),
  fighter: () =>
    build([
      tube(0.05, 0.07, 0.62, 0.85, 0, 0, 0.12),
      tube(0.05, 0.02, 0.38, 0.8, 0, 0.005, -0.37),
      part(new SphereGeometry(0.045, 8, 6), 0.35, 0, 0.05, 0.12),
      box(1.05, 0.02, 0.2, 1, 0, -0.02, 0.14),
      box(0.36, 0.015, 0.1, 1, 0, 0.01, -0.5),
      box(0.015, 0.14, 0.12, 0.9, 0, 0.07, -0.5),
      tube(0.075, 0.075, 0.04, 0.3, 0, 0, 0.44),
    ]),
  diver: () =>
    build([
      tube(0.055, 0.07, 0.62, 0.85, 0, 0, 0.1),
      tube(0.055, 0.02, 0.4, 0.8, 0, 0.005, -0.4),
      box(0.06, 0.06, 0.34, 0.35, 0, 0.06, 0.02),
      box(1.2, 0.022, 0.22, 1, 0, -0.03, 0.1),
      box(0.4, 0.015, 0.11, 1, 0, 0.01, -0.54),
      box(0.015, 0.16, 0.14, 0.9, 0, 0.08, -0.54),
      box(0.03, 0.12, 0.05, 0.5, -0.14, -0.08, 0.16),
      box(0.03, 0.12, 0.05, 0.5, 0.14, -0.08, 0.16),
      tube(0.08, 0.08, 0.04, 0.3, 0, 0, 0.42),
    ]),
  bomber: () =>
    build([
      tube(0.055, 0.055, 0.86, 0.95, 0, 0, 0.02),
      part(new SphereGeometry(0.055, 10, 8), 0.7, 0, 0, 0.45),
      tube(0.055, 0.015, 0.14, 0.9, 0, 0.005, -0.48),
      box(1.42, 0.02, 0.15, 1, 0, 0, 0.08),
      box(0.46, 0.015, 0.1, 1, 0, 0.01, -0.5),
      box(0.015, 0.24, 0.16, 0.95, 0, 0.12, -0.49),
      tube(0.03, 0.03, 0.16, 0.6, -0.22, -0.02, 0.14),
      tube(0.03, 0.03, 0.16, 0.6, 0.22, -0.02, 0.14),
      tube(0.03, 0.03, 0.16, 0.6, -0.44, -0.02, 0.12),
      tube(0.03, 0.03, 0.16, 0.6, 0.44, -0.02, 0.12),
    ]),
  twin: () =>
    build([
      tube(0.06, 0.07, 0.8, 0.85, 0, 0, 0.02),
      tube(0.06, 0.02, 0.2, 0.8, 0, 0.01, -0.48),
      box(1.3, 0.022, 0.17, 1, 0, 0, 0.1),
      box(0.4, 0.015, 0.1, 1, 0, 0.02, -0.52),
      box(0.015, 0.18, 0.14, 0.9, 0, 0.09, -0.52),
      tube(0.04, 0.04, 0.2, 0.55, -0.24, -0.02, 0.16),
      tube(0.04, 0.04, 0.2, 0.55, 0.24, -0.02, 0.16),
    ]),
  bomb: () =>
    build([
      tube(0.12, 0.12, 0.7, 0.5, 0, 0, 0),
      prow(0.24, 0.24, 0.3, 0.5, 0.5),
      box(0.3, 0.3, 0.02, 0.4, 0, 0, -0.34),
    ]),
  squad: () =>
    build([
      box(0.12, 0.2, 0.12, 0.8, -0.2, 0.1, 0.1),
      box(0.12, 0.2, 0.12, 0.8, 0.05, 0.1, -0.05),
      box(0.12, 0.2, 0.12, 0.8, 0.25, 0.1, 0.15),
      box(0.12, 0.2, 0.12, 0.8, -0.05, 0.1, -0.3),
      box(0.12, 0.2, 0.12, 0.8, 0.2, 0.1, -0.25),
    ]),
};

const scratchMatrix = new Matrix4();
const scratchQuat = new Quaternion();
const scratchEuler = new Euler(0, 0, 0, "YXZ");
const scratchPos = new Vector3();
const scratchScale = new Vector3();
const hidden = new Matrix4().makeScale(0, 0, 0);

export class Units {
  readonly group = new Group();
  private readonly meshes = new Map<ModelKind, InstancedMesh>();
  private readonly counts = new Map<ModelKind, number>();
  private readonly material = new MeshLambertMaterial({
    vertexColors: true,
    emissive: 0x2a2820,
  });

  constructor(capacity: Partial<Record<ModelKind, number>>) {
    for (const [kind, count] of Object.entries(capacity) as [
      ModelKind,
      number,
    ][]) {
      const geometry =
        kind in ARSENAL
          ? ARSENAL[kind as ArsenalId].build()
          : BUILDERS[kind as LegacyKind]();
      const mesh = new InstancedMesh(geometry, this.material, count);
      mesh.frustumCulled = false;
      mesh.renderOrder = 4;
      mesh.count = 0;
      mesh.setColorAt(0, FACTION.neutral);
      this.meshes.set(kind, mesh);
      this.counts.set(kind, 0);
      this.group.add(mesh);
    }
  }

  begin() {
    for (const kind of this.counts.keys()) this.counts.set(kind, 0);
  }

  put(
    kind: ModelKind,
    x: number,
    y: number,
    z: number,
    yaw: number,
    length: number,
    color: Color,
    pitch = 0,
    roll = 0,
    sink = 0
  ) {
    const mesh = this.meshes.get(kind);
    if (!mesh) return;
    const i = this.counts.get(kind)!;
    if (i >= mesh.instanceMatrix.count) return;
    this.counts.set(kind, i + 1);
    scratchEuler.set(-pitch, yaw, roll);
    scratchQuat.setFromEuler(scratchEuler);
    scratchPos.set(x, y - sink * length * 0.06, z);
    scratchScale.set(length, length, length);
    scratchMatrix.compose(scratchPos, scratchQuat, scratchScale);
    mesh.setMatrixAt(i, scratchMatrix);
    mesh.setColorAt(i, color);
  }

  end() {
    for (const [kind, mesh] of this.meshes) {
      const count = this.counts.get(kind)!;
      mesh.count = count;
      if (count === 0) mesh.setMatrixAt(0, hidden);
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }

  dispose() {
    for (const mesh of this.meshes.values()) {
      mesh.geometry.dispose();
      mesh.dispose();
    }
    this.material.dispose();
  }
}
