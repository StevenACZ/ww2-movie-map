import { TorusGeometry } from "three";
import {
  ball,
  box,
  dome,
  mirror,
  model,
  part,
  type Part,
  plan,
  rod,
  tube,
} from "./parts";

const C = {
  grey: 0x76848a,
  dark: 0x303b40,
  deck: 0x585f60,
  red: 0x743e35,
  wood: 0x956b43,
  cream: 0xd4c8a5,
  blue: 0x294c64,
  glass: 0x314d58,
  white: 0xe1ded0,
  rope: 0x9e9175,
  ochre: 0xb49456,
  black: 0x242b2b,
};

type Outline = [number, number][];

function boatOutline(beam: number, inset = 0): Outline {
  const b = beam / 2 - inset;
  return mirror([
    [0, 0.5 - inset],
    [b * 0.45, 0.43 - inset],
    [b * 0.82, 0.3],
    [b, 0.08],
    [b * 0.98, -0.25],
    [b * 0.82, -0.43],
    [b * 0.48, -0.5 + inset],
  ]);
}

function hull(
  beam: number,
  freeboard: number,
  paint: number,
  deck: number
): Part[] {
  return [
    plan(boatOutline(beam, 0.008), 0.025, C.red, { y: -0.025 }),
    plan(boatOutline(beam), freeboard, paint),
    plan(boatOutline(beam, 0.008), 0.006, deck, { y: freeboard }),
  ];
}

function stay(
  a: [number, number, number],
  b: [number, number, number],
  r = 0.0012,
  paint = C.dark
): Part {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const length = Math.hypot(dx, dy, dz);
  return rod(
    r,
    length,
    paint,
    {
      x: (a[0] + b[0]) / 2,
      y: (a[1] + b[1]) / 2,
      z: (a[2] + b[2]) / 2,
      rx: Math.acos(dy / length),
      ry: Math.atan2(dx, dz),
    },
    5
  );
}

function ring(x: number, y: number, z: number, r: number): Part {
  return part(new TorusGeometry(r, r * 0.24, 4, 12), C.cream, { x, y, z });
}

function bollards(beam: number, y: number): Part[] {
  return [-0.4, 0.37].flatMap((z) =>
    [-1, 1].flatMap((side) => [
      rod(0.003, 0.012, C.dark, { x: side * beam * 0.29, y: y + 0.006, z }, 6),
      box(0.011, 0.003, 0.004, C.dark, {
        x: side * beam * 0.29,
        y: y + 0.012,
        z,
      }),
    ])
  );
}

function gun(z: number, y: number, aft = false): Part[] {
  const direction = aft ? -1 : 1;
  return [
    rod(0.014, 0.009, C.dark, { y: y + 0.0045, z }, 10),
    box(0.028, 0.024, 0.024, C.grey, { y: y + 0.018, z }),
    box(0.025, 0.014, 0.001, C.dark, {
      y: y + 0.014,
      z: z - direction * 0.0125,
    }),
    tube(
      0.0024,
      0.002,
      0.048,
      C.dark,
      { y: y + 0.023, z: z + direction * 0.028 },
      6
    ),
  ];
}

