import type {
  EventsFile,
  FrontsFile,
  Locale,
  Localized,
  LonLat,
  OperationsFile,
  Stop,
  Title,
  TitlesFile,
} from "~~/types/data";
import type {
  EventCard,
  PlaceDetail,
  PlaceSummary,
  StopCard,
  StopDetail,
  TitleCard,
  TitleDetail,
  TmdbFile,
  WorldData,
} from "~~/types/view";
import ww1 from "~~/data/titles/ww1.json";
import interwar from "~~/data/titles/interwar.json";
import ww2West from "~~/data/titles/ww2-west.json";
import ww2Britain from "~~/data/titles/ww2-britain-atlantic.json";
import ww2East from "~~/data/titles/ww2-east.json";
import ww2Med from "~~/data/titles/ww2-med.json";
import ww2Pacific from "~~/data/titles/ww2-pacific.json";
import eventsFile from "~~/data/events.json";
import europeOps from "~~/data/operations/europe.json";
import worldOps from "~~/data/operations/world.json";
import frontsFile from "~~/data/fronts.json";
import countriesFile from "~~/data/geo/countries.json";
import tmdbFile from "~~/data/tmdb.json";
import placesFile from "~~/data/places.json";

const TITLES: Title[] = (
  [
    ww1,
    interwar,
    ww2West,
    ww2Britain,
    ww2East,
    ww2Med,
    ww2Pacific,
  ] as TitlesFile[]
)
  .flatMap((file) => file.titles)
  .sort(
    (a, b) => a.period.start.localeCompare(b.period.start) || a.year - b.year
  );

const EVENTS = (eventsFile as EventsFile).events;
const TMDB = (tmdbFile as TmdbFile).titles;
const PLACES = (
  placesFile as {
    places: Record<string, { name?: Localized; description?: Localized }>;
  }
).places;

const byId = new Map(TITLES.map((title) => [title.id, title]));

export const LOCALES: Locale[] = ["en", "es"];

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

function pick(value: Localized, locale: Locale): string {
  return value[locale] || value.en;
}

function localTitle(title: Title, locale: Locale): string {
  return locale === "es" ? title.titleEs || title.title : title.title;
}

function stopCard(stop: Stop, locale: Locale): StopCard {
  return {
    place: stop.place,
    name: pick(stop.name, locale),
    coordinates: stop.coordinates,
    date: stop.date,
    kind: stop.kind,
    ...(stop.primary ? { primary: true } : {}),
  };
}

function stopDetail(stop: Stop, locale: Locale): StopDetail {
  return {
    ...stopCard(stop, locale),
    story: pick(stop.story, locale),
    ...(stop.history ? { history: pick(stop.history, locale) } : {}),
  };
}

export function titleCard(title: Title, locale: Locale): TitleCard {
  const extra = TMDB[title.id] ?? {};
  const name = localTitle(title, locale);
  return {
    id: title.id,
    kind: title.kind,
    title: name,
    ...(name !== title.title ? { altTitle: title.title } : {}),
    year: title.year,
    ...(title.endYear ? { endYear: title.endYear } : {}),
    era: title.era,
    gold: title.gold,
    theaters: title.theaters,
    tags: title.tags,
    period: title.period,
    ...(extra.poster || extra.posterEs
      ? { poster: (locale === "es" && extra.posterEs) || extra.poster }
      : {}),
    ...(extra.backdrop ? { backdrop: extra.backdrop } : {}),
    ...(extra.vote ? { vote: extra.vote } : {}),
    synopsis: pick(title.synopsis, locale),
    stops: title.journey.map((stop) => stopCard(stop, locale)),
  };
}

export function allTitleCards(locale: Locale): TitleCard[] {
  return TITLES.map((title) => titleCard(title, locale));
}

export function eventCard(
  event: EventsFile["events"][number],
  locale: Locale
): EventCard {
  return {
    id: event.id,
    date: event.date,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    era: event.era,
    category: event.category,
    title: pick(event.title, locale),
    summary: pick(event.summary, locale),
    ...(event.coordinates ? { coordinates: event.coordinates } : {}),
    ...(event.place ? { place: pick(event.place, locale) } : {}),
    wikipedia:
      locale === "es" && event.wikipediaEs
        ? event.wikipediaEs
        : event.wikipediaEn,
    ...(event.major ? { major: true } : {}),
  };
}

