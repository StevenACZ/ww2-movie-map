// Usage: bun scripts/images/flags.ts [--force]
// Fetches historical national flags from Wikimedia Commons into public/flags and writes data/flags.json.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import sharp from "sharp";

type Flag = {
  file: string;
  ratio: number;
  source: string;
  license: string;
  author: string;
};
type Timeline = [string, string | null][];
type FlagsFile = {
  flags: Record<string, Flag>;
  countries: Record<string, Timeline>;
};

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const OUT_DIR = join(ROOT, "public/flags");
const MANIFEST = join(ROOT, "data/flags.json");
const CREDITS = join(OUT_DIR, "CREDITS.md");
const COUNTRIES_FILE = join(ROOT, "data/geo/countries.json");
const UA = "ww2-movie-map-image-sync/1.0 (https://ww2.stevenacz.com)";
const HEIGHT = 64;
const FETCH_WIDTH = 256;
const MAX_BYTES = 6_000;
const MAX_ATTEMPTS = 5;
const START = "1914-01-01";
const BELLIGERENT = new Set([
  "entente",
  "central",
  "allies",
  "axis",
  "soviet",
  "war",
  "civil-war",
]);
const LICENSE = /^(public domain|cc0|cc by(-sa)? \d)/i;

const FLAGS: Record<string, string> = {
  "albania-1912":
    "Flag of the Provisional Government of Albania (1912–1914).svg",
  "albania-1914": "Flag of Albania (1914–1920).svg",
  "albania-1920": "Flag of Albania (1920–1926).svg",
  "albania-1928": "Flag of Albania (1928–1934).svg",
  "albania-1939": "Flag of Albania (1939–1943).svg",
  "albania-1943": "Flag of Albania (1943–1944).svg",
  "albania-1944":
    "Flag of the Democratic Government of Albania (1944–1946).svg",
  argentina: "Flag of Argentina.svg",
  australia: "Flag of Australia.svg",
  austria: "Flag of Austria.svg",
  "austria-hungary": "Civil Ensign of Austria-Hungary (1869–1918).svg",
  belgium: "Flag of Belgium.svg",
  bolivia: "Flag of Bolivia.svg",
  "brazil-1889": "Flag of Brazil (1889–1960).svg",
  "british-raj": "British Raj Red Ensign.svg",
  bulgaria: "Flag of Bulgaria.svg",
  "canada-1868": "Flag of Canada (1868–1921).svg",
  "canada-1921": "Flag of Canada (1921–1957).svg",
  chile: "Flag of Chile.svg",
  "china-1912": "Flag of China (1912–1928).svg",
  "china-1928": "Flag of the Republic of China.svg",
  colombia: "Flag of Colombia.svg",
  "costa-rica": "Flag of Costa Rica (state).svg",
  cuba: "Flag of Cuba.svg",
  "czechoslovakia-1918": "Flag of Bohemia.svg",
  czechoslovakia: "Flag of the Czech Republic.svg",
  danzig: "Flag of the Free City of Danzig.svg",
  denmark: "Flag of Denmark.svg",
  "dominican-republic": "Flag of the Dominican Republic.svg",
  "ecuador-1900": "Flag of Ecuador (1900–2009).svg",
  "egypt-1882": "Egypt flag 1882.svg",
  "egypt-1923": "Flag of Egypt 1922.svg",
  "el-salvador-1912": "Flag of El Salvador (1912–1916).svg",
  "el-salvador": "Flag of El Salvador.svg",
  estonia: "Flag of Estonia.svg",
  ethiopia: "Flag of Ethiopia (1897-1936; 1941-1974).svg",
  "finland-1917": "Flag of Finland 1918 (state).svg",
  finland: "Flag of Finland.svg",
  france: "Flag of France.svg",
  "germany-1867": "Flag of Germany (1867–1918).svg",
  "germany-1919": "Flag of Germany (3-2).svg",
  "germany-1933": "Flag of Germany (1933–1935).svg",
  "germany-1935": "Flag of Germany (1935–1945).svg",
  greece: "Flag of Greece (1822-1978).svg",
  "guatemala-1871": "Flag of Guatemala (1871–1968).svg",
  haiti: "Flag of Haiti (1820–1849, 1859–1964).svg",
  "honduras-1866": "Flag of Honduras (1866–1949).svg",
  "hungary-1915": "Flag of Hungary (1915-1918, 1919-1946).svg",
  "hungary-1918": "Flag of Hungary (1918–1919).svg",
  "hungary-1919": "Flag of Hungary (1919).svg",
  "iran-1907": "State flag of Persia (1907–1933).svg",
  "iran-1933": "State flag of Iran (1933–1964).svg",
  "iraq-1921": "Flag of the Arab Federation.svg",
  "iraq-1924": "Flag of Iraq (1924–1959).svg",
  ireland: "Flag of Ireland.svg",
  "italy-1861": "Flag of Italy (1861–1946).svg",
  "japan-1870": "Flag of Japan (1870–1999).svg",
  latvia: "Flag of Latvia.svg",
  liberia: "Flag of Liberia.svg",
  "lithuania-1918": "Flag of Lithuania (1918–1940).svg",
  luxembourg: "Flag of Luxembourg.svg",
  "mexico-1893": "Flag of Mexico (1893–1916).svg",
  "mexico-1916": "Flag of Mexico (1916–1934).svg",
  "mexico-1934": "Flag of Mexico (1934-1968).svg",
  "mongolia-1911": "Flag of Bogd Khaanate Mongolia.svg",
  "mongolia-1924": "Flag of the People's Republic of Mongolia (1924-1930).svg",
  "mongolia-1940": "Flag of the People's Republic of Mongolia (1940-1945).svg",
  "mongolia-1945": "Flag of the Mongolian People's Republic (1945–1992).svg",
  "montenegro-1905": "Flag of Montenegro (1905–1918).svg",
  muscat: "Flag of Muscat.svg",
  "nepal-1856": "Flag of Nepal (1856-c.1930).svg",
  "nepal-1930": "Flag of Nepal (1743–1962).svg",
  netherlands: "Flag of the Netherlands.svg",
  "new-zealand": "Flag of New Zealand.svg",
  "newfoundland-1904": "Flag of Newfoundland (1904–1949).svg",
  "nicaragua-1908": "Flag of Nicaragua (1908–1971).svg",
  norway: "Flag of Norway.svg",
  "ottoman-empire": "Flag of the Ottoman Empire (1844–1922).svg",
  panama: "Flag of Panama.svg",
  "paraguay-1842": "Flag of Paraguay (1842–1954).svg",
  "peru-1884": "Flag of Peru (1884–1950).svg",
  "poland-1919": "Flag of Poland (1919–1928).svg",
  "poland-1928": "Flag of Poland (1928-1980).svg",
  portugal: "Flag of Portugal.svg",
  "romania-1867": "Flag of Romania (1867–1948).svg",
  "russia-1896": "Flag of Russia (1896–1918).svg",
  "rsfsr-1918": "Flag of Russia (1918).svg",
  rsfsr:
    "Flag of the Russian Soviet Federative Socialist Republic (1918–1925).svg",
  "saudi-arabia-1932": "Flag of Saudi Arabia (1932–1934).svg",
  "saudi-arabia-1934": "Flag of Saudi Arabia (1934–1938).svg",
  "saudi-arabia-1938": "Flag of Saudi Arabia (1938–1973).svg",
  "serbia-1882": "Flag of Serbia (1882–1918).svg",
  "siam-1855": "Flag of Siam (1855).svg",
  "south-africa-1912": "Red Ensign of South Africa (1912–1951).svg",
  "south-africa-1928": "Flag of South Africa (1928–1994, dark colors).svg",
  "spain-1785": "Flag of Spain (1785–1873, 1875–1931).svg",
  "spain-1931": "Flag of the Second Spanish Republic.svg",
  "spain-1938": "Flag of Spain (1938–1945).svg",
  "spain-1945": "Flag of Spain (1945–1977).svg",
  thailand: "Flag of Thailand.svg",
  turkey: "Flag of Turkey.svg",
  uk: "Flag of the United Kingdom (1-2).svg",
  uruguay: "Flag of Uruguay.svg",
  "usa-1912": "Flag of the United States (1912-1959).svg",
  "ussr-1923": "Flag of the Soviet Union (1924–1936).svg",
  "ussr-1936": "Flag of the Soviet Union (1936 – 1955).svg",
  "venezuela-1905": "Flag of Venezuela (1905–1930).svg",
  "venezuela-1930": "Flag of Venezuela (1930–2006).svg",
  "yugoslavia-1918": "Flag of Yugoslavia (1918–1941).svg",
  "yugoslavia-1945": "Flag of Yugoslavia (1946-1992).svg",
};

