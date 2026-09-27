import {
  ball,
  box,
  model,
  type Part,
  plan,
  profile,
  rod,
  star,
  tube,
} from "./parts";

export type AircraftDetail = "map" | "scene";
type Outline = [number, number][];

const C = {
  green: 0x4b5948,
  gray: 0x738082,
  pale: 0xb9c8c9,
  silver: 0xc5cdcf,
  panel: 0x929fa5,
  dark: 0x252c2d,
  glass: 0x446e83,
  white: 0xe4e5df,
  blue: 0x243e61,
  red: 0xa44436,
  yellow: 0xd2af4e,
};

function propeller(
  x: number,
  z: number,
  radius: number,
  blades: number
): Part[] {
  return Array.from({ length: blades }, (_, blade) => {
    const angle = (blade * Math.PI * 2) / blades;
    return box(0.019, radius, 0.007, C.dark, {
      x: x - (Math.sin(angle) * radius) / 2,
      y: (Math.cos(angle) * radius) / 2,
      z,
      rz: angle,
    });
  });
}

function wings(outline: Outline, color: number, y = -0.022): Part[] {
  return [-1, 1].map((side) =>
    plan(
      outline.map(([x, z]) => [side * x, z]),
      0.013,
      color,
      { y }
    )
  );
}

function tail(span: number, color: number, swept = false): Part[] {
  return [
    plan(
      [
        [-span, -0.438],
        [-span * 0.88, -0.467],
        [-0.045, -0.482],
        [0.045, -0.482],
        [span * 0.88, -0.467],
        [span, -0.438],
        [span * 0.82, -0.405],
        [0, swept ? -0.332 : -0.379],
        [-span * 0.82, -0.405],
      ],
      0.009,
      color,
      { y: 0.011 }
    ),
    profile(
      [
        [-0.5, 0.01],
        [-0.487, 0.126],
        [-0.454, 0.16],
        [-0.423, 0.152],
        [swept ? -0.326 : -0.385, 0.025],
      ],
      0.009,
      color
    ),
  ];
}

function markings(
  parts: Part[],
  kind: "raf" | "us" | "axis",
  x: number,
  z: number,
  detail: AircraftDetail
) {
  for (const side of [-1, 1]) {
    if (kind === "axis") {
      parts.push(
        box(0.095, 0.002, 0.026, C.white, { x: side * x, y: -0.006, z }),
        box(0.026, 0.002, 0.095, C.white, { x: side * x, y: -0.006, z })
      );
      if (detail === "scene")
        parts.push(
          box(0.083, 0.002, 0.012, C.dark, { x: side * x, y: -0.003, z }),
          box(0.012, 0.002, 0.083, C.dark, { x: side * x, y: -0.003, z })
        );
    } else {
      parts.push(
        rod(
          0.049,
          0.002,
          C.blue,
          { x: side * x, y: -0.006, z },
          detail === "map" ? 6 : 16
        )
      );
      if (kind === "raf")
        parts.push(
          rod(
            0.02,
            0.002,
            C.red,
            { x: side * x, y: -0.003, z },
            detail === "map" ? 5 : 12
          )
        );
      else if (detail === "scene")
        parts.push(
          box(0.14, 0.002, 0.025, C.white, { x: side * x, y: -0.003, z }),
          star(0.038, C.white, { x: side * x, y: -0.001, z, rx: -Math.PI / 2 })
        );
    }
  }
}

function exhaust(parts: Part[], width: number, start: number) {
  for (const side of [-1, 1])
    for (let i = 0; i < 6; i++) {
      parts.push(
        box(0.011, 0.01, 0.013, C.dark, {
          x: side * width,
          y: 0.014,
          z: start + i * 0.021,
        })
      );
    }
}

