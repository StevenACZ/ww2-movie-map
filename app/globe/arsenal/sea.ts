import { PAINT } from "./palette";
import { box, dome, mirror, model, type Part, plan, rod, tube } from "./parts";

function hull(beam: number, height: number, draft = 0.02): Part[] {
  const half = beam / 2;
  const outline = mirror([
    [0, 0.5],
    [half * 0.45, 0.43],
    [half, 0.26],
    [half, -0.3],
    [half * 0.8, -0.44],
    [half * 0.4, -0.5],
  ]);
  const deck = mirror([
    [0, 0.48],
    [half * 0.4, 0.42],
    [half * 0.9, 0.26],
    [half * 0.9, -0.3],
    [half * 0.72, -0.43],
    [half * 0.35, -0.48],
  ]);
  return [
    plan(outline, draft, PAINT.hullRed, { y: -draft }),
    plan(outline, height, PAINT.navyHull),
    plan(deck, 0.004, PAINT.deck, { y: height }),
  ];
}

function mount(
  z: number,
  y: number,
  r: number,
  barrels: number,
  length: number,
  trained: number
): Part[] {
  const parts: Part[] = [
    rod(r, r * 0.8, PAINT.navyHull, { y: y + r * 0.4, z }, 10),
    box(r * 1.6, r * 0.7, r * 1.4, PAINT.navyHull, {
      y: y + r * 0.8,
      z,
      ry: trained,
    }),
  ];
  const c = Math.cos(trained);
  const s = Math.sin(trained);
  for (let i = 0; i < barrels; i++) {
    const off = (i - (barrels - 1) / 2) * r * 0.5;
    const reach = r * 0.6 + length / 2;
    parts.push(
      tube(r * 0.13, r * 0.1, length, PAINT.gun, {
        ry: trained,
        x: off * c + reach * s,
        y: y + r * 0.85,
        z: z - off * s + reach * c,
      })
    );
  }
  return parts;
}

function tripod(z: number, base: number, top: number): Part[] {
  const h = top - base;
  return [
    rod(0.006, h, PAINT.navyDark, { y: base + h / 2, z }, 5),
    rod(0.005, h, PAINT.navyDark, {
      x: 0.02,
      y: base + h / 2,
      z: z - 0.03,
      rx: -0.18,
      rz: 0.12,
    }),
    rod(0.005, h, PAINT.navyDark, {
      x: -0.02,
      y: base + h / 2,
      z: z - 0.03,
      rx: -0.18,
      rz: -0.12,
    }),
    box(0.05, 0.02, 0.05, PAINT.navyHull, { y: top, z }),
  ];
}

function battleshipParts(trained: number): Part[] {
  const aft = trained ? trained : Math.PI;
  return [
    ...hull(0.17, 0.05),
    ...mount(0.3, 0.054, 0.04, 3, 0.13, trained),
    ...mount(0.2, 0.08, 0.04, 2, 0.13, trained),
    ...mount(-0.24, 0.08, 0.04, 2, 0.13, aft),
    ...mount(-0.34, 0.054, 0.04, 3, 0.13, aft),
    box(0.1, 0.05, 0.16, PAINT.navyHull, { y: 0.08, z: 0.03 }),
    box(0.07, 0.04, 0.07, PAINT.navyHull, { y: 0.12, z: 0.08 }),
    rod(0.022, 0.08, PAINT.navyDark, { y: 0.13, z: -0.04 }, 10),
    ...tripod(0.1, 0.13, 0.23),
    ...tripod(-0.12, 0.08, 0.19),
    ...[-1, 1].flatMap((side) => [
      box(0.02, 0.02, 0.2, PAINT.navyHull, { x: side * 0.07, y: 0.065 }),
      tube(0.004, 0.004, 0.04, PAINT.gun, {
        x: side * 0.085,
        y: 0.07,
        z: 0.04,
      }),
      tube(0.004, 0.004, 0.04, PAINT.gun, {
        x: side * 0.085,
        y: 0.07,
        z: -0.04,
      }),
    ]),
  ];
}

export function battleship() {
  return model(battleshipParts(0));
}

export function battleshipFiring() {
  return model(battleshipParts(-1.25));
}

export function destroyer() {
  return model([
    ...hull(0.105, 0.045),
    ...mount(0.33, 0.045, 0.022, 1, 0.06, 0),
    ...mount(0.24, 0.06, 0.022, 1, 0.06, 0),
    ...mount(-0.22, 0.06, 0.022, 1, 0.06, Math.PI),
    ...mount(-0.3, 0.045, 0.022, 1, 0.06, Math.PI),
    ...mount(-0.39, 0.045, 0.022, 1, 0.06, Math.PI),
    box(0.06, 0.05, 0.1, PAINT.navyHull, { y: 0.07, z: 0.14 }),
    box(0.05, 0.02, 0.05, PAINT.glass, { y: 0.1, z: 0.16 }),
    rod(0.004, 0.12, PAINT.navyDark, { y: 0.14, z: 0.1 }, 5),
    rod(0.016, 0.07, PAINT.navyDark, { y: 0.08, z: 0.02 }, 10),
    rod(0.016, 0.07, PAINT.navyDark, { y: 0.08, z: -0.08 }, 10),
    box(0.04, 0.02, 0.1, PAINT.navyHull, { y: 0.055, z: -0.03 }),
  ]);
}

