import { ball, box, model, type Part, plan, profile, rod, tube } from "./parts";

const AIR = {
  earth: 0x806949,
  green: 0x465642,
  dark: 0x303e35,
  pale: 0xa8bec2,
  glass: 0x536e77,
  frame: 0x677263,
  black: 0x252a29,
  blue: 0x283e64,
  red: 0x943f37,
  white: 0xd6d4c5,
};

function propeller(z: number, radius: number): Part[] {
  return [0, 1, 2].map((blade) => {
    const angle = (blade * Math.PI * 2) / 3;
    return box(0.023, radius, 0.009, AIR.black, {
      x: (-Math.sin(angle) * radius) / 2,
      y: (Math.cos(angle) * radius) / 2,
      z,
      rz: angle,
    });
  });
}

function roundel(x: number, y: number, z: number, radius: number): Part[] {
  return [
    rod(radius, 0.0015, AIR.blue, { x, y, z }, 20),
    rod(radius * 0.4, 0.0015, AIR.red, { x, y: y + 0.0016, z }, 16),
  ];
}

export function spitfireMk1() {
  const wing: [number, number][] = [
    [0.04, 0.21],
    [0.18, 0.207],
    [0.35, 0.175],
    [0.49, 0.127],
    [0.578, 0.069],
    [0.614, 0.022],
    [0.615, -0.011],
    [0.588, -0.04],
    [0.508, -0.064],
    [0.37, -0.077],
    [0.18, -0.082],
    [0.04, -0.069],
  ];
  const parts: Part[] = [
    tube(0.044, 0.054, 0.3, AIR.earth, { z: 0.025, sy: 1.12 }, 12),
    tube(0.054, 0.043, 0.255, AIR.earth, { z: 0.3025, sy: 1.04 }, 12),
    tube(0.012, 0.044, 0.365, AIR.earth, { z: -0.3075, y: 0.008 }, 12),
    tube(0.04, 0.003, 0.064, AIR.black, { z: 0.468 }, 12),
    ...propeller(0.438, 0.163),
    ball(
      0.046,
      AIR.glass,
      { y: 0.046, z: -0.041, sx: 0.8, sy: 0.95, sz: 1.7 },
      12
    ),
    box(0.063, 0.004, 0.009, AIR.frame, { y: 0.083, z: -0.042 }),
    box(0.004, 0.008, 0.115, AIR.frame, { y: 0.083, z: -0.04 }),
    box(0.07, 0.004, 0.008, AIR.frame, { y: 0.072, z: 0.015 }),
    box(0.068, 0.004, 0.008, AIR.frame, { y: 0.071, z: -0.097 }),
    rod(0.0025, 0.061, AIR.dark, { y: 0.093, z: -0.13 }, 5),
    profile(
      [
        [-0.5, 0.012],
        [-0.491, 0.118],
        [-0.47, 0.147],
        [-0.435, 0.144],
        [-0.399, 0.115],
        [-0.367, 0.025],
      ],
      0.011,
      AIR.green
    ),
    plan(
      [
        [-0.2, -0.424],
        [-0.18, -0.454],
        [-0.08, -0.474],
        [0.08, -0.474],
        [0.18, -0.454],
        [0.2, -0.424],
        [0.164, -0.393],
        [0.07, -0.373],
        [-0.07, -0.373],
        [-0.164, -0.393],
      ],
      0.009,
      AIR.earth,
      { y: 0.011 }
    ),
    box(0.074, 0.032, 0.122, AIR.pale, { x: 0.18, y: -0.044, z: -0.007 }),
    box(0.061, 0.025, 0.006, AIR.black, { x: 0.18, y: -0.044, z: 0.057 }),
    ball(
      0.024,
      AIR.pale,
      { x: -0.16, y: -0.03, z: 0.01, sx: 0.7, sy: 0.6, sz: 1.6 },
      8
    ),
    box(0.029, 0.025, 0.043, AIR.pale, { y: -0.047, z: 0.269 }),
  ];
  for (const side of [-1, 1]) {
    parts.push(
      plan(
        wing.map(([x, z]) => [x * side, z]),
        0.016,
        AIR.earth,
        { y: -0.024 }
      ),
      plan(
        [
          [side * 0.08, 0.19],
          [side * 0.2, 0.202],
          [side * 0.32, 0.173],
          [side * 0.28, 0.085],
          [side * 0.35, -0.073],
          [side * 0.2, -0.078],
          [side * 0.16, 0.047],
        ],
        0.001,
        AIR.green,
        { y: -0.0075 }
      ),
      plan(
        [
          [side * 0.38, 0.16],
          [side * 0.5, 0.116],
          [side * 0.53, 0.065],
          [side * 0.48, -0.061],
          [side * 0.39, -0.074],
          [side * 0.43, 0.02],
        ],
        0.001,
        AIR.green,
        { y: -0.0075 }
      ),
      ...roundel(side * 0.453, -0.004, 0.029, 0.059),
      tube(
        0.025,
        0.025,
        0.003,
        AIR.blue,
        { x: side * 0.032, y: 0.016, z: -0.225, ry: Math.PI / 2 },
        16
      ),
      tube(
        0.016,
        0.016,
        0.0035,
        AIR.white,
        { x: side * 0.034, y: 0.016, z: -0.225, ry: Math.PI / 2 },
        16
      ),
      tube(
        0.008,
        0.008,
        0.004,
        AIR.red,
        { x: side * 0.036, y: 0.016, z: -0.225, ry: Math.PI / 2 },
        12
      )
    );
    for (const z of [0.218, 0.245, 0.272])
      parts.push(
        box(0.012, 0.012, 0.019, AIR.black, { x: side * 0.047, y: 0.014, z })
      );
  }
  parts.push(
    plan(
      [
        [-0.044, 0.11],
        [0.041, 0.145],
        [0.043, 0.235],
        [-0.035, 0.284],
      ],
      0.004,
      AIR.green,
      { y: 0.049 }
    )
  );
  return model(parts);
}

