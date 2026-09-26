// Usage: bun scripts/data/validate.ts            (all data files)
//        bun scripts/data/validate.ts data/titles/ww1.json data/operations/europe.json
// Exits 1 on any error; warnings are printed but do not fail.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type {
  EventsFile,
  OperationsFile,
  Title,
  TitlesFile,
} from "../../types/data";

const ROOT = join(import.meta.dir, "../..");
const ERA = ["ww1", "interwar", "ww2"];
const THEATERS = [
  "western-europe",
  "eastern-europe",
  "mediterranean",
  "atlantic",
  "pacific",
  "asia",
  "americas",
];
const TAGS = [
  "combat",
  "holocaust",
  "resistance",
  "espionage",
  "air",
  "naval",
  "home-front",
  "prisoners",
  "civil-war",
  "politics",
  "biography",
  "true-story",
  "animation",
  "documentary",
  "comedy",
  "romance",
];
const STOP_KINDS = [
  "battle",
  "city",
  "front",
  "camp",
  "sea",
  "landing",
  "base",
  "home",
  "journey",
];
const CATEGORIES = [
  "war",
  "battle",
  "politics",
  "diplomacy",
  "holocaust",
  "home-front",
  "technology",
  "naval",
  "air",
];
const FACTIONS = [
  "entente",
  "central",
  "allies",
  "axis",
  "soviet",
  "republican",
  "nationalist",
  "neutral",
];
const UNITS = [
  "tank",
  "infantry",
  "ship",
  "carrier",
  "submarine",
  "fighter",
  "bomber",
];
const ERA_RANGE: Record<string, [string, string]> = {
  ww1: ["1914-06", "1919-06"],
  interwar: ["1917-01", "1939-09"],
  ww2: ["1937-07", "1945-12"],
};

