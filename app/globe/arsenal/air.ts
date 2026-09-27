import { PAINT } from "./palette";
import {
  ball,
  box,
  model,
  type Part,
  plan,
  profile,
  tube,
  HALF_PI,
} from "./parts";

function stripes(
  from: number,
  width: number,
  chord: [number, number],
  y: number
): Part[] {
  const parts: Part[] = [];
  for (let i = 0; i < 5; i++) {
    const hex = i % 2 ? PAINT.black : PAINT.white;
    for (const side of [-1, 1]) {
      parts.push(
        box(width, 0.004, chord[1] - chord[0], hex, {
          x: side * (from + (i + 0.5) * width),
          y,
          z: (chord[0] + chord[1]) / 2,
        })
      );
    }
  }
  return parts;
}

function bands(r: number, from: number, width: number, y = 0): Part[] {
  const parts: Part[] = [];
  for (let i = 0; i < 5; i++)
    parts.push(
      tube(r, r, width, i % 2 ? PAINT.black : PAINT.white, {
        y,
        z: from - (i + 0.5) * width,
      })
    );
  return parts;
}

function prop(x: number, y: number, z: number, r: number): Part {
  return tube(r, r, 0.004, PAINT.black, { x, y, z }, 14);
}

function engine(x: number, y: number, z: number, r: number, l: number) {
  return [
    tube(r * 0.7, r, l, PAINT.olive, { x, y, z }, 10),
    tube(r, r * 0.9, 0.03, PAINT.gun, { x, y, z: z + l / 2 + 0.01 }, 10),
    prop(x, y, z + l / 2 + 0.03, r * 2.1),
  ];
}

export function c47() {
  return model([
    tube(0.065, 0.065, 0.46, PAINT.olive, { z: 0.06 }, 12),
    ball(0.065, PAINT.olive, { z: 0.29, sz: 1.5 }, 12),
    box(0.07, 0.025, 0.05, PAINT.glass, { y: 0.045, z: 0.3 }),
    tube(0.012, 0.065, 0.34, PAINT.olive, { y: 0.015, z: -0.34 }, 12),
    ...bands(0.067, -0.08, 0.035),
    plan(
      [
        [-0.75, 0.13],
        [-0.75, 0.06],
        [-0.1, -0.02],
        [0.1, -0.02],
        [0.75, 0.06],
        [0.75, 0.13],
        [0.1, 0.2],
        [-0.1, 0.2],
      ],
      0.018,
      PAINT.olive,
      { y: -0.045 }
    ),
    ...stripes(0.27, 0.04, [0.0, 0.17], -0.026),
    ...engine(-0.2, -0.02, 0.2, 0.038, 0.16),
    ...engine(0.2, -0.02, 0.2, 0.038, 0.16),
    plan(
      [
        [-0.2, -0.42],
        [-0.18, -0.48],
        [0.18, -0.48],
        [0.2, -0.42],
        [0, -0.36],
      ],
      0.01,
      PAINT.olive,
      { y: 0.01 }
    ),
    profile(
      [
        [-0.5, 0.02],
        [-0.36, 0.03],
        [-0.46, 0.17],
        [-0.5, 0.17],
      ],
      0.012,
      PAINT.olive
    ),
  ]);
}

export function horsa() {
  return model([
    ball(0.06, PAINT.glass, { z: 0.36, sz: 1.3 }, 10),
    tube(0.06, 0.06, 0.4, PAINT.raf, { z: 0.14 }, 10),
    tube(0.03, 0.06, 0.44, PAINT.raf, { y: 0.01, z: -0.28 }, 10),
    ...bands(0.062, 0.02, 0.035),
    plan(
      [
        [-0.66, 0.17],
        [-0.66, 0.1],
        [0, 0.06],
        [0.66, 0.1],
        [0.66, 0.17],
        [0, 0.24],
      ],
      0.016,
      PAINT.raf,
      { y: 0.055 }
    ),
    ...stripes(0.12, 0.04, [0.08, 0.2], 0.073),
    plan(
      [
        [-0.2, -0.4],
        [-0.18, -0.46],
        [0.18, -0.46],
        [0.2, -0.4],
        [0, -0.34],
      ],
      0.01,
      PAINT.raf,
      { y: 0.03 }
    ),
    profile(
      [
        [-0.5, 0.02],
        [-0.34, 0.04],
        [-0.42, 0.2],
        [-0.5, 0.2],
      ],
      0.012,
      PAINT.raf
    ),
    box(0.012, 0.05, 0.012, PAINT.black, { x: -0.05, y: -0.08, z: 0.1 }),
    box(0.012, 0.05, 0.012, PAINT.black, { x: 0.05, y: -0.08, z: 0.1 }),
  ]);
}

export function b24() {
  const nacelles = [-0.44, -0.2, 0.2, 0.44].flatMap((x) => [
    tube(0.028, 0.036, 0.22, PAINT.silver, { x, y: 0.02, z: 0.12 }, 10),
    prop(x, 0.02, 0.24, 0.07),
  ]);
  return model([
    profile(
      [
        [0.42, -0.04],
        [0.46, 0.0],
        [0.44, 0.05],
        [0.3, 0.08],
        [-0.3, 0.07],
        [-0.46, 0.04],
        [-0.46, 0.0],
        [-0.3, -0.08],
        [0.3, -0.08],
      ],
      0.1,
      PAINT.silver
    ),
    ball(0.045, PAINT.glass, { y: 0.01, z: 0.45 }, 8),
    box(0.06, 0.03, 0.06, PAINT.glass, { y: 0.085, z: 0.32 }),
    plan(
      [
        [-0.8, 0.16],
        [-0.8, 0.11],
        [0, 0.04],
        [0.8, 0.11],
        [0.8, 0.16],
        [0, 0.21],
      ],
      0.018,
      PAINT.silver,
      { y: 0.06 }
    ),
    ...nacelles,
    plan(
      [
        [-0.24, -0.39],
        [-0.24, -0.46],
        [0.24, -0.46],
        [0.24, -0.39],
      ],
      0.01,
      PAINT.silver,
      { y: 0.04 }
    ),
    ...[-0.24, 0.24].map((x) =>
      tube(0.07, 0.07, 0.012, PAINT.olive, {
        x,
        y: 0.06,
        z: -0.43,
        ry: HALF_PI,
        sy: 1.2,
      })
    ),
    box(0.02, 0.012, 0.04, PAINT.olive, { y: 0.08, z: 0.34 }),
  ]);
}
