import {
  Color,
  BufferAttribute,
  Euler,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from "three";
import { box, dome, model, type Part, profile, rod } from "../../arsenal/parts";
import { ground, hash, smooth, type Kit } from "../kit";

export type AtomicCity = "hiroshima" | "nagasaki";

export function ridge(
  kit: Kit,
  x: number,
  z: number,
  rx: number,
  rz: number,
  height: number,
  tint: number,
  yaw = 0
) {
  const geometry = new PlaneGeometry(rx * 2, rz * 2, 24, 24).rotateX(
    -Math.PI / 2
  );
  const points = geometry.getAttribute("position");
  const colors = new Float32Array(points.count * 3);
  const color = new Color(tint);
  const shade = new Color();
  for (let i = 0; i < points.count; i++) {
    const px = points.getX(i),
      pz = points.getZ(i);
    const edge = Math.max(0, 1 - (px / rx) ** 2 - (pz / rz) ** 2);
    const folds =
      0.74 +
      Math.sin(px * 2.7 + Math.sin(pz * 1.9)) * 0.16 +
      Math.cos(pz * 3.1 + px) * 0.1;
    const wx = x + px * Math.cos(yaw) - pz * Math.sin(yaw);
    const wz = z + px * Math.sin(yaw) + pz * Math.cos(yaw);
    const lift = Math.pow(edge, 1.35) * folds * height;
    points.setXYZ(i, wx, ground(wx, wz) + 0.017 + lift, wz);
    shade
      .copy(color)
      .multiplyScalar(0.85 + hash(i + x * 77) * 0.12 + (lift / height) * 0.4);
    colors.set([shade.r, shade.g, shade.b], i * 3);
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const mesh = new Mesh(
    geometry,
    new MeshLambertMaterial({ vertexColors: true, emissive: 0x161b10 })
  );
  mesh.renderOrder = 2;
  kit.stage.add(mesh);
}

function house(factory: boolean) {
  const parts: Part[] = [
    box(1, 0.65, 1, factory ? 0xa9947b : 0xc2b599, { y: 0.325 }),
    profile(
      [
        [-0.55, 0.65],
        [0, 1],
        [0.55, 0.65],
      ],
      1.09,
      factory ? 0x6c6d69 : 0x575f60
    ),
  ];
  for (const x of [-0.3, 0, 0.3]) {
    for (const z of [-0.503, 0.503])
      parts.push(box(0.13, 0.23, 0.009, 0x444e50, { x, y: 0.35, z }));
  }
  if (factory)
    parts.push(rod(0.085, 1.3, 0x857662, { x: 0.34, y: 0.65, z: 0.28 }, 6));
  return model(parts);
}

function landmark(city: AtomicCity, ruined: boolean) {
  const parts: Part[] = [];
  const stone = ruined ? 0x72695a : 0xc8b597;
  if (city === "hiroshima") {
    parts.push(
      box(0.55, ruined ? 0.17 : 0.3, 0.26, stone, { y: ruined ? 0.085 : 0.15 }),
      rod(0.095, 0.38, stone, { y: 0.19, z: 0.02 }, 12)
    );
    if (!ruined) parts.push(dome(0.12, 0x64847e, { y: 0.4, z: 0.02 }, 12));
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 8;
      parts.push(
        rod(
          0.007,
          0.2,
          ruined ? 0x4e4b44 : 0x74928a,
          {
            y: 0.43,
            x: Math.cos(a) * 0.07,
            z: 0.02 + Math.sin(a) * 0.07,
            rz: Math.cos(a) * 0.55,
            rx: Math.sin(a) * 0.55,
          },
          4
        )
      );
    }
    for (const x of [-0.21, -0.14, 0.14, 0.21])
      parts.push(box(0.036, 0.12, 0.009, 0x4b514c, { x, y: 0.18, z: 0.135 }));
  } else {
    parts.push(
      box(0.38, ruined ? 0.085 : 0.26, 0.75, stone, {
        y: ruined ? 0.042 : 0.13,
      })
    );
    if (!ruined) {
      parts.push(
        profile(
          [
            [-0.4, 0.26],
            [0, 0.43],
            [0.4, 0.26],
          ],
          0.42,
          0x635f57,
          { ry: Math.PI / 2 }
        )
      );
      for (const x of [-0.15, 0.15]) {
        parts.push(box(0.12, 0.49, 0.14, 0x9b7960, { x, y: 0.245, z: 0.31 }));
        parts.push(rod(0.075, 0.14, 0x585950, { x, y: 0.56, z: 0.31 }, 4, 0));
      }
    }
  }
  return model(parts);
}

export function atomicCity(
  kit: Kit,
  city: AtomicCity,
  spots: number[],
  burst: number,
  fate: (x: number, z: number, distance: number) => number
) {
  const material = new MeshLambertMaterial({
    vertexColors: true,
    emissive: 0x1a1710,
  });
  const homes = new InstancedMesh(house(false), material, spots.length / 2);
  const factories = new InstancedMesh(house(true), material, spots.length / 2);
  const rubble = new InstancedMesh(
    box(1, 1, 1, 0x93836c)[0],
    new MeshLambertMaterial({ color: 0x847866 }),
    spots.length
  );
  for (const mesh of [homes, factories, rubble]) {
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    kit.stage.add(mesh);
  }
  const buildings = Array.from({ length: spots.length / 2 }, (_, i) => {
    const x = spots[i * 2]!;
    const z = spots[i * 2 + 1]!;
    const industrial =
      city === "nagasaki" && (z < -1.4 || x < -0.85) && i % 3 === 0;
    return {
      x,
      z,
      distance: Math.hypot(x, z),
      loss: fate(x, z, Math.hypot(x, z)),
      industrial,
      w: (industrial ? 0.32 : 0.17) + hash(i * 3.1) * 0.1,
      h: (industrial ? 0.18 : 0.1) + hash(i * 5.7) * 0.09,
      l: (industrial ? 0.32 : 0.2) + hash(i * 7.3) * 0.1,
      yaw: (i % 3 === 0 ? Math.PI / 2 : 0) + (hash(i) - 0.5) * 0.12,
    };
  });
  const landmarkX = city === "hiroshima" ? -0.18 : 0.7;
  const landmarkZ = city === "hiroshima" ? -0.05 : -0.45;
  const whole = new Mesh(landmark(city, false), material);
  const remains = new Mesh(landmark(city, true), material);
  for (const mesh of [whole, remains]) {
    mesh.position.set(
      landmarkX,
      ground(landmarkX, landmarkZ) + 0.045,
      landmarkZ
    );
    mesh.renderOrder = 4;
    kit.stage.add(mesh);
  }

  const streets: Part[] = [];
  const street = (
    x: number,
    z: number,
    w: number,
    l: number,
    color = 0xaca78d
  ) => streets.push(box(w, 0.006, l, color, { x, y: ground(x, z) + 0.029, z }));
  if (city === "hiroshima") {
    for (let x = -4.5; x <= 4.5; x += 0.9) street(x, 0, 0.048, 8.6);
    for (let z = -4; z <= 4; z += 0.9) street(0, z, 8.8, 0.048);
    street(-0.62, -0.46, 1.6, 0.12, 0xb8b39e);
    street(-0.5, -0.18, 0.11, 0.55, 0xb8b39e);
    for (const z of [-1.7, 1.4, 2.8]) street(0, z, 5.2, 0.08);
  } else {
    for (const x of [-1.1, -0.45, 0.85, 1.4]) street(x, -0.8, 0.07, 8.4);
    for (let z = -4; z < 3; z += 0.8) street(0, z, 3.8, 0.05);
    for (const x of [-0.62, -0.57]) street(x, -0.6, 0.012, 9, 0x5a5a51);
    for (let z = -5; z < 3.8; z += 0.13)
      street(-0.595, z, 0.12, 0.018, 0x82745d);
  }
  const roads = new Mesh(model(streets), material);
  roads.renderOrder = 2;
  kit.stage.add(roads);
  const matrix = new Matrix4();
  const position = new Vector3();
  const size = new Vector3();
  const rotation = new Quaternion();
  const angles = new Euler(0, 0, 0, "YXZ");
  const color = new Color();
  const white = new Color(0xffffff);
  const char = new Color(0x66584c);
  let last = Number.NaN;
  return (t: number) => {
    const age = t - burst;
    const state = age < 0 ? -1 : age > 10 ? 11 : age;
    if (state === last) return;
    last = state;
    let h = 0,
      f = 0,
      r = 0;
    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i]!;
      const hit = smooth(b.distance * 0.23, b.distance * 0.23 + 0.9, age);
      const loss = hit * b.loss;
      position.set(b.x, ground(b.x, b.z) + 0.035 - loss * b.h * 0.18, b.z);
      size.set(b.w, b.h * (1 - loss * 0.88), b.l);
      angles.set(
        loss * (hash(i + 81) - 0.5) * 0.8,
        b.yaw,
        loss * (hash(i + 31) - 0.5)
      );
      rotation.setFromEuler(angles);
      matrix.compose(position, rotation, size);
      const mesh = b.industrial ? factories : homes;
      const index = b.industrial ? f++ : h++;
      mesh.setMatrixAt(index, matrix);
      color.copy(white).lerp(char, loss * 0.85);
      mesh.setColorAt(index, color);
      if (loss > 0.15) {
        for (let k = 0; k < 2; k++) {
          position.set(
            b.x + (k - 0.5) * b.w * 0.75,
            ground(b.x, b.z) + 0.046,
            b.z + (hash(i * 2 + k) - 0.5) * b.l
          );
          size.set(b.w * 0.7, 0.027 + hash(i + k) * 0.035, b.l * 0.56);
          angles.set(0.18, b.yaw + k * 0.7, 0.1);
          rotation.setFromEuler(angles);
          matrix.compose(position, rotation, size);
          rubble.setMatrixAt(r++, matrix);
        }
      }
    }
    homes.count = h;
    factories.count = f;
    rubble.count = r;
    for (const mesh of [homes, factories, rubble]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    whole.visible = age < 0.65;
    remains.visible = !whole.visible;
  };
}
