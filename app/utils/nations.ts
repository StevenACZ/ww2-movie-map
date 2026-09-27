import type { WorldData } from "~~/types/view";

export const NATION_GROUPS = [
  "entente",
  "central",
  "allies",
  "axis",
  "soviet",
  "war",
  "civil-war",
  "occupied",
] as const;

export type NationGroup = (typeof NATION_GROUPS)[number];

export interface Flag {
  file: string;
  ratio: number;
}

export interface Nation {
  id: string;
  name: string;
  rank: number;
  flag: Flag;
}

function valueAt<T>(timeline: [number, T][] | undefined, t: number, empty: T) {
  let value = empty;
  for (const [month, next] of timeline ?? []) {
    if (month > t) break;
    value = next;
  }
  return value;
}

export function flagAt(world: WorldData, id: string, t: number): Flag | null {
  const slug = valueAt<string | null>(world.countries[id]?.flags, t, null);
  return slug ? (world.flags[slug] ?? null) : null;
}

export function nationsAt(
  world: WorldData,
  t: number,
  locale: string
): { key: NationGroup; nations: Nation[] }[] {
  const lang = locale === "es" ? 1 : 0;
  const groups = new Map<string, Nation[]>();
  for (const [id, country] of Object.entries(world.countries)) {
    const flag = flagAt(world, id, t);
    if (!flag) continue;
    const status = valueAt(country.timeline, t, "neutral");
    const key = status.startsWith("occupied-") ? "occupied" : status;
    const list = groups.get(key) ?? [];
    list.push({
      id,
      name: country.name[lang],
      rank: country.labelRank ?? 5,
      flag,
    });
    groups.set(key, list);
  }
  return NATION_GROUPS.flatMap((key) => {
    const nations = groups.get(key);
    if (!nations?.length) return [];
    nations.sort(
      (a, b) => a.rank - b.rank || a.name.localeCompare(b.name, locale)
    );
    return [{ key, nations }];
  });
}
