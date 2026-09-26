// Usage: bun scripts/geo/build-borders.ts           (regenerate public/geo + data/geo)
//        bun scripts/geo/build-borders.ts --check   (validate the committed outputs)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  BORROWS,
  DROP_NAMES,
  EMPTY_DROP_BELOW_LAT,
  EMPTY_NEAREST_MAX_DEG,
  EMPTY_OVERRIDES,
  ISLANDS,
  ISLAND_NEAR_DEG,
  LICENSE_URL,
  NAME_TO_ID,
  PART_SPLITS,
  SOURCE_URL,
  YEARS,
  YEAR_NAME_TO_ID,
  type Box,
  type Year,
} from "./sources";
import {
  COUNTRIES,
  STATUSES,
  resolveTimeline,
  statusAt,
  type Entry,
} from "./countries";

const ROOT = join(import.meta.dir, "../..");
const SRC_DIR = "/tmp/hb";
const WORK_DIR = "/tmp/ww2-geo";
const TOOLS_DIR = "/tmp/ww2-geo-tools";
const MAPSHAPER_VERSION = "0.7.67";
const MAPSHAPER = join(TOOLS_DIR, "node_modules/.bin/mapshaper");
const GEO_OUT = join(ROOT, "public/geo");
const COUNTRIES_OUT = join(ROOT, "data/geo/countries.json");
const LICENSE_OUT = join(GEO_OUT, "LICENSE-historical-basemaps.txt");
const MAX_BYTES = 220 * 1024;
const TARGET_BYTES = 214 * 1024;
const INTERVALS_M = [1000, 1500, 2000, 2500, 3000, 4000, 5000, 6500, 8000];
const LABEL_PRIORITY: Year[] = ["1938", "1945", "1930", "1920", "1914"];
const SETS: Record<Year, { from: string; to: string }> = {
  "1914": { from: "1914-01", to: "1918-11" },
  "1920": { from: "1918-12", to: "1929-12" },
  "1930": { from: "1930-01", to: "1937-12" },
  "1938": { from: "1938-01", to: "1945-08" },
  "1945": { from: "1945-09", to: "1945-12" },
};
const SPOT_DATES = [
  "1916-07-15",
  "1938-10-15",
  "1941-11-15",
  "1942-11-15",
  "1944-08-15",
  "1945-05-15",
];
const SPOT_IDS = [
  "germany",
  "france",
  "uk",
  "italy",
  "russia",
  "ussr",
  "usa",
  "japan",
  "china",
  "poland",
  "spain",
  "brazil",
  "mexico",
  "argentina",
];

type Ring = number[][];
type Polygon = Ring[];
type Feature = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: any } | null;
};
type Collection = { type: "FeatureCollection"; features: Feature[] };

function polygonsOf(geometry: Feature["geometry"]): Polygon[] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function ringCenter(ring: Ring): [number, number] {
  let x = 0;
  let y = 0;
  for (const [px, py] of ring) {
    x += px!;
    y += py!;
  }
  return [x / ring.length, y / ring.length];
}

function inBox([x, y]: [number, number], [x0, y0, x1, y1]: Box): boolean {
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function inRing([x, y]: [number, number], ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    if (
      yi! > y !== yj! > y &&
      x < ((xj! - xi!) * (y - yi!)) / (yj! - yi!) + xi!
    )
      inside = !inside;
  }
  return inside;
}

function inPolygons(point: [number, number], polygons: Polygon[]): boolean {
  return polygons.some(
    (poly) =>
      inRing(point, poly[0]!) && !poly.slice(1).some((h) => inRing(point, h))
  );
}

function nearDistance(point: [number, number], polygons: Polygon[]): number {
  let best = Infinity;
  const k = Math.cos((point[1] * Math.PI) / 180);
  for (const poly of polygons)
    for (const ring of poly)
      for (const [x, y] of ring) {
        const d = Math.hypot((x! - point[0]) * k, y! - point[1]);
        if (d < best) best = d;
      }
  return best;
}