const COUNTRIES: Record<string, Timeline> = {
  albania: [
    [START, "albania-1912"],
    ["1914-03-07", "albania-1914"],
    ["1920-01-31", "albania-1920"],
    ["1928-09-01", "albania-1928"],
    ["1939-09-28", "albania-1939"],
    ["1943-07-25", "albania-1943"],
    ["1944-11-29", "albania-1944"],
  ],
  argentina: [[START, "argentina"]],
  australia: [[START, "australia"]],
  austria: [
    [START, null],
    ["1918-11-12", "austria"],
    ["1938-03-13", null],
    ["1945-04-27", "austria"],
  ],
  "austria-hungary": [
    [START, "austria-hungary"],
    ["1918-11-12", null],
  ],
  belgium: [[START, "belgium"]],
  bolivia: [[START, "bolivia"]],
  brazil: [[START, "brazil-1889"]],
  "british-raj": [[START, "british-raj"]],
  bulgaria: [[START, "bulgaria"]],
  canada: [
    [START, "canada-1868"],
    ["1921-11-21", "canada-1921"],
  ],
  chile: [[START, "chile"]],
  china: [
    [START, "china-1912"],
    ["1928-12-29", "china-1928"],
  ],
  colombia: [[START, "colombia"]],
  "costa-rica": [[START, "costa-rica"]],
  cuba: [[START, "cuba"]],
  czechoslovakia: [
    [START, null],
    ["1918-10-28", "czechoslovakia-1918"],
    ["1920-03-30", "czechoslovakia"],
  ],
  danzig: [
    [START, null],
    ["1920-11-15", "danzig"],
    ["1939-09-01", null],
  ],
  denmark: [[START, "denmark"]],
  "dominican-republic": [[START, "dominican-republic"]],
  ecuador: [[START, "ecuador-1900"]],
  egypt: [
    [START, "egypt-1882"],
    ["1923-12-10", "egypt-1923"],
  ],
  "el-salvador": [
    [START, "el-salvador-1912"],
    ["1916-03-24", "el-salvador"],
  ],
  estonia: [
    [START, null],
    ["1918-02-24", "estonia"],
    ["1940-08-06", null],
  ],
  ethiopia: [[START, "ethiopia"]],
  finland: [
    [START, null],
    ["1917-12-06", "finland-1917"],
    ["1918-05-29", "finland"],
  ],
  france: [[START, "france"]],
  germany: [
    [START, "germany-1867"],
    ["1919-08-11", "germany-1919"],
    ["1933-03-12", "germany-1933"],
    ["1935-09-15", "germany-1935"],
    ["1945-05-23", null],
  ],
  greece: [[START, "greece"]],
  guatemala: [[START, "guatemala-1871"]],
  haiti: [[START, "haiti"]],
  honduras: [[START, "honduras-1866"]],
  hungary: [
    [START, null],
    ["1918-11-16", "hungary-1915"],
    ["1918-11-29", "hungary-1918"],
    ["1919-03-21", "hungary-1919"],
    ["1919-08-02", "hungary-1918"],
    ["1919-08-08", "hungary-1915"],
  ],
  iran: [
    [START, "iran-1907"],
    ["1933-01-01", "iran-1933"],
  ],
  iraq: [
    [START, null],
    ["1921-08-23", "iraq-1921"],
    ["1924-07-10", "iraq-1924"],
  ],
  ireland: [
    [START, null],
    ["1919-01-21", "ireland"],
  ],
  italy: [[START, "italy-1861"]],
  japan: [[START, "japan-1870"]],
  latvia: [
    [START, null],
    ["1918-11-18", "latvia"],
    ["1940-08-05", null],
  ],
  liberia: [[START, "liberia"]],
  lithuania: [
    [START, null],
    ["1918-02-16", "lithuania-1918"],
    ["1940-08-03", null],
  ],
  luxembourg: [[START, "luxembourg"]],
  mexico: [
    [START, "mexico-1893"],
    ["1916-09-20", "mexico-1916"],
    ["1934-02-05", "mexico-1934"],
  ],
  mongolia: [
    [START, "mongolia-1911"],
    ["1920-01-01", null],
    ["1921-07-11", "mongolia-1911"],
    ["1924-11-26", "mongolia-1924"],
    ["1940-07-30", "mongolia-1940"],
    ["1945-07-10", "mongolia-1945"],
  ],
  montenegro: [
    [START, "montenegro-1905"],
    ["1918-11-26", null],
  ],
  nepal: [
    [START, "nepal-1856"],
    ["1930-01-01", "nepal-1930"],
  ],
  netherlands: [[START, "netherlands"]],
  "new-zealand": [[START, "new-zealand"]],
  newfoundland: [
    [START, "newfoundland-1904"],
    ["1931-05-15", "uk"],
  ],
  nicaragua: [[START, "nicaragua-1908"]],
  norway: [[START, "norway"]],
  oman: [[START, "muscat"]],
  "ottoman-empire": [
    [START, "ottoman-empire"],
    ["1922-11-01", null],
  ],
  panama: [[START, "panama"]],
  paraguay: [[START, "paraguay-1842"]],
  peru: [[START, "peru-1884"]],
  poland: [
    [START, null],
    ["1918-11-11", "poland-1919"],
    ["1928-03-29", "poland-1928"],
  ],
  portugal: [[START, "portugal"]],
  romania: [[START, "romania-1867"]],
  russia: [
    [START, "russia-1896"],
    ["1922-10-25", null],
  ],
  "saudi-arabia": [
    [START, null],
    ["1932-09-23", "saudi-arabia-1932"],
    ["1934-01-01", "saudi-arabia-1934"],
    ["1938-01-01", "saudi-arabia-1938"],
  ],
  serbia: [
    [START, "serbia-1882"],
    ["1918-12-01", null],
  ],
  "south-africa": [
    [START, "south-africa-1912"],
    ["1928-05-31", "south-africa-1928"],
  ],
  spain: [
    [START, "spain-1785"],
    ["1931-04-14", "spain-1931"],
    ["1939-04-01", "spain-1938"],
    ["1945-10-11", "spain-1945"],
  ],
  thailand: [
    [START, "siam-1855"],
    ["1917-09-28", "thailand"],
  ],
  turkey: [
    [START, null],
    ["1920-04-23", "turkey"],
  ],
  uk: [[START, "uk"]],
  uruguay: [[START, "uruguay"]],
  usa: [[START, "usa-1912"]],
  ussr: [
    [START, null],
    ["1918-04-13", "rsfsr-1918"],
    ["1918-07-10", "rsfsr"],
    ["1923-11-12", "ussr-1923"],
    ["1936-12-05", "ussr-1936"],
  ],
  venezuela: [
    [START, "venezuela-1905"],
    ["1930-07-15", "venezuela-1930"],
  ],
  yugoslavia: [
    [START, null],
    ["1918-12-01", "yugoslavia-1918"],
    ["1945-11-29", "yugoslavia-1945"],
  ],
};

