import {
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import { box, model, type Part, profile, rod, tube } from "../../arsenal/parts";
import { ground, hash, type Kit } from "../kit";

export const MOLE_X = -6.8;
export const DECK = 0.19;
export const BEACH = 0.07;

export function coast(kit: Kit) {
  const water = new Mesh(
    new PlaneGeometry(190, 150, 190, 150).rotateX(-Math.PI / 2),
    new ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        uniform float time;
        varying vec2 p;
        varying float swell;
        void main() {
          p = position.xz;
          swell = sin(p.x * 2.2 + p.y * 1.7 + time * 1.3) * .014
            + sin(p.x * 4.1 - p.y * 2.9 - time * 1.8) * .006;
          float shoal = 1.0 - smoothstep(-2.0, .0, p.y);
          vec3 v = vec3(p.x, -.018 - dot(p,p) / 12742.0 + swell * shoal, p.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(v, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 p;
        varying float swell;
        float random(vec2 v) { return fract(sin(dot(v, vec2(127.1,311.7))) * 43758.5453); }
        float noise(vec2 v) {
          vec2 i = floor(v), f = fract(v);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(random(i), random(i+vec2(1,0)), f.x),
            mix(random(i+vec2(0,1)), random(i+vec2(1,1)), f.x), f.y);
        }
        void main() {
          float n = noise(p * 3.0 + vec2(time * .24, -time * .17));
          float ripples = sin(p.x * 14.0 + p.y * 18.0 + n * 5.0 + time * 2.0);
          float shoal = smoothstep(-5.0, .2, p.y);
          vec3 color = mix(vec3(.065,.125,.145), vec3(.19,.25,.25), shoal);
          color += vec3(.065,.083,.085) * (n + swell * 9.0);
          float glint = pow(max(0.0, ripples), 22.0) * noise(p * .5) * .12;
          color += vec3(.72,.77,.70) * glint;
          float wave = sin(p.y * 9.0 + time * 1.7 + sin(p.x * 1.3) * .7);
          float shore = smoothstep(-1.8, -.4, p.y) * (1.0-smoothstep(-.2,.16,p.y));
          float foam = smoothstep(.63, .96, wave) * shore * (.45 + n * .55);
          color = mix(color, vec3(.64,.72,.70), foam * .8);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  );
  water.renderOrder = 0;
  water.frustumCulled = false;
  kit.stage.add(water);
  kit.terrain(
    [
      [-95, 0.18],
      [95, 0.18],
      [95, 75],
      [-95, 75],
    ],
    BEACH,
    [0xaaa18c, 0xc2b598, 0xb6aa8c],
    2
  );
  kit.terrain(
    [
      [-95, 3.8],
      [95, 4.2],
      [95, 75],
      [-95, 75],
    ],
    BEACH + 0.012,
    [0x6a6c57, 0x7e8069, 0x93907a],
    3
  );
  kit.strip(
    [
      [-65, 0.2],
      [65, 0.2],
    ],
    0.55,
    0x898a7b,
    BEACH + 0.007
  );
  kit.strip(
    [
      [-65, 3.2],
      [65, 3.2],
    ],
    0.42,
    0x79766c,
    BEACH + 0.014
  );

  const parts: Part[] = [];
  const pierLength = 10.8;
  parts.push(
    box(0.34, 0.12, pierLength, 0x817c6a, {
      x: MOLE_X,
      y: DECK - 0.07,
      z: -4.4,
    }),
    box(0.29, 0.023, pierLength, 0xb7aa8c, {
      x: MOLE_X,
      y: DECK - 0.009,
      z: -4.4,
    }),
    box(0.53, 0.06, 0.5, 0xa79d85, { x: MOLE_X, y: DECK - 0.015, z: -9.63 }),
    box(0.24, 0.026, 0.1, 0x847964, {
      x: MOLE_X - 0.25,
      y: DECK - 0.012,
      z: -8.35,
    })
  );
  for (let i = 0; i < 79; i++) {
    const z = 0.85 - i * 0.134;
    parts.push(
      box(0.29, 0.006, 0.006, 0x716b5d, { x: MOLE_X, y: DECK + 0.005, z })
    );
    if (i % 2) continue;
    for (const side of [-1, 1]) {
      parts.push(
        rod(0.02, 0.28, 0x494b41, { x: MOLE_X + side * 0.135, y: 0.005, z }, 5),
        rod(
          0.007,
          0.065,
          0xa29881,
          { x: MOLE_X + side * 0.155, y: DECK + 0.032, z },
          5
        )
      );
    }
  }
  for (const side of [-1, 1]) {
    parts.push(
      tube(
        0.004,
        0.004,
        pierLength,
        0x8e8979,
        {
          x: MOLE_X + side * 0.155,
          y: DECK + 0.065,
          z: -4.4,
        },
        5
      )
    );
  }
  parts.push(
    rod(0.075, 0.38, 0xa2a395, { x: MOLE_X, y: 0.37, z: -9.63 }, 10),
    rod(0.1, 0.06, 0x343d3d, { x: MOLE_X, y: 0.58, z: -9.63 }, 10)
  );
  for (let i = 0; i < 66; i++) {
    const x = -25 + (i % 22) * 2.05;
    const z = 4.8 + Math.floor(i / 22) * 2.3 + hash(i + 5) * 0.4;
    const w = 0.5 + hash(i + 13) * 0.6;
    const h = 0.4 + hash(i + 7) * 0.65;
    const y = ground(x, z) + BEACH;
    const stone = [0x928577, 0xa39783, 0x867f71, 0xb1a591][i % 4]!;
    parts.push(
      box(w, h, 0.85, stone, { x, y: y + h / 2, z }),
      profile(
        [
          [-0.5, 0],
          [0, 0.25],
          [0.5, 0],
        ],
        w + 0.08,
        0x55524d,
        { x, y: y + h, z }
      ),
      box(0.09, 0.25, 0.12, 0x6b655a, {
        x: x + w * 0.27,
        y: y + h + 0.17,
        z: z - 0.16,
      })
    );
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        parts.push(
          box(0.085, 0.1, 0.008, 0x303c3c, {
            x: x + (col - 1) * w * 0.26,
            y: y + 0.14 + row * h * 0.43,
            z: z - 0.429,
          })
        );
      }
    }
  }
  for (let i = 0; i < 8; i++) {
    const x = -15.8 + (i % 4) * 0.77;
    const z = 3.5 + Math.floor(i / 4) * 0.9;
    const y = ground(x, z) + BEACH;
    parts.push(
      rod(0.31, 0.48, 0x575e5b, { x, y: y + 0.24, z }, 18),
      rod(0.325, 0.035, 0x888b7f, { x, y: y + 0.5, z }, 18),
      box(0.65, 0.022, 0.025, 0x383e3b, { x, y: y + 0.18, z: z - 0.26 })
    );
  }
  for (let i = 0; i < 9; i++) {
    const x = -3 + i * 2.25;
    const z = 2.1 + hash(i + 72) * 0.7;
    const y = ground(x, z) + BEACH;
    parts.push(
      box(0.19, 0.075, 0.35, 0x565a45, { x, y: y + 0.085, z }),
      box(0.18, 0.15, 0.12, 0x676953, { x, y: y + 0.18, z: z + 0.12 }),
      box(0.2, 0.16, 0.23, 0x8b846d, { x, y: y + 0.17, z: z - 0.06 }),
      box(0.12, 0.055, 0.006, 0x303d3d, { x, y: y + 0.21, z: z + 0.183 })
    );
    for (const side of [-1, 1])
      for (const axle of [-1, 1]) {
        parts.push(
          rod(
            0.038,
            0.032,
            0x282c29,
            {
              x: x + side * 0.102,
              y: y + 0.046,
              z: z + axle * 0.105,
              rz: Math.PI / 2,
            },
            8
          )
        );
      }
    for (let j = 0; j < 3; j++)
      parts.push(
        box(0.07, 0.05, 0.11, 0x847553, {
          x: x + 0.25 + j * 0.095,
          y: y + 0.025,
          z: z - 0.08 + hash(i + j) * 0.14,
          ry: hash(i + j) * 2,
        })
      );
  }
  for (let i = 0; i < 44; i++) {
    const x = -22 + i;
    const z = 3.65 + Math.sin(i * 0.7) * 0.07;
    parts.push(
      rod(0.015, 0.19, 0x756f5a, { x, y: ground(x, z) + 0.17, z, rz: 0.12 }, 5)
    );
  }
  const scenery = new Mesh(
    model(parts),
    new MeshLambertMaterial({ vertexColors: true, emissive: 0x14130e })
  );
  scenery.renderOrder = 3;
  kit.stage.add(scenery);
  return water.material.uniforms.time!;
}
