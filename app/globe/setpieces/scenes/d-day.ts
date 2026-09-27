import { plume, trail } from "../fx";
import {
  type Kit,
  type Sample,
  clamp01,
  easeOut,
  ground,
  hash,
  offset,
  Path,
  sample,
  smooth,
  WHITE,
  type Label,
  type SceneDef,
} from "../kit";
import type { ModelKind } from "../models";

type LL = [number, number];

const SEA = 0.012;
const LAND = 0.045;

const COAST: LL[] = [
  [-1.58, 48.8],
  [-1.57, 48.95],
  [-1.6, 49.08],
  [-1.62, 49.2],
  [-1.68, 49.3],
  [-1.77, 49.4],
  [-1.83, 49.47],
  [-1.88, 49.54],
  [-1.85, 49.6],
  [-1.93, 49.66],
  [-1.95, 49.72],
  [-1.87, 49.71],
  [-1.8, 49.68],
  [-1.7, 49.66],
  [-1.62, 49.645],
  [-1.52, 49.66],
  [-1.44, 49.69],
  [-1.33, 49.7],
  [-1.265, 49.695],
  [-1.255, 49.64],
  [-1.265, 49.59],
  [-1.29, 49.55],
  [-1.29, 49.51],
  [-1.25, 49.47],
  [-1.21, 49.445],
  [-1.19, 49.43],
  [-1.165, 49.4],
  [-1.15, 49.375],
  [-1.14, 49.35],
  [-1.12, 49.33],
  [-1.1, 49.325],
  [-1.08, 49.345],
  [-1.06, 49.37],
  [-1.04, 49.385],
  [-1.01, 49.39],
  [-0.99, 49.398],
  [-0.95, 49.39],
  [-0.915, 49.383],
  [-0.87, 49.37],
  [-0.83, 49.357],
  [-0.79, 49.352],
  [-0.755, 49.349],
  [-0.7, 49.35],
  [-0.65, 49.345],
  [-0.62, 49.342],
  [-0.56, 49.341],
  [-0.5, 49.338],
  [-0.47, 49.335],
  [-0.42, 49.331],
  [-0.37, 49.325],
  [-0.35, 49.317],
  [-0.33, 49.303],
  [-0.265, 49.29],
  [-0.245, 49.283],
  [-0.23, 49.285],
  [-0.2, 49.288],
  [-0.15, 49.29],
  [-0.1, 49.295],
  [-0.05, 49.31],
  [0.0, 49.33],
  [0.07, 49.36],
  [0.13, 49.39],
  [0.2, 49.42],
  [0.3, 49.44],
  [0.25, 49.46],
  [0.1, 49.49],
  [0.07, 49.52],
  [0.2, 49.7],
  [0.37, 49.77],
  [0.7, 49.87],
  [1.3, 49.97],
  [1.6, 48.3],
  [-2.2, 48.3],
  [-2.2, 48.6],
  [-1.5, 48.65],
];

const MARSHES: LL[][] = [
  [
    [-1.25, 49.42],
    [-1.21, 49.412],
    [-1.195, 49.385],
    [-1.215, 49.355],
    [-1.25, 49.37],
  ],
  [
    [-1.32, 49.335],
    [-1.22, 49.325],
    [-1.18, 49.3],
    [-1.25, 49.285],
    [-1.33, 49.3],
  ],
];

const ORNE: LL[] = [
  [-0.235, 49.285],
  [-0.25, 49.26],
  [-0.265, 49.24],
  [-0.275, 49.22],
  [-0.3, 49.2],
  [-0.34, 49.185],
  [-0.37, 49.18],
];

const CANAL: LL[] = [
  [-0.252, 49.285],
  [-0.266, 49.262],
  [-0.276, 49.242],
  [-0.29, 49.22],
  [-0.32, 49.2],
  [-0.35, 49.19],
];

const VILLAGES: [lon: number, lat: number, size: number][] = [
  [-1.316, 49.408, 0.5],
  [-1.227, 49.379, 0.4],
  [-0.9, 49.378, 0.35],
  [-0.866, 49.364, 0.35],
  [-0.85, 49.353, 0.35],
  [-0.62, 49.338, 0.4],
  [-0.46, 49.328, 0.45],
  [-0.4, 49.323, 0.4],
  [-0.26, 49.283, 0.45],
  [-0.26, 49.228, 0.35],
  [-0.37, 49.19, 0.9],
  [-0.35, 49.18, 0.9],
  [-0.39, 49.178, 0.8],
  [-0.9, 49.33, 0.3],
];

interface BeachSpec {
  id: string;
  a: LL;
  b: LL;
  hint: [number, number];
  touch: number;
  flags: string[];
  fleet: [battleships: number, destroyers: number, transports: number];
  waves: [kind: "lcvp" | "lct", start: number, touch: number, count: number][];
}

const BEACHES: BeachSpec[] = [
  {
    id: "Utah",
    a: [-1.19, 49.43],
    b: [-1.165, 49.4],
    hint: [1, 0],
    touch: 40,
    flags: ["usa-1912"],
    fleet: [1, 2, 3],
    waves: [
      ["lcvp", 35.8, 40, 10],
      ["lct", 38, 42, 3],
      ["lcvp", 44, 48.5, 8],
      ["lct", 54, 58, 3],
      ["lcvp", 58, 62.5, 8],
    ],
  },
  {
    id: "Omaha",
    a: [-0.915, 49.383],
    b: [-0.83, 49.357],
    hint: [0, -1],
    touch: 40,
    flags: ["usa-1912"],
    fleet: [2, 3, 4],
    waves: [
      ["lcvp", 35.8, 40, 14],
      ["lcvp", 38.6, 42.8, 12],
      ["lct", 41, 45, 4],
      ["lcvp", 44, 48.5, 10],
      ["lct", 50, 54, 4],
      ["lcvp", 54, 58.5, 10],
      ["lcvp", 58, 62.5, 10],
    ],
  },
  {
    id: "Gold",
    a: [-0.62, 49.342],
    b: [-0.5, 49.338],
    hint: [0, -1],
    touch: 50,
    flags: ["uk"],
    fleet: [1, 2, 3],
    waves: [
      ["lct", 45.5, 50, 4],
      ["lcvp", 46, 50.3, 10],
      ["lcvp", 52, 56.5, 8],
      ["lct", 56, 60.5, 3],
      ["lcvp", 60, 64.5, 8],
    ],
  },
  {
    id: "Juno",
    a: [-0.47, 49.335],
    b: [-0.37, 49.325],
    hint: [0, -1],
    touch: 51,
    flags: ["canada-1921"],
    fleet: [1, 2, 3],
    waves: [
      ["lct", 46.5, 51, 4],
      ["lcvp", 47, 51.3, 10],
      ["lcvp", 53, 57.5, 8],
      ["lct", 57, 61.5, 3],
      ["lcvp", 61, 65.5, 8],
    ],
  },
  {
    id: "Sword",
    a: [-0.33, 49.303],
    b: [-0.265, 49.29],
    hint: [0, -1],
    touch: 50,
    flags: ["uk", "france"],
    fleet: [1, 2, 3],
    waves: [
      ["lct", 45.5, 50, 4],
      ["lcvp", 46, 50.3, 10],
      ["lcvp", 52, 56.5, 8],
      ["lct", 56, 60.5, 3],
      ["lcvp", 60, 64.5, 8],
    ],
  },
];

