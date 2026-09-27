import { toMonths } from "~~/shared/utils/time";

export type SetPieceId =
  | "messines"
  | "dunkirk"
  | "pearl-harbor"
  | "midway"
  | "d-day"
  | "hiroshima"
  | "nagasaki";

export interface SetPieceMeta {
  id: SetPieceId;
  date: string;
  at: [number, number];
  clock: string;
  era: "ww1" | "ww2";
  event?: string;
  duration: number;
  beats: number[];
  stills: number[];
  vignette: string;
}

export const SET_PIECES: SetPieceMeta[] = [
  {
    id: "messines",
    date: "1917-06-07",
    at: [2.895, 50.763],
    clock: "03:10",
    era: "ww1",
    duration: 28,
    beats: [0, 5, 9, 15, 21],
    stills: [2.5, 7, 11.5, 17, 25],
    vignette:
      '<path d="M4 44h56" stroke-width="2"/><path d="M4 44c8-4 14-6 22-6s16 3 34 6" fill="currentColor" fill-opacity=".18"/><path d="M14 40c-2-8 2-14 6-16-1 4 2 6 4 4 0-5 3-9 7-10-2 5 1 8 3 7 1-4 4-6 7-6-3 4-1 8 1 9 2-3 5-3 7-2-4 3-4 10-6 14" fill="currentColor" fill-opacity=".35"/><path d="M8 40c1-3 3-4 5-4M50 40c1-3 3-4 5-4" />',
  },
  {
    id: "dunkirk",
    event: "dunkirk-evacuation",
    date: "1940-05-26",
    at: [2.3764, 51.0378],
    clock: "",
    era: "ww2",
    duration: 30,
    beats: [0, 5, 10, 15, 20, 26],
    stills: [3, 8, 13, 17.5, 23, 28.5],
    vignette:
      '<path d="M4 46c6 2 10 2 16 0s10-2 16 0 10 2 16 0 6-2 8-1" /><path d="M14 40h14l-3 4H17z" fill="currentColor" fill-opacity=".35"/><path d="M36 38h16l-3 5H39z" fill="currentColor" fill-opacity=".35"/><path d="M21 40v-8l5 6M44 38v-7" /><path d="M50 10c-4 2-5 6-3 10s0 8-4 10M56 8c-3 3-3 7-1 10" stroke-width="2.4" opacity=".7"/>',
  },
  {
    id: "pearl-harbor",
    event: "attack-on-pearl-harbor",
    date: "1941-12-07",
    at: [-157.9536, 21.3619],
    clock: "07:48",
    era: "ww2",
    duration: 32,
    beats: [0, 6, 12, 18, 24, 28],
    stills: [3.5, 9.5, 15, 20.5, 26, 30.5],
    vignette:
      '<path d="M6 44h52" /><path d="M10 44l3-5h34l4 5" fill="currentColor" fill-opacity=".3"/><path d="M22 39v-6h6v6M31 39v-9h4v9" /><path d="M42 14l10-3-4 4M20 18l12-2-4 4" /><path d="M36 38c2-8 8-12 12-22" stroke-width="2.4" opacity=".6"/>',
  },
  {
    id: "midway",
    event: "battle-of-midway",
    date: "1942-06-04",
    at: [-177.35, 28.2075],
    clock: "10:25",
    era: "ww2",
    duration: 32,
    beats: [0, 6, 12, 17, 23, 28],
    stills: [3, 9, 14.5, 20, 25.5, 30.5],
    vignette:
      '<path d="M6 46h52" /><path d="M8 46l4-4h40l4 4" fill="currentColor" fill-opacity=".3"/><path d="M40 42v-5h4v5" /><path d="M24 8l2 10M20 12l12-2M28 22l2 10" /><path d="M22 40c0-6 4-8 4-14" stroke-width="2.4" opacity=".6"/>',
  },
  {
    id: "d-day",
    event: "d-day",
    date: "1944-06-06",
    at: [-0.8686, 49.3689],
    clock: "06:30",
    era: "ww2",
    duration: 32,
    beats: [0, 6, 12, 18, 25],
    stills: [3, 9.5, 15, 22, 29.5],
    vignette:
      '<path d="M4 34c10 3 22 3 30 0s18-3 26 0" /><path d="M4 46h56" /><path d="M10 44l2-4h10v4zM28 44l2-4h10v4zM46 44l2-4h10v4z" fill="currentColor" fill-opacity=".35"/><circle cx="18" cy="12" r="4" /><path d="M14 12l4 8 4-8M44 8l3 6 3-6" />',
  },
  {
    id: "hiroshima",
    event: "atomic-bombing-of-hiroshima",
    date: "1945-08-06",
    at: [132.4536, 34.3956],
    clock: "08:15",
    era: "ww2",
    duration: 32,
    beats: [0, 5, 9, 15, 20, 27],
    stills: [2.5, 7.5, 12, 16.5, 24, 31],
    vignette:
      '<path d="M4 48h56" /><path d="M28 48c1-8 1-16 0-22h8c-1 6-1 14 0 22z" fill="currentColor" fill-opacity=".3"/><path d="M16 22c-6 0-8-8-2-10 1-6 9-8 13-4 3-4 11-3 12 2 6-1 10 6 5 10 3 4-2 8-7 6-4 3-15 3-21-4z" fill="currentColor" fill-opacity=".35"/><path d="M18 40c5-2 23-2 28 0" />',
  },
  {
    id: "nagasaki",
    event: "atomic-bombing-of-nagasaki",
    date: "1945-08-09",
    at: [129.8796, 32.7495],
    clock: "11:02",
    era: "ww2",
    duration: 32,
    beats: [0, 5, 9, 15, 21, 27],
    stills: [2.5, 7.5, 12, 17, 24, 31],
    vignette:
      '<path d="M4 48l10-10 8 6 10-4 10 4 8-6 10 10" /><path d="M29 44c1-8 1-14 0-20h6c-1 6-1 12 0 20z" fill="currentColor" fill-opacity=".3"/><path d="M18 22c-5-1-6-7-1-9 2-5 9-6 12-2 4-3 10-1 10 3 5 0 7 6 3 8 1 4-4 6-8 4-4 2-12 2-16-4z" fill="currentColor" fill-opacity=".35"/>',
  },
];

export function beatAt(meta: SetPieceMeta, t: number): number {
  let index = 0;
  for (let i = 0; i < meta.beats.length; i++)
    if (t >= meta.beats[i]!) index = i;
  return index;
}

export const SET_PIECE_BY_EVENT = new Map(
  SET_PIECES.flatMap((piece) =>
    piece.event ? [[piece.event, piece.id] as const] : []
  )
);

export function featuredPiece(time: number): SetPieceMeta | null {
  let best: SetPieceMeta | null = null;
  let gap = Infinity;
  for (const piece of SET_PIECES) {
    const diff = time - toMonths(piece.date);
    if (diff < -1 || diff > 3) continue;
    if (Math.abs(diff) < gap) {
      gap = Math.abs(diff);
      best = piece;
    }
  }
  return best;
}