export function vwDestroyer() {
  const parts: Part[] = [
    ...hull(0.099, 0.033, C.grey, C.deck),
    plan(
      mirror([
        [0, 0.496],
        [0.022, 0.425],
        [0.044, 0.31],
        [0.049, 0.14],
      ]),
      0.021,
      C.grey,
      { y: 0.033 }
    ),
    plan(
      mirror([
        [0, 0.491],
        [0.021, 0.421],
        [0.043, 0.31],
        [0.047, 0.145],
      ]),
      0.002,
      C.deck,
      { y: 0.054 }
    ),
    ...gun(0.372, 0.056),
    ...gun(0.264, 0.073),
    ...gun(-0.292, 0.057, true),
    ...gun(-0.404, 0.039, true),
    box(0.048, 0.02, 0.054, C.grey, { y: 0.064, z: 0.264 }),
    box(0.047, 0.036, 0.08, C.grey, { y: 0.074, z: 0.185 }),
    box(0.063, 0.012, 0.048, C.grey, { y: 0.096, z: 0.197 }),
    box(0.051, 0.012, 0.026, C.glass, { y: 0.107, z: 0.2 }),
    box(0.065, 0.004, 0.04, C.grey, { y: 0.115, z: 0.2 }),
    box(0.047, 0.016, 0.09, C.grey, { y: 0.047, z: -0.265 }),
    rod(0.0025, 0.163, C.dark, { y: 0.142, z: 0.143 }, 6),
    box(0.102, 0.0025, 0.003, C.dark, { y: 0.19, z: 0.143 }),
    stay([0, 0.219, 0.143], [-0.039, 0.055, 0.23]),
    stay([0, 0.219, 0.143], [0.039, 0.055, 0.23]),
    stay([0, 0.219, 0.143], [0, 0.054, -0.28]),
    rod(0.0015, 0.04, C.dark, { y: 0.06, z: -0.478 }, 5),
    box(0.027, 0.016, 0.001, C.white, { x: 0.0135, y: 0.073, z: -0.478 }),
    box(0.003, 0.0165, 0.0015, C.red, { x: 0.013, y: 0.073, z: -0.478 }),
    box(0.027, 0.003, 0.0015, C.red, { x: 0.0135, y: 0.073, z: -0.478 }),
    box(0.01, 0.006, 0.002, C.blue, { x: 0.005, y: 0.078, z: -0.478 }),
    ...bollards(0.099, 0.056),
  ];
  for (const z of [0.065, -0.04])
    parts.push(
      rod(0.013, 0.065, C.grey, { y: 0.072, z, sz: 1.28 }, 12),
      rod(0.0135, 0.012, C.dark, { y: 0.108, z, sz: 1.28 }, 12),
      rod(0.009, 0.001, C.black, { y: 0.1145, z, sz: 1.28 }, 12)
    );
  for (const z of [-0.125, -0.209]) {
    parts.push(rod(0.014, 0.008, C.dark, { y: 0.043, z }, 8));
    for (const x of [-0.01, 0, 0.01])
      parts.push(tube(0.004, 0.004, 0.053, C.grey, { x, y: 0.052, z }, 8));
  }
  for (const side of [-1, 1]) {
    parts.push(
      plan(boatOutline(0.28), 0.08, C.cream, {
        x: side * 0.042,
        y: 0.062,
        z: 0.018,
        sx: 0.072,
        sy: 0.072,
        sz: 0.072,
      })
    );
    for (const z of [-0.004, 0.042])
      parts.push(
        stay(
          [side * 0.032, 0.038, z],
          [side * 0.047, 0.084, z],
          0.0018,
          C.grey
        ),
        stay([side * 0.047, 0.084, z], [side * 0.042, 0.066, z], 0.0008, C.rope)
      );
    for (const z of [0.186, 0.199, 0.212])
      parts.push(
        box(0.002, 0.013, 0.002, C.grey, { x: side * 0.026, y: 0.107, z })
      );
  }
  return model(parts);
}

export function dunkirkYacht() {
  const parts: Part[] = [
    ...hull(0.245, 0.071, C.cream, C.wood),
    plan(boatOutline(0.25), 0.014, C.blue, { y: 0.003 }),
    box(0.156, 0.105, 0.275, C.wood, { y: 0.126, z: 0.055 }),
    box(0.143, 0.045, 0.253, C.glass, { y: 0.146, z: 0.055 }),
    box(0.176, 0.014, 0.3, C.cream, { y: 0.186, z: 0.055 }),
    box(0.143, 0.038, 0.023, C.cream, { y: 0.094, z: -0.35 }),
    rod(0.004, 0.33, C.wood, { y: 0.263, z: 0.25 }, 6),
    stay([0, 0.423, 0.25], [0, 0.08, 0.46], 0.0014, C.rope),
    stay([0, 0.423, 0.25], [0, 0.083, -0.43], 0.0014, C.rope),
    ...bollards(0.245, 0.079),
  ];
  for (const side of [-1, 1]) {
    for (const z of [-0.045, 0.045, 0.135])
      parts.push(
        box(0.009, 0.062, 0.009, C.wood, { x: side * 0.075, y: 0.147, z })
      );
    parts.push(ring(side * 0.067, 0.134, -0.088, 0.022));
    for (const z of [-0.29, -0.39])
      parts.push(
        rod(0.002, 0.036, C.cream, { x: side * 0.084, y: 0.095, z }, 5)
      );
    parts.push(
      stay(
        [side * 0.084, 0.113, -0.4],
        [side * 0.084, 0.113, -0.25],
        0.0015,
        C.cream
      )
    );
  }
  return model(parts);
}

export function dunkirkTrawler() {
  const parts: Part[] = [
    ...hull(0.26, 0.102, C.blue, C.wood),
    box(0.162, 0.13, 0.17, C.ochre, { y: 0.169, z: -0.13 }),
    box(0.166, 0.039, 0.014, C.glass, { y: 0.198, z: -0.039 }),
    box(0.184, 0.014, 0.193, C.cream, { y: 0.241, z: -0.13 }),
    rod(0.03, 0.125, C.ochre, { y: 0.191, z: -0.27 }, 10),
    rod(0.031, 0.029, C.black, { y: 0.264, z: -0.27 }, 10),
    rod(0.007, 0.38, C.wood, { y: 0.29, z: 0.19 }, 6),
    stay([0, 0.21, 0.19], [0, 0.295, -0.065], 0.006, C.wood),
    stay([0, 0.472, 0.19], [0, 0.295, -0.065], 0.0018, C.rope),
    stay([0, 0.472, 0.19], [-0.108, 0.11, 0.3], 0.0018, C.rope),
    stay([0, 0.472, 0.19], [0.108, 0.11, 0.3], 0.0018, C.rope),
    box(0.103, 0.031, 0.072, C.dark, { y: 0.124, z: 0.06 }),
    tube(
      0.027,
      0.027,
      0.079,
      C.rope,
      { y: 0.156, z: 0.06, ry: Math.PI / 2 },
      10
    ),
    box(0.07, 0.055, 0.064, C.wood, { x: -0.062, y: 0.134, z: 0.305 }),
    box(0.065, 0.045, 0.06, C.ochre, { x: 0.05, y: 0.129, z: 0.34 }),
    ring(0.052, 0.188, -0.035, 0.021),
    ...bollards(0.26, 0.108),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      box(0.004, 0.037, 0.072, C.glass, { x: side * 0.083, y: 0.198, z: -0.12 })
    );
    parts.push(
      box(0.01, 0.027, 0.63, C.blue, { x: side * 0.119, y: 0.119, z: -0.005 })
    );
  }
  for (const x of [-0.052, 0, 0.052])
    parts.push(box(0.006, 0.043, 0.017, C.ochre, { x, y: 0.198, z: -0.037 }));
  return model(parts);
}

