import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Shape,
  SphereGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import {
  bf109,
  fw190,
  spitfireMk9,
  spitfireMk1Map,
  p51d,
  b29,
} from "./arsenal/aviation";

export type ModelKind =
  | "tank"
  | "turret"
  | "infantry"
  | "ship"
  | "carrier"
  | "submarine"
  | "fighter"
  | "bomber"
  | "bf109"
  | "fw190"
  | "spitfireMk1"
  | "spitfireMk9"
  | "p51d"
  | "b29";

const HALF_PI = Math.PI / 2;

interface Place {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

function part(
  geometry: BufferGeometry,
  shade: number,
  { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 }: Place = {}
): BufferGeometry {
  if (rx) geometry.rotateX(rx);
  if (ry) geometry.rotateY(ry);
  if (rz) geometry.rotateZ(rz);
  geometry.translate(x, y, z);
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  if (flat !== geometry) geometry.dispose();
  flat.deleteAttribute("uv");
  const count = flat.getAttribute("position").count;
  flat.setAttribute(
    "color",
    new Float32BufferAttribute(new Float32Array(count * 3).fill(shade), 3)
  );
  return flat;
}

function merge(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

function hull(length: number, beam: number, depth: number, bow: number) {
  const half = length / 2;
  const shape = new Shape();
  shape.moveTo(-half, -beam / 2);
  shape.lineTo(half - bow, -beam / 2);
  shape.lineTo(half, 0);
  shape.lineTo(half - bow, beam / 2);
  shape.lineTo(-half, beam / 2);
  shape.lineTo(-half, -beam / 2);
  return new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  }).rotateX(-HALF_PI);
}

function tank(): BufferGeometry {
  return merge([
    part(new BoxGeometry(0.86, 0.18, 0.46), 1, { y: 0.19 }),
    part(new BoxGeometry(0.2, 0.12, 0.46), 0.85, {
      x: 0.46,
      y: 0.17,
      rz: -0.5,
    }),
    part(new BoxGeometry(1, 0.16, 0.13), 0.42, { y: 0.09, z: 0.29 }),
    part(new BoxGeometry(1, 0.16, 0.13), 0.42, { y: 0.09, z: -0.29 }),
    part(new BoxGeometry(0.96, 0.03, 0.15), 0.6, { y: 0.18, z: 0.29 }),
    part(new BoxGeometry(0.96, 0.03, 0.15), 0.6, { y: 0.18, z: -0.29 }),
    part(new BoxGeometry(0.16, 0.06, 0.3), 0.55, { x: -0.38, y: 0.3 }),
  ]);
}

function turret(): BufferGeometry {
  return merge([
    part(new CylinderGeometry(0.17, 0.21, 0.15, 6), 0.9, { y: 0.355 }),
    part(new BoxGeometry(0.12, 0.08, 0.1), 0.7, { x: -0.2, y: 0.35 }),
    part(new CylinderGeometry(0.028, 0.034, 0.5, 6), 0.5, {
      x: 0.4,
      y: 0.36,
      rz: -HALF_PI,
    }),
    part(new CylinderGeometry(0.045, 0.045, 0.06, 6), 0.4, {
      x: 0.64,
      y: 0.36,
      rz: -HALF_PI,
    }),
    part(new CylinderGeometry(0.05, 0.05, 0.05, 6), 0.55, {
      x: -0.04,
      y: 0.455,
      z: 0.06,
    }),
  ]);
}

function soldier(): BufferGeometry {
  return merge([
    part(new BoxGeometry(0.16, 0.36, 0.1), 0.5, { y: 0.18, z: 0.07 }),
    part(new BoxGeometry(0.16, 0.36, 0.1), 0.5, { y: 0.18, z: -0.07 }),
    part(new BoxGeometry(0.2, 0.36, 0.3), 1, { y: 0.54 }),
    part(new BoxGeometry(0.12, 0.24, 0.22), 0.62, { x: -0.15, y: 0.58 }),
    part(new IcosahedronGeometry(0.085, 0), 0.8, { x: 0.01, y: 0.8 }),
    part(new SphereGeometry(0.13, 7, 3, 0, Math.PI * 2, 0, HALF_PI), 0.58, {
      y: 0.83,
    }),
    part(new BoxGeometry(0.04, 0.62, 0.04), 0.28, {
      x: -0.02,
      y: 0.62,
      z: 0.19,
      rz: 0.45,
    }),
  ]);
}

function fighter(): BufferGeometry {
  return merge([
    part(new CylinderGeometry(0.06, 0.035, 0.82, 6), 1, { rz: -HALF_PI }),
    part(new ConeGeometry(0.06, 0.14, 6), 0.75, { x: 0.48, rz: -HALF_PI }),
    part(new BoxGeometry(0.22, 0.024, 1), 0.92, { x: 0.08 }),
    part(new BoxGeometry(0.11, 0.02, 0.36), 0.85, { x: -0.36, y: 0.01 }),
    part(new BoxGeometry(0.13, 0.15, 0.02), 0.8, { x: -0.37, y: 0.08 }),
    part(new BoxGeometry(0.15, 0.06, 0.07), 0.3, { x: 0.12, y: 0.06 }),
    part(new CylinderGeometry(0.17, 0.17, 0.006, 10), 0.35, {
      x: 0.56,
      rz: HALF_PI,
    }),
  ]);
}