const OMAHA = 1;

const V: [number, number][] = [
  [0, 0],
  [-0.9, 0.9],
  [0.9, 0.9],
  [-1.8, 1.8],
  [1.8, 1.8],
  [-2.7, 2.7],
  [2.7, 2.7],
  [-0.9, 2.7],
  [0.9, 2.7],
];

const PEGASUS: LL = [-0.2745, 49.2419];
const RANVILLE: LL = [-0.26, 49.23];
const CAEN: LL = [-0.37, 49.185];
const LION: LL = [-0.32, 49.29];

function midpoint(spec: BeachSpec, inland: number): LL {
  return [
    (spec.a[0] + spec.b[0]) / 2 - spec.hint[0] * inland,
    (spec.a[1] + spec.b[1]) / 2 + spec.hint[1] * inland,
  ];
}

const LABELS: Label[] = [
  {
    at: PEGASUS,
    text: { en: "Pegasus Bridge", es: "Puente Pegasus" },
    flags: ["uk"],
    lift: 0.35,
    from: 1,
    to: 9.2,
  },
  {
    at: [-1.316, 49.408],
    text: "Sainte-Mère-Église",
    flags: ["usa-1912"],
    lift: 0.4,
    from: 11.5,
    to: 18.8,
  },
  {
    at: [-0.989, 49.394],
    text: "Pointe du Hoc",
    flags: ["usa-1912"],
    lift: 0.4,
    from: 25.5,
    to: 30.5,
  },
  ...BEACHES.flatMap((spec, i): Label[] => {
    const at = midpoint(spec, 0.012);
    const base = { at, text: spec.id, flags: spec.flags, lift: 0.5 };
    return i === OMAHA
      ? [
          { ...base, from: 19.5, to: 30.6 },
          { ...base, from: 47.6, to: 67 },
        ]
      : [{ ...base, from: 19.5, to: 67 }];
  }),
  {
    at: CAEN,
    text: "Caen",
    flags: [],
    lift: 0.5,
    from: 58,
    to: 67,
  },
];

interface Beach {
  spec: BeachSpec;
  ax: number;
  az: number;
  tx: number;
  tz: number;
  nx: number;
  nz: number;
  len: number;
  toShore: number;
  toSea: number;
}

interface Boat {
  beach: Beach;
  kind: "lcvp" | "lct";
  start: number;
  touch: number;
  u: number;
  from: number;
  hit: number;
  first: boolean;
  seed: number;
}

interface Ship {
  kind: ModelKind;
  beach: Beach;
  x: number;
  z: number;
  size: number;
  arrive: number;
  yaw: number;
  fire: number;
  every: number;
  until: number;
  seed: number;
}

interface Shot {
  at: number;
  ship: number;
  tx: number;
  tz: number;
  flight: number;
  big: boolean;
}

interface Drop {
  at: number;
  x: number;
  y: number;
  z: number;
  dx: number;
  dz: number;
  seed: number;
}

