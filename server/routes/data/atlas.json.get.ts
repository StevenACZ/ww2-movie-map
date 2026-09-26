import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { Feature, MultiPolygon, Polygon, Position } from "geojson";
import type { Era, Localized, PlacesFile } from "~~/types/data";
import borders from "~~/public/geo/borders-1938.json";
import countriesFile from "~~/data/geo/countries.json";
import placesFile from "~~/data/places.json";

type Pt = [number, number];

const CENTER = 30;
const WIDTH = 1000;
const TOLERANCE = 0.35;
const MIN_AREA = 2;
const NEAR = 0.2;
const STATUS_DATE = "1942-06-01";
const ERAS: Era[] = ["ww1", "interwar", "ww2"];

const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;
const M = Math.sqrt(3) / 2;
const X_MAX = Math.PI / (M * A1);
const Y_MAX = equalEarth(180, 90)[1] * -1;
const SCALE = WIDTH / (2 * X_MAX);
const HEIGHT = Math.round(2 * Y_MAX * SCALE);

function equalEarth(rel: number, lat: number): Pt {
  const lambda = (rel * Math.PI) / 180;
  const theta = Math.asin(M * Math.sin((lat * Math.PI) / 180));
  const t2 = theta * theta;
  const t6 = t2 * t2 * t2;
  const x =
    (lambda * Math.cos(theta)) /
    (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, -y];
}

function toRel(lon: number): number {
  return ((((lon - CENTER + 180) % 360) + 360) % 360) - 180;
}

function project(rel: number, lat: number): Pt {
  const [x, y] = equalEarth(rel, lat);
  return [(x + X_MAX) * SCALE, (y + Y_MAX) * SCALE];
}

function projectLonLat(lon: number, lat: number): Pt {
  return project(toRel(lon), lat);
}

function unwrap(ring: Position[]): Pt[] {
  const out: Pt[] = [];
  let prev = toRel(ring[0]![0]!);
  for (const [lon, lat] of ring as Pt[]) {
    let rel = toRel(lon);
    while (rel - prev > 180) rel -= 360;
    while (rel - prev < -180) rel += 360;
    out.push([rel, lat]);
    prev = rel;
  }
  return out;
}

function clipSide(ring: Pt[], limit: number, keepBelow: boolean): Pt[] {
  const out: Pt[] = [];
  const inside = (p: Pt) => (keepBelow ? p[0] <= limit : p[0] >= limit);
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % ring.length]!;
    const ia = inside(a);
    const ib = inside(b);
    if (ia) out.push(a);
    if (ia !== ib) {
      const t = (limit - a[0]) / (b[0] - a[0]);
      out.push([limit, a[1] + t * (b[1] - a[1])]);
    }
  }
  return out;
}

function densify(ring: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % ring.length]!;
    out.push(a);
    const steps = Math.floor(
      Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 2
    );
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return out;
}

function simplify(points: Pt[], tolerance: number): Pt[] {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop()!;
    const [ax, ay] = points[start]!;
    const [bx, by] = points[end]!;
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    let max = 0;
    let index = -1;
    for (let i = start + 1; i < end; i++) {
      const [px, py] = points[i]!;
      const d =
        dx || dy
          ? Math.abs(dy * px - dx * py + bx * ay - by * ax) / len
          : Math.hypot(px - ax, py - ay);
      if (d > max) {
        max = d;
        index = i;
      }
    }
    if (max > tolerance && index > 0) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function area(ring: Pt[]): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]!;
    const b = ring[(i + 1) % ring.length]!;
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(sum / 2);
}

function pathOf(ring: Pt[], closed: boolean): string {
  let d = "";
  let px = 0;
  let py = 0;
  ring.forEach(([x, y], i) => {
    const rx = Math.round(x * 10);
    const ry = Math.round(y * 10);
    if (i === 0) d += `M${rx / 10} ${ry / 10}`;
    else if (rx !== px || ry !== py)
      d += `l${(rx - px) / 10} ${(ry - py) / 10}`;
    px = rx;
    py = ry;
  });
  return (closed ? d + "z" : d)
    .replace(/ -/g, "-")
    .replace(/(^|[^\d])0\./g, "$1.");
}

