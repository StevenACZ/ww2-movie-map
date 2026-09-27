import { PAINT } from "./palette";
import {
  ball,
  box,
  dome,
  model,
  type Part,
  profile,
  rod,
  star,
  tube,
  wheel,
  HALF_PI,
} from "./parts";

function tracks(width: number, length: number, wheels: number): Part[] {
  const parts: Part[] = [];
  for (const side of [-1, 1]) {
    const x = side * width;
    parts.push(
      box(0.1, 0.13, length, PAINT.tread, { x, y: 0.085 }),
      box(0.105, 0.02, length * 0.96, PAINT.steel, { x, y: 0.16 })
    );
    for (let i = 0; i < wheels; i++) {
      const z = -length * 0.38 + (i / (wheels - 1)) * length * 0.76;
      parts.push(
        wheel(0.05, 0.03, PAINT.steel, { x: x + side * 0.055, y: 0.07, z })
      );
    }
  }
  return parts;
}

function shermanHull(): Part[] {
  return [
    ...tracks(0.19, 0.96, 6),
    box(0.3, 0.1, 0.9, PAINT.olive, { y: 0.16 }),
    profile(
      [
        [-0.47, 0.19],
        [0.48, 0.19],
        [0.3, 0.34],
        [-0.42, 0.34],
        [-0.47, 0.3],
      ],
      0.46,
      PAINT.olive
    ),
    box(0.06, 0.03, 0.08, PAINT.oliveLight, { x: -0.12, y: 0.35, z: 0.26 }),
    box(0.06, 0.03, 0.08, PAINT.oliveLight, { x: 0.12, y: 0.35, z: 0.26 }),
    box(0.34, 0.02, 0.2, PAINT.oliveLight, { y: 0.345, z: -0.3 }),
    star(0.06, PAINT.white, { x: 0.232, y: 0.27, z: -0.05, ry: HALF_PI }),
    star(0.06, PAINT.white, { x: -0.232, y: 0.27, z: -0.05, ry: -HALF_PI }),
  ];
}

export function sherman() {
  return model([
    ...shermanHull(),
    rod(0.15, 0.1, PAINT.olive, { y: 0.39, z: -0.02 }, 12),
    dome(0.15, PAINT.olive, { y: 0.44, z: -0.02, sy: 0.5 }),
    box(0.17, 0.09, 0.06, PAINT.oliveLight, { y: 0.41, z: 0.13 }),
    tube(0.02, 0.018, 0.4, PAINT.gun, { y: 0.41, z: 0.34 }, 8),
    rod(0.035, 0.04, PAINT.oliveLight, { x: 0.05, y: 0.5, z: -0.06 }, 8),
    tube(0.006, 0.006, 0.12, PAINT.gun, { x: 0.05, y: 0.53, z: 0.0 }, 5),
  ]);
}

export function shermanDD() {
  return model([
    ...tracks(0.19, 0.96, 6),
    box(0.3, 0.1, 0.9, PAINT.olive, { y: 0.16 }),
    rod(0.5, 0.3, PAINT.canvas, { y: 0.36, sx: 0.55, sz: 1.08 }, 18),
    rod(0.5, 0.02, PAINT.khaki, { y: 0.52, sx: 0.56, sz: 1.09 }, 18),
    rod(0.14, 0.08, PAINT.olive, { y: 0.54, z: -0.04 }, 12),
    tube(0.018, 0.016, 0.3, PAINT.gun, { y: 0.55, z: 0.22 }, 8),
  ]);
}