export function allEvents(locale: Locale): EventCard[] {
  return EVENTS.map((event) => eventCard(event, locale));
}

function distanceKm(a: LonLat, b: LonLat): number {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

interface PlaceAggregate {
  id: string;
  coordinates: LonLat;
  names: Localized;
  titles: Title[];
}

const PLACE_INDEX: Map<string, PlaceAggregate> = (() => {
  const map = new Map<string, PlaceAggregate>();
  for (const title of TITLES) {
    for (const stop of title.journey) {
      const entry = map.get(stop.place);
      if (!entry) {
        map.set(stop.place, {
          id: stop.place,
          coordinates: stop.coordinates,
          names: stop.name,
          titles: [title],
        });
      } else if (!entry.titles.includes(title)) {
        entry.titles.push(title);
      }
    }
  }
  return map;
})();

export function placeIds(): string[] {
  return [...PLACE_INDEX.values()]
    .filter((p) => p.titles.length >= 2)
    .map((p) => p.id);
}

function placeName(place: PlaceAggregate, locale: Locale): string {
  const curated = PLACES[place.id]?.name;
  if (curated) return pick(curated, locale);
  // Stop names can carry a sub-location ("Stalingrad factory district"); the
  // shortest name among the stops is the plain place name.
  const names = TITLES.flatMap((t) => t.journey)
    .filter((s) => s.place === place.id)
    .map((s) => pick(s.name, locale));
  return names.sort((a, b) => a.length - b.length)[0] ?? place.id;
}

function placeSummary(place: PlaceAggregate, locale: Locale): PlaceSummary {
  const gold = place.titles.find((t) => t.gold) ?? place.titles[0];
  const poster = gold ? TMDB[gold.id]?.poster : undefined;
  return {
    id: place.id,
    name: placeName(place, locale),
    coordinates: place.coordinates,
    count: place.titles.length,
    ...(poster ? { poster } : {}),
  };
}

export function allPlaces(locale: Locale): PlaceSummary[] {
  return [...PLACE_INDEX.values()]
    .filter((p) => p.titles.length >= 2)
    .map((p) => placeSummary(p, locale))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function placeDetail(
  id: string,
  locale: Locale
): PlaceDetail | undefined {
  const place = PLACE_INDEX.get(id);
  if (!place || place.titles.length < 2) return undefined;
  const summary = placeSummary(place, locale);
  const description = PLACES[id]?.description;
  const events = EVENTS.filter(
    (e) => e.coordinates && distanceKm(e.coordinates, place.coordinates) < 60
  ).map((e) => eventCard(e, locale));
  const nearby = [...PLACE_INDEX.values()]
    .filter((p) => p.id !== id && p.titles.length >= 2)
    .map((p) => ({ p, d: distanceKm(p.coordinates, place.coordinates) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 6)
    .map(({ p }) => placeSummary(p, locale));
  return {
    ...summary,
    ...(description ? { description: pick(description, locale) } : {}),
    titles: place.titles
      .slice()
      .sort((a, b) => Number(b.gold) - Number(a.gold) || a.year - b.year)
      .map((title) => ({
        ...titleCard(title, locale),
        here: title.journey
          .filter((s) => s.place === id)
          .map((s) => stopDetail(s, locale)),
      })),
    events,
    nearby,
  };
}

function relatedTitles(title: Title, locale: Locale): TitleCard[] {
  const places = new Set(title.journey.map((s) => s.place));
  const start = title.period.start;
  return TITLES.filter((other) => other.id !== title.id)
    .map((other) => {
      let score = 0;
      if (other.journey.some((s) => places.has(s.place))) score += 5;
      score +=
        other.theaters.filter((t) => title.theaters.includes(t)).length * 2;
      if (other.era === title.era) score += 1;
      if (
        Math.abs(
          Number(other.period.start.slice(0, 4)) - Number(start.slice(0, 4))
        ) <= 1
      )
        score += 2;
      if (other.gold) score += 1;
      return { other, score };
    })
    .filter(({ score }) => score >= 5)
    .sort((a, b) => b.score - a.score || b.other.year - a.other.year)
    .slice(0, 8)
    .map(({ other }) => titleCard(other, locale));
}

export function titleDetail(
  id: string,
  locale: Locale
): TitleDetail | undefined {
  const title = byId.get(id);
  if (!title) return undefined;
  const extra = TMDB[id] ?? {};
  const { stops: _stops, ...card } = titleCard(title, locale);
  const trailer =
    (locale === "es" ? extra.trailer?.es : extra.trailer?.en) ??
    extra.trailer?.en ??
    extra.trailer?.es;
  return {
    ...card,
    ...(title.originalTitle ? { originalTitle: title.originalTitle } : {}),
    ...(title.goldReason ? { goldReason: pick(title.goldReason, locale) } : {}),
    directors: title.directors,
    countries: title.countries,
    languages: title.languages,
    ...(extra.runtime ? { runtime: extra.runtime } : {}),
    ...((extra.seasons ?? title.seasons)
      ? { seasons: extra.seasons ?? title.seasons }
      : {}),
    ...(extra.genres ? { genres: extra.genres[locale] } : {}),
    ...(extra.cast ? { cast: extra.cast } : {}),
    ...(trailer ? { trailer } : {}),
    ...(TMDB[id] ? { streaming: true } : {}),
    history: title.history[locale].length
      ? title.history[locale]
      : title.history.en,
    journey: title.journey.map((stop) => stopDetail(stop, locale)),
    ids: title.ids,
    links: {
      wikipedia:
        locale === "es" && title.links.wikipediaEs
          ? title.links.wikipediaEs
          : title.links.wikipediaEn,
      wikipediaEn: title.links.wikipediaEn,
      ...(title.links.fandom ? { fandom: title.links.fandom } : {}),
      ...(title.links.official ? { official: title.links.official } : {}),
    },
    related: relatedTitles(title, locale),
    placePages: [...new Set(title.journey.map((s) => s.place))].filter(
      (p) => (PLACE_INDEX.get(p)?.titles.length ?? 0) >= 2
    ),
  };
}

export function titleIds(): string[] {
  return TITLES.map((t) => t.id);
}

export function worldData(): WorldData {
  const ops = [
    ...(europeOps as OperationsFile).operations,
    ...(worldOps as OperationsFile).operations,
  ];
  const fronts = (frontsFile as FrontsFile).frontlines;
  const countries = countriesFile as unknown as {
    sets: Record<string, { from: string; to: string }>;
    countries: Record<
      string,
      {
        name: Localized;
        label?: LonLat;
        labelRank?: number;
        timeline: [string, string][];
      }
    >;
  };
  return {
    operations: ops.map((op) => ({
      id: op.id,
      era: op.era,
      name: [op.name.en, op.name.es],
      faction: op.faction,
      unit: op.unit,
      count: op.count,
      start: toMonths(op.start),
      end: toMonths(op.end) + 1 / 31,
      path: op.path,
      ...(op.loop ? { loop: true } : {}),
      ...(op.weight ? { weight: op.weight } : {}),
    })),
    frontlines: fronts.map((front) => ({
      id: front.id,
      era: front.era,
      name: [front.name.en, front.name.es],
      snapshots: front.snapshots.map((s) => ({
        t: toMonths(s.date),
        line: s.line,
      })),
    })),
    countries: Object.fromEntries(
      Object.entries(countries.countries).map(([id, c]) => [
        id,
        {
          name: [c.name.en, c.name.es],
          ...(c.label ? { label: c.label, labelRank: c.labelRank ?? 3 } : {}),
          timeline: c.timeline.map(([date, status]) => [
            toMonths(date),
            status,
          ]),
        },
      ])
    ),
    sets: Object.fromEntries(
      Object.entries(countries.sets).map(([id, s]) => [
        id,
        { from: toMonths(s.from), to: toMonths(s.to) + 1 },
      ])
    ),
  };
}