function ringPaths(ring: Position[]): string[] {
  const rel = unwrap(ring);
  const out: string[] = [];
  const min = Math.min(...rel.map((p) => p[0]));
  const max = Math.max(...rel.map((p) => p[0]));
  for (const shift of [-360, 0, 360]) {
    if (max + shift < -180 || min + shift > 180) continue;
    let clipped = rel.map(([x, y]): Pt => [x + shift, y]);
    clipped = clipSide(clipSide(clipped, 180, true), -180, false);
    if (clipped.length < 3) continue;
    const projected = simplify(
      densify(clipped).map(([x, y]) => project(x, y)),
      TOLERANCE
    );
    if (projected.length < 3 || area(projected) < MIN_AREA) continue;
    out.push(pathOf(projected, true));
  }
  return out;
}

function line(points: Pt[]): string {
  return pathOf(
    simplify(
      points.map(([x, y]) => project(x, y)),
      TOLERANCE
    ),
    false
  );
}

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(v);
  return out;
}

function bbox(
  lon0: number,
  lat0: number,
  lon1: number,
  lat1: number
): number[] {
  const rel0 = toRel(lon0);
  let rel1 = toRel(lon1);
  if (rel1 < rel0) rel1 += 360;
  const points = range(0, 1, 0.125).flatMap((u) =>
    range(0, 1, 0.125).map((v) =>
      project(Math.min(180, rel0 + u * (rel1 - rel0)), lat0 + v * (lat1 - lat0))
    )
  );
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return [
    Math.min(...xs),
    Math.min(...ys),
    Math.max(...xs),
    Math.max(...ys),
  ].map((n) => Math.round(n));
}

function contains(rings: Position[][], lon: number, lat: number): boolean {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i] as Pt;
      const [xj, yj] = ring[j] as Pt;
      if (
        yi > lat !== yj > lat &&
        lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
      )
        inside = !inside;
    }
  }
  return inside;
}

function distance(rings: Position[][], lon: number, lat: number): number {
  const k = Math.cos((lat * Math.PI) / 180);
  let min = Infinity;
  for (const ring of rings) {
    for (const [x, y] of ring as Pt[])
      min = Math.min(min, Math.hypot((x - lon) * k, y - lat));
  }
  return min;
}

function countryAt(
  shapes: { id: string; polygons: Position[][][] }[],
  lon: number,
  lat: number
) {
  const inside = shapes.find((shape) =>
    shape.polygons.some((polygon) => contains(polygon, lon, lat))
  );
  if (inside) return inside.id;
  const near = shapes
    .map((shape) => ({
      id: shape.id,
      d: Math.min(
        ...shape.polygons.map((polygon) => distance(polygon, lon, lat))
      ),
    }))
    .sort((a, b) => a.d - b.d)[0];
  return near && near.d < NEAR ? near.id : undefined;
}

type CountryMeta = { name: Localized; timeline: [string, string][] };
const COUNTRIES = (
  countriesFile as unknown as { countries: Record<string, CountryMeta> }
).countries;
const NOTES = (placesFile as PlacesFile).places;

function tone(id: string): string {
  const status =
    COUNTRIES[id]?.timeline
      .filter(([date]) => date <= STATUS_DATE)
      .at(-1)?.[1] ?? "neutral";
  if (status === "allies" || status === "soviet") return "allies";
  if (status === "axis") return "axis";
  if (status.startsWith("occupied")) return "occupied";
  return "neutral";
}

const REGIONS: Record<string, [number, number, number, number]> = {
  west: [-11, 36, 20, 62],
  east: [12, 42, 52, 62],
  med: [-12, 22, 40, 46],
  pacific: [100, -18, -150, 42],
  asia: [92, 0, 146, 46],
};

const LABELS: [string, number, number][] = [
  ["atlantic", -38, 30],
  ["pacific", 168, 22],
  ["indian", 76, -22],
  ["europe", 18, 57],
  ["ussr", 80, 62],
  ["africa", 20, 6],
  ["china", 103, 36],
  ["americas", -100, 46],
];

