import type { Era } from "~~/types/data";

export const ATLAS_REGIONS = [
  "world",
  "west",
  "east",
  "med",
  "pacific",
  "asia",
] as const;
export type AtlasRegion = (typeof ATLAS_REGIONS)[number];
export type AtlasBox = [number, number, number, number];

export const ATLAS_ERAS: Era[] = ["ww1", "interwar", "ww2"];

export const ERA_COLOR: Record<Era, string> = {
  ww1: "#c49a5c",
  interwar: "#c5634f",
  ww2: "#a9b870",
};

export interface AtlasPlace {
  x: number;
  y: number;
  e: Era;
  n: [number, number, number];
  c?: string;
  t: number[];
}

export interface AtlasTitle {
  t: [string] | [string, string];
  y: number;
  e: Era;
  k: "film" | "series";
  g?: 1;
  p?: string;
  pe?: string;
}

export interface AtlasData {
  w: number;
  h: number;
  land: { id: string; d: string }[];
  graticule: string;
  outline: string;
  regions: Record<AtlasRegion, AtlasBox>;
  labels: { id: string; x: number; y: number }[];
  countries: Record<string, [string, string]>;
  titles: AtlasTitle[];
  places: Record<string, AtlasPlace>;
}

export function arcPath(
  ax: number,
  ay: number,
  bx: number,
  by: number
): string {
  const dx = bx - ax;
  const dy = by - ay;
  const bend = 0.22 * (dx >= 0 ? 1 : -1);
  const cx = (ax + bx) / 2 + dy * bend;
  const cy = (ay + by) / 2 - Math.abs(dx) * 0.22 - Math.abs(dy) * 0.05;
  return `M${ax} ${ay}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx} ${by}`;
}

export interface LabelCandidate {
  id: string;
  x: number;
  y: number;
  r: number;
  w: number;
}

export type LabelSide = "r" | "l" | "t" | "b";

const LABEL_H = 14;
const GAP = 5;

export function placeLabels(
  items: LabelCandidate[],
  limit: number,
  width: number,
  height: number
): { id: string; side: LabelSide }[] {
  const boxes: AtlasBox[] = items.map(({ x, y, r }) => [
    x - r,
    y - r,
    r * 2,
    r * 2,
  ]);
  const placed: { id: string; side: LabelSide }[] = [];
  for (const item of items) {
    if (placed.length >= limit) break;
    if (item.x < 0 || item.y < 0 || item.x > width || item.y > height) continue;
    const options: [LabelSide, AtlasBox][] = [
      ["r", [item.x + item.r + GAP, item.y - LABEL_H / 2, item.w, LABEL_H]],
      [
        "l",
        [item.x - item.r - GAP - item.w, item.y - LABEL_H / 2, item.w, LABEL_H],
      ],
      [
        "t",
        [item.x - item.w / 2, item.y - item.r - GAP - LABEL_H, item.w, LABEL_H],
      ],
      ["b", [item.x - item.w / 2, item.y + item.r + GAP, item.w, LABEL_H]],
    ];
    const free = options.find(
      ([, [x, y, w, h]]) =>
        x >= 4 &&
        y >= 4 &&
        x + w <= width - 4 &&
        y + h <= height - 4 &&
        boxes.every(
          ([bx, by, bw, bh]) =>
            x + w < bx || bx + bw < x || y + h < by || by + bh < y
        )
    );
    if (!free) continue;
    boxes.push(free[1]);
    placed.push({ id: item.id, side: free[0] });
  }
  return placed;
}
