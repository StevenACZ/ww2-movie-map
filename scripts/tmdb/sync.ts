// Usage: bun scripts/tmdb/sync.ts [--only <id,id>] [--out-dir <dir>] [--fixture <dir>]
// Credentials: TMDB_API_KEY (v3) or TMDB_READ_TOKEN (v4), else ~/.config/ww2-movie-map/tmdb.env.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import type { Title, TitlesFile } from "../../types/data";
import type { TmdbExtra, TmdbFile } from "../../types/view";

type MediaType = "movie" | "tv";
type Provider = { id: number; name: string; logo: string };
type Region = {
  link: string;
  flatrate?: Provider[];
  free?: Provider[];
  ads?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
};
type WatchFile = { regions: Record<string, Region> };

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const API = "https://api.themoviedb.org/3";
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 5;
const OFFER_KINDS = ["flatrate", "free", "ads", "rent", "buy"] as const;
const COVERAGE = ["PE", "MX", "ES", "US"];

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

const only = arg("--only")
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const outDir = arg("--out-dir") ?? ROOT;
const fixtureDir = arg("--fixture");

function credentials(): { key?: string; token?: string } {
  let key = process.env.TMDB_API_KEY;
  let token = process.env.TMDB_READ_TOKEN;
  const file = join(homedir(), ".config/ww2-movie-map/tmdb.env");
  if (!key && !token && existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*(?:export\s+)?([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, "");
      if (m[1] === "TMDB_API_KEY") key = value;
      if (m[1] === "TMDB_READ_TOKEN") token = value;
    }
  }
  return { key: key || undefined, token: token || undefined };
}

const auth = fixtureDir ? {} : credentials();
if (!fixtureDir && !auth.key && !auth.token) {
  console.error(
    "Missing TMDB credentials: set TMDB_API_KEY or TMDB_READ_TOKEN, or create ~/.config/ww2-movie-map/tmdb.env with one of them."
  );
  process.exit(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tmdb(
  path: string,
  params: Record<string, string>
): Promise<any> {
  if (fixtureDir) {
    const name = path.replace(/^\//, "").replace(/\//g, "-");
    const lang = params.language ? `.${params.language}` : "";
    return JSON.parse(
      readFileSync(join(fixtureDir, `${name}${lang}.json`), "utf8")
    );
  }
  const q = new URLSearchParams(params);
  if (auth.key) q.set("api_key", auth.key);
  const headers: Record<string, string> = { accept: "application/json" };
  if (!auth.key && auth.token) headers.authorization = `Bearer ${auth.token}`;
  for (let attempt = 1; ; attempt++) {
    let res: Response | undefined;
    try {
      res = await fetch(`${API}${path}?${q}`, { headers });
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS) throw new Error(`${path}: ${err}`);
    }
    if (res?.ok) return res.json();
    if (res && res.status !== 429 && res.status < 500) {
      throw new Error(`${res.status} ${path}`);
    }
    if (attempt >= MAX_ATTEMPTS) throw new Error(`${res?.status} ${path}`);
    const retryAfter = Number(res?.headers.get("retry-after"));
    await sleep(retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** (attempt - 1));
  }
}

function loadTitles(): Title[] {
  const dir = join(ROOT, "data/titles");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("._"))
    .sort()
    .flatMap(
      (f) =>
        (JSON.parse(readFileSync(join(dir, f), "utf8")) as TitlesFile).titles
    );
}

function best(items: any[]): any {
  return [...items].sort(
    (a, b) =>
      (b.vote_average ?? 0) - (a.vote_average ?? 0) ||
      (b.vote_count ?? 0) - (a.vote_count ?? 0)
  )[0];
}

function trailer(videos: any[], lang: string): string | undefined {
  const rank = (v: any) =>
    (v.type === "Trailer" ? 0 : 2) + (v.official ? 0 : 1);
  return videos
    .filter(
      (v) =>
        v.iso_639_1 === lang &&
        v.site === "YouTube" &&
        (v.type === "Trailer" || v.type === "Teaser")
    )
    .sort((a, b) => rank(a) - rank(b))[0]?.key;
}

function spanishTitle(d: any, type: MediaType): string | undefined {
  const field = type === "movie" ? "title" : "name";
  const es = (d.translations?.translations ?? []).filter(
    (t: any) => t.iso_639_1 === "es" && t.data?.[field]
  );
  const pick =
    es.find((t: any) => t.iso_3166_1 === "MX") ??
    es.find((t: any) => t.iso_3166_1 === "ES") ??
    es[0];
  return pick?.data[field] ?? undefined;
}

function watch(d: any): WatchFile {
  const results: Record<string, any> = d["watch/providers"]?.results ?? {};
  const regions: Record<string, Region> = {};
  for (const iso of Object.keys(results).sort()) {
    const r = results[iso];
    const region: Region = { link: r.link };
    for (const kind of OFFER_KINDS) {
      if (!r[kind]?.length) continue;
      region[kind] = [...r[kind]]
        .sort(
          (a: any, b: any) =>
            (a.display_priority ?? 0) - (b.display_priority ?? 0)
        )
        .map((p: any) => ({
          id: p.provider_id,
          name: p.provider_name,
          logo: p.logo_path,
        }));
    }
    regions[iso] = region;
  }
  return { regions };
}

function extra(
  d: any,
  type: MediaType,
  genresEs: Map<number, string>
): TmdbExtra {
  const images = d.images ?? {};
  const videos = d.videos?.results ?? [];
  const posterEs = best(
    (images.posters ?? []).filter((p: any) => p.iso_639_1 === "es")
  )?.file_path;
  const backdrop =
    best((images.backdrops ?? []).filter((b: any) => b.iso_639_1 == null))
      ?.file_path ?? d.backdrop_path;
  const runtime = type === "movie" ? d.runtime : (d.episode_run_time ?? [])[0];
  const genres = d.genres ?? [];
  const credits = type === "movie" ? d.credits : d.aggregate_credits;
  const cast = [...(credits?.cast ?? [])]
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 6)
    .map((c: any) => c.name);
  const trailerEn = trailer(videos, "en");
  const trailerEs = trailer(videos, "es");
  return {
    poster: d.poster_path || undefined,
    posterEs: posterEs || undefined,
    backdrop: backdrop || undefined,
    runtime: runtime || undefined,
    seasons: type === "tv" ? d.number_of_seasons || undefined : undefined,
    episodes: type === "tv" ? d.number_of_episodes || undefined : undefined,
    vote:
      (d.vote_count ?? 0) >= 50
        ? Math.round(d.vote_average * 10) / 10
        : undefined,
    votes: d.vote_count || undefined,
    genres: genres.length
      ? {
          en: genres.map((g: any) => g.name),
          es: genres.map((g: any) => genresEs.get(g.id) ?? g.name),
        }
      : undefined,
    trailer:
      trailerEn || trailerEs ? { en: trailerEn, es: trailerEs } : undefined,
    titleEs: spanishTitle(d, type),
    releaseDate:
      (type === "movie" ? d.release_date : d.first_air_date) || undefined,
    cast: cast.length ? cast : undefined,
  };
}