export function attackTransport() {
  const davits: Part[] = [];
  for (const side of [-1, 1])
    for (const z of [-0.12, 0.02, 0.16])
      davits.push(
        box(0.05, 0.03, 0.08, PAINT.olive, {
          x: side * 0.085,
          y: 0.1,
          z,
        })
      );
  return model([
    ...hull(0.15, 0.07),
    box(0.1, 0.07, 0.2, PAINT.navyHull, { y: 0.1, z: -0.05 }),
    box(0.08, 0.04, 0.1, PAINT.navyHull, { y: 0.15, z: -0.03 }),
    box(0.07, 0.02, 0.03, PAINT.glass, { y: 0.16, z: 0.02 }),
    rod(0.022, 0.07, PAINT.navyDark, { y: 0.2, z: -0.1 }, 10),
    rod(0.005, 0.2, PAINT.navyDark, { y: 0.17, z: 0.28 }, 5),
    rod(0.005, 0.18, PAINT.navyDark, { y: 0.16, z: -0.3 }, 5),
    box(0.004, 0.004, 0.16, PAINT.navyDark, {
      y: 0.18,
      z: 0.34,
      rx: 0.5,
    }),
    box(0.1, 0.03, 0.12, PAINT.deckWood, { y: 0.085, z: 0.28 }),
    box(0.1, 0.03, 0.1, PAINT.deckWood, { y: 0.085, z: -0.3 }),
    ...davits,
  ]);
}

function landingCraft(open: boolean, loaded: boolean): Part[] {
  const parts: Part[] = [
    plan(
      mirror([
        [0.14, 0.44],
        [0.15, -0.36],
        [0.1, -0.5],
      ]),
      0.06,
      PAINT.navyHull,
      { y: -0.02 }
    ),
    box(0.25, 0.02, 0.72, PAINT.deck, { y: 0.04, z: -0.02 }),
    box(0.02, 0.1, 0.74, PAINT.navyHull, { x: 0.14, y: 0.08, z: -0.04 }),
    box(0.02, 0.1, 0.74, PAINT.navyHull, { x: -0.14, y: 0.08, z: -0.04 }),
    box(0.3, 0.14, 0.14, PAINT.navyHull, { y: 0.09, z: -0.42 }),
    box(0.1, 0.05, 0.04, PAINT.gun, { x: 0.07, y: 0.18, z: -0.42 }),
  ];
  if (open)
    parts.push(
      box(0.26, 0.015, 0.2, PAINT.steel, { y: 0.02, z: 0.54, rx: 0.2 })
    );
  else parts.push(box(0.28, 0.14, 0.03, PAINT.steel, { y: 0.1, z: 0.44 }));
  if (loaded)
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 3; col++)
        parts.push(
          dome(0.035, PAINT.helmet, {
            x: (col - 1) * 0.075,
            y: 0.13,
            z: 0.3 - row * 0.12,
            sy: 0.7,
          })
        );
  return parts;
}

export function lcvp() {
  return model(landingCraft(false, true));
}

export function lcvpOpen() {
  return model(landingCraft(true, false));
}

export function lct() {
  const tank = (z: number): Part[] => [
    box(0.12, 0.06, 0.2, PAINT.olive, { y: 0.07, z }),
    rod(0.04, 0.03, PAINT.olive, { y: 0.115, z }, 8),
    tube(0.006, 0.006, 0.09, PAINT.gun, { y: 0.115, z: z + 0.07 }, 5),
  ];
  return model([
    plan(
      mirror([
        [0.15, 0.46],
        [0.16, -0.5],
      ]),
      0.05,
      PAINT.navyHull,
      { y: -0.02 }
    ),
    box(0.27, 0.015, 0.8, PAINT.deck, { y: 0.03 }),
    box(0.02, 0.07, 0.86, PAINT.navyHull, { x: 0.15, y: 0.06 }),
    box(0.02, 0.07, 0.86, PAINT.navyHull, { x: -0.15, y: 0.06 }),
    box(0.3, 0.08, 0.03, PAINT.steel, { y: 0.07, z: 0.46 }),
    box(0.14, 0.1, 0.1, PAINT.navyHull, { x: 0.07, y: 0.1, z: -0.44 }),
    box(0.06, 0.03, 0.03, PAINT.glass, { x: 0.07, y: 0.14, z: -0.39 }),
    ...tank(0.3),
    ...tank(0.05),
    ...tank(-0.2),
  ]);
}
