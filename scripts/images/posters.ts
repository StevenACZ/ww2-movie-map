// Usage: bun scripts/images/posters.ts [--force] [--only <id,id>]
// Fetches each title's infobox poster from Wikipedia into public/img/posters and writes data/posters.json.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import sharp from "sharp";
import type { PostersFile, Title, TitlesFile } from "../../types/data";

type Info = { thumb: string; page: string; width: number; height: number };

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const TITLES_DIR = join(ROOT, "data/titles");
const OUT_DIR = join(ROOT, "public/img/posters");
const SM_DIR = join(OUT_DIR, "sm");
const MANIFEST = join(ROOT, "data/posters.json");
const UA = "ww2-movie-map-image-sync/1.0 (https://ww2.stevenacz.com)";
const WIDTH = 342;
const HEIGHT = 513;
const FETCH_WIDTH = 500;
const MAX_BYTES = 40_000;
const SM_WIDTH = 92;
const SM_HEIGHT = 138;
const SM_MAX_BYTES = 5_000;
const MAX_ATTEMPTS = 5;
const MIN_RATIO = 1.2;
const MAX_RATIO = 1.75;

const force = process.argv.includes("--force");
const onlyArg = process.argv.indexOf("--only");
const only = onlyArg === -1 ? undefined : process.argv[onlyArg + 1]?.split(",");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    await sleep(350);
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res;
    if (res.status === 404) return res;
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

function fileFromUrl(url: string): string {
  const parts = new URL(url).pathname.split("/");
  const thumb = parts.indexOf("thumb");
  return decodeURIComponent(thumb === -1 ? parts.at(-1)! : parts[thumb + 3]!);
}

async function summaryFile(page: string): Promise<string | undefined> {
  const res = await get(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page)}`
  );
  if (!res.ok) return undefined;
  const d: any = await res.json();
  const src = d.originalimage?.source ?? d.thumbnail?.source;
  return src ? fileFromUrl(src) : undefined;
}

async function pageImageFile(page: string): Promise<string | undefined> {
  const d = await api("en.wikipedia.org", {
    action: "query",
    prop: "pageimages",
    piprop: "original|name",
    pilicense: "any",
    redirects: "1",
    titles: page,
  });
  const p: any = Object.values(d.query?.pages ?? {})[0];
  return p?.pageimage;
}

async function wikidataFile(id?: string): Promise<string | undefined> {
  if (!id) return undefined;
  const d = await api("www.wikidata.org", {
    action: "wbgetclaims",
    entity: id,
    property: "P3383",
  });
  return d.claims?.P3383?.[0]?.mainsnak?.datavalue?.value;
}

async function fileInfo(name: string): Promise<Info | undefined> {
  const d = await api("en.wikipedia.org", {
    action: "query",
    titles: `File:${name}`,
    prop: "imageinfo",
    iiprop: "url|size",
    iiurlwidth: String(FETCH_WIDTH),
  });
  const page: any = Object.values(d.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return undefined;
  return {
    thumb:
      info.thumburl ??
      `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=${FETCH_WIDTH}`,
    page: info.descriptionurl,
    width: info.width,
    height: info.height,
  };
}

async function fit(
  input: Buffer,
  width: number,
  height: number,
  letterbox: boolean
) {
  const cover = sharp(input).resize({
    width,
    height,
    fit: "cover",
    position: "centre",
  });
  if (!letterbox) return cover.png().toBuffer();
  const back = await cover.blur(18).modulate({ brightness: 0.45 }).toBuffer();
  const front = await sharp(input)
    .resize({
      width,
      height,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  return sharp(back)
    .composite([{ input: front }])
    .png()
    .toBuffer();
}

async function encode(
  input: Buffer,
  width: number,
  height: number,
  letterbox: boolean,
  start: number,
  maxBytes: number
) {
  const base = await fit(input, width, height, letterbox);
  let quality = start;
  for (;;) {
    const data = await sharp(base).webp({ quality, effort: 6 }).toBuffer();
    if (data.length <= maxBytes || quality <= 40) return data;
    quality -= 6;
  }
}

const small = (input: Buffer, letterbox: boolean) =>
  encode(input, SM_WIDTH, SM_HEIGHT, letterbox, 70, SM_MAX_BYTES);

const titles: Title[] = readdirSync(TITLES_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .flatMap(
    (f) =>
      (JSON.parse(readFileSync(join(TITLES_DIR, f), "utf8")) as TitlesFile)
        .titles
  );
const manifest: PostersFile = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : {};
mkdirSync(SM_DIR, { recursive: true });

const noImage: string[] = [];
const letterboxed: string[] = [];
const errors: string[] = [];

for (const title of titles) {
  if (only && !only.includes(title.id)) continue;
  const file = join(OUT_DIR, `${title.id}.webp`);
  const smFile = join(SM_DIR, `${title.id}.webp`);
  if (!force && manifest[title.id] && existsSync(file)) {
    if (!existsSync(smFile)) {
      writeFileSync(smFile, await small(readFileSync(file), false));
    }
    continue;
  }
  const page = pageTitle(title.links.wikipediaEn);
  const sources = [
    () => summaryFile(page),
    () => pageImageFile(page),
    () => wikidataFile(title.ids.wikidata),
  ];
  const seen = new Set<string>();
  let saved = false;
  let failed = false;
  for (const source of sources) {
    try {
      const name = (await source())?.replace(/^File:/, "").replace(/_/g, " ");
      if (!name || seen.has(name)) continue;
      seen.add(name);
      const info = await fileInfo(name);
      if (!info) continue;
      const ratio = info.height / info.width;
      const letterbox = ratio < MIN_RATIO || ratio > MAX_RATIO;
      const raw = Buffer.from(await (await get(info.thumb)).arrayBuffer());
      writeFileSync(
        file,
        await encode(raw, WIDTH, HEIGHT, letterbox, 72, MAX_BYTES)
      );
      writeFileSync(smFile, await small(raw, letterbox));
      if (letterbox) letterboxed.push(title.id);
      manifest[title.id] = {
        src: `/img/posters/${title.id}.webp`,
        width: WIDTH,
        height: HEIGHT,
        source: info.page,
      };
      saved = true;
      break;
    } catch (err) {
      failed = true;
      console.log(`error ${title.id}: ${String(err)}`);
    }
  }
  if (!saved) {
    delete manifest[title.id];
    (failed ? errors : noImage).push(title.id);
  }
}

const ids = titles.map((t) => t.id);
const ordered = Object.fromEntries(
  Object.keys(manifest)
    .filter((id) => ids.includes(id))
    .sort()
    .map((id) => [id, manifest[id]!])
);
writeFileSync(
  MANIFEST,
  await format(JSON.stringify(ordered), { parser: "json", filepath: MANIFEST })
);

const bytesIn = (dir: string) =>
  Object.keys(ordered).reduce(
    (sum, id) => sum + readFileSync(join(dir, `${id}.webp`)).length,
    0
  );
console.log(
  JSON.stringify(
    {
      titles: titles.length,
      found: Object.keys(ordered).length,
      bytes: bytesIn(OUT_DIR),
      smBytes: bytesIn(SM_DIR),
      noImage,
      letterboxed,
      errors,
    },
    null,
    2
  )
);
