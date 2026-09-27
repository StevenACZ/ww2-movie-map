import type {
  Era,
  EventCategory,
  Faction,
  IsoDate,
  Locale,
  LonLat,
  StopKind,
  Tag,
  Theater,
  UnitKind,
} from "./data";

export interface TmdbExtra {
  poster?: string;
  posterEs?: string;
  backdrop?: string;
  runtime?: number;
  seasons?: number;
  episodes?: number;
  vote?: number;
  votes?: number;
  genres?: { en: string[]; es: string[] };
  trailer?: { en?: string; es?: string };
  titleEs?: string;
  releaseDate?: string;
  cast?: string[];
}

export interface TmdbFile {
  syncedAt: string | null;
  titles: Record<string, TmdbExtra>;
}

/** Stop as sent to lists and the globe: localized, compact. */
export interface StopCard {
  place: string;
  name: string;
  coordinates: LonLat;
  date: IsoDate;
  kind: StopKind;
  primary?: boolean;
}

export interface TitleCard {
  id: string;
  kind: "film" | "series";
  title: string;
  /** English title shown as a subtitle on the Spanish site when it differs. */
  altTitle?: string;
  year: number;
  endYear?: number;
  era: Era;
  gold: boolean;
  theaters: Theater[];
  tags: Tag[];
  period: { start: IsoDate; end: IsoDate };
  poster?: string;
  backdrop?: string;
  vote?: number;
  synopsis: string;
  stops: StopCard[];
}

export interface StopDetail extends StopCard {
  story: string;
  history?: string;
}

export interface TitleDetail extends Omit<TitleCard, "stops"> {
  originalTitle?: string;
  goldReason?: string;
  directors: string[];
  countries: string[];
  languages: string[];
  runtime?: number;
  seasons?: number;
  genres?: string[];
  cast?: string[];
  trailer?: string;
  streaming?: boolean;
  history: string[];
  journey: StopDetail[];
  ids: {
    tmdb: number;
    tmdbType: "movie" | "tv";
    imdb: string;
    wikidata?: string;
  };
  links: {
    wikipedia: string;
    wikipediaEn: string;
    fandom?: string;
    official?: string;
  };
  related: TitleCard[];
  placePages: string[];
}

export interface PlaceSummary {
  id: string;
  name: string;
  coordinates: LonLat;
  count: number;
  poster?: string;
}

export interface PlaceDetail extends PlaceSummary {
  description?: string;
  titles: (TitleCard & { here: StopDetail[] })[];
  events: EventCard[];
  nearby: PlaceSummary[];
}

export interface EventCard {
  id: string;
  date: IsoDate;
  endDate?: IsoDate;
  era: Era;
  category: EventCategory;
  title: string;
  summary: string;
  coordinates?: LonLat;
  place?: string;
  wikipedia: string;
  major?: boolean;
}

export interface IndexPayload {
  locale: Locale;
  titles: TitleCard[];
  events: EventCard[];
}

/** Compact globe dataset, fetched lazily by the map. */
export interface WorldData {
  operations: {
    id: string;
    era: Era;
    name: [string, string];
    faction: Faction;
    unit: UnitKind;
    count: number;
    start: number;
    end: number;
    path: LonLat[];
    loop?: boolean;
    weight?: number;
  }[];
  frontlines: {
    id: string;
    era: Era;
    name: [string, string];
    snapshots: { t: number; line: LonLat[] }[];
  }[];
  countries: Record<
    string,
    {
      name: [string, string];
      label?: LonLat;
      labelRank?: number;
      timeline: [number, string][];
      flags?: [number, string | null][];
    }
  >;
  flags: Record<string, { file: string; ratio: number }>;
  sets: Record<string, { from: number; to: number }>;
}