export function bf109(detail: AircraftDetail = "scene") {
  const n = detail === "map" ? 6 : 12;
  const parts: Part[] = [
    tube(0.011, 0.043, 0.37, C.gray, { z: -0.305 }, n),
    tube(0.043, 0.047, 0.31, C.gray, { z: 0.035, sy: 1.2 }, n),
    tube(0.047, 0.034, 0.235, C.gray, { z: 0.3075, sy: 1.17 }, n),
    tube(0.034, 0, 0.075, C.yellow, { z: 0.4625 }, n),
    ...propeller(0, 0.427, 0.161, 3),
    profile(
      [
        [-0.132, 0.038],
        [-0.116, 0.088],
        [-0.025, 0.09],
        [0.03, 0.045],
      ],
      0.061,
      C.glass
    ),
    ...wings(
      [
        [0.035, 0.155],
        [0.508, 0.085],
        [0.53, 0.048],
        [0.517, -0.06],
        [0.04, -0.121],
      ],
      C.green
    ),
    ...tail(0.168, C.gray),
    box(0.044, 0.029, 0.075, C.pale, { y: -0.053, z: 0.29 }),
  ];
  markings(parts, "axis", 0.381, 0.009, detail);
  if (detail === "scene") {
    exhaust(parts, 0.044, 0.223);
    parts.push(
      box(0.064, 0.004, 0.008, C.gray, { y: 0.09, z: -0.035 }),
      box(0.004, 0.004, 0.1, C.gray, { y: 0.09, z: -0.071 }),
      rod(0.002, 0.06, C.dark, { y: 0.082, z: -0.16 }, 5)
    );
    for (const side of [-1, 1])
      parts.push(
        box(0.075, 0.026, 0.103, C.pale, {
          x: side * 0.18,
          y: -0.04,
          z: -0.04,
        }),
        box(0.061, 0.018, 0.004, C.dark, {
          x: side * 0.18,
          y: -0.04,
          z: 0.013,
        }),
        plan(
          [
            [side * 0.1, 0.14],
            [side * 0.32, 0.108],
            [side * 0.2, -0.105],
          ],
          0.001,
          C.gray,
          { y: -0.008 }
        )
      );
  }
  return model(parts);
}

export function fw190(detail: AircraftDetail = "scene") {
  const n = detail === "map" ? 6 : 12;
  const parts: Part[] = [
    tube(0.014, 0.061, 0.46, C.gray, { z: -0.26 }, n),
    tube(0.061, 0.072, 0.28, C.gray, { z: 0.11 }, n),
    tube(0.072, 0.07, 0.18, C.green, { z: 0.34 }, n),
    tube(0.059, 0.059, 0.007, C.dark, { z: 0.434 }, n),
    tube(0.035, 0, 0.061, C.gray, { z: 0.4695 }, n),
    ...propeller(0, 0.442, 0.177, 3),
    profile(
      [
        [-0.151, 0.042],
        [-0.103, 0.101],
        [-0.014, 0.097],
        [0.067, 0.044],
      ],
      0.072,
      C.glass
    ),
    ...wings(
      [
        [0.045, 0.186],
        [0.514, 0.066],
        [0.537, 0.019],
        [0.526, -0.069],
        [0.355, -0.092],
        [0.044, -0.134],
      ],
      C.green
    ),
    ...tail(0.195, C.gray),
  ];
  markings(parts, "axis", 0.4, -0.005, detail);
  if (detail === "scene") {
    parts.push(
      box(0.076, 0.004, 0.009, C.gray, { y: 0.099, z: -0.018 }),
      box(0.004, 0.004, 0.137, C.gray, { y: 0.099, z: -0.05 })
    );
    for (const side of [-1, 1]) {
      parts.push(
        tube(
          0.005,
          0.005,
          0.12,
          C.dark,
          { x: side * 0.12, y: -0.008, z: 0.183 },
          6
        ),
        plan(
          [
            [side * 0.14, 0.162],
            [side * 0.4, 0.09],
            [side * 0.32, -0.096],
          ],
          0.001,
          C.gray,
          { y: -0.008 }
        )
      );
      for (let i = 0; i < 4; i++)
        parts.push(
          box(0.004, 0.035, 0.011, C.dark, {
            x: side * 0.07,
            z: 0.267 + i * 0.018,
          })
        );
    }
  }
  return model(parts);
}