function build() {
  const topology = borders as unknown as Topology<{
    countries: GeometryCollection<{ id: string }>;
  }>;
  const collection = feature(topology, topology.objects.countries);
  const tones: Record<string, string[]> = {
    allies: [],
    axis: [],
    occupied: [],
    neutral: [],
  };
  const shapes: { id: string; polygons: Position[][][] }[] = [];

  for (const country of collection.features as Feature<
    Polygon | MultiPolygon,
    { id: string }
  >[]) {
    if (!country.geometry) continue;
    const polygons =
      country.geometry.type === "Polygon"
        ? [country.geometry.coordinates]
        : country.geometry.coordinates;
    shapes.push({ id: country.properties.id, polygons });
    const bucket = tones[tone(country.properties.id)]!;
    for (const polygon of polygons)
      for (const ring of polygon) bucket.push(...ringPaths(ring));
  }

  const graticule = [
    ...range(-150, 150, 30).map((rel) =>
      line(range(-90, 90, 2).map((lat): Pt => [rel, lat]))
    ),
    ...range(-60, 60, 30).map((lat) =>
      line(range(-180, 180, 2).map((rel): Pt => [rel, lat]))
    ),
  ].join("");
  const outline = pathOf(
    [
      ...range(-90, 90, 2).map((lat) => project(180, lat)),
      ...range(-90, 90, 2).map((lat) => project(-180, -lat)),
    ],
    true
  );

  const en = allTitleCards("en");
  const es = allTitleCards("es");
  const titleIndex = new Map<string, number>();
  const titles: Record<string, unknown>[] = [];
  const countryNames: Record<string, [string, string]> = {};
  const places: Record<string, unknown> = {};

  for (const place of allPlaces("en")) {
    const [lon, lat] = place.coordinates;
    const [x, y] = projectLonLat(lon, lat);
    const here = en
      .map((card, i) => ({ card, i }))
      .filter(({ card }) => card.stops.some((stop) => stop.place === place.id))
      .sort(
        (a, b) =>
          Number(b.card.gold) - Number(a.card.gold) || a.card.year - b.card.year
      );
    const counts = ERAS.map(
      (era) => here.filter(({ card }) => card.era === era).length
    );
    const dominant = ERAS[counts.indexOf(Math.max(...counts))]!;
    const country = countryAt(shapes, lon, lat);
    const aliases = NOTES[place.id]?.aliases;
    if (country && COUNTRIES[country]) {
      countryNames[country] = [
        COUNTRIES[country].name.en,
        COUNTRIES[country].name.es,
      ];
    }
    places[place.id] = {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      e: dominant,
      n: counts,
      ...(country && COUNTRIES[country] ? { c: country } : {}),
      t: here.map(({ card, i }) => {
        let index = titleIndex.get(card.id);
        if (index === undefined) {
          const local = es[i]!;
          index = titles.length;
          titleIndex.set(card.id, index);
          titles.push({
            t:
              local.title === card.title
                ? [card.title]
                : [card.title, local.title],
            y: card.year,
            e: card.era,
            k: card.kind,
            ...(card.gold ? { g: 1 } : {}),
            ...(card.poster ? { p: card.poster } : {}),
            ...(local.poster && local.poster !== card.poster
              ? { pe: local.poster }
              : {}),
          });
        }
        return index;
      }),
      ...(aliases?.length ? { a: aliases } : {}),
    };
  }

  return {
    w: WIDTH,
    h: HEIGHT,
    land: Object.entries(tones).map(([id, paths]) => ({
      id,
      d: paths.join(""),
    })),
    graticule,
    outline,
    regions: {
      world: [
        0,
        Math.round(project(0, 84)[1]),
        WIDTH,
        Math.round(project(0, -58)[1]),
      ],
      ...Object.fromEntries(
        Object.entries(REGIONS).map(([id, [lon0, lat0, lon1, lat1]]) => [
          id,
          bbox(lon0, lat0, lon1, lat1),
        ])
      ),
    },
    labels: LABELS.map(([id, lon, lat]) => {
      const [x, y] = projectLonLat(lon, lat);
      return { id, x: Math.round(x), y: Math.round(y) };
    }),
    countries: countryNames,
    titles,
    places,
  };
}

export default defineEventHandler((event) => {
  setHeader(event, "content-type", "application/json; charset=utf-8");
  return JSON.stringify(build());
});
