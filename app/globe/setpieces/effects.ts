import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  NormalBlending,
  PlaneGeometry,
  RGBAFormat,
  RingGeometry,
  ShaderMaterial,
  Vector2,
} from "three";

export const EARTH_KM = 6371;
export const KM = 1 / EARTH_KM;

const NOISE_GLSL = /* glsl */ `
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}
`;

function quad(capacity: number, layout: Record<string, number>) {
  const base = new PlaneGeometry(1, 1);
  const geometry = new InstancedBufferGeometry();
  geometry.index = base.index;
  geometry.setAttribute("position", base.getAttribute("position"));
  geometry.setAttribute("uv", base.getAttribute("uv"));
  const arrays: Record<string, Float32Array> = {};
  for (const [name, size] of Object.entries(layout)) {
    const array = new Float32Array(capacity * size);
    const attribute = new InstancedBufferAttribute(array, size);
    attribute.setUsage(DynamicDrawUsage);
    geometry.setAttribute(name, attribute);
    arrays[name] = array;
  }
  geometry.instanceCount = 0;
  return { geometry, arrays };
}

function valueNoise(size: number, seed: number) {
  const grid = new Float32Array(size * size);
  let s = seed * 9301 + 49297;
  for (let i = 0; i < grid.length; i++) {
    s = (s * 9301 + 49297) % 233280;
    grid[i] = s / 233280;
  }
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const at = (a: number, b: number) =>
      grid[(((b % size) + size) % size) * size + (((a % size) + size) % size)]!;
    const top = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * sx;
    const bottom = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * sx;
    return top + (bottom - top) * sy;
  };
}