export function ju87b() {
  const parts: Part[] = [
    tube(0.044, 0.06, 0.38, AIR.green, { z: 0.06, sy: 1.12 }, 12),
    tube(0.06, 0.045, 0.184, AIR.dark, { z: 0.342, sy: 1.15 }, 12),
    tube(0.013, 0.044, 0.36, AIR.green, { z: -0.31, y: 0.012 }, 12),
    tube(0.04, 0.002, 0.06, AIR.black, { z: 0.47 }, 12),
    ...propeller(0.44, 0.156),
    profile(
      [
        [-0.45, -0.004],
        [-0.12, -0.046],
        [0.255, -0.06],
        [0.385, -0.047],
        [0.385, -0.033],
        [-0.12, -0.025],
      ],
      0.065,
      AIR.pale
    ),
    box(0.067, 0.045, 0.105, AIR.pale, { y: -0.064, z: 0.317 }),
    box(0.055, 0.028, 0.005, AIR.black, { y: -0.068, z: 0.372 }),
    profile(
      [
        [-0.18, 0.04],
        [-0.15, 0.089],
        [-0.02, 0.101],
        [0.086, 0.074],
        [0.11, 0.042],
      ],
      0.064,
      AIR.glass
    ),
    box(0.068, 0.005, 0.011, AIR.frame, { y: 0.098, z: -0.03 }),
    box(0.068, 0.005, 0.01, AIR.frame, { y: 0.09, z: -0.116 }),
    box(0.066, 0.005, 0.01, AIR.frame, { y: 0.082, z: 0.057 }),
    box(0.004, 0.005, 0.221, AIR.frame, { y: 0.1, z: -0.033, rx: 0.025 }),
    profile(
      [
        [-0.5, 0.01],
        [-0.493, 0.172],
        [-0.452, 0.18],
        [-0.405, 0.134],
        [-0.362, 0.023],
      ],
      0.012,
      AIR.dark
    ),
    plan(
      [
        [-0.212, -0.422],
        [-0.184, -0.464],
        [0.184, -0.464],
        [0.212, -0.422],
        [0.17, -0.368],
        [-0.17, -0.368],
      ],
      0.01,
      AIR.green,
      { y: 0.019 }
    ),
  ];
  for (const side of [-1, 1]) {
    const inner: [number, number][] = [
      [side * 0.035, 0.182],
      [side * 0.203, 0.163],
      [side * 0.203, -0.088],
      [side * 0.035, -0.098],
    ];
    const outer: [number, number][] = [
      [0, 0.163],
      [side * 0.44, 0.018],
      [side * 0.452, -0.055],
      [side * 0.434, -0.1],
      [0, -0.088],
    ];
    parts.push(
      plan(inner, 0.003, AIR.green, { y: 0, rz: -side * 0.28 }),
      plan(outer, 0.003, AIR.green, {
        x: side * 0.195,
        y: -0.059,
        rz: side * 0.14,
      }),
      plan(inner, 0.019, AIR.pale, { y: -0.016, rz: -side * 0.28 }),
      plan(outer, 0.016, AIR.pale, {
        x: side * 0.195,
        y: -0.073,
        rz: side * 0.14,
      }),
      plan(
        [
          [0, 0.16],
          [side * 0.175, 0.102],
          [side * 0.09, -0.089],
          [0, -0.088],
        ],
        0.001,
        AIR.dark,
        { x: side * 0.195, y: -0.056, rz: side * 0.14 }
      ),
      plan(
        [
          [side * 0.245, 0.08],
          [side * 0.435, 0.016],
          [side * 0.395, -0.098],
          [side * 0.29, -0.094],
        ],
        0.001,
        AIR.dark,
        { x: side * 0.195, y: -0.056, rz: side * 0.14 }
      ),
      box(0.045, 0.134, 0.074, AIR.green, {
        x: side * 0.197,
        y: -0.131,
        z: 0.027,
        rz: side * 0.09,
      }),
      ball(
        0.048,
        AIR.dark,
        { x: side * 0.204, y: -0.205, z: 0.036, sx: 0.68, sy: 0.88, sz: 1.7 },
        10
      ),
      tube(
        0.023,
        0.023,
        0.043,
        AIR.black,
        { x: side * 0.204, y: -0.224, z: 0.032, ry: Math.PI / 2 },
        10
      ),
      rod(
        0.002,
        0.185,
        AIR.dark,
        { x: side * 0.09, y: -0.015, z: -0.414, rz: side * -1.18 },
        5
      ),
      box(0.021, 0.034, 0.167, AIR.dark, {
        x: side * 0.25,
        y: -0.072,
        z: 0.115,
        ry: side * 0.3,
      })
    );
    const x = side * 0.487;
    const y = -0.013;
    for (const [width, length, paint, lift] of [
      [0.092, 0.025, AIR.white, 0],
      [0.025, 0.092, AIR.white, 0],
      [0.082, 0.013, AIR.black, 0.0015],
      [0.013, 0.082, AIR.black, 0.0015],
    ])
      parts.push(
        box(width!, 0.0015, length!, paint!, {
          x,
          y: y + lift!,
          z: -0.028,
          rz: side * 0.14,
        })
      );
    for (const z of [0.26, 0.285, 0.31, 0.335])
      parts.push(
        box(0.013, 0.012, 0.014, AIR.black, { x: side * 0.054, y: 0.014, z })
      );
  }
  return model(parts);
}