export function panzerIV() {
  const skirt = (side: number): Part =>
    box(0.012, 0.13, 0.72, PAINT.dunkelgelb, { x: side * 0.25, y: 0.25 });
  return model([
    ...tracks(0.18, 0.9, 8),
    box(0.34, 0.12, 0.84, PAINT.dunkelgelb, { y: 0.17 }),
    box(0.44, 0.1, 0.6, PAINT.dunkelgelb, { y: 0.28, z: -0.06 }),
    profile(
      [
        [0.24, 0.23],
        [0.42, 0.2],
        [0.42, 0.25],
        [0.24, 0.33],
      ],
      0.34,
      PAINT.dunkelgelb
    ),
    skirt(-1),
    skirt(1),
    profile(
      [
        [-0.2, 0.33],
        [0.12, 0.33],
        [0.1, 0.45],
        [-0.18, 0.45],
      ],
      0.3,
      PAINT.dunkelgelb
    ),
    box(0.012, 0.11, 0.3, PAINT.panzerGrey, { x: 0.2, y: 0.4, z: -0.05 }),
    box(0.012, 0.11, 0.3, PAINT.panzerGrey, { x: -0.2, y: 0.4, z: -0.05 }),
    box(0.4, 0.11, 0.012, PAINT.panzerGrey, { y: 0.4, z: -0.21 }),
    rod(0.05, 0.05, PAINT.dunkelgelb, { y: 0.48, z: -0.1 }, 8),
    tube(0.018, 0.016, 0.46, PAINT.gun, { y: 0.39, z: 0.35 }, 8),
    box(0.05, 0.04, 0.05, PAINT.gun, { y: 0.39, z: 0.59 }),
    ...[-1, 1].flatMap((side) => [
      box(0.002, 0.12, 0.04, PAINT.white, { x: side * 0.257, y: 0.26 }),
      box(0.002, 0.04, 0.12, PAINT.white, { x: side * 0.257, y: 0.26 }),
      box(0.002, 0.1, 0.022, PAINT.black, { x: side * 0.259, y: 0.26 }),
      box(0.002, 0.022, 0.1, PAINT.black, { x: side * 0.259, y: 0.26 }),
    ]),
  ]);
}

function soldier(x: number, z: number, uniform: number, helmet: number) {
  return [
    box(0.07, 0.14, 0.05, uniform, { x, y: 0.07, z }),
    box(0.09, 0.14, 0.07, uniform, { x, y: 0.2, z }),
    box(0.06, 0.08, 0.04, PAINT.khaki, { x, y: 0.21, z: z - 0.05 }),
    ball(0.03, PAINT.skin, { x, y: 0.3, z }, 6),
    dome(0.045, helmet, { x, y: 0.31, z, sy: 0.7 }, 8),
    box(0.012, 0.012, 0.18, PAINT.gun, { x: x + 0.05, y: 0.22, z: z + 0.05 }),
  ];
}

export function infantry() {
  const parts: Part[] = [];
  const spots: [number, number][] = [
    [-0.3, 0.25],
    [0, 0.35],
    [0.3, 0.2],
    [-0.15, -0.05],
    [0.18, -0.1],
    [-0.35, -0.3],
    [0.05, -0.35],
    [0.35, -0.3],
  ];
  for (const [x, z] of spots)
    parts.push(...soldier(x, z, PAINT.oliveLight, PAINT.helmet));
  return model(parts);
}

export function paratrooper() {
  const lines: Part[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * 0.26;
    const z = Math.sin(a) * 0.26;
    lines.push(
      box(0.006, Math.hypot(x, z, 0.38), 0.006, PAINT.khaki, {
        x: x / 2,
        y: 0.41,
        z: z / 2,
        rx: Math.atan2(z, 0.38),
        rz: -Math.atan2(x, 0.38),
      })
    );
  }
  return model([
    dome(0.3, PAINT.canopy, { y: 0.6, sy: 0.55 }, 14),
    rod(0.3, 0.02, PAINT.khaki, { y: 0.6 }, 14),
    ...lines,
    box(0.05, 0.1, 0.04, PAINT.oliveLight, { y: 0.14 }),
    box(0.04, 0.1, 0.035, PAINT.oliveLight, { y: 0.05 }),
    dome(0.03, PAINT.helmet, { y: 0.21, sy: 0.8 }, 8),
  ]);
}