const scene: SceneDef = {
  anchor: [-0.7, 49.42],
  near: 2.2,
  pace: 0.62,
  clip: [0.05, 420],
  bare: true,
  labels: LABELS,
  night: [
    [0, 0.48],
    [16, 0.44],
    [22, 0.28],
    [27, 0.12],
    [32, 0],
    [57, 0],
    [62, 0.45],
    [66, 0.6],
  ],
  capacity: {
    smoke: 2600,
    fire: 420,
    balls: 90,
    decals: 1100,
    glow: 280,
    tracers: 460,
    units: {
      c47: 56,
      horsa: 6,
      paratrooper: 270,
      b24: 24,
      bomb: 72,
      "us-battleship-firing": 7,
      "fletcher-destroyer": 12,
      "attack-transport": 17,
      lcvp: 150,
      "lcvp-open": 110,
      lct: 40,
      sherman: 150,
      "sherman-dd": 12,
      infantry: 260,
      "panzer-iv": 5,
      casemate: 14,
      "mg-nest": 22,
      hedgehog: 170,
      village: 16,
    },
  },
  camera: [
    [0, 39, 5, 1.5, 5, 200, 14],
    [2.2, 33.5, 13.5, 0.8, 4.5, 205, 16],
    [4.3, 31.3, 19.4, 0.1, 3.4, 220, 22],
    [6.8, 32, 20.8, 0.4, 6.5, 195, 30],
    [8.8, 30, 18, 0.6, 14, 190, 40],
    [10.6, -20, 4, 1, 45, 210, 50],
    [12.4, -56, 2.5, 1.1, 5, 250, 12],
    [14.6, -45, 3, 0.7, 6, 205, 26],
    [17, -42, 3.6, 0.2, 5.5, 170, 32],
    [19, -28, -2, 0.5, 28, 205, 34],
    [21.2, -13, -9, 0.1, 12, 215, 16],
    [24, -14, -4, 0.2, 10, 240, 16],
    [27, -13, 1.5, 0.3, 9, 215, 20],
    [29.4, -12.8, 4.8, 0.2, 7, 200, 26],
    [31.2, -12.5, -12, 1.9, 4.5, 200, 10],
    [33.6, -12.5, 3, 2, 5.5, 195, 30],
    [36, -13, 9, 0.4, 10, 190, 38],
    [38, -13, 3.5, 0.1, 7, 200, 20],
    [40, -12.8, 4.6, 0.05, 3.6, 215, 18],
    [42.4, -12.6, 5.6, 0.05, 3.3, 200, 24],
    [45, -12.2, 5.8, 0.1, 3.4, 160, 26],
    [47.6, -14, 4, 0.3, 16, 200, 32],
    [50, 9.4, 8.6, 0.1, 5.2, 205, 22],
    [52.6, 19.4, 9.6, 0.1, 5.2, 195, 22],
    [55.4, 29.7, 14.3, 0.1, 5.5, 190, 24],
    [60, 8, 6, 0.3, 50, 190, 36],
    [66, 2, 6, 0.3, 62, 186, 46],
  ],
  cues: [
    [0.3, "drone", 0.5],
    [10.5, "drone", 0.7],
    [13.5, "far", 0.4],
    [25.3, "far", 0.7],
    [26, "boom", 0.55],
    [27.4, "far", 0.7],
    [29, "boom", 0.5],
    [31, "drone", 0.8],
    [34.6, "rumble", 0.7],
    [35.2, "far", 0.6],
    [40.2, "boom", 0.45],
    [41.5, "far", 0.5],
    [44.5, "boom", 0.5],
    [46.3, "far", 0.6],
    [50.2, "far", 0.6],
    [51.2, "boom", 0.4],
    [58, "far", 0.4],
  ],
  build(kit) {
    const geo = (p: LL) => kit.geo(p[0], p[1]);
    kit.sea(170, 0, -20, SEA);
    kit.terrain(COAST.map(geo), LAND, [0x565d3c, 0x656a44, 0x75734c, 0x6a7248]);
    for (const marsh of MARSHES)
      kit.terrain(marsh.map(geo), LAND + 0.004, [0x4b5844, 0x535e46], 3);
    kit.strip(ORNE.map(geo), 0.16, 0x25363a, LAND + 0.006);
    kit.strip(CANAL.map(geo), 0.09, 0x25363a, LAND + 0.006);
    const [px, pz] = geo(PEGASUS);
    kit.strip(
      [
        [px - 0.12, pz - 0.04],
        [px + 0.12, pz + 0.04],
      ],
      0.05,
      0xa39d88,
      LAND + 0.02
    );

    const beaches: Beach[] = BEACHES.map((spec) => {
      const [ax, az] = geo(spec.a);
      const [bx, bz] = geo(spec.b);
      const len = Math.hypot(bx - ax, bz - az);
      const tx = (bx - ax) / len;
      const tz = (bz - az) / len;
      let nx = -tz;
      let nz = tx;
      if (nx * spec.hint[0] + nz * spec.hint[1] < 0) {
        nx = -nx;
        nz = -nz;
      }
      return {
        spec,
        ax,
        az,
        tx,
        tz,
        nx,
        nz,
        len,
        toShore: Math.atan2(-nx, -nz),
        toSea: Math.atan2(nx, nz),
      };
    });
    const px0 = [0, 0];
    const shore = (b: Beach, u: number, off: number) => {
      px0[0] = b.ax + b.tx * b.len * u + b.nx * off;
      px0[1] = b.az + b.tz * b.len * u + b.nz * off;
      return px0 as [number, number];
    };

    for (const b of beaches) {
      const sand: [number, number][] = [];
      for (let u = -0.08; u <= 1.081; u += 0.2)
        sand.push([...shore(b, u, -0.2)] as [number, number]);
      kit.strip(sand, 0.46, 0xbfae83, LAND + 0.004);
    }
    const along = (b: Beach, x: number, z: number) =>
      ((x - b.ax) * b.tx + (z - b.az) * b.tz) / b.len;
    const bluffYaw = (b: Beach) => Math.atan2(-b.tz, b.tx);
    const omaha = beaches[OMAHA]!;
    for (let i = 0; i < 6; i++) {
      const [hx, hz] = shore(omaha, 0.06 + i * 0.176, -0.62);
      kit.hill(hx, hz, 0.78, 0.36, 0.2, 0x59603f, bluffYaw(omaha));
    }
    {
      const [hx, hz] = geo([-0.989, 49.394]);
      kit.hill(hx, hz, 0.5, 0.38, 0.17, 0x5d6242, 0.2);
    }
    const top = (x: number, z: number) =>
      Math.max(kit.surface(x, z), ground(x, z) + LAND);
    const sea = (x: number, z: number) => ground(x, z) + SEA;

    const s = sample();
    const put = (
      kind: ModelKind,
      x: number,
      y: number,
      z: number,
      yaw: number,
      size: number,
      pitch = 0,
      roll = 0
    ) => {
      s.x = x;
      s.y = y;
      s.z = z;
      s.yaw = yaw;
      s.pitch = pitch;
      s.roll = roll;
      kit.unit(kind, s, size, WHITE);
    };

    const villages = VILLAGES.map(([lon, lat, size], i) => {
      const [x, z] = geo([lon, lat]);
      return [x, z, size, hash(i + 40) * Math.PI] as const;
    });

    const defenses: {
      kind: "casemate" | "mg-nest";
      x: number;
      z: number;
      yaw: number;
      beach: number;
      seed: number;
    }[] = [];
    const hedgehogs: number[] = [];
    beaches.forEach((b, bi) => {
      const big = bi === OMAHA;
      const casemates = big ? [0.06, 0.26, 0.5, 0.72, 0.93] : [0.25, 0.75];
      for (const u of casemates) {
        const [x, z] = shore(b, u, big ? -0.62 : -0.5);
        defenses.push({
          kind: "casemate",
          x,
          z,
          yaw: b.toSea + (u - 0.5) * 0.6,
          beach: bi,
          seed: defenses.length,
        });
      }
      const nests = big ? 8 : 3;
      for (let i = 0; i < nests; i++) {
        const [x, z] = shore(b, (i + 0.5) / nests, big ? -0.4 : -0.42);
        defenses.push({
          kind: "mg-nest",
          x,
          z,
          yaw: b.toSea,
          beach: bi,
          seed: defenses.length,
        });
      }
      const rows = big ? 3 : 2;
      const per = big ? 28 : 11;
      for (let r = 0; r < rows; r++)
        for (let i = 0; i < per; i++) {
          const k = r * per + i + bi * 97;
          const [x, z] = shore(
            b,
            (i + 0.5 + (hash(k) - 0.5) * 0.6) / per,
            0.1 + r * 0.1 + hash(k + 0.3) * 0.04
          );
          hedgehogs.push(x, z, hash(k + 0.6) * Math.PI);
        }
    });

    const ships: Ship[] = [];
    beaches.forEach((b, bi) => {
      const [bs, ds, ts] = b.spec.fleet;
      const add = (
        kind: ModelKind,
        count: number,
        dist: number,
        size: number,
        every: number,
        until: number
      ) => {
        for (let i = 0; i < count; i++) {
          const seed = ships.length;
          const [x, z] = shore(
            b,
            (i + 0.5) / count + (hash(seed) - 0.5) * 0.15,
            dist + (hash(seed + 0.5) - 0.5) * 1.5
          );
          ships.push({
            kind,
            beach: b,
            x,
            z,
            size,
            arrive: 22.6 + hash(seed + 0.2) * 1.8,
            yaw: b.toShore,
            fire:
              kind === "attack-transport"
                ? Infinity
                : 25.2 + hash(seed + 0.7) * 1.4 + (bi > 1 ? 1 : 0),
            every,
            until,
            seed,
          });
        }
      };
      add("us-battleship-firing", bs, 9.5, 1.5, 1.8, bi > 1 ? 49 : 39.5);
      add("fletcher-destroyer", ds, 4.5, 0.75, 1.15, 57);
      add("attack-transport", ts, 16, 1.05, 0, 0);
    });

    const targets = (b: Beach, seed: number, out: [number, number]) => {
      const bi = beaches.indexOf(b);
      const list = defenses.filter((d) => d.beach === bi);
      if (hash(seed) < 0.55 && list.length) {
        const d = list[Math.floor(hash(seed + 0.1) * list.length)]!;
        out[0] = d.x + (hash(seed + 0.2) - 0.5) * 0.5;
        out[1] = d.z + (hash(seed + 0.3) - 0.5) * 0.5;
      } else {
        const [x, z] = shore(
          b,
          hash(seed + 0.4),
          -0.5 - hash(seed + 0.5) * 1.6
        );
        out[0] = x;
        out[1] = z;
      }
      return out;
    };
    const shots: Shot[] = [];
    const aim: [number, number] = [0, 0];
    ships.forEach((ship, si) => {
      if (ship.fire === Infinity) return;
      const big = ship.kind === "us-battleship-firing";
      for (let at = ship.fire; at < ship.until; at += ship.every) {
        const seed = si * 131 + shots.length;
        targets(ship.beach, seed, aim);
        shots.push({
          at: at + (hash(seed + 0.9) - 0.5) * 0.3,
          ship: si,
          tx: aim[0],
          tz: aim[1],
          flight: big ? 1.6 : 0.9,
          big: big && hash(seed + 0.95) < 0.35,
        });
      }
    });

    const boats: Boat[] = [];
    beaches.forEach((b, bi) => {
      b.spec.waves.forEach(([kind, start, touch, count], wi) => {
        for (let i = 0; i < count; i++) {
          const seed = boats.length + 1;
          const hit =
            bi === OMAHA && wi < 2 && hash(seed + 0.4) > 0.8
              ? start + (touch - start) * (0.62 + hash(seed + 0.1) * 0.25)
              : 0;
          boats.push({
            beach: b,
            kind,
            start: start + (hash(seed) - 0.5) * 0.5,
            touch: touch + (hash(seed + 0.2) - 0.5) * 0.4,
            u: (i + 0.5 + (hash(seed + 0.3) - 0.5) * 0.5) / count,
            from: kind === "lct" ? 5 : 6.5,
            hit,
            first: wi < 2,
            seed,
          });
        }
      });
    });

    const dd: { beach: Beach; u: number; sink: number; seed: number }[] = [];
    for (let i = 0; i < 8; i++)
      dd.push({
        beach: omaha,
        u: 0.3 + (i / 7) * 0.5,
        sink: i === 2 || i === 6 ? 0 : 36 + hash(i + 3) * 3.2,
        seed: i,
      });
    for (let i = 0; i < 4; i++)
      dd.push({ beach: beaches[0]!, u: 0.2 + i * 0.2, sink: 0, seed: 20 + i });

    const plane = sample();
    const wing = sample();
    const slot = (yaw: number, j: number) => {
      wing.x = 0;
      wing.z = 0;
      wing.yaw = yaw;
      offset(wing, V[j]![0] * 0.55, V[j]![1] * 0.55, 0);
    };
    const usSerials = [0, 1, 2, 3].map((k) => ({
      t0: 9.8 + k * 0.55,
      t1: 17.8 + k * 0.55,
      x0: -86,
      x1: -4,
      z: 1.4 + k * 1.5,
      h: 1.15,
      seed: k * 11,
    }));
    const usAt = (serial: (typeof usSerials)[number], j: number, t: number) => {
      const u = (t - serial.t0) / (serial.t1 - serial.t0);
      const span = serial.x1 - serial.x0;
      const yaw0 = Math.atan2(span, 0.012 * span);
      slot(yaw0, j);
      fly(
        plane,
        serial.x0 + wing.x,
        serial.z + wing.z,
        yaw0,
        span * u,
        smx + 7 - serial.x0,
        5,
        1.25
      );
      plane.y = ground(plane.x, plane.z) + serial.h;
      jostle(plane, t, serial.seed + j);
      return u;
    };
    const [rx, rz] = geo(RANVILLE);
    const ukSerials = [0, 1].map((k) => ({
      t0: 2.2 + k * 0.8,
      t1: 9.4 + k * 0.8,
      x: rx - 0.8 + k * 1.8,
      z0: -16,
      z1: 44,
      h: 1.05,
      seed: 50 + k * 11,
    }));
    const ukAt = (serial: (typeof ukSerials)[number], j: number, t: number) => {
      const u = (t - serial.t0) / (serial.t1 - serial.t0);
      const span = serial.z1 - serial.z0;
      slot(0, j);
      fly(
        plane,
        serial.x + wing.x,
        serial.z0 + wing.z,
        0,
        span * u,
        rz + 3 - serial.z0,
        4,
        2.4
      );
      plane.y = ground(plane.x, plane.z) + serial.h;
      jostle(plane, t, serial.seed + j);
      return u;
    };

    const drops: Drop[] = [];
    const [smx, smz] = geo([-1.316, 49.408]);
    usSerials.forEach((serial, k) => {
      for (let j = 0; j < 9; j++)
        for (let p = 0; p < 5; p++) {
          const seed = drops.length + 7;
          const xDrop =
            smx - 3 + (k % 2) * 5 + p * 0.35 + (hash(seed) - 0.5) * 6;
          const u = (xDrop - serial.x0) / (serial.x1 - serial.x0);
          const at = serial.t0 + u * (serial.t1 - serial.t0);
          usAt(serial, j, at);
          drops.push({
            at,
            x: plane.x,
            y: plane.y - 0.08,
            z: plane.z + (hash(seed + 0.5) - 0.5) * 2.5,
            dx: 0.05 + hash(seed + 0.2) * 0.05,
            dz: (hash(seed + 0.3) - 0.5) * 0.06,
            seed,
          });
        }
    });
    ukSerials.forEach((serial) => {
      for (let j = 0; j < 9; j++)
        for (let p = 0; p < 4; p++) {
          const seed = drops.length + 7;
          const zDrop = rz - 1.4 + p * 0.4 + (hash(seed) - 0.5) * 1.6;
          const u = (zDrop - serial.z0) / (serial.z1 - serial.z0);
          const at = serial.t0 + u * (serial.t1 - serial.t0);
          ukAt(serial, j, at);
          drops.push({
            at,
            x: plane.x + (hash(seed + 0.5) - 0.5) * 0.8,
            y: plane.y - 0.08,
            z: plane.z,
            dx: 0.04,
            dz: 0.02,
            seed,
          });
        }
    });

    const gliders = [0, 1, 2, 3, 4, 5].map((i) => {
      const land = 2.8 + i * 0.35;
      const lx = px + 0.35 + (i > 2 ? 0.8 : 0) + (hash(i + 60) - 0.5) * 0.12;
      const lz = pz - 0.2 - (i % 3) * 0.62 - (i > 2 ? 0.3 : 0);
      return new Path([
        [px + 9 + i * 0.4, 1.7, pz - 16 + i * 0.5, 0],
        [px + 3, 0.9, pz - 6, land - 1.4],
        [lx, LAND + 0.09, lz - 0.4, land - 0.15],
        [lx, LAND + 0.04, lz, land + 0.5],
      ]);
    });

    const bombers: { x: number; z0: number; t0: number; release: number }[] =
      [];
    for (let box = 0; box < 4; box++)
      for (let j = 0; j < 6; j++)
        bombers.push({
          x:
            omaha.ax +
            omaha.tx * omaha.len * (0.1 + box * 0.27) +
            V[j]![0] * 0.5,
          z0: -18 - V[j]![1] * 0.6 - box * 1.6,
          t0: 30.4 + box * 0.35,
          release: 0,
        });
    const BOMBER_SPEED = 7.2;
    const bombs: { x: number; z: number; at: number; tz: number }[] = [];
    bombers.forEach((b, i) => {
      const releaseZ = omaha.az + 1.2 + hash(i + 50) * 1.4;
      b.release = b.t0 + (releaseZ - b.z0) / BOMBER_SPEED;
      for (let k = 0; k < 3; k++)
        bombs.push({
          x: b.x + (hash(i * 3 + k) - 0.5) * 1.6,
          z: releaseZ + k * 0.25,
          at: b.release + k * 0.12,
          tz: releaseZ + 2.2 + k * 0.9 + hash(i * 3 + k + 0.5) * 3,
        });
    });

    const [cx, cz] = geo(CAEN);
    const [lx, lz] = geo(LION);
    const aimShip = [0, 0];

    const shipAt = (ship: Ship, t: number) => {
      const k = clamp01((t - ship.arrive + 8) / 8);
      const back = 40 * (1 - easeOut(k));
      s.x = ship.x + ship.beach.nx * back;
      s.z = ship.z + ship.beach.nz * back;
      s.y = sea(s.x, s.z);
      const turn =
        ship.kind === "us-battleship-firing"
          ? smooth(ship.arrive, ship.arrive + 2, t) * 1.25
          : 0;
      s.yaw = ship.yaw + turn;
      s.pitch = Math.sin(t * 0.9 + ship.seed) * 0.01;
      s.roll = Math.sin(t * 0.7 + ship.seed * 2) * 0.015;
      if (ship.kind === "fletcher-destroyer" && ship.beach === omaha) {
        const close = smooth(43.5, 46.5, t) * 2.6;
        s.x -= ship.beach.nx * close;
        s.z -= ship.beach.nz * close;
      }
      return k;
    };

    return (t) => {
      for (const [x, z, size, yaw] of villages)
        put("village", x, top(x, z), z, yaw, size);

      for (const d of defenses) {
        const size = d.kind === "casemate" ? 0.24 : 0.11;
        put(d.kind, d.x, top(d.x, d.z) - 0.01, d.z, d.yaw, size);
      }
      for (let i = 0; i < hedgehogs.length; i += 3) {
        const x = hedgehogs[i]!;
        const z = hedgehogs[i + 1]!;
        put("hedgehog", x, sea(x, z) - 0.006, z, hedgehogs[i + 2]!, 0.05);
      }

      if (t < 18.5) {
        for (let g = 0; g < 6; g++) {
          const path = gliders[g]!;
          path.at(t, s);
          const landed = t > path.finish - 0.6;
          if (landed) {
            s.pitch = 0;
            s.roll = 0.08 * (g % 2 ? 1 : -1);
            s.yaw +=
              (hash(g + 61) - 0.5) *
              0.5 *
              smooth(path.finish - 0.6, path.finish, t);
          }
          kit.unit("horsa", s, 0.42, WHITE);
          if (!landed && t > path.start) trail(kit, s, 0.4, 0.05, 0.2, 3);
        }
        for (const serial of ukSerials)
          for (let j = 0; j < 9; j++) {
            const u = ukAt(serial, j, t);
            if (u > 0 && u < 1) kit.unit("c47", plane, 0.55, WHITE);
          }
        for (let k = 0; k < usSerials.length; k++) {
          const serial = usSerials[k]!;
          for (let j = 0; j < 9; j++) {
            const u = usAt(serial, j, t);
            if (u <= 0 || u >= 1) continue;
            if (k === 1 && j === 4 && t > 13.4) {
              const age = t - 13.4;
              if (age > 2.6) continue;
              plane.y -= age * age * 0.17;
              plane.pitch = -0.25 - age * 0.2;
              plane.roll = age * 0.5;
              kit.fire.push(
                plane.x,
                plane.y,
                plane.z,
                0.18,
                0.9,
                1,
                0,
                0,
                hash(Math.floor(t * 20))
              );
              for (let q = 0; q < 5; q++)
                kit.smoke.push(
                  plane.x - q * 0.25,
                  plane.y + q * 0.05,
                  plane.z,
                  0.14 + q * 0.05,
                  0.7 - q * 0.12,
                  0,
                  0.1,
                  0,
                  hash(q + Math.floor(t * 10))
                );
            }
            kit.unit("c47", plane, 0.55, WHITE);
          }
        }
        for (const drop of drops) {
          const age = t - drop.at;
          const fall = 0.35 + (drop.y - LAND - 0.315) / 0.3;
          if (age < 0 || age > fall + 0.4) continue;
          const open = smooth(0, 0.35, age);
          const x = drop.x + drop.dx * age;
          const z = drop.z + drop.dz * age;
          const y = Math.max(
            top(x, z),
            drop.y - (age < 0.35 ? age * 0.9 : 0.315 + (age - 0.35) * 0.3)
          );
          put(
            "paratrooper",
            x,
            y,
            z,
            hash(drop.seed) * 6,
            0.1 + open * 0.1,
            Math.sin(t * 2 + drop.seed) * 0.12,
            Math.cos(t * 1.7 + drop.seed) * 0.12
          );
        }
        const flak = (
          cx0: number,
          cz0: number,
          seed: number,
          t0: number,
          t1: number
        ) => {
          if (t < t0 || t > t1) return;
          for (let a = 0; a < 16; a++) {
            const phase = t * 2.4 + a * 0.31;
            const cycle = phase - Math.floor(phase);
            const fx = cx0 + (hash(a + seed) - 0.5) * 14;
            const fz = cz0 + (hash(a + seed + 0.4) - 0.5) * 9;
            const gy = top(fx, fz);
            const len = 0.3 + cycle * 1.3;
            kit.tracers.push(
              fx,
              gy + len * 0.55,
              fz,
              fx + 0.12,
              gy + len,
              fz - 0.08,
              1,
              0.55,
              0.22,
              1 - cycle
            );
            if (hash(a + Math.floor(phase) + seed) > 0.72) {
              kit.glow.disc(fx, gy + 1.15, fz, 0.3, 1 - cycle, 1, 0.8, 0.45);
              kit.smoke.push(
                fx,
                gy + 1.15,
                fz,
                0.25 + cycle * 0.3,
                0.55 * (1 - cycle),
                0,
                0.05,
                0,
                hash(a + seed)
              );
            }
          }
        };
        flak(rx, rz - 1, 3, 2, 9.5);
        flak(smx + 2, smz + 1, 11, 11, 17.5);
      }

      for (let si = 0; si < ships.length; si++) {
        const ship = ships[si]!;
        if (t < ship.arrive - 8.5) continue;
        const k = shipAt(ship, t);
        kit.unit(ship.kind, s, ship.size, WHITE);
        if (k < 1) trail(kit, s, 3, 0.16, 0.45 * (1 - k * k));
        if (ship.kind === "attack-transport" && t > 25 && t < 48)
          for (let side = -1; side <= 1; side += 2) {
            const bob = Math.sin(t * 1.3 + ship.seed + side) * 0.004;
            aimShip[0] = s.x + Math.cos(s.yaw) * side * 0.14;
            aimShip[1] = s.z - Math.sin(s.yaw) * side * 0.14;
            put(
              "lcvp",
              aimShip[0]!,
              sea(aimShip[0]!, aimShip[1]!) + bob,
              aimShip[1]!,
              s.yaw,
              0.13
            );
          }
      }

      for (const shot of shots) {
        const age = t - shot.at;
        if (age < -0.05 || age > shot.flight + 8) continue;
        const ship = ships[shot.ship]!;
        shipAt(ship, t);
        const mx = s.x + (shot.tx - s.x) * 0.02;
        const mz = s.z + (shot.tz - s.z) * 0.02;
        const my = s.y + 0.12;
        if (age >= 0 && age < 0.25) {
          const f = 1 - age / 0.25;
          kit.glow.disc(mx, my, mz, ship.size * 0.7, f, 1, 0.78, 0.45);
          kit.fire.push(
            mx,
            my + 0.05,
            mz,
            ship.size * 0.35,
            f,
            1,
            0,
            0,
            hash(shot.at)
          );
          if (ship.size > 1) kit.flash = Math.max(kit.flash, 0.05 * f);
        }
        if (age >= 0 && age < 2.5)
          kit.smoke.push(
            mx + age * 0.3,
            my + age * 0.12,
            mz,
            ship.size * (0.25 + age * 0.3),
            0.6 * (1 - age / 2.5),
            0,
            0.55,
            0,
            hash(shot.at + 1)
          );
        if (age > 0 && age < shot.flight) {
          const u1 = age / shot.flight;
          const u0 = Math.max(0, u1 - 0.08);
          const dist = Math.hypot(shot.tx - mx, shot.tz - mz);
          const arc = dist * 0.1;
          const ty = top(shot.tx, shot.tz);
          kit.tracers.push(
            mx + (shot.tx - mx) * u0,
            my + (ty - my) * u0 + Math.sin(Math.PI * u0) * arc,
            mz + (shot.tz - mz) * u0,
            mx + (shot.tx - mx) * u1,
            my + (ty - my) * u1 + Math.sin(Math.PI * u1) * arc,
            mz + (shot.tz - mz) * u1,
            1,
            0.85,
            0.55,
            0.9
          );
        }
        const hitAt = shot.at + shot.flight;
        if (t >= hitAt) {
          const ty = top(shot.tx, shot.tz);
          if (shot.big)
            blast(
              kit,
              t,
              hitAt,
              shot.tx,
              ty + 0.02,
              shot.tz,
              0.22,
              shot.at * 7
            );
          else {
            const a = t - hitAt;
            if (a < 0.3)
              kit.glow.disc(
                shot.tx,
                ty + 0.02,
                shot.tz,
                0.35,
                1 - a / 0.3,
                1,
                0.7,
                0.35
              );
            if (a < 0.7)
              kit.fire.push(
                shot.tx,
                ty + 0.06 + a * 0.1,
                shot.tz,
                0.16,
                1 - a / 0.7,
                1,
                0,
                0.4,
                hash(shot.at)
              );
            for (let q = 0; q < 3; q++) {
              const age2 = a - q * 0.2;
              if (age2 < 0 || age2 > 5) continue;
              kit.smoke.push(
                shot.tx + age2 * 0.12 + (hash(shot.at + q) - 0.5) * 0.15,
                ty + 0.08 + age2 * 0.07,
                shot.tz,
                0.14 + age2 * 0.09,
                0.7 * (1 - age2 / 5),
                0,
                0.2,
                0.6,
                hash(shot.at + q * 3)
              );
            }
          }
        }
      }

      if (t > 28.5 && t < 39) {
        const fade = smooth(28.5, 30.5, t) * (1 - smooth(36.5, 39, t));
        for (let c = 0; c < 36; c++) {
          const x = omaha.ax - 7 + hash(c + 200) * 16;
          const z = omaha.az - 4 + hash(c + 201) * 14;
          kit.smoke.push(
            x + t * 0.05,
            ground(x, z) + 1.75 + hash(c + 202) * 0.2,
            z,
            0.8 + hash(c + 203) * 0.8,
            0.3 * fade,
            0,
            0.82,
            0,
            hash(c + 204)
          );
        }
      }
      for (const b of bombers) {
        const age = t - b.t0;
        if (age < 0 || age > 9) continue;
        fly(
          s,
          b.x,
          b.z0,
          0,
          age * BOMBER_SPEED,
          (b.release - b.t0) * BOMBER_SPEED + 3,
          3.5,
          -2.4
        );
        const climb = Math.max(0, t - b.release - 0.4) * 0.05;
        s.y = ground(s.x, s.z) + 2.35 + climb;
        jostle(s, t, b.z0 * 7);
        kit.unit("b24", s, 0.5, WHITE);
      }
      for (const bomb of bombs) {
        const age = t - bomb.at;
        if (age < 0) continue;
        const fall = 1.4;
        if (age < fall) {
          const u = age / fall;
          const z = bomb.z + (bomb.tz - bomb.z) * u;
          const y = ground(bomb.x, z) + 2.3 - 2.3 * u * u;
          put("bomb", bomb.x, y, z, 0, 0.08, -0.4 - u * 0.9);
        }
        blast(
          kit,
          t,
          bomb.at + fall,
          bomb.x,
          top(bomb.x, bomb.tz) + 0.02,
          bomb.tz,
          0.12,
          bomb.at * 13,
          0
        );
      }

      for (const d of dd) {
        const b = d.beach;
        const start = b === omaha ? 34.8 : 36;
        const touch = b === omaha ? 42.5 : 40.5;
        if (t < start) continue;
        const from = b === omaha ? 5.5 : 3;
        const k = clamp01((t - start) / (touch - start));
        const [x, z] = shore(b, d.u, from * (1 - k) + 0.06);
        if (d.sink && t > d.sink) {
          const a = t - d.sink;
          if (a < 1.6)
            put(
              "sherman-dd",
              x,
              sea(x, z) - a * 0.07,
              z,
              b.toShore,
              0.11,
              a * 0.3,
              a * 0.2
            );
          spout(kit, t, d.sink + 0.2, x, z, 0.06, d.seed + 300);
          continue;
        }
        if (k < 1) {
          put(
            "sherman-dd",
            x,
            sea(x, z) - 0.035,
            z,
            b.toShore,
            0.11,
            Math.sin(t * 2 + d.seed) * 0.04
          );
          s.x = x;
          s.z = z;
          s.yaw = b.toShore;
          trail(kit, s, 0.2, 0.05, 0.4, 3);
        } else {
          const adv =
            b === omaha
              ? Math.min(0.28, (t - touch) * 0.06)
              : Math.min(2.4, (t - touch) * 0.12);
          const [ix, iz] = shore(b, d.u, -adv);
          put("sherman", ix, top(ix, iz), iz, b.toShore, 0.15);
        }
      }

      for (const boat of boats) {
        if (t < boat.start - 0.2 || t > boat.touch + 12) continue;
        const b = boat.beach;
        const omahaFirst = b === omaha && boat.first;
        const k = clamp01((t - boat.start) / (boat.touch - boat.start));
        const size = boat.kind === "lct" ? 0.34 : 0.2;
        const reach = boat.from * (1 - easeOut(k)) + size * 0.45 + 0.02;
        const leave = Math.max(0, t - boat.touch - 5) * 0.35;
        const [x, z] = shore(b, boat.u, reach + leave);
        const rock = Math.sin(t * 2.3 + boat.seed) * 0.05;
        if (boat.hit && t > boat.hit) {
          const a = t - boat.hit;
          const [hx, hz] = shore(
            b,
            boat.u,
            boat.from *
              (1 -
                easeOut(
                  clamp01((boat.hit - boat.start) / (boat.touch - boat.start))
                ))
          );
          blast(
            kit,
            t,
            boat.hit,
            hx,
            sea(hx, hz) + 0.02,
            hz,
            0.12,
            boat.seed * 5
          );
          if (a < 3)
            put(
              boat.kind,
              hx,
              sea(hx, hz) - a * 0.03,
              hz,
              b.toShore,
              size,
              0.2 + a * 0.2,
              a * 0.25
            );
          continue;
        }
        const landed = t >= boat.touch;
        const kind: ModelKind =
          boat.kind === "lct" ? "lct" : landed ? "lcvp-open" : "lcvp";
        const yaw =
          leave > 0 ? b.toShore + Math.min(Math.PI, leave * 2) : b.toShore;
        put(kind, x, sea(x, z), z, yaw, size, landed ? 0 : rock * 0.6, rock);
        if (!landed || leave > 0) {
          s.x = x;
          s.z = z;
          s.yaw = yaw;
          trail(kit, s, 0.32, 0.035, 0.3, 5);
        }
        if (!landed) {
          if (omahaFirst && t > boat.touch - 2.2)
            spout(
              kit,
              t,
              boat.touch - 2.2 + hash(boat.seed) * 1.6,
              x + (hash(boat.seed + 1) - 0.5) * 0.3,
              z + b.nz * 0.2,
              0.05,
              boat.seed + 90
            );
          continue;
        }
        const since = t - boat.touch;
        const stall =
          b === omaha ? (t < 50 ? 0.3 : 0.3 + (t - 50) * 0.09) : 2.2;
        if (boat.kind === "lcvp") {
          for (let q = 0; q < 2; q++) {
            if (since < 0.3 + q * 0.4) continue;
            const seed = boat.seed * 3 + q;
            const pinned = omahaFirst && hash(seed + 0.77) < 0.4;
            const adv = Math.min(
              pinned ? 0.07 + hash(seed) * 0.08 : stall,
              rush(since - 0.3 - q * 0.4, b === omaha ? 0.09 : 0.16, seed)
            );
            const spread = (q - 0.5) * 0.02 + (hash(seed + 0.4) - 0.5) * 0.012;
            const [ix, iz] = shore(b, boat.u + spread * (1 + adv * 6), -adv);
            put(
              "infantry",
              ix,
              top(ix, iz),
              iz,
              b.toShore + (hash(seed + 0.6) - 0.5) * 0.6,
              0.12
            );
          }
        } else {
          for (let q = 0; q < 3; q++) {
            const out = since - 0.8 - q * 0.6;
            if (out < 0) continue;
            const adv = Math.min(b === omaha ? stall + 0.1 : 2.6, out * 0.14);
            const [ix, iz] = shore(b, boat.u + (q - 1) * 0.01, -adv);
            put("sherman", ix, top(ix, iz), iz, b.toShore, 0.15);
          }
        }
      }

      for (const d of defenses) {
        const b = beaches[d.beach]!;
        const hTime = b.spec.touch;
        const bigBeach = d.beach === OMAHA;
        const silenced = bigBeach
          ? 45.5 + hash(d.seed) * 3
          : hTime + 2 + hash(d.seed) * 2;
        if (t > silenced) {
          if (d.kind === "casemate") {
            blast(
              kit,
              t,
              silenced,
              d.x,
              top(d.x, d.z) + 0.05,
              d.z,
              0.16,
              d.seed + 400
            );
            plume(
              kit,
              t,
              silenced + 0.5,
              66,
              d.x,
              d.z,
              0.12,
              d.seed + 500,
              SMOLDER
            );
          }
          continue;
        }
        const from = hTime - 3.5;
        if (t < from) continue;
        const gy = top(d.x, d.z) + 0.05;
        if (d.kind === "casemate") {
          const phase = (t - from) / 2.1 + hash(d.seed);
          const cycle = phase - Math.floor(phase);
          if (cycle < 0.12) {
            const fx = d.x + Math.sin(d.yaw) * 0.2;
            const fz = d.z + Math.cos(d.yaw) * 0.2;
            kit.glow.disc(fx, gy, fz, 0.2, 1 - cycle / 0.12, 1, 0.75, 0.4);
          }
          const [sx2, sz2] = shore(
            b,
            clamp01(
              along(b, d.x, d.z) +
                (hash(Math.floor(phase) + d.seed) - 0.5) * 0.3
            ),
            0.4 + hash(Math.floor(phase) * 3 + d.seed) * 2.2
          );
          spout(
            kit,
            t,
            from + (Math.floor(phase) - hash(d.seed) + 0.25) * 2.1,
            sx2,
            sz2,
            0.08,
            d.seed * 31 + Math.floor(phase)
          );
        } else {
          for (let q = 0; q < 3; q++) {
            const phase = t * 3.1 + q * 0.33 + d.seed * 0.17;
            const cycle = phase - Math.floor(phase);
            const sweep = hash(Math.floor(phase) + d.seed * 9 + q);
            const [tx2, tz2] = shore(
              b,
              clamp01(along(b, d.x, d.z) + (sweep - 0.5) * 0.25),
              -0.1 + sweep * 0.9
            );
            const u0 = cycle * 0.85;
            const u1 = u0 + 0.15;
            kit.tracers.push(
              d.x + (tx2 - d.x) * u0,
              gy + (sea(tx2, tz2) + 0.02 - gy) * u0,
              d.z + (tz2 - d.z) * u0,
              d.x + (tx2 - d.x) * u1,
              gy + (sea(tx2, tz2) + 0.02 - gy) * u1,
              d.z + (tz2 - d.z) * u1,
              1,
              0.62,
              0.3,
              0.9
            );
          }
        }
      }

      if (t > 56.5) {
        for (let i = 0; i < 5; i++) {
          const k = smooth(56.5 + i * 0.3, 66, t);
          const x = cx + (lx - cx) * k * 0.7 + (i - 2) * 0.35;
          const z = cz + (lz - cz) * k * 0.7 + (hash(i + 70) - 0.5) * 0.4;
          put("panzer-iv", x, top(x, z), z, Math.atan2(lx - cx, lz - cz), 0.13);
        }
      }

      beaches.forEach((b, bi) => {
        for (let q = 0; q < (bi === OMAHA ? 4 : 2); q++) {
          const [x, z] = shore(
            b,
            0.15 + q * 0.23 + hash(bi * 7 + q) * 0.08,
            -0.35
          );
          plume(
            kit,
            t,
            b.spec.touch - 12 + q * 0.7,
            66,
            x,
            z,
            0.4,
            bi * 10 + q,
            SHORE
          );
        }
      });
    };
  },
};

