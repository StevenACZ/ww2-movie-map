// Usage: bun scripts/data/wiki-lookup.ts "Stalingrad (1993 film)" "place:Pitomnik Airfield" ...
// Titles print identifiers and the plot section; "place:" articles print [lon, lat] and the Spanish label.

const UA = "WW2FilmMap-data/1.0 (https://ww2.stevenacz.com)";

async function json(url: string): Promise<any> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function claim(entity: any, prop: string): string | undefined {
  const c = entity?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;
  if (c == null) return undefined;
  if (typeof c === "string") return c;
  if (typeof c === "object" && "id" in c) return c.id;
  if (typeof c === "object" && "latitude" in c)
    return `${c.longitude},${c.latitude}`;
  return JSON.stringify(c);
}

async function plot(title: string): Promise<string> {
  const q = new URLSearchParams({
    action: "query",
    prop: "extracts",
    explaintext: "1",
    redirects: "1",
    titles: title,
    format: "json",
  });
  const d = await json(`https://en.wikipedia.org/w/api.php?${q}`);
  const page: any = Object.values(d.query.pages)[0];
  const text: string = page.extract ?? "";
  const m = text.match(
    /==\s*(Plot|Synopsis|Premise|Summary|Story|Episodes)\s*==([\s\S]*?)(\n==[^=]|$)/
  );
  return (m ? m[2] : text.slice(0, 2500)).trim().slice(0, 4000);
}

async function lookup(title: string) {
  const q = new URLSearchParams({
    action: "wbgetentities",
    sites: "enwiki",
    titles: title,
    props: "claims|sitelinks|labels",
    languages: "en|es",
    normalize: "1",
    format: "json",
  });
  const d = await json(`https://www.wikidata.org/w/api.php?${q}`);
  const entity: any = Object.values(d.entities)[0];
  if (!entity || entity.missing !== undefined) {
    return { title, error: "not found on Wikidata/enwiki" };
  }
  const enTitle = entity.sitelinks?.enwiki?.title;
  const esTitle = entity.sitelinks?.eswiki?.title;
  return {
    query: title,
    wikidata: entity.id,
    labelEs: entity.labels?.es?.value,
    imdb: claim(entity, "P345"),
    tmdbMovie: claim(entity, "P4947"),
    tmdbTv: claim(entity, "P4983"),
    wikipediaEn: enTitle
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(enTitle.replace(/ /g, "_"))}`
      : undefined,
    wikipediaEs: esTitle
      ? `https://es.wikipedia.org/wiki/${encodeURIComponent(esTitle.replace(/ /g, "_"))}`
      : undefined,
    fandom: claim(entity, "P6262"),
    plot: enTitle ? await plot(enTitle) : undefined,
  };
}

async function place(title: string) {
  const q = new URLSearchParams({
    action: "wbgetentities",
    sites: "enwiki",
    titles: title,
    props: "claims|sitelinks|labels",
    languages: "en|es",
    normalize: "1",
    format: "json",
  });
  const d = await json(`https://www.wikidata.org/w/api.php?${q}`);
  const entity: any = Object.values(d.entities)[0];
  const c = entity?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
  return {
    place: title,
    wikidata: entity?.id,
    labelEs: entity?.labels?.es?.value,
    coordinates: c
      ? [Number(c.longitude.toFixed(4)), Number(c.latitude.toFixed(4))]
      : "no P625 coordinates",
  };
}

for (const title of process.argv.slice(2)) {
  try {
    const result = title.startsWith("place:")
      ? await place(title.slice(6).trim())
      : await lookup(title);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(JSON.stringify({ query: title, error: String(err) }));
  }
}
