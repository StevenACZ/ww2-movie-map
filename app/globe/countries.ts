import {
  BufferGeometry,
  Color,
  DataTexture,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LinearSRGBColorSpace,
  Mesh,
  NearestFilter,
  RGBAFormat,
  ShaderMaterial,
  ShapeUtils,
  Uint32BufferAttribute,
  Vector2,
  Vector3,
} from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { feature, mesh as topoMesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { densify, toVec3, unwrapRing, type LonLat } from "./geo";
import { belligerent, camp, swatch, type PaletteMode } from "./palette";

type CountryProps = { id: string };
export type BordersTopology = Topology<{
  countries: GeometryCollection<CountryProps>;
}>;

const PALETTE_SIZE = 256;
const MAX_EDGE = 3;
const FILL_RADIUS = 1;
const LINE_RADIUS = 1.0012;

const vertexShader = /* glsl */ `
attribute float aIndex;
attribute vec2 aLonLat;
uniform sampler2D uPaletteA;
uniform sampler2D uPaletteB;
varying vec4 vFillA;
varying vec3 vHatchA;
varying vec4 vFillB;
varying vec3 vHatchB;
varying vec2 vLonLat;
varying vec3 vPosW;
void main() {
  float u = (aIndex + 0.5) / ${PALETTE_SIZE.toFixed(1)};
  vFillA = texture2D(uPaletteA, vec2(u, 0.25));
  vHatchA = texture2D(uPaletteA, vec2(u, 0.75)).rgb;
  vFillB = texture2D(uPaletteB, vec2(u, 0.25));
  vHatchB = texture2D(uPaletteB, vec2(u, 0.75)).rgb;
  vLonLat = aLonLat;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPosW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const fragmentShader = /* glsl */ `
uniform float uMix;
uniform float uOpacity;
uniform float uHatch;
uniform vec3 uLightDir;
uniform vec3 uCamPos;
uniform float uHighlight;
uniform float uHighlightIndex;
varying vec4 vFillA;
varying vec3 vHatchA;
varying vec4 vFillB;
varying vec3 vHatchB;
varying vec2 vLonLat;
varying vec3 vPosW;

vec3 pattern(vec4 fill, vec3 hatch) {
  float kind = floor(fill.a * 255.0 + 0.5);
  if (kind < 0.5) return fill.rgb;
  float coord = kind < 1.5 ? (vLonLat.x + vLonLat.y) / uHatch : (vLonLat.x * 0.35 - vLonLat.y) / (uHatch * 1.4);
  float w = fwidth(coord);
  float f = fract(coord);
  float stripe = smoothstep(0.5 - w, 0.5 + w, f) * (1.0 - smoothstep(1.0 - w, 1.0, f));
  stripe = mix(stripe, 0.45, clamp(w * 1.6 - 0.35, 0.0, 1.0));
  return mix(fill.rgb, hatch, stripe * 0.9);
}

void main() {
  vec3 color = mix(pattern(vFillA, vHatchA), pattern(vFillB, vHatchB), uMix);
  vec3 n = normalize(vPosW);
  float diffuse = clamp(dot(n, normalize(uLightDir)), 0.0, 1.0);
  float facing = clamp(dot(n, normalize(uCamPos - vPosW)), 0.0, 1.0);
  color *= 0.58 + 0.55 * diffuse;
  color += vec3(0.9, 0.78, 0.55) * pow(1.0 - facing, 3.0) * 0.16;
  gl_FragColor = vec4(color, uOpacity);
}
`;

function makePalette(): DataTexture {
  const texture = new DataTexture(
    new Uint8Array(PALETTE_SIZE * 2 * 4),
    PALETTE_SIZE,
    2,
    RGBAFormat
  );
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

function lineMaterial(
  color: string,
  width: number,
  opacity: number
): LineMaterial {
  return new LineMaterial({
    color: new Color(color).getHex(),
    linewidth: width,
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function segmentsFrom(lines: LonLat[][], radius: number): number[] {
  const out: number[] = [];
  const a = new Vector3();
  const b = new Vector3();
  for (const line of lines) {
    const dense = densify(line, 1);
    for (let i = 0; i < dense.length - 1; i++) {
      toVec3(dense[i]![0], dense[i]![1], radius, a);
      toVec3(dense[i + 1]![0], dense[i + 1]![1], radius, b);
      out.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  return out;
}

function segmentsObject(
  positions: number[],
  material: LineMaterial
): LineSegments2 {
  const geometry = new LineSegmentsGeometry();
  geometry.setPositions(positions.length ? positions : [0, 0, 0, 0, 0, 0]);
  const line = new LineSegments2(geometry, material);
  line.visible = positions.length > 0;
  line.renderOrder = 2;
  return line;
}

interface Shape {
  index: number;
  bbox: [number, number, number, number];
  rings: LonLat[][];
}

function inRing(lon: number, lat: number, ring: LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    if (
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    )
      inside = !inside;
  }
  return inside;
}

function buildFill(
  topology: BordersTopology,
  ids: string[],
  shapes: Shape[]
): BufferGeometry {
  const positions: number[] = [];
  const lonlats: number[] = [];
  const indexes: number[] = [];
  const triangles: number[] = [];
  const v = new Vector3();
  const collection = feature(topology, topology.objects.countries);

  collection.features.forEach((f) => {
    const id = f.properties?.id;
    if (!id || !f.geometry) return;
    let index = ids.indexOf(id);
    if (index < 0) index = ids.push(id) - 1;
    const polygons =
      f.geometry.type === "Polygon"
        ? [f.geometry.coordinates as LonLat[][]]
        : f.geometry.type === "MultiPolygon"
          ? (f.geometry.coordinates as LonLat[][][])
          : [];

    for (const rings of polygons) {
      if (!rings[0] || rings[0].length < 4) continue;
      const outer = densify(unwrapRing(rings[0]), 2);
      const reference = outer[0]![0];
      const holes = rings
        .slice(1)
        .map((ring) => densify(unwrapRing(ring, reference), 2));
      const strip = (ring: LonLat[]) => {
        const last = ring[ring.length - 1]!;
        return last[0] === ring[0]![0] && last[1] === ring[0]![1]
          ? ring.slice(0, -1)
          : ring;
      };
      const contour = strip(outer);
      const holeRings = holes.map(strip).filter((ring) => ring.length >= 3);
      const bbox: Shape["bbox"] = [Infinity, Infinity, -Infinity, -Infinity];
      for (const [x, y] of contour) {
        bbox[0] = Math.min(bbox[0], x);
        bbox[1] = Math.min(bbox[1], y);
        bbox[2] = Math.max(bbox[2], x);
        bbox[3] = Math.max(bbox[3], y);
      }
      shapes.push({ index, bbox, rings: [contour, ...holeRings] });
      const faces = ShapeUtils.triangulateShape(
        contour.map(([x, y]) => new Vector2(x, y)),
        holeRings.map((ring) => ring.map(([x, y]) => new Vector2(x, y)))
      );
      const verts: LonLat[] = [...contour, ...holeRings.flat()];
      const base = positions.length / 3;
      const cache = new Map<number, number>();
      const mid = (a: number, b: number) => {
        const key = a < b ? a * 1_000_003 + b : b * 1_000_003 + a;
        const hit = cache.get(key);
        if (hit !== undefined) return hit;
        const pa = verts[a]!;
        const pb = verts[b]!;
        const m = verts.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]) - 1;
        cache.set(key, m);
        return m;
      };
      const span = (a: number, b: number) => {
        const pa = verts[a]!;
        const pb = verts[b]!;
        const k = Math.cos((((pa[1] + pb[1]) / 2) * Math.PI) / 180);
        return Math.hypot((pa[0] - pb[0]) * k, pa[1] - pb[1]);
      };
      const long = (a: number, b: number, depth: number) =>
        depth < 24 && span(a, b) > MAX_EDGE;
      const emit = (a: number, b: number, c: number, depth: number): void => {
        const ab = long(a, b, depth);
        const bc = long(b, c, depth);
        const ca = long(c, a, depth);
        const next = depth + 1;
        if (ab && bc && ca) {
          const mab = mid(a, b);
          const mbc = mid(b, c);
          const mca = mid(c, a);
          emit(a, mab, mca, next);
          emit(mab, b, mbc, next);
          emit(mca, mbc, c, next);
          emit(mab, mbc, mca, next);
        } else if (ab || bc || ca) {
          const [p, q, r] =
            ab && !ca ? [a, b, c] : bc && !ab ? [b, c, a] : [c, a, b];
          const mpq = mid(p, q);
          if (long(q, r, depth)) {
            const mqr = mid(q, r);
            emit(mpq, q, mqr, next);
            emit(p, mpq, mqr, next);
            emit(p, mqr, r, next);
          } else {
            emit(p, mpq, r, next);
            emit(mpq, q, r, next);
          }
        } else {
          triangles.push(base + a, base + b, base + c);
        }
      };
      for (const [a, b, c] of faces) emit(a!, b!, c!, 0);
      for (const [lon, lat] of verts) {
        toVec3(lon, lat, FILL_RADIUS, v);
        positions.push(v.x, v.y, v.z);
        lonlats.push(lon, lat);
        indexes.push(index);
      }
    }
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aLonLat", new Float32BufferAttribute(lonlats, 2));
  geometry.setAttribute("aIndex", new Float32BufferAttribute(indexes, 1));
  geometry.setIndex(new Uint32BufferAttribute(triangles, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

export class CountryLayer {
  readonly group = new Group();
  readonly ids: string[] = [];
  readonly material: ShaderMaterial;
  private paletteA = makePalette();
  private paletteB = makePalette();
  private warLines: LineSegments2;
  private warGlow: LineSegments2;
  private campKey = "";
  private statusKey = "";
  private readonly byId = new Map<string, number>();
  private readonly shapes: Shape[] = [];
  private readonly fill: Mesh;

  constructor(
    readonly key: string,
    private readonly topology: BordersTopology
  ) {
    const fill = buildFill(topology, this.ids, this.shapes);
    this.ids.forEach((id, i) => this.byId.set(id, i));
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      uniforms: {
        uPaletteA: { value: this.paletteA },
        uPaletteB: { value: this.paletteB },
        uMix: { value: 1 },
        uOpacity: { value: 1 },
        uHatch: { value: 1 },
        uLightDir: { value: new Vector3(0, 1, 1) },
        uCamPos: { value: new Vector3() },
        uHighlight: { value: 0 },
        uHighlightIndex: { value: -1 },
      },
    });
    this.fill = new Mesh(fill, this.material);
    this.fill.renderOrder = 1;
    this.group.add(this.fill);

    const object = topology.objects.countries;
    const inner = topoMesh(topology, object, (a, b) => a !== b)
      .coordinates as LonLat[][];
    const coast = topoMesh(topology, object, (a, b) => a === b)
      .coordinates as LonLat[][];
    this.group.add(
      segmentsObject(
        segmentsFrom(inner, LINE_RADIUS),
        lineMaterial("#0a0b08", 1, 0.6)
      )
    );
    this.group.add(
      segmentsObject(
        segmentsFrom(coast, LINE_RADIUS),
        lineMaterial("#d9cfae", 1, 0.28)
      )
    );
    this.warGlow = segmentsObject([], lineMaterial("#ff3d22", 5, 0.22));
    this.warLines = segmentsObject([], lineMaterial("#e0452f", 1.6, 0.95));
    this.group.add(this.warGlow, this.warLines);
  }

  get index(): Map<string, number> {
    return this.byId;
  }

  /** Returns true when the palette changed and a crossfade should run. */
  apply(
    statusOf: (id: string) => string,
    mode: PaletteMode,
    animate: boolean
  ): boolean {
    const statuses = this.ids.map(statusOf);
    const statusKey = `${mode}|${statuses.join(",")}`;
    if (statusKey === this.statusKey) return false;
    this.statusKey = statusKey;

    const next = this.paletteA;
    const data = next.image.data as Uint8Array;
    const color = new Color();
    statuses.forEach((status, i) => {
      const [fill, hatch, pattern] = swatch(status, mode);
      color.setStyle(fill, LinearSRGBColorSpace);
      data[i * 4] = Math.round(color.r * 255);
      data[i * 4 + 1] = Math.round(color.g * 255);
      data[i * 4 + 2] = Math.round(color.b * 255);
      data[i * 4 + 3] = pattern;
      color.setStyle(hatch, LinearSRGBColorSpace);
      const row = (PALETTE_SIZE + i) * 4;
      data[row] = Math.round(color.r * 255);
      data[row + 1] = Math.round(color.g * 255);
      data[row + 2] = Math.round(color.b * 255);
      data[row + 3] = 255;
    });
    next.needsUpdate = true;
    this.paletteA = this.paletteB;
    this.paletteB = next;
    this.material.uniforms.uPaletteA!.value = this.paletteA;
    this.material.uniforms.uPaletteB!.value = this.paletteB;
    this.material.uniforms.uMix!.value = animate ? 0 : 1;

    const camps = statuses.map(camp);
    const campKey = mode === "terrain" ? mode : camps.join(",");
    if (campKey !== this.campKey) {
      this.campKey = campKey;
      const war = mode === "terrain" ? [] : this.warBorders(statuses);
      const positions = segmentsFrom(war, LINE_RADIUS + 0.0004);
      for (const line of [this.warLines, this.warGlow]) {
        line.geometry.dispose();
        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(
          positions.length ? positions : [0, 0, 0, 0, 0, 0]
        );
        line.geometry = geometry;
        line.visible = positions.length > 0;
      }
    }
    return animate;
  }

  private warBorders(statuses: string[]): LonLat[][] {
    const statusOf = (country: { properties?: unknown }) =>
      statuses[
        this.byId.get(
          (country.properties as CountryProps | undefined)?.id ?? ""
        ) ?? -1
      ] ?? "neutral";
    return topoMesh(this.topology, this.topology.objects.countries, (a, b) => {
      if (a === b) return false;
      const sa = statusOf(a);
      const sb = statusOf(b);
      return camp(sa) !== camp(sb) && (belligerent(sa) || belligerent(sb));
    }).coordinates as LonLat[][];
  }

  pick(lon: number, lat: number): string | undefined {
    for (const shape of this.shapes) {
      const [x0, y0, x1, y1] = shape.bbox;
      if (lat < y0 || lat > y1) continue;
      for (const x of [lon, lon + 360, lon - 360]) {
        if (x < x0 || x > x1) continue;
        const [outer, ...holes] = shape.rings;
        if (
          outer &&
          inRing(x, lat, outer) &&
          !holes.some((hole) => inRing(x, lat, hole))
        ) {
          return this.ids[shape.index];
        }
      }
    }
    return undefined;
  }

  get opacity(): number {
    return this.material.uniforms.uOpacity!.value as number;
  }

  raise(front: boolean) {
    this.fill.renderOrder = front ? 1.5 : 1;
  }

  setOpacity(fill: number, lines = fill) {
    this.material.uniforms.uOpacity!.value = fill;
    this.group.traverse((child) => {
      if (child instanceof LineSegments2) {
        const base = (child.userData.baseOpacity ??=
          child.material.opacity) as number;
        child.material.opacity = base * lines;
      }
    });
    this.group.visible = Math.max(fill, lines) > 0.001;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child instanceof Mesh || child instanceof LineSegments2) {
        child.geometry.dispose();
        (child.material as ShaderMaterial).dispose();
      }
    });
    this.paletteA.dispose();
    this.paletteB.dispose();
  }
}