export function puffTexture(): DataTexture {
  const cell = 64;
  const size = cell * 2;
  const data = new Uint8Array(size * size * 4);
  for (let q = 0; q < 4; q++) {
    const noise = valueNoise(16, q + 3);
    const ox = (q % 2) * cell;
    const oy = Math.floor(q / 2) * cell;
    for (let y = 0; y < cell; y++) {
      for (let x = 0; x < cell; x++) {
        const u = (x + 0.5) / cell - 0.5;
        const v = (y + 0.5) / cell - 0.5;
        let n = 0;
        let a = 0.5;
        let f = 3;
        for (let o = 0; o < 4; o++) {
          n += a * noise(u * f + 8, v * f + 8);
          a *= 0.5;
          f *= 2;
        }
        const r = Math.hypot(u, v) * 2;
        const body = Math.max(
          0,
          Math.min(1, (1 - (r + (n - 0.5) * 0.75)) / 0.55)
        );
        const alpha = body * body * (3 - 2 * body);
        const light = Math.max(
          0,
          Math.min(1, 0.55 + (n - 0.5) * 0.9 + v * 0.7)
        );
        const i = ((oy + y) * size + ox + x) * 4;
        data[i] = Math.round(light * 255);
        data[i + 1] = Math.round(n * 255);
        data[i + 2] = 0;
        data[i + 3] = Math.round(alpha * 255);
      }
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const puffVertex = /* glsl */ `
attribute vec3 aCenter;
attribute vec4 aData;
attribute vec3 aLook;
uniform float uScale;
varying vec2 vUv;
varying float vAlpha;
varying vec3 vLook;
void main() {
  float angle = aData.w * 6.2831853;
  float c = cos(angle);
  float s = sin(angle);
  vec2 corner = vec2(position.x * c - position.y * s, position.x * s + position.y * c);
  vec4 mv = modelViewMatrix * vec4(aCenter, 1.0);
  mv.xy += corner * aData.x * uScale;
  gl_Position = projectionMatrix * mv;
  float cell = floor(fract(aData.w * 7.31) * 4.0);
  vUv = uv * 0.5 + vec2(mod(cell, 2.0), floor(cell / 2.0)) * 0.5;
  vAlpha = aData.y;
  vLook = vec3(aData.z, aLook.x, aLook.y);
}
`;

const puffFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uAdditive;
varying vec2 vUv;
varying float vAlpha;
varying vec3 vLook;
void main() {
  vec4 tex = texture2D(uMap, vUv);
  float heat = vLook.x;
  float shade = vLook.y;
  float earth = vLook.z;
  vec3 smoke = mix(vec3(0.06, 0.058, 0.055), vec3(0.8, 0.77, 0.72), shade);
  smoke = mix(smoke, smoke * vec3(1.08, 0.86, 0.62), earth);
  smoke *= 0.62 + tex.r * 0.6;
  vec3 fire = mix(vec3(0.9, 0.22, 0.04), vec3(1.0, 0.78, 0.42), clamp(heat * tex.g * 1.6, 0.0, 1.0));
  if (uAdditive > 0.5) {
    float a = tex.a * vAlpha;
    gl_FragColor = vec4(fire * (0.5 + heat), a);
  } else {
    vec3 color = mix(smoke, fire * 1.1, clamp(heat, 0.0, 1.0) * (0.45 + 0.55 * (1.0 - tex.r)));
    gl_FragColor = vec4(color, tex.a * vAlpha);
  }
}
`;

export class Puffs {
  readonly mesh: Mesh<InstancedBufferGeometry, ShaderMaterial>;
  private readonly center: Float32Array;
  private readonly data: Float32Array;
  private readonly look: Float32Array;
  private count = 0;

  constructor(
    readonly capacity: number,
    map: DataTexture,
    additive: boolean,
    renderOrder: number
  ) {
    const { geometry, arrays } = quad(capacity, {
      aCenter: 3,
      aData: 4,
      aLook: 3,
    });
    this.center = arrays.aCenter!;
    this.data = arrays.aData!;
    this.look = arrays.aLook!;
    this.mesh = new Mesh(
      geometry,
      new ShaderMaterial({
        vertexShader: puffVertex,
        fragmentShader: puffFragment,
        uniforms: {
          uMap: { value: map },
          uScale: { value: KM },
          uAdditive: { value: additive ? 1 : 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: additive ? AdditiveBlending : NormalBlending,
      })
    );
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = renderOrder;
  }

  begin() {
    this.count = 0;
  }

  push(
    x: number,
    y: number,
    z: number,
    size: number,
    alpha: number,
    heat = 0,
    shade = 0.5,
    earth = 0,
    seed = 0
  ) {
    if (this.count >= this.capacity || alpha <= 0.002 || size <= 0) return;
    const i = this.count++;
    this.center[i * 3] = x;
    this.center[i * 3 + 1] = y;
    this.center[i * 3 + 2] = z;
    this.data[i * 4] = size;
    this.data[i * 4 + 1] = alpha;
    this.data[i * 4 + 2] = heat;
    this.data[i * 4 + 3] = seed;
    this.look[i * 3] = shade;
    this.look[i * 3 + 1] = earth;
  }

  end() {
    const geometry = this.mesh.geometry;
    geometry.instanceCount = this.count;
    for (const name of ["aCenter", "aData", "aLook"]) {
      const attribute = geometry.getAttribute(name) as InstancedBufferAttribute;
      attribute.clearUpdateRanges();
      attribute.addUpdateRange(0, this.count * attribute.itemSize);
      attribute.needsUpdate = true;
    }
  }

  get live() {
    return this.count;
  }
}

const fireballVertex = /* glsl */ `
attribute vec3 aCenter;
attribute vec4 aData;
uniform float uScale;
varying vec2 vUv;
varying vec3 vData;
void main() {
  vec4 mv = modelViewMatrix * vec4(aCenter, 1.0);
  mv.xy += position.xy * aData.x * uScale;
  gl_Position = projectionMatrix * mv;
  vUv = uv;
  vData = aData.yzw;
}
`;

const fireballFragment = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying vec3 vData;
${NOISE_GLSL}
void main() {
  float age = vData.x;
  float seed = vData.y;
  float power = vData.z;
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  vec2 q = p * 2.4 + seed * 13.0;
  float n = fbm(q + vec2(uTime * 0.35, -uTime * 0.6));
  float m = fbm(q * 1.7 - vec2(uTime * 0.5, uTime * 0.2) + n);
  float edge = 1.0 - smoothstep(0.42, 1.0, r + (m - 0.5) * 0.8);
  float temperature = clamp(power * (1.15 - age * 1.05) - r * 0.65 + (n - 0.5) * 0.7, 0.0, 1.0);
  vec3 color = mix(vec3(0.28, 0.035, 0.01), vec3(1.0, 0.42, 0.08), smoothstep(0.08, 0.45, temperature));
  color = mix(color, vec3(1.0, 0.86, 0.55), smoothstep(0.45, 0.8, temperature));
  color = mix(color, vec3(1.0, 0.99, 0.94), smoothstep(0.82, 1.0, temperature));
  float fade = 1.0 - smoothstep(0.6, 1.0, age);
  gl_FragColor = vec4(color * (0.35 + temperature * 1.4), edge * fade);
}
`;

export class Fireballs {
  readonly mesh: Mesh<InstancedBufferGeometry, ShaderMaterial>;
  private readonly center: Float32Array;
  private readonly data: Float32Array;
  private count = 0;

  constructor(readonly capacity: number) {
    const { geometry, arrays } = quad(capacity, { aCenter: 3, aData: 4 });
    this.center = arrays.aCenter!;
    this.data = arrays.aData!;
    this.mesh = new Mesh(
      geometry,
      new ShaderMaterial({
        vertexShader: fireballVertex,
        fragmentShader: fireballFragment,
        uniforms: { uScale: { value: KM }, uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      })
    );
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 8;
  }

  begin(time: number) {
    this.count = 0;
    this.mesh.material.uniforms.uTime!.value = time;
  }

  push(
    x: number,
    y: number,
    z: number,
    size: number,
    age: number,
    seed: number,
    power = 1
  ) {
    if (this.count >= this.capacity || age < 0 || age >= 1) return;
    const i = this.count++;
    this.center[i * 3] = x;
    this.center[i * 3 + 1] = y;
    this.center[i * 3 + 2] = z;
    this.data[i * 4] = size;
    this.data[i * 4 + 1] = age;
    this.data[i * 4 + 2] = seed;
    this.data[i * 4 + 3] = power;
  }

  end() {
    const geometry = this.mesh.geometry;
    geometry.instanceCount = this.count;
    for (const name of ["aCenter", "aData"]) {
      const attribute = geometry.getAttribute(name) as InstancedBufferAttribute;
      attribute.needsUpdate = true;
    }
  }
}

const decalVertex = /* glsl */ `
attribute vec3 aCenter;
attribute vec4 aData;
attribute vec3 aColor;
varying vec2 vUv;
varying vec4 vData;
varying vec3 vColor;
void main() {
  vec3 local = aCenter + vec3(position.x, 0.0, -position.y) * aData.x * 2.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(local, 1.0);
  vUv = uv;
  vData = aData;
  vColor = aColor;
}
`;

const decalFragment = /* glsl */ `
varying vec2 vUv;
varying vec4 vData;
varying vec3 vColor;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float width = max(vData.y, 0.02);
  float inner = 1.0 - width;
  float ring = smoothstep(inner - width * 0.3, inner + width * 0.35, r) * (1.0 - smoothstep(1.0 - width * 0.35, 1.0, r));
  float disc = 1.0 - smoothstep(0.25, 1.0, r);
  float m = mix(ring, disc, step(1.5, vData.w));
  gl_FragColor = vec4(vColor, m * vData.z);
}
`;

export class Decals {
  readonly mesh: Mesh<InstancedBufferGeometry, ShaderMaterial>;
  private readonly center: Float32Array;
  private readonly data: Float32Array;
  private readonly color: Float32Array;
  private count = 0;

  constructor(
    readonly capacity: number,
    additive: boolean,
    renderOrder: number
  ) {
    const { geometry, arrays } = quad(capacity, {
      aCenter: 3,
      aData: 4,
      aColor: 3,
    });
    this.center = arrays.aCenter!;
    this.data = arrays.aData!;
    this.color = arrays.aColor!;
    this.mesh = new Mesh(
      geometry,
      new ShaderMaterial({
        vertexShader: decalVertex,
        fragmentShader: decalFragment,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: additive ? AdditiveBlending : NormalBlending,
      })
    );
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = renderOrder;
  }

  begin() {
    this.count = 0;
  }

  ring(
    x: number,
    y: number,
    z: number,
    radius: number,
    width: number,
    alpha: number,
    r: number,
    g: number,
    b: number
  ) {
    this.put(x, y, z, radius, width, alpha, 1, r, g, b);
  }

  disc(
    x: number,
    y: number,
    z: number,
    radius: number,
    alpha: number,
    r: number,
    g: number,
    b: number
  ) {
    this.put(x, y, z, radius, 1, alpha, 2, r, g, b);
  }

  private put(
    x: number,
    y: number,
    z: number,
    radius: number,
    width: number,
    alpha: number,
    kind: number,
    r: number,
    g: number,
    b: number
  ) {
    if (this.count >= this.capacity || alpha <= 0.002 || radius <= 0) return;
    const i = this.count++;
    this.center[i * 3] = x;
    this.center[i * 3 + 1] = y;
    this.center[i * 3 + 2] = z;
    this.data[i * 4] = radius;
    this.data[i * 4 + 1] = width;
    this.data[i * 4 + 2] = alpha;
    this.data[i * 4 + 3] = kind;
    this.color[i * 3] = r;
    this.color[i * 3 + 1] = g;
    this.color[i * 3 + 2] = b;
  }

  end() {
    const geometry = this.mesh.geometry;
    geometry.instanceCount = this.count;
    for (const name of ["aCenter", "aData", "aColor"]) {
      (geometry.getAttribute(name) as InstancedBufferAttribute).needsUpdate =
        true;
    }
  }

  get live() {
    return this.count;
  }
}

export class Tracers {
  readonly mesh: LineSegments<BufferGeometry, LineBasicMaterial>;
  private readonly positions: Float32Array;
  private readonly colors: Float32Array;
  private count = 0;

  constructor(readonly capacity: number) {
    this.positions = new Float32Array(capacity * 6);
    this.colors = new Float32Array(capacity * 8);
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage)
    );
    geometry.setAttribute(
      "color",
      new BufferAttribute(this.colors, 4).setUsage(DynamicDrawUsage)
    );
    geometry.setDrawRange(0, 0);
    this.mesh = new LineSegments(
      geometry,
      new LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      })
    );
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 9;
  }

  begin() {
    this.count = 0;
  }

  push(
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    r: number,
    g: number,
    b: number,
    alpha: number
  ) {
    if (this.count >= this.capacity || alpha <= 0.002) return;
    const i = this.count++;
    const p = this.positions;
    p[i * 6] = x0;
    p[i * 6 + 1] = y0;
    p[i * 6 + 2] = z0;
    p[i * 6 + 3] = x1;
    p[i * 6 + 4] = y1;
    p[i * 6 + 5] = z1;
    const c = this.colors;
    c[i * 8] = r * 0.4;
    c[i * 8 + 1] = g * 0.4;
    c[i * 8 + 2] = b * 0.4;
    c[i * 8 + 3] = alpha * 0.2;
    c[i * 8 + 4] = r;
    c[i * 8 + 5] = g;
    c[i * 8 + 6] = b;
    c[i * 8 + 7] = alpha;
  }

  end() {
    const geometry = this.mesh.geometry;
    geometry.setDrawRange(0, this.count * 2);
    geometry.getAttribute("position").needsUpdate = true;
    geometry.getAttribute("color").needsUpdate = true;
  }
}