async function writeJson(file: string, data: unknown) {
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(
    file,
    await format(JSON.stringify(data), { parser: "json", filepath: file })
  );
}

const titles = loadTitles().filter((t) => !only || only.includes(t.id));
if (only) {
  const missing = only.filter((id) => !titles.some((t) => t.id === id));
  if (missing.length) {
    console.error(`Unknown title ids: ${missing.join(", ")}`);
    process.exit(1);
  }
}

const genresEs = new Map<number, string>();
for (const type of new Set(titles.map((t) => t.ids.tmdbType))) {
  const list = await tmdb(`/genre/${type}/list`, { language: "es-MX" });
  for (const g of list.genres ?? []) genresEs.set(g.id, g.name);
}

const tmdbFile = join(outDir, "data/tmdb.json");
const previous: TmdbFile = existsSync(tmdbFile)
  ? JSON.parse(readFileSync(tmdbFile, "utf8"))
  : { syncedAt: null, titles: {} };
const synced: Record<string, TmdbExtra> = {};
const regionsById: Record<string, string[]> = {};
const failures: string[] = [];

async function syncTitle(t: Title) {
  const type = t.ids.tmdbType;
  const d = await tmdb(`/${type}/${t.ids.tmdb}`, {
    language: "en-US",
    append_to_response: [
      "videos",
      "images",
      type === "movie" ? "credits" : "aggregate_credits",
      "watch/providers",
      "translations",
    ].join(","),
    include_image_language: "en,es,null",
    include_video_language: "en,es",
  });
  synced[t.id] = extra(d, type, genresEs);
  const w = watch(d);
  const file = join(outDir, "public/data/watch", `${t.id}.json`);
  regionsById[t.id] = Object.keys(w.regions);
  if (regionsById[t.id].length) await writeJson(file, w);
  else if (existsSync(file)) unlinkSync(file);
}

const queue = [...titles];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    for (let t = queue.shift(); t; t = queue.shift()) {
      try {
        await syncTitle(t);
      } catch (err) {
        failures.push(t.id);
        console.error(`FAIL ${t.id}: ${(err as Error).message}`);
      }
    }
  })
);

const merged = { ...previous.titles, ...synced };
const sortedTitles: Record<string, TmdbExtra> = {};
for (const id of Object.keys(merged).sort()) sortedTitles[id] = merged[id];
await writeJson(tmdbFile, {
  syncedAt: new Date().toISOString(),
  titles: sortedTitles,
} satisfies TmdbFile);

const ok = Object.keys(synced);
const noPoster = ok.filter((id) => !synced[id].poster);
const noTrailer = ok.filter((id) => !synced[id].trailer);
const coverage = COVERAGE.map(
  (iso) =>
    `${iso} ${ok.filter((id) => regionsById[id].includes(iso)).length}/${ok.length}`
).join(" ");
console.log(
  `synced ${ok.length}/${titles.length}, failed ${failures.length}` +
    `${failures.length ? ` (${failures.sort().join(", ")})` : ""}` +
    ` | no poster ${noPoster.length}${noPoster.length ? ` (${noPoster.sort().join(", ")})` : ""}` +
    ` | no trailer ${noTrailer.length}${noTrailer.length ? ` (${noTrailer.sort().join(", ")})` : ""}` +
    ` | regions ${coverage}`
);
if (failures.length > titles.length * 0.1) process.exit(1);
