export type Locale = "en" | "es";

export interface Localized {
  en: string;
  es: string;
}

export interface LocalizedList {
  en: string[];
  es: string[];
}

/** [longitude, latitude] in WGS84 degrees. */
export type LonLat = [number, number];

/** "YYYY", "YYYY-MM" or "YYYY-MM-DD". */
export type IsoDate = string;

export type Era = "ww1" | "interwar" | "ww2";

export type Theater =
  | "western-europe"
  | "eastern-europe"
  | "mediterranean"
  | "atlantic"
  | "pacific"
  | "asia"
  | "americas";

export type Tag =
  | "combat"
  | "holocaust"
  | "resistance"
  | "espionage"
  | "air"
  | "naval"
  | "home-front"
  | "prisoners"
  | "civil-war"
  | "politics"
  | "biography"
  | "true-story"
  | "animation"
  | "documentary"
  | "comedy"
  | "romance";

export type StopKind =
  | "battle"
  | "city"
  | "front"
  | "camp"
  | "sea"
  | "landing"
  | "base"
  | "home"
  | "journey";

export interface Stop {
  /** Shared kebab-case place id reused across titles, e.g. "stalingrad", "omaha-beach". */
  place: string;
  name: Localized;
  coordinates: LonLat;
  /** Historical date when the story is at this stop. */
  date: IsoDate;
  kind: StopKind;
  /** The title's most iconic location; exactly one stop per title. */
  primary?: boolean;
  /** What happens in the story here, spoiler-light. */
  story: Localized;
  /** What really happened here, one sentence. */
  history?: Localized;
}

export interface Title {
  id: string;
  kind: "film" | "series";
  title: string;
  titleEs: string;
  originalTitle?: string;
  year: number;
  endYear?: number;
  seasons?: number;
  era: Era;
  period: { start: IsoDate; end: IsoDate };
  theaters: Theater[];
  tags: Tag[];
  gold: boolean;
  goldReason?: Localized;
  directors: string[];
  countries: string[];
  languages: string[];
  runtime?: number;
  ids: {
    tmdb: number;
    tmdbType: "movie" | "tv";
    imdb: string;
    wikidata?: string;
  };
  links: {
    wikipediaEn: string;
    wikipediaEs?: string;
    fandom?: string;
    official?: string;
  };
  synopsis: Localized;
  history: LocalizedList;
  journey: Stop[];
}

export interface TitlesFile {
  titles: Title[];
}

export type PostersFile = Record<
  string,
  { src: string; width: number; height: number; source: string }
>;

export type EventCategory =
  | "war"
  | "battle"
  | "politics"
  | "diplomacy"
  | "holocaust"
  | "home-front"
  | "technology"
  | "naval"
  | "air";

export interface HistoricalEvent {
  id: string;
  date: IsoDate;
  endDate?: IsoDate;
  era: Era;
  category: EventCategory;
  title: Localized;
  summary: Localized;
  coordinates?: LonLat;
  place?: Localized;
  wikipediaEn: string;
  wikipediaEs?: string;
  /** Milestones that anchor the timeline and the globe scrubber. */
  major?: boolean;
}

export interface EventsFile {
  events: HistoricalEvent[];
}

export interface PlaceNote {
  name?: Localized;
  description?: Localized;
  aliases?: string[];
}

export interface PlacesFile {
  places: Record<string, PlaceNote>;
}

export type Faction =
  | "entente"
  | "central"
  | "allies"
  | "axis"
  | "soviet"
  | "republican"
  | "nationalist"
  | "neutral";

export type UnitKind =
  "tank" | "infantry" | "ship" | "carrier" | "submarine" | "fighter" | "bomber";

export interface Operation {
  id: string;
  era: Era;
  name: Localized;
  summary: Localized;
  faction: Faction;
  unit: UnitKind;
  /** Number of models drawn along the path (1-6). */
  count: number;
  start: IsoDate;
  end: IsoDate;
  /** Ordered path. Progress along it follows the timeline date between start and end. */
  path: LonLat[];
  /** Patrols, convoys and bombing runs cycle along the path while active. */
  loop?: boolean;
  /** Relative importance when the globe picks which operations get units (default 1). */
  weight?: number;
  wikipediaEn?: string;
}

export interface Frontline {
  id: string;
  era: Era;
  name: Localized;
  sources?: string[];
  /** Snapshots ordered by date; the globe interpolates between neighbours. */
  snapshots: { date: IsoDate; line: LonLat[] }[];
}

export interface OperationsFile {
  operations: Operation[];
}

export interface FrontsFile {
  frontlines: Frontline[];
}