function fly(
  out: Sample,
  x0: number,
  z0: number,
  yaw0: number,
  dist: number,
  at: number,
  radius: number,
  by: number
) {
  const sign = Math.sign(by);
  out.pitch = 0;
  if (dist <= at) {
    out.x = x0 + Math.sin(yaw0) * dist;
    out.z = z0 + Math.cos(yaw0) * dist;
    out.yaw = yaw0;
    out.roll = 0;
    return out;
  }
  const arc = radius * Math.abs(by);
  const sx = x0 + Math.sin(yaw0) * at;
  const sz = z0 + Math.cos(yaw0) * at;
  const cx = sx + radius * sign * Math.cos(yaw0);
  const cz = sz - radius * sign * Math.sin(yaw0);
  const yaw = yaw0 + (sign * Math.min(dist - at, arc)) / radius;
  const rest = Math.max(0, dist - at - arc);
  out.x = cx - radius * sign * Math.cos(yaw) + Math.sin(yaw) * rest;
  out.z = cz + radius * sign * Math.sin(yaw) + Math.cos(yaw) * rest;
  out.yaw = yaw;
  const ease = radius * 0.35;
  out.roll =
    -sign *
    0.55 *
    Math.min(clamp01((dist - at) / ease), 1 - clamp01(rest / ease));
  return out;
}