function spitfire(detail: AircraftDetail, early: boolean) {
  const n = detail === "map" ? 6 : 12;
  const wing: Outline = [
    [0.037, 0.194],
    [0.2, 0.191],
    [0.366, 0.157],
    [0.496, 0.103],
    [0.553, 0.045],
    [0.555, 0.007],
    [0.519, -0.034],
    [0.37, -0.066],
    [0.18, -0.075],
    [0.038, -0.063],
  ];
  const parts: Part[] = [
    tube(0.011, 0.046, 0.38, early ? 0x806949 : C.gray, { z: -0.3 }, n),
    tube(
      0.046,
      0.052,
      0.295,
      early ? 0x806949 : C.gray,
      { z: 0.0375, sy: 1.1 },
      n
    ),
    tube(0.052, 0.037, 0.247, C.green, { z: 0.3085, sy: 1.1 }, n),
    tube(0.037, 0, 0.068, C.gray, { z: 0.466 }, n),
    ...propeller(0, 0.435, 0.161, early ? 3 : 4),
    ball(
      0.043,
      C.glass,
      { y: 0.045, z: -0.059, sx: 0.78, sy: 0.95, sz: 1.7 },
      detail === "map" ? 6 : 12
    ),
    ...wings(
      wing.map(([x, z]) => [early ? x * 1.095 : x, z]),
      early ? 0x806949 : C.gray
    ),
    ...tail(0.188, C.green),
  ];
  for (const side of early ? [1] : [-1, 1])
    parts.push(
      box(0.072, 0.025, 0.095, C.pale, { x: side * 0.18, y: -0.04, z: -0.01 })
    );
  markings(parts, "raf", early ? 0.455 : 0.414, 0.02, detail);
  if (detail === "map")
    for (const side of [-1, 1])
      parts.push(
        plan(
          [
            [side * 0.13, 0.189],
            [side * 0.3, 0.171],
            [side * 0.25, 0.021],
            [side * 0.3, -0.066],
            [side * 0.16, -0.072],
          ],
          0.001,
          C.green,
          { y: -0.008 }
        )
      );
  if (detail === "scene") {
    exhaust(parts, 0.048, 0.203);
    parts.push(
      box(0.065, 0.004, 0.007, C.gray, { y: 0.08, z: -0.055 }),
      box(0.004, 0.004, 0.106, C.gray, { y: 0.084, z: -0.059 })
    );
    for (const side of [-1, 1])
      parts.push(
        plan(
          [
            [side * 0.095, 0.19],
            [side * 0.23, 0.184],
            [side * 0.3, 0.13],
            [side * 0.26, 0.03],
            [side * 0.31, -0.07],
            [side * 0.16, -0.072],
          ],
          0.001,
          C.green,
          { y: -0.008 }
        ),
        plan(
          [
            [side * 0.39, 0.146],
            [side * 0.49, 0.11],
            [side * 0.47, -0.043],
            [side * 0.39, -0.061],
          ],
          0.001,
          C.green,
          { y: -0.008 }
        ),
        tube(
          0.006,
          0.004,
          0.108,
          C.dark,
          { x: side * 0.25, y: -0.011, z: 0.216 },
          6
        )
      );
  }
  return model(parts);
}

export function spitfireMk9(detail: AircraftDetail = "scene") {
  return spitfire(detail, false);
}

export function spitfireMk1Map() {
  return spitfire("map", true);
}

