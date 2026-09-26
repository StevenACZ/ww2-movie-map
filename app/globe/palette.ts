export type ColorMode = "side" | "war";

export const STATUS_KEYS = [
  "neutral",
  "war",
  "entente",
  "central",
  "allies",
  "axis",
  "soviet",
  "occupied-central",
  "occupied-axis",
  "occupied-allies",
  "occupied-soviet",
  "civil-war",
] as const;

export type Status = (typeof STATUS_KEYS)[number];

/** fill, hatch, pattern (0 solid, 1 hatched, 2 stripes). */
type Swatch = [string, string, number];

const SIDE: Record<Status, Swatch> = {
  neutral: ["#4d4c42", "#4d4c42", 0],
  war: ["#9a5a35", "#9a5a35", 0],
  entente: ["#3f6f9f", "#3f6f9f", 0],
  central: ["#6b6d58", "#6b6d58", 0],
  allies: ["#3f6f9f", "#3f6f9f", 0],
  axis: ["#3b3d36", "#3b3d36", 0],
  soviet: ["#a2362a", "#a2362a", 0],
  "occupied-central": ["#6b6d58", "#8c5a3c", 1],
  "occupied-axis": ["#3b3d36", "#7b3a2e", 1],
  "occupied-allies": ["#3f6f9f", "#2d3f55", 1],
  "occupied-soviet": ["#a2362a", "#5f2a24", 1],
  "civil-war": ["#8e5a26", "#3a2a18", 2],
};

const WAR: Record<Status, Swatch> = {
  neutral: ["#4a4a41", "#4a4a41", 0],
  war: ["#9c3527", "#9c3527", 0],
  entente: ["#9c3527", "#9c3527", 0],
  central: ["#9c3527", "#9c3527", 0],
  allies: ["#9c3527", "#9c3527", 0],
  axis: ["#9c3527", "#9c3527", 0],
  soviet: ["#9c3527", "#9c3527", 0],
  "occupied-central": ["#5e2a22", "#9c3527", 1],
  "occupied-axis": ["#5e2a22", "#9c3527", 1],
  "occupied-allies": ["#5e2a22", "#9c3527", 1],
  "occupied-soviet": ["#5e2a22", "#9c3527", 1],
  "civil-war": ["#8e5a26", "#3a2a18", 2],
};

export const LEGEND: Record<
  ColorMode,
  { key: string; fill: string; hatch?: string }[]
> = {
  side: [
    { key: "allies", fill: SIDE.allies[0] },
    { key: "axis", fill: SIDE.axis[0] },
    { key: "soviet", fill: SIDE.soviet[0] },
    { key: "central", fill: SIDE.central[0] },
    { key: "war", fill: SIDE.war[0] },
    {
      key: "occupied",
      fill: SIDE["occupied-axis"][0],
      hatch: SIDE["occupied-axis"][1],
    },
    {
      key: "civil-war",
      fill: SIDE["civil-war"][0],
      hatch: SIDE["civil-war"][1],
    },
    { key: "neutral", fill: SIDE.neutral[0] },
  ],
  war: [
    { key: "war", fill: WAR.war[0] },
    {
      key: "occupied",
      fill: WAR["occupied-axis"][0],
      hatch: WAR["occupied-axis"][1],
    },
    { key: "civil-war", fill: WAR["civil-war"][0], hatch: WAR["civil-war"][1] },
    { key: "neutral", fill: WAR.neutral[0] },
  ],
};

export function swatch(status: string, mode: ColorMode): Swatch {
  const table = mode === "side" ? SIDE : WAR;
  return table[status as Status] ?? table.neutral;
}

/** Which bloc controls a territory: borders between different blocs at war are drawn red. */
export function camp(status: string): string {
  switch (status) {
    case "entente":
    case "allies":
    case "occupied-allies":
      return "allies";
    case "central":
    case "occupied-central":
      return "central";
    case "axis":
    case "occupied-axis":
      return "axis";
    case "soviet":
    case "occupied-soviet":
      return "soviet";
    case "war":
      return "war";
    case "civil-war":
      return "civil-war";
    default:
      return "neutral";
  }
}

export function belligerent(status: string): boolean {
  return status !== "neutral";
}

export const FACTION_COLORS: Record<string, string> = {
  allies: "#8dbbe8",
  entente: "#8dbbe8",
  axis: "#c9ccbd",
  central: "#c9ccbd",
  soviet: "#ff6a52",
  republican: "#f0a948",
  nationalist: "#b8a36a",
  neutral: "#e6e0cc",
};