function jostle(out: Sample, t: number, seed: number) {
  out.y += Math.sin(t * 1.3 + seed * 1.7) * 0.015;
  out.pitch += Math.sin(t * 1.1 + seed) * 0.03;
  out.roll += Math.sin(t * 0.8 + seed * 2.3) * 0.05;
  offset(out, Math.sin(t * 0.6 + seed * 0.9) * 0.04, 0, 0);
}

function rush(time: number, rate: number, seed: number) {
  if (time <= 0) return 0;
  const period = 1.3 + hash(seed) * 0.8;
  const k = time / period;
  const n = Math.floor(k);
  return ((n * 0.6 + Math.min(k - n, 0.6)) * period * rate) / 0.6;
}

function spout(
  kit: Kit,
  t: number,
  t0: number,
  x: number,
  z: number,
  size: number,
  seed: number
) {
  const age = t - t0;
  if (age < 0 || age > 2.2) return;
  const y = ground(x, z) + SEA;
  for (let i = 0; i < 5; i++) {
    const k = seed * 13 + i;
    const rise =
      size * (2 + hash(k) * 2) * Math.sin(Math.min(Math.PI, age * 2));
    kit.smoke.push(
      x + (hash(k + 0.3) - 0.5) * size,
      y + Math.max(0, rise),
      z + (hash(k + 0.6) - 0.5) * size,
      size * (0.8 + age * 0.9),
      0.7 * (1 - age / 2.2),
      0,
      0.95,
      0,
      hash(k + 0.9)
    );
  }
}