const force = process.argv.includes("--force");

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

function plain(html = ""): string {
  return html
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

async function fileInfo(name: string) {
  const q = new URLSearchParams({
    action: "query",
    titles: `File:${name}`,
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: String(FETCH_WIDTH),
    redirects: "1",
    format: "json",
  });
  const d: any = await (
    await get(`https://commons.wikimedia.org/w/api.php?${q}`)
  ).json();
  const info = (Object.values(d.query?.pages ?? {})[0] as any)?.imageinfo?.[0];
  if (!info) throw new Error(`missing File:${name}`);
  const meta = info.extmetadata ?? {};
  return {
    thumb: info.thumburl as string,
    page: info.descriptionurl as string,
    ratio: info.width / info.height,
    license: plain(meta.LicenseShortName?.value),
    author: plain(meta.Artist?.value),
  };
}

async function encode(input: Buffer, width: number) {
  const base = await sharp(input)
    .resize({ width, height: HEIGHT, fit: "fill", kernel: "lanczos3" })
    .png()
    .toBuffer();
  let quality = 90;
  for (;;) {
    const data = await sharp(base).webp({ quality, effort: 6 }).toBuffer();
    if (data.length < MAX_BYTES || quality <= 30) return data;
    quality -= 5;
  }
}

const geo = JSON.parse(readFileSync(COUNTRIES_FILE, "utf8")) as {
  countries: Record<string, { timeline: [string, string][] }>;
};
const unknown = Object.keys(COUNTRIES).filter((id) => !geo.countries[id]);
const undefinedSlugs = Object.values(COUNTRIES)
  .flat()
  .map(([, slug]) => slug)
  .filter((slug): slug is string => slug !== null && !FLAGS[slug]);
if (unknown.length || undefinedSlugs.length) {
  throw new Error(
    `unknown countries: ${unknown.join(", ")}; undefined slugs: ${undefinedSlugs.join(", ")}`
  );
}

const previous: FlagsFile = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : { flags: {}, countries: {} };
mkdirSync(OUT_DIR, { recursive: true });

const flags: Record<string, Flag> = {};
const errors: string[] = [];
let fetched = 0;

for (const slug of Object.keys(FLAGS).sort()) {
  const file = join(OUT_DIR, `${slug}.webp`);
  const known = previous.flags[slug];
  if (!force && known && existsSync(file)) {
    flags[slug] = known;
    continue;
  }
  try {
    const info = await fileInfo(FLAGS[slug]!);
    if (!LICENSE.test(info.license)) {
      throw new Error(`license ${info.license}`);
    }
    const raw = Buffer.from(await (await get(info.thumb)).arrayBuffer());
    writeFileSync(file, await encode(raw, Math.round(HEIGHT * info.ratio)));
    flags[slug] = {
      file: `/flags/${slug}.webp`,
      ratio: Math.round(info.ratio * 1000) / 1000,
      source: info.page,
      license: info.license,
      author: info.author,
    };
    fetched++;
  } catch (err) {
    errors.push(`${slug}: ${String(err)}`);
  }
}

const skipped = Object.entries(geo.countries)
  .filter(
    ([id, c]) =>
      !COUNTRIES[id] && c.timeline.some(([, s]) => BELLIGERENT.has(s))
  )
  .map(([id]) => id);

if (errors.length) {
  console.log(JSON.stringify({ errors }, null, 2));
  process.exit(1);
}

const manifest: FlagsFile = {
  flags,
  countries: Object.fromEntries(
    Object.keys(COUNTRIES)
      .sort()
      .map((id) => [id, COUNTRIES[id]!])
  ),
};
writeFileSync(
  MANIFEST,
  await format(JSON.stringify(manifest), {
    parser: "json",
    filepath: MANIFEST,
  })
);

const cell = (s: string) => s.replace(/\|/g, "\\|");
const credits = [
  "# Flag credits",
  "",
  "National flags come from [Wikimedia Commons](https://commons.wikimedia.org) under the licenses below.",
  "",
  "| Flag | Commons file | License | Author |",
  "| --- | --- | --- | --- |",
  ...Object.entries(flags).map(
    ([slug, f]) =>
      `| ${slug} | [${cell(decodeURIComponent(f.source.split("/wiki/")[1]!).replace(/_/g, " "))}](${f.source}) | ${cell(f.license)} | ${cell(f.author)} |`
  ),
  "",
].join("\n");
writeFileSync(
  CREDITS,
  await format(credits, { parser: "markdown", filepath: CREDITS })
);

const bytes = Object.keys(flags).reduce(
  (sum, slug) => sum + readFileSync(join(OUT_DIR, `${slug}.webp`)).length,
  0
);
console.log(
  JSON.stringify(
    {
      countries: Object.keys(COUNTRIES).length,
      flags: Object.keys(flags).length,
      fetched,
      bytes,
      skipped,
    },
    null,
    2
  )
);
