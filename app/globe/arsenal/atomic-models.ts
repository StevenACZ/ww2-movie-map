import { ball, box, model, type Part, plan, tube } from "./parts";

const SHELL = {
  olive: 0x62634a,
  yellow: 0xc8ab55,
  dark: 0x393d39,
  rim: 0x858473,
};

export function littleBoy() {
  const parts: Part[] = [
    tube(0.098, 0.098, 0.58, SHELL.olive, { z: 0.05 }, 16),
    ball(0.098, SHELL.olive, { z: 0.34, sz: 1.632653 }, 16),
    tube(0.055, 0.098, 0.12, SHELL.olive, { z: -0.3 }, 16),
    tube(0.057, 0.057, 0.014, SHELL.rim, { z: -0.24 }, 16),
  ];
  for (const angle of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    parts.push(
      plan(
        [
          [0.035, -0.29],
          [0.136, -0.365],
          [0.136, -0.5],
          [0.035, -0.5],
        ],
        0.007,
        SHELL.olive,
        { rz: angle }
      ),
      box(0.27, 0.008, 0.146, SHELL.olive, {
        y: Math.cos(angle) * 0.134,
        x: -Math.sin(angle) * 0.134,
        z: -0.427,
        rz: angle,
      })
    );
  }
  return model(parts);
}

export function fatMan() {
  const parts: Part[] = [
    ball(0.235, SHELL.yellow, { z: 0.155, sy: 1, sz: 1.468085 }, 20),
    tube(0.057, 0.18, 0.235, SHELL.yellow, { z: -0.22 }, 16),
    tube(0.232, 0.232, 0.012, SHELL.dark, { z: 0.16 }, 20),
  ];
  for (const angle of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    parts.push(
      plan(
        [
          [0.034, -0.263],
          [0.171, -0.339],
          [0.171, -0.5],
          [0.034, -0.5],
        ],
        0.009,
        SHELL.yellow,
        { rz: angle }
      ),
      box(0.342, 0.012, 0.147, SHELL.yellow, {
        y: Math.cos(angle) * 0.171,
        x: -Math.sin(angle) * 0.171,
        z: -0.4265,
        rz: angle,
      })
    );
  }
  return model(parts);
}
