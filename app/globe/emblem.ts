import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Shape,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { feature } from "topojson-client";
import type { BordersTopology } from "./countries";
import { unwrapRing, type LonLat } from "./geo";

const GOLD = "#d8ae52";
const TILT = 0.4;

function landTexture(topology: BordersTopology): CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const x = (lon: number) => ((lon + 180) / 360) * width;
  const y = (lat: number) => ((90 - lat) / 180) * height;

  ctx.fillStyle = "#12150e";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgb(216 174 82 / 0.16)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let lon = -180; lon <= 180; lon += 15) {
    ctx.moveTo(x(lon), 0);
    ctx.lineTo(x(lon), height);
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    ctx.moveTo(0, y(lat));
    ctx.lineTo(width, y(lat));
  }
  ctx.stroke();

  const land = feature(topology, topology.objects.countries);
  const polygons: LonLat[][][] = [];
  for (const country of land.features) {
    const geometry = country.geometry;
    if (geometry?.type === "Polygon")
      polygons.push(geometry.coordinates as LonLat[][]);
    else if (geometry?.type === "MultiPolygon")
      polygons.push(...(geometry.coordinates as LonLat[][][]));
  }

  ctx.fillStyle = "#454c30";
  ctx.strokeStyle = "rgb(233 225 201 / 0.34)";
  ctx.lineWidth = 1.2;
  ctx.lineJoin = "round";
  for (const offset of [-width, 0, width]) {
    for (const rings of polygons) {
      ctx.beginPath();
      const reference = rings[0]?.[0]?.[0];
      for (const ring of rings) {
        unwrapRing(ring, reference).forEach(([lon, lat], i) => {
          const px = x(lon) + offset;
          if (i) ctx.lineTo(px, y(lat));
          else ctx.moveTo(px, y(lat));
        });
        ctx.closePath();
      }
      ctx.fill("evenodd");
      ctx.stroke();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function starShape(outer: number, inner: number): Shape {
  const shape = new Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    if (i) shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  return shape;
}

function atmosphere(): Mesh {
  return new Mesh(
    new SphereGeometry(1.14, 64, 32),
    new ShaderMaterial({
      uniforms: { uColor: { value: new Color(GOLD) } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying vec3 vNormal;
        void main() {
          float glow = pow(max(0.0, 0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
          gl_FragColor = vec4(uColor * glow * 0.5, 1.0);
        }
      `,
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })
  );
}

function medal(): Group {
  const group = new Group();
  const gold = new MeshStandardMaterial({
    color: GOLD,
    metalness: 1,
    roughness: 0.28,
  });
  const face = new MeshStandardMaterial({
    color: "#14160f",
    metalness: 0.6,
    roughness: 0.45,
  });

  const disc = new Mesh(new CylinderGeometry(0.42, 0.42, 0.07, 96), [
    gold,
    face,
    face,
  ]);
  disc.rotation.x = Math.PI / 2;

  const rim = new Mesh(new TorusGeometry(0.42, 0.028, 20, 120), gold);
  const inner = new Mesh(new TorusGeometry(0.35, 0.008, 12, 120), gold);
  inner.position.z = 0.036;

  const star = new Mesh(
    new ExtrudeGeometry(starShape(0.27, 0.108), {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.022,
      bevelSize: 0.014,
      bevelSegments: 4,
    }),
    gold
  );
  star.position.z = 0.03;

  group.add(disc, rim, inner, star);
  return group;
}

export interface Emblem {
  setVisible: (visible: boolean) => void;
  dispose: () => void;
}

/** Spinning 3D globe with a gold star medal for the About hero. */
export async function mountEmblem(
  canvas: HTMLCanvasElement,
  onReady: () => void
): Promise<Emblem> {
  const topology = (await (
    await fetch("/geo/borders-1938.json")
  ).json()) as BordersTopology;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 4.9);

  const key = new DirectionalLight("#fff1d0", 2.6);
  key.position.set(-3, 2.5, 3);
  const rim = new DirectionalLight("#d8ae52", 1.6);
  rim.position.set(3, -1, -2);
  scene.add(key, rim, new HemisphereLight("#e9e1c9", "#0b0c09", 0.35));

  const rig = new Group();
  scene.add(rig);

  const texture = landTexture(topology);
  const earth = new Mesh(
    new SphereGeometry(1, 96, 64),
    new MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.05,
      envMapIntensity: 0.3,
    })
  );
  const axis = new Group();
  axis.rotation.z = TILT;
  axis.add(earth);
  rig.add(axis, atmosphere());

  const orbit = new Group();
  orbit.rotation.set(1.18, 0.2, -0.28);
  const ringMaterial = new MeshStandardMaterial({
    color: GOLD,
    metalness: 1,
    roughness: 0.35,
  });
  const ring = new Mesh(new TorusGeometry(1.24, 0.007, 12, 200), ringMaterial);
  const satellite = new Mesh(
    new SphereGeometry(0.035, 24, 16),
    new MeshStandardMaterial({
      color: "#f3d78e",
      emissive: "#f3d78e",
      emissiveIntensity: 1.4,
    })
  );
  orbit.add(ring, satellite);
  rig.add(orbit);

  const badge = medal();
  badge.position.z = 1.16;
  rig.add(badge);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visible = true;
  let frame = 0;
  let last = performance.now();
  let spin = 2.2;
  const pointer = { x: 0, y: 0 };

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    if (!clientWidth || !clientHeight) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }

  function draw(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    spin += dt * 0.16;
    earth.rotation.y = spin;
    const angle = t * 0.55;
    satellite.position.set(Math.cos(angle) * 1.24, Math.sin(angle) * 1.24, 0);
    badge.rotation.y = Math.sin(t * 0.7) * 0.42;
    badge.rotation.x = Math.sin(t * 0.45) * 0.08;
    rig.rotation.y += (pointer.x * 0.22 - rig.rotation.y) * 0.06;
    rig.rotation.x += (pointer.y * 0.16 - rig.rotation.x) * 0.06;
    renderer.render(scene, camera);
  }

  function loop(now: number) {
    draw(now);
    if (visible) frame = requestAnimationFrame(loop);
  }

  function onPointer(event: PointerEvent) {
    const box = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - box.left) / box.width - 0.5) * 2;
    pointer.y = ((event.clientY - box.top) / box.height - 0.5) * 2;
  }

  function onLeave() {
    pointer.x = 0;
    pointer.y = 0;
  }

  const observer = new ResizeObserver(() => {
    resize();
    if (reduced) draw(last);
  });
  observer.observe(canvas);
  resize();

  if (reduced) {
    badge.rotation.y = -0.3;
    draw(last);
  } else {
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(loop);
  }
  onReady();

  return {
    setVisible(value) {
      if (reduced || value === visible) return;
      visible = value;
      cancelAnimationFrame(frame);
      if (value) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerleave", onLeave);
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          for (const material of [object.material].flat()) material.dispose();
        }
      });
      texture.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