function blast(
  kit: Kit,
  t: number,
  t0: number,
  x: number,
  y: number,
  z: number,
  size: number,
  seed: number,
  fire = 1
) {
  const age = t - t0;
  if (age < 0 || age > 8) return;
  if (fire)
    kit.balls.push(
      x,
      y + size * 0.3 * age,
      z,
      size * (1.3 + 2 * easeOut(age / 1.1)),
      age / 1.5,
      seed,
      1
    );
  if (age < 0.35)
    kit.glow.disc(
      x,
      y + 0.02,
      z,
      size * (fire ? 2.6 : 1.2),
      (1 - age / 0.35) * (fire ? 1 : 0.35),
      1,
      0.6,
      0.25
    );
  for (let i = 0; i < 8; i++) {
    const k = seed * 97 + i;
    const a = hash(k) * Math.PI * 2;
    const spread = size * (0.4 + hash(k + 0.3)) * easeOut(age / 2.5);
    const life = clamp01(age / (5 + hash(k + 0.7) * 3));
    kit.smoke.push(
      x + Math.cos(a) * spread + age * 0.12,
      y + size * 0.4 + age * size * (0.4 + hash(k + 0.5) * 0.3),
      z + Math.sin(a) * spread,
      size * (1.1 + 2.2 * easeOut(age / 4)),
      0.8 * smooth(0.05, 0.5, age) * (1 - life),
      Math.max(0, 1 - age) * fire,
      0.12 + (1 - fire) * 0.25,
      0.3 + (1 - fire) * 0.5,
      hash(k + 0.9)
    );
  }
}

const SHORE = {
  rise: 0.14,
  wind: 0.12,
  life: 9,
  every: 0.5,
  fire: 0.45,
  shade: 0.14,
};

const SMOLDER = {
  rise: 0.1,
  wind: 0.08,
  life: 7,
  every: 0.6,
  fire: 0.3,
  shade: 0.1,
};

export default scene;