export function dunkirkLifeboat() {
  const outline = boatOutline(0.31);
  const parts: Part[] = [
    ...hull(0.31, 0.044, C.wood, C.dark),
    plan(boatOutline(0.26, 0.018), 0.004, 0x252b28, { y: 0.051 }),
  ];
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i]!;
    const b = outline[(i + 1) % outline.length]!;
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    parts.push(
      box(0.018, 0.07, Math.hypot(dx, dz) + 0.008, C.wood, {
        x: (a[0] + b[0]) / 2,
        y: 0.076,
        z: (a[1] + b[1]) / 2,
        ry: Math.atan2(dx, dz),
      })
    );
    parts.push(stay([a[0], 0.114, a[1]], [b[0], 0.114, b[1]], 0.008, C.cream));
  }
  for (const z of [-0.32, -0.1, 0.13, 0.32])
    parts.push(
      box(z === 0.32 ? 0.215 : 0.274, 0.017, 0.055, C.wood, { y: 0.089, z })
    );
  for (const side of [-1, 1]) {
    parts.push(
      stay(
        [side * 0.075, 0.127, 0.22],
        [side * 0.36, 0.069, -0.02],
        0.005,
        C.wood
      )
    );
    parts.push(
      box(0.043, 0.008, 0.13, C.ochre, {
        x: side * 0.345,
        y: 0.07,
        z: -0.016,
        ry: side * 0.86,
      })
    );
  }
  parts.push(
    box(0.055, 0.091, 0.043, C.blue, { y: 0.169, z: -0.325 }),
    ball(0.023, 0xb59170, { y: 0.236, z: -0.324 }, 6),
    dome(0.026, C.dark, { y: 0.25, z: -0.324, sy: 0.3 }, 8),
    box(0.047, 0.021, 0.085, C.dark, { y: 0.115, z: -0.28 }),
    stay([-0.025, 0.196, -0.319], [-0.052, 0.138, -0.4], 0.011, C.blue),
    stay([0.025, 0.196, -0.319], [0.049, 0.148, -0.262], 0.011, C.blue),
    box(0.009, 0.009, 0.12, C.wood, { y: 0.133, z: -0.418, ry: 0.35 })
  );
  const geometry = model(parts);
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox!;
  const length = bounds.max.z - bounds.min.z;
  geometry.translate(0, 0, -(bounds.min.z + bounds.max.z) / 2);
  geometry.scale(1, 1, 1 / length);
  return geometry;
}

export function befSoldier() {
  return model([
    box(0.26, 0.31, 0.16, 0x796d49, { y: 0.6 }),
    box(0.255, 0.035, 0.172, 0x514c37, { y: 0.485 }),
    box(0.18, 0.235, 0.1, 0x706647, { y: 0.635, z: -0.118 }),
    box(0.032, 0.26, 0.018, 0xa09673, { x: -0.077, y: 0.62, z: 0.087 }),
    box(0.032, 0.26, 0.018, 0xa09673, { x: 0.077, y: 0.62, z: 0.087 }),
    box(0.071, 0.065, 0.048, 0x9b906b, { x: -0.072, y: 0.497, z: 0.112 }),
    box(0.071, 0.065, 0.048, 0x9b906b, { x: 0.072, y: 0.497, z: 0.112 }),
    rod(0.067, 0.17, 0xb08e6c, { y: 0.83 }, 6),
    rod(0.112, 0.018, 0x626149, { y: 0.937 }, 10),
    dome(0.09, 0x69694e, { y: 0.941, sy: 0.65555556 }, 10),
    ...[-1, 1].flatMap((side) => [
      box(0.093, 0.35, 0.113, 0x756747, { x: side * 0.071, y: 0.277 }),
      box(0.098, 0.14, 0.119, 0x807759, { x: side * 0.071, y: 0.154 }),
      box(0.104, 0.084, 0.179, 0x393a30, {
        x: side * 0.071,
        y: 0.042,
        z: 0.023,
      }),
      box(0.08, 0.28, 0.106, 0x796d49, {
        x: side * 0.171,
        y: 0.577,
        rz: side * 0.09,
      }),
      box(0.055, 0.064, 0.07, 0xb08e6c, { x: side * 0.182, y: 0.41, z: 0.012 }),
    ]),
  ]);
}