const errors: string[] = [];
const warnings: string[] = [];
const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`);
const warn = (where: string, msg: string) => warnings.push(`${where}: ${msg}`);

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^(\d{4})(-(0[1-9]|1[0-2]))?(-(0[1-9]|[12]\d|3[01]))?$/;

function monthKey(date: string): string {
  const [y, m = "01"] = date.split("-");
  return `${y}-${m}`;
}

function checkDate(where: string, value: unknown): value is string {
  if (typeof value !== "string" || !DATE.test(value)) {
    err(where, `invalid date ${JSON.stringify(value)}`);
    return false;
  }
  const year = Number(value.slice(0, 4));
  if (year < 1900 || year > 1950)
    warn(where, `date ${value} outside 1900-1950`);
  return true;
}

function checkText(where: string, value: unknown, min: number, max: number) {
  if (typeof value !== "string" || value.trim().length === 0) {
    err(where, "missing text");
    return;
  }
  if (value.length < min) warn(where, `short text (${value.length} < ${min})`);
  if (value.length > max) warn(where, `long text (${value.length} > ${max})`);
  if (/\s{2,}|^\s|\s$/.test(value)) warn(where, "stray whitespace");
}

function checkLocalized(where: string, value: any, min: number, max: number) {
  if (!value || typeof value !== "object") {
    err(where, "missing {en, es}");
    return;
  }
  checkText(`${where}.en`, value.en, min, max);
  checkText(`${where}.es`, value.es, min, max);
  if (value.en && value.en === value.es && value.en.length > 20)
    warn(where, "Spanish text equals English text");
}

function checkCoords(where: string, value: unknown) {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    !value.every((n) => typeof n === "number" && Number.isFinite(n))
  ) {
    err(where, `invalid coordinates ${JSON.stringify(value)}`);
    return;
  }
  const [lon, lat] = value as [number, number];
  if (lon < -180 || lon > 180) err(where, `longitude ${lon} out of range`);
  if (lat < -85 || lat > 85) err(where, `latitude ${lat} out of range`);
}

function checkUrl(
  where: string,
  value: unknown,
  prefix: string,
  required: boolean
) {
  if (value == null) {
    if (required) err(where, "missing URL");
    return;
  }
  if (typeof value !== "string" || !value.startsWith(prefix))
    err(where, `URL must start with ${prefix}`);
}

function readJson<T>(path: string): T | undefined {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (e) {
    err(path, `invalid JSON: ${(e as Error).message}`);
    return undefined;
  }
}

const seenIds = new Map<string, string>();
const seenTmdb = new Map<string, string>();

function checkTitle(file: string, t: Title) {
  const w = `${file} ${t.id ?? "?"}`;
  if (!t.id || !/^[a-z0-9]+(-[a-z0-9]+)*-\d{4}$/.test(t.id))
    err(w, "id must be kebab-case ending in the release year");
  if (seenIds.has(t.id)) err(w, `duplicate id (also in ${seenIds.get(t.id)})`);
  seenIds.set(t.id, file);
  if (!["film", "series"].includes(t.kind)) err(w, "kind must be film|series");
  checkText(`${w}.title`, t.title, 1, 120);
  checkText(`${w}.titleEs`, t.titleEs, 1, 140);
  if (!Number.isInteger(t.year) || t.year < 1915 || t.year > 2026)
    err(w, `year ${t.year} out of range`);
  if (t.id && t.year && !t.id.endsWith(String(t.year)))
    err(w, "id year must match release year");
  if (t.endYear != null && t.endYear < t.year) err(w, "endYear < year");
  if (t.kind === "series" && t.seasons == null)
    warn(w, "series without seasons");
  if (!ERA.includes(t.era)) err(w, `era ${t.era}`);
  if (
    checkDate(`${w}.period.start`, t.period?.start) &&
    checkDate(`${w}.period.end`, t.period?.end)
  ) {
    if (monthKey(t.period.start) > monthKey(t.period.end))
      err(w, "period start after end");
    const range = ERA_RANGE[t.era];
    if (
      range &&
      (monthKey(t.period.end) < range[0] || monthKey(t.period.start) > range[1])
    )
      warn(
        w,
        `period ${t.period.start}..${t.period.end} does not overlap era ${t.era}`
      );
  }
  if (!Array.isArray(t.theaters) || t.theaters.length === 0)
    err(w, "theaters empty");
  t.theaters?.forEach(
    (x) => THEATERS.includes(x) || err(w, `unknown theater ${x}`)
  );
  if (!Array.isArray(t.tags) || t.tags.length === 0) err(w, "tags empty");
  t.tags?.forEach((x) => TAGS.includes(x) || err(w, `unknown tag ${x}`));
  if (typeof t.gold !== "boolean") err(w, "gold must be boolean");
  if (t.gold) checkLocalized(`${w}.goldReason`, t.goldReason, 20, 220);
  if (!t.directors?.length) err(w, "directors empty");
  if (!t.countries?.length) err(w, "countries empty");
  t.countries?.forEach(
    (c) => /^[A-Z]{2}$/.test(c) || err(w, `country ${c} must be ISO alpha-2`)
  );
  if (!t.languages?.length) err(w, "languages empty");
  t.languages?.forEach(
    (l) => /^[a-z]{2,3}$/.test(l) || err(w, `language ${l} must be ISO 639`)
  );
  if (!Number.isInteger(t.ids?.tmdb) || t.ids.tmdb <= 0)
    err(w, "ids.tmdb must be a positive integer");
  if (!["movie", "tv"].includes(t.ids?.tmdbType))
    err(w, "ids.tmdbType must be movie|tv");
  if (t.kind === "series" && t.ids?.tmdbType !== "tv")
    warn(w, "series usually has tmdbType tv");
  if (!/^tt\d{7,8}$/.test(t.ids?.imdb ?? ""))
    err(w, "ids.imdb must look like tt1234567");
  if (t.ids?.wikidata && !/^Q\d+$/.test(t.ids.wikidata))
    err(w, "ids.wikidata must look like Q123");
  const tmdbKey = `${t.ids?.tmdbType}:${t.ids?.tmdb}`;
  if (seenTmdb.has(tmdbKey))
    err(w, `duplicate TMDB ${tmdbKey} (also ${seenTmdb.get(tmdbKey)})`);
  seenTmdb.set(tmdbKey, t.id);
  checkUrl(
    `${w}.links.wikipediaEn`,
    t.links?.wikipediaEn,
    "https://en.wikipedia.org/wiki/",
    true
  );
  checkUrl(
    `${w}.links.wikipediaEs`,
    t.links?.wikipediaEs,
    "https://es.wikipedia.org/wiki/",
    false
  );
  checkUrl(`${w}.links.fandom`, t.links?.fandom, "https://", false);
  checkUrl(`${w}.links.official`, t.links?.official, "https://", false);
  checkLocalized(`${w}.synopsis`, t.synopsis, 80, 420);
  const h = t.history;
  if (!h || !Array.isArray(h.en) || !Array.isArray(h.es) || h.en.length === 0) {
    err(w, "history needs en[] and es[]");
  } else {
    if (h.en.length !== h.es.length)
      err(w, "history en/es paragraph counts differ");
    if (h.en.length > 3) warn(w, "more than 3 history paragraphs");
    h.en.forEach((p, i) => checkText(`${w}.history.en[${i}]`, p, 150, 900));
    h.es.forEach((p, i) => checkText(`${w}.history.es[${i}]`, p, 150, 1000));
  }
  if (!Array.isArray(t.journey) || t.journey.length === 0) {
    err(w, "journey empty");
    return;
  }
  const primaries = t.journey.filter((s) => s.primary).length;
  if (primaries !== 1)
    err(w, `journey needs exactly one primary stop (has ${primaries})`);
  let prev = "";
  t.journey.forEach((s, i) => {
    const sw = `${w}.journey[${i}]`;
    if (!s.place || !KEBAB.test(s.place)) err(sw, "place must be kebab-case");
    checkLocalized(`${sw}.name`, s.name, 2, 80);
    checkCoords(`${sw}.coordinates`, s.coordinates);
    if (checkDate(`${sw}.date`, s.date)) {
      const m = monthKey(s.date);
      if (prev && m < prev)
        warn(sw, `date ${s.date} earlier than previous stop`);
      prev = m;
    }
    if (!STOP_KINDS.includes(s.kind)) err(sw, `unknown kind ${s.kind}`);
    checkLocalized(`${sw}.story`, s.story, 30, 320);
    if (s.history) checkLocalized(`${sw}.history`, s.history, 30, 320);
  });
}

function checkTitles(path: string) {
  const data = readJson<TitlesFile>(path);
  if (!data) return;
  if (!Array.isArray(data.titles)) return err(path, "missing titles[]");
  data.titles.forEach((t) => checkTitle(path, t));
  console.log(`${path}: ${data.titles.length} titles`);
}

function checkEvents(path: string) {
  const data = readJson<EventsFile>(path);
  if (!data) return;
  const ids = new Set<string>();
  data.events.forEach((e) => {
    const w = `${path} ${e.id}`;
    if (!KEBAB.test(e.id ?? "")) err(w, "id must be kebab-case");
    if (ids.has(e.id)) err(w, "duplicate id");
    ids.add(e.id);
    checkDate(`${w}.date`, e.date);
    if (e.endDate) checkDate(`${w}.endDate`, e.endDate);
    if (!ERA.includes(e.era)) err(w, `era ${e.era}`);
    if (!CATEGORIES.includes(e.category)) err(w, `category ${e.category}`);
    checkLocalized(`${w}.title`, e.title, 3, 90);
    checkLocalized(`${w}.summary`, e.summary, 60, 480);
    if (e.coordinates) checkCoords(`${w}.coordinates`, e.coordinates);
    if (e.place) checkLocalized(`${w}.place`, e.place, 2, 80);
    checkUrl(
      `${w}.wikipediaEn`,
      e.wikipediaEn,
      "https://en.wikipedia.org/wiki/",
      true
    );
    checkUrl(
      `${w}.wikipediaEs`,
      e.wikipediaEs,
      "https://es.wikipedia.org/wiki/",
      false
    );
  });
  console.log(`${path}: ${data.events.length} events`);
}

function checkOperations(path: string) {
  const data = readJson<OperationsFile>(path);
  if (!data) return;
  const ids = new Set<string>();
  data.operations.forEach((o) => {
    const w = `${path} ${o.id}`;
    if (!KEBAB.test(o.id ?? "")) err(w, "id must be kebab-case");
    if (ids.has(o.id)) err(w, "duplicate id");
    ids.add(o.id);
    if (!ERA.includes(o.era)) err(w, `era ${o.era}`);
    checkLocalized(`${w}.name`, o.name, 3, 90);
    checkLocalized(`${w}.summary`, o.summary, 40, 360);
    if (!FACTIONS.includes(o.faction)) err(w, `faction ${o.faction}`);
    if (!UNITS.includes(o.unit)) err(w, `unit ${o.unit}`);
    if (!Number.isInteger(o.count) || o.count < 1 || o.count > 6)
      err(w, "count must be 1-6");
    if (
      checkDate(`${w}.start`, o.start) &&
      checkDate(`${w}.end`, o.end) &&
      o.start > o.end
    )
      err(w, "start after end");
    if (!Array.isArray(o.path) || o.path.length < 2)
      err(w, "path needs 2+ points");
    o.path?.forEach((p, i) => checkCoords(`${w}.path[${i}]`, p));
  });
  data.frontlines.forEach((f) => {
    const w = `${path} frontline ${f.id}`;
    if (!KEBAB.test(f.id ?? "")) err(w, "id must be kebab-case");
    checkLocalized(`${w}.name`, f.name, 3, 90);
    let prev = "";
    f.snapshots.forEach((s, i) => {
      if (checkDate(`${w}.snapshots[${i}].date`, s.date)) {
        if (prev && s.date < prev) err(w, "snapshots must be sorted by date");
        prev = s.date;
      }
      if (!Array.isArray(s.line) || s.line.length < 2)
        err(w, `snapshot ${i} needs 2+ points`);
      s.line?.forEach((p, j) =>
        checkCoords(`${w}.snapshots[${i}].line[${j}]`, p)
      );
    });
  });
  console.log(
    `${path}: ${data.operations.length} operations, ${data.frontlines.length} frontlines`
  );
}

const args = process.argv.slice(2);
const jsonFiles = (dir: string) =>
  existsSync(join(ROOT, dir))
    ? readdirSync(join(ROOT, dir))
        .filter((f) => f.endsWith(".json") && !f.startsWith("._"))
        .map((f) => join(ROOT, dir, f))
    : [];
const all = [
  ...jsonFiles("data/titles"),
  join(ROOT, "data/events.json"),
  ...jsonFiles("data/operations"),
];
const targets = args.length ? args.map((a) => join(ROOT, a)) : all;

// Duplicate detection needs every title file even when validating one.
if (args.length) {
  all
    .filter((p) => p.includes("/titles/") && !targets.includes(p))
    .forEach((p) => {
      const data = readJson<TitlesFile>(p);
      data?.titles?.forEach((t) => {
        seenIds.set(t.id, p);
        seenTmdb.set(`${t.ids?.tmdbType}:${t.ids?.tmdb}`, t.id);
      });
    });
}

for (const path of targets) {
  if (!existsSync(path)) {
    if (args.length) err(path, "file not found");
    continue;
  }
  if (path.includes("/titles/")) checkTitles(path);
  else if (path.endsWith("events.json")) checkEvents(path);
  else if (path.includes("/operations/")) checkOperations(path);
}

warnings.forEach((w) => console.log(`warn  ${w}`));
errors.forEach((e) => console.log(`ERROR ${e}`));
console.log(`${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
