import { PAINT } from "./palette";
import { box, dome, model, type Part, profile, rod, tube } from "./parts";

export function casemate() {
  return model([
    dome(0.62, PAINT.berm, { y: -0.02, sy: 0.32, sz: 0.8 }, 14),
    profile(
      [
        [-0.34, 0],
        [0.3, 0],
        [0.36, 0.1],
        [0.3, 0.26],
        [-0.34, 0.26],
      ],
      0.56,
      PAINT.concrete
    ),
    box(0.62, 0.05, 0.1, PAINT.concrete, { y: 0.28, z: 0.3 }),
    box(0.2, 0.08, 0.04, PAINT.black, { y: 0.15, z: 0.35 }),
    tube(0.018, 0.016, 0.34, PAINT.gun, { y: 0.15, z: 0.5 }, 8),
    box(0.04, 0.04, 0.04, PAINT.gun, { y: 0.15, z: 0.67 }),
    box(0.56, 0.02, 0.6, PAINT.concreteDark, { y: 0.27, z: -0.03 }),
  ]);
}

export function mgNest() {
  const bags: Part[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    bags.push(
      box(0.12, 0.06, 0.07, PAINT.sandbag, {
        x: Math.cos(a) * 0.32,
        y: 0.05,
        z: Math.sin(a) * 0.32,
        ry: -a,
      })
    );
  }
  return model([
    rod(0.3, 0.08, PAINT.concrete, { y: 0.04 }, 16),
    rod(0.12, 0.09, PAINT.black, { y: 0.05 }, 12),
    ...bags,
    box(0.03, 0.03, 0.08, PAINT.gun, { y: 0.1 }),
    tube(0.008, 0.008, 0.22, PAINT.gun, { y: 0.1, z: 0.14 }, 6),
    dome(0.04, PAINT.fieldGrey, { x: -0.06, y: 0.13, z: -0.02, sy: 0.7 }, 8),
  ]);
}

export function hedgehog() {
  const beam = (rx: number, ry: number, rz: number): Part =>
    box(0.08, 0.9, 0.08, PAINT.steel, { y: 0.28, rx, ry, rz });
  return model([
    beam(0.95, 0, 0),
    beam(0.95, (Math.PI * 2) / 3, 0),
    beam(0.95, (Math.PI * 4) / 3, 0),
  ]);
}
