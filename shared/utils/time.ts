/** Timeline unit: months since January 1914 (fractional days included). */
export const TIME_MIN = 0;
export const TIME_MAX = (1945 - 1914) * 12 + 12;

export function toMonths(date: string): number {
  const [y, m = "1", d = "1"] = date.split("-");
  return (Number(y) - 1914) * 12 + (Number(m) - 1) + (Number(d) - 1) / 31;
}

export function monthParts(t: number): { year: number; month: number } {
  const whole = Math.floor(Math.max(TIME_MIN, Math.min(TIME_MAX - 0.001, t)));
  return { year: 1914 + Math.floor(whole / 12), month: whole % 12 };
}

const MONTHS: Record<string, string[]> = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  es: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
};

export function formatMonth(t: number, locale: string): string {
  const { year, month } = monthParts(t);
  return `${(MONTHS[locale] ?? MONTHS.en)![month]} ${year}`;
}

export function formatDate(date: string, locale: string): string {
  const [y, m, d] = date.split("-");
  const names = MONTHS[locale] ?? MONTHS.en!;
  if (!m) return y!;
  const month = names[Number(m) - 1];
  if (!d) return `${month} ${y}`;
  return locale === "es"
    ? `${Number(d)} ${month} ${y}`
    : `${month} ${Number(d)}, ${y}`;
}

export const ERA_RANGES = {
  ww1: [toMonths("1914-06-28"), toMonths("1918-11-11")],
  interwar: [toMonths("1918-11-11"), toMonths("1939-09-01")],
  ww2: [toMonths("1939-09-01"), toMonths("1945-09-02")],
} as const;

export function eraAt(t: number): "ww1" | "interwar" | "ww2" {
  if (t < ERA_RANGES.ww1[1]) return "ww1";
  if (t < ERA_RANGES.interwar[1]) return "interwar";
  return "ww2";
}