const seaVertex = /* glsl */ `
uniform float uRadius;
uniform float uLevel;
uniform vec2 uOffset;
varying vec2 vPos;
void main() {
  vPos = position.xy;
  vec2 w = vec2(position.x, -position.y) + uOffset;
  vec3 p = vec3(position.x, uLevel - dot(w, w) / ${(2 * EARTH_KM).toFixed(1)}, -position.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const seaFragment = /* glsl */ `
uniform float uRadius;
uniform float uTime;
varying vec2 vPos;
${NOISE_GLSL}
void main() {
  float r = length(vPos) / uRadius;
  float waves = fbm(vPos * 0.22 + vec2(uTime * 0.05, uTime * 0.03));
  float fine = vnoise(vPos * 1.3 - vec2(uTime * 0.2, 0.0));
  vec3 deep = vec3(0.045, 0.075, 0.085);
  vec3 lit = vec3(0.1, 0.15, 0.16);
  vec3 color = mix(deep, lit, waves * 0.8 + fine * 0.2);
  color += vec3(0.55, 0.5, 0.36) * smoothstep(0.72, 0.95, fine * waves * 1.6) * 0.08;
  float alpha = 1.0 - smoothstep(0.55, 1.0, r);
  gl_FragColor = vec4(color, alpha * 0.92);
}
`;

export function seaPatch(
  radius: number,
  x: number,
  z: number,
  level = -0.35
): Mesh<RingGeometry, ShaderMaterial> {
  const mesh = new Mesh(
    new RingGeometry(0.01, radius, 96, 32),
    new ShaderMaterial({
      vertexShader: seaVertex,
      fragmentShader: seaFragment,
      uniforms: {
        uRadius: { value: radius },
        uLevel: { value: level },
        uTime: { value: 0 },
        uOffset: { value: new Vector2(x, z) },
      },
      transparent: true,
      depthWrite: false,
    })
  );
  mesh.renderOrder = 0;
  mesh.frustumCulled = false;
  return mesh;
}