function bomber(): BufferGeometry {
  const nacelles = [0.27, -0.27, 0.54, -0.54].map((z) =>
    part(new CylinderGeometry(0.036, 0.03, 0.22, 6), 0.5, {
      x: 0.2,
      y: -0.02,
      z,
      rz: -HALF_PI,
    })
  );
  return merge([
    part(new CylinderGeometry(0.085, 0.055, 1.1, 6), 1, { rz: -HALF_PI }),
    part(new ConeGeometry(0.085, 0.16, 6), 0.7, { x: 0.63, rz: -HALF_PI }),
    part(new BoxGeometry(0.28, 0.03, 1.6), 0.92, { x: 0.1 }),
    part(new BoxGeometry(0.15, 0.02, 0.52), 0.85, { x: -0.5, y: 0.02 }),
    part(new BoxGeometry(0.17, 0.2, 0.02), 0.8, { x: -0.52, y: 0.11 }),
    part(new BoxGeometry(0.14, 0.05, 0.1), 0.3, { x: 0.42, y: 0.07 }),
    ...nacelles,
  ]);
}

function ship(): BufferGeometry {
  return merge([
    part(hull(1, 0.2, 0.1, 0.24), 0.55),
    part(new BoxGeometry(0.62, 0.02, 0.17), 0.78, { x: -0.06, y: 0.11 }),
    part(new BoxGeometry(0.22, 0.12, 0.12), 1, { x: 0.02, y: 0.18 }),
    part(new BoxGeometry(0.08, 0.1, 0.08), 1, { x: 0.06, y: 0.28 }),
    part(new CylinderGeometry(0.035, 0.045, 0.14, 6), 0.4, {
      x: -0.12,
      y: 0.22,
    }),
    part(new CylinderGeometry(0.055, 0.055, 0.05, 6), 0.85, {
      x: 0.25,
      y: 0.14,
    }),
    part(new BoxGeometry(0.14, 0.018, 0.018), 0.45, { x: 0.33, y: 0.15 }),
    part(new CylinderGeometry(0.055, 0.055, 0.05, 6), 0.85, {
      x: -0.3,
      y: 0.14,
    }),
    part(new BoxGeometry(0.14, 0.018, 0.018), 0.45, { x: -0.38, y: 0.15 }),
  ]);
}

function carrier(): BufferGeometry {
  return merge([
    part(hull(1, 0.2, 0.11, 0.2), 0.55),
    part(new BoxGeometry(1.14, 0.025, 0.3), 0.82, { x: 0.02, y: 0.12 }),
    part(new BoxGeometry(0.9, 0.004, 0.012), 0.35, { x: 0.02, y: 0.135 }),
    part(new BoxGeometry(0.2, 0.13, 0.05), 1, { x: 0.06, y: 0.195, z: 0.125 }),
    part(new CylinderGeometry(0.025, 0.03, 0.08, 6), 0.4, {
      x: 0.02,
      y: 0.29,
      z: 0.125,
    }),
  ]);
}

function submarine(): BufferGeometry {
  return merge([
    part(new CylinderGeometry(0.07, 0.07, 0.72, 8), 0.8, {
      y: 0.05,
      rz: -HALF_PI,
    }),
    part(new ConeGeometry(0.07, 0.2, 8), 0.8, {
      x: 0.46,
      y: 0.05,
      rz: -HALF_PI,
    }),
    part(new ConeGeometry(0.07, 0.18, 8), 0.6, {
      x: -0.45,
      y: 0.05,
      rz: HALF_PI,
    }),
    part(new BoxGeometry(0.16, 0.1, 0.06), 1, { x: 0.08, y: 0.15 }),
    part(new BoxGeometry(0.03, 0.08, 0.012), 0.4, { x: 0.1, y: 0.23 }),
    part(new BoxGeometry(0.06, 0.02, 0.2), 0.5, { x: -0.44, y: 0.05 }),
  ]);
}

export function buildModel(kind: ModelKind): BufferGeometry {
  switch (kind) {
    case "bf109":
      return bf109("map").rotateY(HALF_PI);
    case "fw190":
      return fw190("map").rotateY(HALF_PI);
    case "spitfireMk1":
      return spitfireMk1Map().rotateY(HALF_PI);
    case "spitfireMk9":
      return spitfireMk9("map").rotateY(HALF_PI);
    case "p51d":
      return p51d("map").rotateY(HALF_PI);
    case "b29":
      return b29("map").rotateY(HALF_PI);
    case "tank":
      return tank();
    case "turret":
      return turret();
    case "infantry":
      return soldier();
    case "ship":
      return ship();
    case "carrier":
      return carrier();
    case "submarine":
      return submarine();
    case "fighter":
      return fighter();
    case "bomber":
      return bomber();
  }
}

export function buildDisc(): BufferGeometry {
  return new CircleGeometry(0.5, 14).rotateX(-HALF_PI);
}

export function buildWake(): BufferGeometry {
  return new CircleGeometry(0.5, 12)
    .rotateX(-HALF_PI)
    .scale(1.7, 1, 0.3)
    .translate(-0.75, 0, 0);
}

function withInstanceOpacity<T extends Material>(material: T): T {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aOpacity;\nvarying float vOpacity;"
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvOpacity = aOpacity;"
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying float vOpacity;"
      )
      .replace(
        "#include <opaque_fragment>",
        "diffuseColor.a *= vOpacity;\n#include <opaque_fragment>"
      );
  };
  material.customProgramCacheKey = () => "unit-opacity";
  return material;
}

export function unitMaterial(): MeshStandardMaterial {
  return withInstanceOpacity(
    new MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.82,
      metalness: 0.08,
      emissive: 0x2b281f,
      transparent: true,
    })
  );
}

export function markMaterial(
  color: number,
  opacity: number
): MeshBasicMaterial {
  return withInstanceOpacity(
    new MeshBasicMaterial({
      color,
      opacity,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  );
}

const OLIVE = new Color(0x5f5c45);

export function militaryColor(hex: string): Color {
  const color = new Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  color.setHSL(hsl.h, hsl.s * 0.62, 0.44 + hsl.l * 0.3);
  return color.lerp(OLIVE, 0.12);
}
