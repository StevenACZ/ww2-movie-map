import { PAINT } from "./palette";
import { box, cone, model, type Part, profile } from "./parts";

function house(x: number, z: number, w: number, l: number, yaw: number) {
  const h = w * 0.7;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const at = { x, z, ry: yaw };
  return [
    box(w, h, l, PAINT.stone, { ...at, y: h / 2 }),
    profile(
      [
        [-w / 2 - 0.01, 0],
        [w / 2 + 0.01, 0],
        [0, w * 0.45],
      ],
      l + 0.02,
      PAINT.roof,
      { y: h, x, z, ry: yaw + Math.PI / 2 }
    ),
    box(w * 0.18, w * 0.25, w * 0.18, PAINT.stone, {
      x: x + c * w * 0.25,
      y: h + w * 0.3,
      z: z - s * w * 0.25,
    }),
  ] as Part[];
}

export function village() {
  const parts: Part[] = [
    box(0.1, 0.34, 0.1, PAINT.stone, { y: 0.17 }),
    box(0.14, 0.14, 0.28, PAINT.stone, { y: 0.07, z: -0.16 }),
    cone(0.075, 0.18, PAINT.roof, { y: 0.43, ry: Math.PI / 4 }, 4),
  ];
  const spots: [number, number, number, number, number][] = [
    [-0.28, 0.12, 0.12, 0.2, 0.1],
    [-0.3, -0.18, 0.1, 0.16, 1.6],
    [0.25, 0.2, 0.13, 0.22, -0.2],
    [0.3, -0.12, 0.11, 0.18, 1.4],
    [0.05, 0.36, 0.1, 0.2, 1.5],
    [-0.08, -0.4, 0.12, 0.18, 0.1],
    [0.18, -0.36, 0.1, 0.16, 0.3],
    [-0.4, 0.34, 0.09, 0.15, 0.6],
  ];
  for (const [x, z, w, l, yaw] of spots) parts.push(...house(x, z, w, l, yaw));
  return model(parts);
}