function islandPresent(point: [number, number], polygons: Polygon[]): boolean {
  return (
    inPolygons(point, polygons) ||
    nearDistance(point, polygons) <= ISLAND_NEAR_DEG
  );
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function run(cmd: string[], cwd = ROOT): string {
  const res = Bun.spawnSync(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
  if (res.exitCode !== 0)
    throw new Error(
      `${cmd.join(" ")} failed:\n${res.stderr.toString()}${res.stdout.toString()}`
    );
  return res.stderr.toString() + res.stdout.toString();
}

async function download(url: string, path: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: HTTP ${res.status}`);
  writeFileSync(path, await res.text());
}

async function ensureInputs() {
  mkdirSync(SRC_DIR, { recursive: true });
  for (const year of YEARS) {
    const path = join(SRC_DIR, `world_${year}.geojson`);
    if (!existsSync(path))
      await download(`${SOURCE_URL}/world_${year}.geojson`, path);
  }
  const license = join(SRC_DIR, "LICENSE");
  if (!existsSync(license)) await download(LICENSE_URL, license);
  if (!existsSync(MAPSHAPER)) {
    mkdirSync(TOOLS_DIR, { recursive: true });
    writeFileSync(
      join(TOOLS_DIR, "package.json"),
      JSON.stringify({ name: "ww2-geo-tools", private: true })
    );
    run(["bun", "add", `mapshaper@${MAPSHAPER_VERSION}`], TOOLS_DIR);
  }
  const version = run([MAPSHAPER, "-v"]).trim();
  if (version !== MAPSHAPER_VERSION)
    throw new Error(`mapshaper ${version} != pinned ${MAPSHAPER_VERSION}`);
}

function sourceOf(year: Year): Collection {
  return readJson<Collection>(join(SRC_DIR, `world_${year}.geojson`));
}

function idForName(year: Year, name: string): string {
  const id = YEAR_NAME_TO_ID[year]?.[name] ?? NAME_TO_ID[name];
  if (!id) throw new Error(`${year}: no country id for source NAME "${name}"`);
  return id;
}

function tagYear(year: Year): { tagged: Collection; log: string[] } {
  const log: string[] = [];
  const named: Feature[] = [];
  const empty: Polygon[] = [];
  for (const feature of sourceOf(year).features) {
    const name = String(feature.properties.NAME ?? "").trim();
    if (DROP_NAMES.has(name)) continue;
    const polygons = polygonsOf(feature.geometry);
    if (!name) {
      empty.push(...polygons);
      continue;
    }
    const id = idForName(year, name);
    for (const poly of polygons) {
      const center = ringCenter(poly[0]!);
      const split = PART_SPLITS.find(
        (s) => s.years.includes(year) && s.from === id && inBox(center, s.box)
      );
      named.push({
        type: "Feature",
        properties: { id: split ? split.to : id },
        geometry: { type: "Polygon", coordinates: poly },
      });
    }
  }
  const byId = new Map<string, Polygon[]>();
  for (const f of named) {
    const id = f.properties.id as string;
    byId.set(id, [...(byId.get(id) ?? []), ...polygonsOf(f.geometry)]);
  }
  for (const poly of empty) {
    const center = ringCenter(poly[0]!);
    if (center[1] < EMPTY_DROP_BELOW_LAT) continue;
    let id = EMPTY_OVERRIDES.find(
      (o) => o.years.includes(year) && inBox(center, o.box)
    )?.id;
    if (!id) {
      let best = Infinity;
      for (const [candidate, polys] of byId) {
        const d = nearDistance(center, polys);
        if (d < best) {
          best = d;
          id = candidate;
        }
      }
      if (best > EMPTY_NEAREST_MAX_DEG) {
        log.push(
          `dropped unnamed polygon at ${center.map((v) => v.toFixed(1))}`
        );
        continue;
      }
    }
    named.push({
      type: "Feature",
      properties: { id: id! },
      geometry: { type: "Polygon", coordinates: poly },
    });
  }
  return { tagged: { type: "FeatureCollection", features: named }, log };
}

function borrowLayer(year: Year) {
  const rules = BORROWS.filter((b) => b.year === year);
  return rules.map((rule) => {
    const features = sourceOf(rule.fromYear).features.filter((f) =>
      rule.names.includes(String(f.properties.NAME ?? "").trim())
    );
    if (!features.length)
      throw new Error(`${year}: borrow ${rule.id} found no source features`);
    const layer = `borrow_${rule.id.replace(/-/g, "_")}`;
    const path = join(WORK_DIR, year, `${layer}.json`);
    writeFileSync(
      path,
      JSON.stringify({
        type: "FeatureCollection",
        features: features.map((f) => ({
          type: "Feature",
          properties: { id: rule.id },
          geometry: f.geometry,
        })),
      })
    );
    return { rule, layer, path };
  });
}

function mapshaperArgs(year: Year, intervalM: number, outputs: string[]) {
  const dir = join(WORK_DIR, year);
  const borrows = borrowLayer(year);
  const args = [
    MAPSHAPER,
    "-i",
    join(dir, "base.json"),
    ...borrows.map((b) => b.path),
    "combine-files",
  ];
  for (const { rule, layer } of borrows) {
    if (!rule.host) continue;
    const host = `host_${layer}`;
    args.push(
      "-filter",
      `id == ${JSON.stringify(rule.host)}`,
      "target=base",
      "+",
      `name=${host}`,
      "-clip",
      `target=${layer}`,
      host,
      "-erase",
      "target=base",
      layer,
      "-drop",
      `target=${host}`
    );
  }
  args.push(
    "-merge-layers",
    `target=base${borrows.map((b) => `,${b.layer}`).join("")}`,
    "force",
    "name=countries",
    "-clean",
    "overlap-rule=min-area",
    "-explode",
    "-simplify",
    `interval=${intervalM}m`,
    "keep-shapes",
    "-dissolve",
    "id",
    ...outputs
  );
  return args;
}

function buildYear(year: Year) {
  const dir = join(WORK_DIR, year);
  mkdirSync(dir, { recursive: true });
  const { tagged, log } = tagYear(year);
  writeFileSync(join(dir, "base.json"), JSON.stringify(tagged));
  const topoPath = join(dir, "countries.topojson");
  let chosen = 0;
  for (const interval of INTERVALS_M) {
    run(
      mapshaperArgs(year, interval, [
        "-o",
        topoPath,
        "format=topojson",
        "quantization=100000",
        "force",
      ])
    );
    if (Bun.file(topoPath).size <= TARGET_BYTES) {
      chosen = interval;
      break;
    }
  }
  if (!chosen) throw new Error(`${year}: no interval fits ${TARGET_BYTES} B`);
  const geoPath = join(dir, "countries.geojson");
  const labelPath = join(dir, "labels.geojson");
  run(
    mapshaperArgs(year, chosen, [
      "-o",
      geoPath,
      "format=geojson",
      "precision=0.0001",
      "force",
      "-points",
      "inner",
      "-o",
      labelPath,
      "format=geojson",
      "precision=0.01",
      "force",
    ])
  );
  const topo = readFileSync(topoPath, "utf8");
  writeFileSync(join(GEO_OUT, `borders-${year}.json`), topo);
  return {
    year,
    interval: chosen,
    log,
    source: tagged,
    output: readJson<Collection>(geoPath),
    labels: readJson<Collection>(labelPath),
  };
}

function islandReport(
  year: Year,
  source: Collection,
  output: Collection
): { lost: string[]; missing: string[] } {
  const srcPolys = source.features.flatMap((f) => polygonsOf(f.geometry));
  const outPolys = output.features.flatMap((f) => polygonsOf(f.geometry));
  const lost: string[] = [];
  const missing: string[] = [];
  for (const [name, point] of Object.entries(ISLANDS)) {
    if (islandPresent(point, outPolys)) continue;
    missing.push(name);
    if (islandPresent(point, srcPolys)) lost.push(`${year} ${name}`);
  }
  return { lost, missing };
}

function buildCountries(
  labelsByYear: Map<Year, Map<string, [number, number]>>
) {
  const countries: Record<string, unknown> = {};
  for (const id of Object.keys(COUNTRIES).sort()) {
    const spec = COUNTRIES[id]!;
    const entry: Record<string, unknown> = {
      name: { en: spec.en, es: spec.es },
    };
    if (spec.rank) {
      const year = LABEL_PRIORITY.find((y) => labelsByYear.get(y)?.has(id));
      if (!year) throw new Error(`no label point for ranked country ${id}`);
      entry.label = labelsByYear.get(year)!.get(id);
      entry.labelRank = spec.rank;
    }
    entry.timeline = resolveTimeline(id);
    countries[id] = entry;
  }
  return { sets: SETS, statuses: STATUSES, countries };
}

function gzipSize(path: string): number {
  return Bun.gzipSync(readFileSync(path)).length;
}

type Topology = {
  type: "Topology";
  transform?: { scale: [number, number]; translate: [number, number] };
  arcs: number[][][];
  objects: Record<
    string,
    {
      type: string;
      geometries: {
        type: string;
        arcs?: any;
        properties?: Record<string, unknown>;
      }[];
    }
  >;
};

function decodeTopology(topo: Topology): Map<string, Polygon[]> {
  const t = topo.transform;
  const arcs = topo.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => {
      if (!t) return [dx!, dy!];
      x += dx!;
      y += dy!;
      return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]];
    });
  });
  const ring = (refs: number[]): Ring =>
    refs.flatMap((ref, i) => {
      const arc = ref < 0 ? [...arcs[~ref]!].reverse() : arcs[ref]!;
      return i === 0 ? arc : arc.slice(1);
    });
  const out = new Map<string, Polygon[]>();
  for (const g of topo.objects.countries?.geometries ?? []) {
    const id = String(g.properties?.id ?? "");
    const polys: Polygon[] =
      g.type === "Polygon"
        ? [g.arcs.map(ring)]
        : g.type === "MultiPolygon"
          ? g.arcs.map((p: number[][]) => p.map(ring))
          : [];
    out.set(id, [...(out.get(id) ?? []), ...polys]);
  }
  return out;
}

function check(): string[] {
  const errors: string[] = [];
  const data = readJson<{
    sets: Record<string, { from: string; to: string }>;
    statuses: string[];
    countries: Record<
      string,
      {
        name?: { en?: string; es?: string };
        label?: [number, number];
        labelRank?: number;
        timeline: Entry[];
      }
    >;
  }>(COUNTRIES_OUT);
  const known = new Set(Object.keys(data.countries));
  const used = new Set<string>();
  const decoded = new Map<Year, Map<string, Polygon[]>>();
  for (const year of YEARS) {
    const path = join(GEO_OUT, `borders-${year}.json`);
    if (!existsSync(path)) {
      errors.push(`missing ${path}`);
      continue;
    }
    const size = Bun.file(path).size;
    if (size > MAX_BYTES)
      errors.push(`borders-${year}.json is ${size} B > ${MAX_BYTES} B`);
    const topo = readJson<Topology>(path);
    if (!topo.objects.countries)
      errors.push(`borders-${year}.json has no "countries" object`);
    for (const g of topo.objects.countries?.geometries ?? []) {
      const keys = Object.keys(g.properties ?? {});
      if (keys.length !== 1 || keys[0] !== "id")
        errors.push(`${year}: geometry properties must be {id}, got ${keys}`);
    }
    const shapes = decodeTopology(topo);
    decoded.set(year, shapes);
    for (const id of shapes.keys()) {
      used.add(id);
      if (!known.has(id))
        errors.push(`${year}: id "${id}" missing in countries.json`);
    }
  }
  for (const id of known)
    if (!used.has(id))
      errors.push(`countries.json id "${id}" unused in borders`);
  const statuses = new Set(data.statuses);
  for (const s of STATUSES)
    if (!statuses.has(s)) errors.push(`statuses list lacks "${s}"`);
  for (const [id, c] of Object.entries(data.countries)) {
    if (!c.name?.en || !c.name?.es) errors.push(`${id}: missing name en/es`);
    let prev = "";
    for (const [date, status] of c.timeline) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
        errors.push(`${id}: bad date ${date}`);
      if (date <= prev) errors.push(`${id}: timeline unsorted at ${date}`);
      if (!statuses.has(status)) errors.push(`${id}: unknown status ${status}`);
      prev = date;
    }
    if (c.label) {
      const polys = [...decoded.values()]
        .map((shapes) => shapes.get(id))
        .filter((p): p is Polygon[] => !!p);
      if (!polys.some((p) => inPolygons(c.label!, p)))
        errors.push(`${id}: label ${c.label} is outside every polygon`);
    }
  }
  return errors;
}

function spotTable(): string {
  const header = ["id", ...SPOT_DATES.map((d) => d.slice(0, 7))];
  const rows = SPOT_IDS.map((id) => [
    id,
    ...SPOT_DATES.map((d) => statusAt(resolveTimeline(id), d)),
  ]);
  return [header, ...rows].map((r) => `| ${r.join(" | ")} |`).join("\n");
}

async function build() {
  await ensureInputs();
  mkdirSync(GEO_OUT, { recursive: true });
  mkdirSync(join(ROOT, "data/geo"), { recursive: true });
  const labelsByYear = new Map<Year, Map<string, [number, number]>>();
  const lost: string[] = [];
  for (const year of YEARS) {
    const result = buildYear(year);
    const labels = new Map<string, [number, number]>();
    for (const f of result.labels.features) {
      const c = f.geometry?.coordinates as [number, number] | undefined;
      if (c) labels.set(String(f.properties.id), c);
    }
    labelsByYear.set(year, labels);
    const islands = islandReport(year, result.source, result.output);
    lost.push(...islands.lost);
    const path = join(GEO_OUT, `borders-${year}.json`);
    console.log(
      `${year}: ${Bun.file(path).size} B raw, ${gzipSize(path)} B gzip, ` +
        `${result.output.features.length} ids, interval ${result.interval} m`
    );
    console.log(`  islands absent: ${islands.missing.join(", ") || "none"}`);
    for (const line of result.log) console.log(`  ${line}`);
  }
  if (lost.length) throw new Error(`islands lost by simplification: ${lost}`);
  writeFileSync(
    COUNTRIES_OUT,
    JSON.stringify(buildCountries(labelsByYear), null, 2) + "\n"
  );
  run([join(ROOT, "node_modules/.bin/prettier"), "--write", COUNTRIES_OUT]);
  writeFileSync(
    LICENSE_OUT,
    [
      "Historical borders in public/geo/borders-*.json are derived from",
      "aourednik/historical-basemaps (https://github.com/aourednik/historical-basemaps),",
      "files geojson/world_{1914,1920,1930,1938,1945}.geojson.",
      "The data was re-keyed to country ids, dissolved, simplified and",
      "quantized to TopoJSON by scripts/geo/build-borders.ts.",
      "It is distributed under the GNU General Public License v3.0, reproduced below.",
      "",
      "------------------------------------------------------------------------",
      "",
      readFileSync(join(SRC_DIR, "LICENSE"), "utf8"),
    ].join("\n")
  );
  console.log(`\n${spotTable()}`);
}

if (process.argv.includes("--check")) {
  const errors = check();
  for (const e of errors) console.error(`error: ${e}`);
  if (errors.length) process.exit(1);
  console.log(`geo check ok\n\n${spotTable()}`);
} else {
  await build();
  const errors = check();
  for (const e of errors) console.error(`error: ${e}`);
  if (errors.length) process.exit(1);
}
