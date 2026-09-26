// Usage: bun scripts/images/events.ts [--force] [--only <id,id>]
// Fetches one freely licensed Wikimedia image per event into public/img/events and writes data/event-images.json.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import sharp from "sharp";
import type { EventsFile } from "../../types/data";

type Entry = {
  src: string;
  width: number;
  height: number;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
};
type Info = {
  thumb: string;
  file: string;
  page: string;
  license: string;
  licenseUrl: string;
  author: string;
};

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const OUT_DIR = join(ROOT, "public/img/events");
const MANIFEST = join(ROOT, "data/event-images.json");
const UA = "ww2-movie-map-image-sync/1.0 (https://ww2.stevenacz.com)";
const WIDTH = 720;
const MAX_BYTES = 70_000;
const BUDGET = 6_000_000;
const MAX_ATTEMPTS = 5;

const PREFER: Record<string, string[]> = {
  "first-tanks-flers-courcelette": ["Mark I tank"],
  "league-of-nations": ["Covenant of the League of Nations"],
  "hitler-becomes-chancellor": ["Hitler cabinet"],
  "lend-lease": ["Persian Corridor"],
  "tizard-mission": ["Cavity magnetron"],
  "atomic-bombing-of-nagasaki": ["Fat Man"],
};
const SYMBOL = /^File:(Flag of|Great Seal|Coat of arms)|logo/i;

const force = process.argv.includes("--force");
const onlyArg = process.argv.indexOf("--only");
const only = onlyArg === -1 ? undefined : process.argv[onlyArg + 1]?.split(",");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    await sleep(350);
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res;
    if (attempt >= MAX_ATTEMPTS || (res.status !== 429 && res.status < 500)) {
      throw new Error(`${res.status} ${url}`);
    }
    const retryAfter = Number(res.headers.get("retry-after"));
    await sleep(retryAfter > 0 ? retryAfter * 1000 : 2000 * 2 ** attempt);
  }
}

async function api(host: string, params: Record<string, string>) {
  const q = new URLSearchParams({ ...params, format: "json" });
  return (await get(`https://${host}/w/api.php?${q}`)).json() as Promise<any>;
}

function pageTitle(url: string): string {
  return decodeURIComponent(new URL(url).pathname.replace(/^\/wiki\//, ""));
}

function plain(html?: string): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function credit(html?: string): string {
  const text = plain(html)
    .replace(/\(?\S+@\S+\)?;?/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 90 ? `${text.slice(0, 89).trimEnd()}…` : text;
}

function accepted(license: string): boolean {
  const l = license.toLowerCase().trim();
  if (/\b(nc|nd)\b/.test(l)) return false;
  return (
    l === "public domain" ||
    l.startsWith("pd") ||
    l.startsWith("cc0") ||
    /^cc[ -]by(-sa)?[ -]\d/.test(l) ||
    /^cc[ -]by(-sa)?$/.test(l)
  );
}

async function pageImage(title: string): Promise<string | undefined> {
  const d = await api("en.wikipedia.org", {
    action: "query",
    prop: "pageimages",
    piprop: "original|name",
    pilicense: "free",
    redirects: "1",
    titles: title,
  });
  const page: any = Object.values(d.query?.pages ?? {})[0];
  return page?.pageimage;
}

async function fileInfo(name: string): Promise<Info | undefined> {
  for (const host of ["commons.wikimedia.org", "en.wikipedia.org"]) {
    const d = await api(host, {
      action: "query",
      titles: `File:${name}`,
      prop: "imageinfo",
      iiprop: "url|size|extmetadata",
      iiurlwidth: "960",
    });
    const page: any = Object.values(d.query?.pages ?? {})[0];
    const info = page?.imageinfo?.[0];
    if (!info) continue;
    const meta = info.extmetadata ?? {};
    return {
      thumb: info.thumburl ?? info.url,
      file: page.title,
      page: info.descriptionurl,
      license: plain(meta.LicenseShortName?.value),
      licenseUrl: plain(meta.LicenseUrl?.value),
      author:
        credit(meta.Artist?.value) || credit(meta.Credit?.value) || "Unknown",
    };
  }
  return undefined;
}

async function encode(input: Buffer) {
  const meta = await sharp(input).metadata();
  const width = Math.min(WIDTH, meta.width, Math.floor((meta.height * 16) / 9));
  const height = Math.round((width * 9) / 16);
  let quality = 68;
  for (;;) {
    const { data, info } = await sharp(input)
      .resize({ width, height, fit: "cover", position: "attention" })
      .webp({ quality, effort: 6 })
      .toBuffer({ resolveWithObject: true });
    if (data.length <= MAX_BYTES || quality <= 44) return { data, info };
    quality -= 6;
  }
}

const { events } = JSON.parse(
  readFileSync(join(ROOT, "data/events.json"), "utf8")
) as EventsFile;
const manifest: Record<string, Entry> = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : {};
mkdirSync(OUT_DIR, { recursive: true });

const found: string[] = [];
const fallback: string[] = [];
const rejected: string[] = [];
const related: string[] = [];

for (const event of events) {
  if (only && !only.includes(event.id)) continue;
  const file = join(OUT_DIR, `${event.id}.webp`);
  if (!force && manifest[event.id] && existsSync(file)) {
    found.push(event.id);
    continue;
  }
  const main = pageTitle(event.wikipediaEn);
  const pages = [...(PREFER[event.id] ?? []), main];
  let entry: Entry | undefined;
  let wasRejected = false;
  for (const title of pages) {
    try {
      const name = await pageImage(title);
      if (!name) continue;
      const info = await fileInfo(name);
      if (!info) continue;
      if (!accepted(info.license) || SYMBOL.test(info.file)) {
        wasRejected = true;
        console.log(`reject ${event.id}: ${info.license} ${info.file}`);
        continue;
      }
      const raw = Buffer.from(await (await get(info.thumb)).arrayBuffer());
      const { data, info: out } = await encode(raw);
      writeFileSync(file, data);
      entry = {
        src: `/img/events/${event.id}.webp`,
        width: out.width,
        height: out.height,
        title: info.file,
        author: info.author,
        license: info.license,
        licenseUrl: info.licenseUrl,
        source: info.page,
      };
      if (title !== main) related.push(`${event.id} <- ${title}`);
      break;
    } catch (err) {
      console.log(`error ${event.id} (${title}): ${String(err)}`);
    }
  }
  if (entry) {
    manifest[event.id] = entry;
    found.push(event.id);
  } else {
    delete manifest[event.id];
    (wasRejected ? rejected : fallback).push(event.id);
  }
}

const ordered = Object.fromEntries(
  events.filter((e) => manifest[e.id]).map((e) => [e.id, manifest[e.id]!])
);
writeFileSync(
  MANIFEST,
  await format(JSON.stringify(ordered), { parser: "json", filepath: MANIFEST })
);

const bytes = Object.keys(ordered).reduce(
  (sum, id) => sum + readFileSync(join(OUT_DIR, `${id}.webp`)).length,
  0
);
const licenses: Record<string, number> = {};
for (const entry of Object.values(ordered)) {
  licenses[entry.license] = (licenses[entry.license] ?? 0) + 1;
}
console.log(
  JSON.stringify(
    {
      found: found.length,
      fallback: fallback.length,
      rejected: rejected.length,
      bytes,
      overBudget: bytes > BUDGET,
      licenses,
      related,
      fallbackIds: fallback,
      rejectedIds: rejected,
    },
    null,
    2
  )
);