export function p51d(detail: AircraftDetail = "scene") {
  const n = detail === "map" ? 6 : 12;
  const parts: Part[] = [
    tube(0.012, 0.05, 0.405, C.silver, { z: -0.2875 }, n),
    tube(0.05, 0.052, 0.275, C.silver, { z: 0.0525, sy: 1.12 }, n),
    tube(0.052, 0.033, 0.239, C.silver, { z: 0.3095, sy: 1.1 }, n),
    tube(0.033, 0, 0.071, C.red, { z: 0.4645 }, n),
    ...propeller(0, 0.432, 0.172, 4),
    ball(
      0.049,
      C.glass,
      { y: 0.045, z: -0.052, sx: 0.78, sy: 0.87, sz: 1.75 },
      detail === "map" ? 6 : 12
    ),
    ...wings(
      [
        [0.043, 0.164],
        [0.232, 0.143],
        [0.542, 0.042],
        [0.551, -0.041],
        [0.517, -0.073],
        [0.181, -0.106],
        [0.047, -0.152],
      ],
      C.silver
    ),
    ...tail(0.204, C.silver, true),
    profile(
      [
        [-0.256, -0.029],
        [-0.19, -0.084],
        [0.022, -0.081],
        [0.064, -0.037],
      ],
      0.065,
      C.panel
    ),
    box(0.061, 0.025, 0.008, C.dark, { y: -0.057, z: 0.045 }),
  ];
  markings(parts, "us", 0.405, -0.017, detail);
  if (detail === "scene") {
    exhaust(parts, 0.046, 0.211);
    parts.push(
      plan(
        [
          [-0.035, 0.091],
          [0.035, 0.091],
          [0.029, 0.374],
          [-0.029, 0.374],
        ],
        0.003,
        C.green,
        { y: 0.053 }
      ),
      box(0.068, 0.004, 0.008, C.silver, { y: 0.073, z: 0.013 }),
      box(0.024, 0.016, 0.04, C.dark, { y: -0.052, z: 0.352 })
    );
    for (const side of [-1, 1])
      for (let i = 0; i < 3; i++)
        parts.push(
          tube(
            0.003,
            0.003,
            0.025,
            C.dark,
            { x: side * (0.219 + i * 0.029), y: -0.013, z: 0.139 - i * 0.009 },
            5
          )
        );
  }
  return model(parts);
}

export function b29(detail: AircraftDetail = "scene") {
  const n = detail === "map" ? 6 : 14;
  const parts: Part[] = [
    tube(0.014, 0.061, 0.36, C.silver, { z: -0.32 }, n),
    tube(0.061, 0.061, 0.46, C.silver, { z: 0.09 }, n),
    tube(0.061, 0.047, 0.12, C.glass, { z: 0.38 }, n),
    tube(0.047, 0.015, 0.06, C.glass, { z: 0.47 }, n),
    ...wings(
      [
        [0.04, 0.166],
        [0.676, -0.011],
        [0.709, -0.074],
        [0.695, -0.103],
        [0.352, -0.12],
        [0.042, -0.134],
      ],
      C.silver
    ),
    plan(
      [
        [-0.25, -0.442],
        [-0.241, -0.483],
        [0.241, -0.483],
        [0.25, -0.442],
        [0, -0.345],
      ],
      0.009,
      C.silver,
      { y: 0.026 }
    ),
    profile(
      [
        [-0.495, 0.01],
        [-0.486, 0.223],
        [-0.451, 0.239],
        [-0.407, 0.215],
        [-0.315, 0.034],
      ],
      0.012,
      C.silver
    ),
  ];
  for (const side of [-1, 1])
    for (const [x, z] of [
      [0.234, 0.169],
      [0.455, 0.09],
    ]) {
      parts.push(
        tube(
          0.019,
          0.04,
          0.168,
          C.silver,
          { x: side * x!, y: -0.006, z: z! - 0.075 },
          n
        ),
        tube(0.04, 0.04, 0.087, C.panel, { x: side * x!, z: z! + 0.0525 }, n),
        tube(0.031, 0.031, 0.005, C.dark, { x: side * x!, z: z! + 0.099 }, n),
        tube(0.016, 0, 0.025, C.silver, { x: side * x!, z: z! + 0.1165 }, n),
        ...(detail === "map" ? propeller(side * x!, z! + 0.105, 0.088, 4) : [])
      );
    }
  if (detail === "scene") {
    for (const z of [0.352, 0.399, 0.442])
      parts.push(
        tube(
          z > 0.42 ? 0.046 : 0.058,
          z > 0.42 ? 0.045 : 0.057,
          0.004,
          C.silver,
          { z },
          14
        )
      );
    for (const side of [-1, 1])
      parts.push(
        box(0.004, 0.078, 0.103, C.silver, {
          x: side * 0.025,
          z: 0.404,
          rx: -0.25,
        }),
        tube(
          0.002,
          0.002,
          0.034,
          C.dark,
          { x: side * 0.009, y: 0.014, z: -0.479 },
          5
        ),
        box(0.008, 0.003, 0.28, C.panel, { x: side * 0.038, y: 0.049, z: 0.02 })
      );
    markings(parts, "us", 0.567, -0.053, detail);
  }
  return model(parts);
}
