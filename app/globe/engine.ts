import {
  AmbientLight,
  BackSide,
  DirectionalLight,
  Mesh,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { WorldData } from "~~/types/view";
import { CountryLayer, type BordersTopology } from "./countries";
import { easeInOut, slerp, toLonLat, toVec3, type LonLat } from "./geo";
import { FrontLayer, JourneyLayer, PulseLayer, type PulseInput } from "./lines";
import {
  Overlay,
  type LabelInput,
  type MarkerInput,
  type TagInput,
} from "./overlay";
import type { ColorMode } from "./palette";
import { UnitLayer } from "./units";

export interface GlobeLayers {
  units: boolean;
  fronts: boolean;
  events: boolean;
  labels: boolean;
}

export interface GlobeHover {
  id: string;
  status: string;
  x: number;
  y: number;
}

export interface GlobeOptions {
  container: HTMLElement;
  world: WorldData;
  mobile: boolean;
  reducedMotion: boolean;
  posterBase: string;
  initial?: { lonLat: LonLat; distance?: number };
  zoom?: boolean;
  onSelect: (id: string) => void;
  onCluster: (ids: string[], x: number, y: number) => void;
  onHover: (hover: GlobeHover | null) => void;
  onError?: (error: unknown) => void;
}

export interface GlobeContext {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  container: HTMLElement;
  mobile: boolean;
  reducedMotion: boolean;
  flyTo(lonLat: LonLat, distance?: number, duration?: number): void;
  addTicker(tick: (now: number, dt: number) => boolean): () => void;
  cinematic(on: boolean): void;
}

const MIN_DISTANCE = 1.08;
const CINEMATIC_MIN_DISTANCE = 1.012;
const MAX_DISTANCE = 4.6;
const WHEEL_TICK = 4.000244140625;
const AMBIENT_FRAME_MS = 33;

const oceanVertex = /* glsl */ `
varying vec3 vPos;
void main() {
  vPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0);
}
`;

const oceanFragment = /* glsl */ `
uniform vec3 uCamPos;
uniform vec3 uLightDir;
varying vec3 vPos;
const float PI = 3.141592653589793;
float grid(float coord, float step) {
  float c = coord / step;
  float w = fwidth(c);
  float f = abs(fract(c - 0.5) - 0.5);
  return 1.0 - smoothstep(0.0, w * 1.2, f);
}
void main() {
  vec3 n = normalize(vPos);
  float lat = asin(clamp(n.y, -1.0, 1.0)) * 180.0 / PI;
  float lon = atan(n.z, -n.x) * 180.0 / PI;
  vec3 deep = vec3(0.035, 0.058, 0.066);
  vec3 shallow = vec3(0.07, 0.1, 0.105);
  float diffuse = clamp(dot(n, normalize(uLightDir)), 0.0, 1.0);
  vec3 color = mix(deep, shallow, diffuse);
  float lines = max(grid(lat, 15.0), grid(lon, 15.0));
  color += vec3(0.55, 0.5, 0.36) * lines * 0.07;
  float facing = clamp(dot(n, normalize(uCamPos - vPos)), 0.0, 1.0);
  color += vec3(0.62, 0.55, 0.38) * pow(1.0 - facing, 2.5) * 0.22;
  gl_FragColor = vec4(color, 1.0);
}
`;

const atmosphereFragment = /* glsl */ `
uniform vec3 uCamPos;
varying vec3 vPos;
void main() {
  vec3 n = normalize(vPos);
  vec3 view = normalize(uCamPos - vPos);
  float rim = pow(1.0 - abs(dot(n, view)), 3.2);
  gl_FragColor = vec4(vec3(0.86, 0.74, 0.5) * rim * 0.9, rim * 0.55);
}
`;

interface Flight {
  from: Vector3;
  to: Vector3;
  fromDistance: number;
  toDistance: number;
  peak: number;
  start: number;
  duration: number;
}

export class GlobeEngine {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private controls: OrbitControls;
  private overlay: Overlay;
  private ocean: Mesh<SphereGeometry, ShaderMaterial>;
  private atmosphere: Mesh<SphereGeometry, ShaderMaterial>;
  private units: UnitLayer;
  private fronts: FrontLayer;
  private journey = new JourneyLayer();
  private pulses = new PulseLayer();
  private light = new DirectionalLight(0xfff1d6, 1.9);
  private layers: GlobeLayers = {
    units: true,
    fronts: true,
    events: true,
    labels: true,
  };
  private countryLayers = new Map<string, Promise<CountryLayer>>();
  private activeLayer: CountryLayer | null = null;
  private fading: {
    layer: CountryLayer;
    from: number;
    to: number;
    start: number;
  }[] = [];
  private paletteFade: { layer: CountryLayer; start: number } | null = null;
  private t = 0;
  private mode: ColorMode = "side";
  private flight: Flight | null = null;
  private raf = 0;
  private width = 1;
  private height = 1;
  private dirty = true;
  private disposed = false;
  private resizeObserver: ResizeObserver;
  private statusCache = new Map<
    string,
    WorldData["countries"][string]["timeline"]
  >();
  private zoomTarget: number | null = null;
  private zoomAnchor: Vector3 | null = null;
  private tickers = new Set<(now: number, dt: number) => boolean>();
  private isCinematic = false;
  private interacting = false;
  private lastFrame = 0;
  private lastRender = 0;
  private lastCamPos = new Vector3();
  private lastCamQuat = new Quaternion();
  private overlayStale = true;
  private dpr = 1;
  private slowFrames = 0;
  private sampledFrames = 0;
  private visible = true;
  private readonly scratchA = new Vector3();
  private readonly scratchB = new Vector3();
  private readonly lightDir = new Vector3();
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private hoverFrame = 0;
  private lastHover = "";
  private lastSet = "";

  constructor(private readonly options: GlobeOptions) {
    const { container, world, mobile } = options;
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.dpr = Math.min(window.devicePixelRatio, 1.5);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.className = "globe-canvas";
    container.append(this.renderer.domElement);

    this.camera = new PerspectiveCamera(34, 1, 0.01, 50);
    const start = options.initial ?? { lonLat: [14, 44] as LonLat };
    toVec3(
      start.lonLat[0],
      start.lonLat[1],
      start.distance ?? (mobile ? 3.7 : 2.75),
      this.camera.position
    );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = MIN_DISTANCE;
    this.controls.maxDistance = MAX_DISTANCE;
    this.controls.zoomSpeed = 0.7;
    this.controls.enableZoom = options.zoom !== false;
    this.controls.addEventListener("start", () => {
      this.flight = null;
      this.zoomTarget = null;
      this.interacting = true;
    });
    this.controls.addEventListener("end", () => {
      this.interacting = false;
    });
    this.controls.addEventListener("change", () => {
      this.dirty = true;
    });

    const oceanMaterial = new ShaderMaterial({
      vertexShader: oceanVertex,
      fragmentShader: oceanFragment,
      uniforms: {
        uCamPos: { value: new Vector3() },
        uLightDir: { value: new Vector3() },
      },
    });
    this.ocean = new Mesh(new SphereGeometry(0.998, 96, 64), oceanMaterial);
    this.scene.add(this.ocean);

    this.atmosphere = new Mesh(
      new SphereGeometry(1.1, 64, 48),
      new ShaderMaterial({
        vertexShader: oceanVertex,
        fragmentShader: atmosphereFragment,
        uniforms: { uCamPos: { value: new Vector3() } },
        side: BackSide,
        transparent: true,
        depthWrite: false,
      })
    );
    this.scene.add(this.atmosphere);

    this.scene.add(new AmbientLight(0xd8d2c0, 1.1));
    this.scene.add(this.light);

    this.units = new UnitLayer(world.operations, { mobile });
    this.fronts = new FrontLayer(world.frontlines);
    this.scene.add(
      this.units.group,
      this.fronts.group,
      this.journey.group,
      this.pulses.group
    );

    for (const [id, country] of Object.entries(world.countries))
      this.statusCache.set(id, country.timeline);

    this.overlay = new Overlay(container, {
      select: (id) => options.onSelect(id),
      cluster: (ids, x, y) => options.onCluster(ids, x, y),
    });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    this.renderer.domElement.addEventListener(
      "pointermove",
      this.onPointerMove
    );
    this.renderer.domElement.addEventListener(
      "pointerleave",
      this.onPointerLeave
    );
    if (options.zoom !== false)
      container.addEventListener("wheel", this.onWheel, {
        passive: false,
        capture: true,
      });

    this.loop();
  }

  get time(): number {
    return this.t;
  }

  private statusAt(id: string, t: number): string {
    const timeline = this.statusCache.get(id);
    if (!timeline) return "neutral";
    let status = "neutral";
    for (const [month, value] of timeline) {
      if (month > t) break;
      status = value;
    }
    return status;
  }

  private setFor(t: number): string {
    let key = "1938";
    for (const [id, range] of Object.entries(this.options.world.sets)) {
      if (t >= range.from && t < range.to) key = id;
    }
    if (t >= (this.options.world.sets["1945"]?.from ?? Infinity)) key = "1945";
    return key;
  }

  private loadLayer(key: string): Promise<CountryLayer> {
    let pending = this.countryLayers.get(key);
    if (!pending) {
      pending = fetch(`/geo/borders-${key}.json`)
        .then((response) => {
          if (!response.ok)
            throw new Error(`borders ${key}: ${response.status}`);
          return response.json() as Promise<BordersTopology>;
        })
        .then((topology) => {
          const layer = new CountryLayer(key, topology);
          layer.setOpacity(0);
          this.scene.add(layer.group);
          return layer;
        });
      pending.catch((error) => {
        this.countryLayers.delete(key);
        this.options.onError?.(error);
      });
      this.countryLayers.set(key, pending);
    }
    return pending;
  }

  setTime(t: number, animate = true) {
    this.t = t;
    this.dirty = true;
    const key = this.setFor(t);
    if (key !== this.lastSet) {
      this.lastSet = key;
      void this.loadLayer(key).then((layer) => {
        if (this.disposed || this.lastSet !== key) return;
        const previous = this.activeLayer;
        this.activeLayer = layer;
        layer.apply((id) => this.statusAt(id, this.t), this.mode, false);
        const now = performance.now();
        this.fading = this.fading.filter(
          (f) => f.layer !== layer && f.layer !== previous
        );
        this.fading.push({ layer, from: 0, to: 1, start: now });
        if (previous && previous !== layer)
          this.fading.push({ layer: previous, from: 1, to: 0, start: now });
        this.overlay.setLabelFilter(new Set(layer.ids));
        this.dirty = true;
      });
      return;
    }
    if (
      this.activeLayer?.apply(
        (id) => this.statusAt(id, t),
        this.mode,
        animate && !this.options.reducedMotion
      )
    ) {
      this.paletteFade = { layer: this.activeLayer, start: performance.now() };
    }
  }

  preload(keys: string[]) {
    for (const key of keys) void this.loadLayer(key);
  }

  setMode(mode: ColorMode) {
    if (mode === this.mode) return;
    this.mode = mode;
    if (
      this.activeLayer?.apply(
        (id) => this.statusAt(id, this.t),
        mode,
        !this.options.reducedMotion
      )
    ) {
      this.paletteFade = { layer: this.activeLayer, start: performance.now() };
    }
    this.dirty = true;
  }

  statusOf(id: string): string {
    return this.statusAt(id, this.t);
  }

  setLayers(layers: Partial<GlobeLayers>) {
    this.layers = { ...this.layers, ...layers };
    this.units.group.visible = this.layers.units;
    this.fronts.group.visible = this.layers.fronts;
    this.pulses.group.visible = this.layers.events;
    this.dirty = true;
    this.overlayStale = true;
  }

  setMarkers(markers: MarkerInput[]) {
    this.overlay.setMarkers(markers, this.options.posterBase);
    this.dirty = true;
  }

  setLabels(labels: LabelInput[]) {
    this.overlay.setLabels(labels);
    this.dirty = true;
  }

  setEvents(events: PulseInput[]) {
    this.pulses.setEvents(events);
    this.dirty = true;
  }

  setTags(tags: TagInput[]) {
    this.overlay.setTags(this.layers.units ? tags : []);
    this.dirty = true;
  }

  setEventLabels(labels: Map<string, string>) {
    this.eventLabels = labels;
  }

  private eventLabels = new Map<string, string>();

  select(id: string | null) {
    this.overlay.setSelected(id);
    this.dirty = true;
  }

  showJourney(stops: { lonLat: LonLat; label: string }[] | null) {
    const time = performance.now() / 1000;
    this.journey.set(stops?.map((s) => s.lonLat) ?? null, time);
    this.overlay.setStops(stops);
    this.dirty = true;
  }

  setActiveStop(index: number | null) {
    this.overlay.setActiveStop(index);
  }

  fitStops(stops: LonLat[], padding = 1) {
    if (!stops.length) return;
    const center = new Vector3();
    for (const [lon, lat] of stops) center.add(toVec3(lon, lat));
    if (center.lengthSq() < 1e-6)
      center.copy(toVec3(stops[0]![0], stops[0]![1]));
    center.normalize();
    let spread = 0;
    for (const [lon, lat] of stops)
      spread = Math.max(spread, center.angleTo(toVec3(lon, lat)));
    const distance = Math.min(
      MAX_DISTANCE - 0.4,
      Math.max(1.55, 1.35 + spread * 2.3 * padding)
    );
    const [lon, lat] = toLonLat(center);
    this.flyTo([lon, lat], distance);
  }

  flyTo(lonLat: LonLat, distance?: number, duration?: number) {
    const from = this.camera.position.clone();
    const fromDistance = from.length();
    const floor = this.isCinematic ? CINEMATIC_MIN_DISTANCE : MIN_DISTANCE;
    const toDistance = Math.max(
      floor,
      Math.min(MAX_DISTANCE, distance ?? fromDistance)
    );
    this.zoomTarget = null;
    const to = toVec3(lonLat[0], lonLat[1], 1);
    const angle = from.clone().normalize().angleTo(to);
    if (this.options.reducedMotion) {
      this.camera.position.copy(to.multiplyScalar(toDistance));
      this.controls.update();
      this.dirty = true;
      return;
    }
    this.flight = {
      from: from.normalize(),
      to,
      fromDistance,
      toDistance,
      peak: Math.min(
        MAX_DISTANCE - 0.3,
        Math.max(fromDistance, toDistance) + angle * 0.55
      ),
      start: performance.now(),
      duration: duration ?? Math.min(2600, 900 + angle * 900),
    };
  }

  get context(): GlobeContext {
    return {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      container: this.options.container,
      mobile: this.options.mobile,
      reducedMotion: this.options.reducedMotion,
      flyTo: (lonLat, distance, duration) =>
        this.flyTo(lonLat, distance, duration),
      addTicker: (tick) => {
        this.tickers.add(tick);
        this.dirty = true;
        return () => {
          this.tickers.delete(tick);
          this.dirty = true;
        };
      },
      cinematic: (on) => this.cinematic(on),
    };
  }

  private cinematic(on: boolean) {
    this.isCinematic = on;
    this.controls.enabled = !on;
    this.controls.minDistance = on ? CINEMATIC_MIN_DISTANCE : MIN_DISTANCE;
    this.zoomTarget = null;
    if (!on && this.camera.position.length() < MIN_DISTANCE) {
      const [lon, lat] = toLonLat(this.camera.position);
      this.flyTo([lon, lat], MIN_DISTANCE + 0.12, 900);
    }
    this.dirty = true;
  }

  setVisible(visible: boolean) {
    if (visible === this.visible || this.disposed) return;
    this.visible = visible;
    cancelAnimationFrame(this.raf);
    if (visible) {
      this.dirty = true;
      this.lastFrame = 0;
      this.loop();
    }
  }

  private onWheel = (event: WheelEvent) => {
    if (this.isCinematic) return;
    event.preventDefault();
    event.stopPropagation();
    let delta =
      event.deltaY *
      (event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? 800 : 1);
    if (event.deltaMode === 0 && delta !== 0 && delta % WHEEL_TICK === 0)
      delta = (delta / WHEEL_TICK) * 100;
    delta = Math.max(-300, Math.min(300, delta));
    const speed = event.ctrlKey ? 0.01 : 0.0025;
    const altitude = (this.zoomTarget ?? this.camera.position.length()) - 1;
    const next = 1 + altitude * Math.exp(delta * speed);
    this.zoomTarget = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, next));
    this.flight = null;
    this.zoomAnchor = null;
    if (delta < 0) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hit = this.raycaster.intersectObject(this.ocean, false)[0];
      if (hit) this.zoomAnchor = hit.point.clone().normalize();
    }
    this.dirty = true;
  };

  private stepZoom(dt: number) {
    if (this.zoomTarget === null) return;
    const position = this.camera.position;
    const altitude = position.length() - 1;
    const target = this.zoomTarget - 1;
    const next = altitude + (target - altitude) * (1 - Math.exp(-dt * 14));
    const direction = this.scratchA.copy(position).normalize();
    if (this.zoomAnchor && next < altitude) {
      direction.lerp(this.zoomAnchor, (1 - next / altitude) * 0.85).normalize();
    }
    position.copy(direction).multiplyScalar(1 + next);
    this.camera.lookAt(0, 0, 0);
    if (Math.abs(target - next) < 1e-4) {
      this.zoomTarget = null;
      this.zoomAnchor = null;
    }
    this.dirty = true;
  }

  private adaptQuality(frameMs: number) {
    if (this.dpr <= 1 || frameMs <= 0 || frameMs > 250) return;
    this.sampledFrames++;
    if (frameMs > 24) this.slowFrames++;
    if (this.sampledFrames < 90) return;
    if (this.slowFrames > 45) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.resize();
    }
    this.sampledFrames = 0;
    this.slowFrames = 0;
  }

  zoomBy(factor: number) {
    const direction = this.camera.position.clone().normalize();
    const distance = Math.max(
      MIN_DISTANCE,
      Math.min(MAX_DISTANCE, this.camera.position.length() * factor)
    );
    const [lon, lat] = toLonLat(direction);
    this.flyTo([lon, lat], distance, 500);
  }

  resetView() {
    this.flyTo([14, 44], this.options.mobile ? 3.7 : 2.75);
  }

  get distance(): number {
    return this.camera.position.length();
  }

  private resize() {
    const { clientWidth, clientHeight } = this.options.container;
    this.width = Math.max(1, clientWidth);
    this.height = Math.max(1, clientHeight);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.fov = this.camera.aspect < 0.8 ? 44 : 34;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
    this.overlayStale = true;
  }

  private onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || event.buttons) {
      this.clearHover();
      return;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    cancelAnimationFrame(this.hoverFrame);
    this.hoverFrame = requestAnimationFrame(() => this.pick(x, y));
  };

  private onPointerLeave = () => this.clearHover();

  private clearHover() {
    if (this.lastHover) {
      this.lastHover = "";
      this.options.onHover(null);
    }
  }

  private pick(x: number, y: number) {
    const layer = this.activeLayer;
    if (!layer) return;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const sphere = this.raycaster.intersectObject(this.ocean, false)[0];
    if (!sphere) {
      this.clearHover();
      return;
    }
    const [lon, lat] = toLonLat(sphere.point);
    const id = layer.pick(lon, lat);
    if (!id) {
      this.clearHover();
      return;
    }
    const status = this.statusAt(id, this.t);
    this.lastHover = `${id}|${status}`;
    this.options.onHover({ id, status, x, y });
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const time = now / 1000;
    const dt = this.lastFrame
      ? Math.min(0.1, (now - this.lastFrame) / 1000)
      : 1 / 60;
    this.lastFrame = now;
    const still = this.options.reducedMotion;
    this.stepZoom(dt);

    if (this.flight) {
      const f = this.flight;
      const u = Math.min(1, (now - f.start) / f.duration);
      const e = easeInOut(u);
      const direction = slerp(f.from, f.to, e, new Vector3());
      const base = f.fromDistance + (f.toDistance - f.fromDistance) * e;
      const bump =
        Math.sin(Math.PI * u) *
        Math.max(0, f.peak - Math.max(f.fromDistance, f.toDistance));
      this.camera.position.copy(
        direction.normalize().multiplyScalar(base + bump)
      );
      this.camera.lookAt(0, 0, 0);
      if (u >= 1) this.flight = null;
      this.dirty = true;
    }

    const distance = this.camera.position.length();
    this.controls.rotateSpeed = Math.max(
      0.04,
      Math.min(0.55, (distance - 1) * 0.3)
    );
    this.controls.update();

    for (const fade of this.fading) {
      const u = Math.min(1, (now - fade.start) / 650);
      fade.layer.setOpacity(fade.from + (fade.to - fade.from) * u);
      if (u >= 1) fade.layer.setOpacity(fade.to);
      this.dirty = true;
    }
    this.fading = this.fading.filter((fade) => now - fade.start < 650);

    if (this.paletteFade) {
      const u = Math.min(1, (now - this.paletteFade.start) / 520);
      this.paletteFade.layer.material.uniforms.uMix!.value = u;
      if (u >= 1) this.paletteFade = null;
      this.dirty = true;
    }

    const zoom = Math.max(0.2, Math.min(1.25, (distance - 1) / 1.75));
    if (this.layers.units)
      this.units.update(this.t, time, zoom, still, this.camera.position);
    if (this.layers.fronts) this.fronts.update(this.t, time);
    if (this.layers.events) this.pulses.update(this.t, time, zoom, still);
    this.journey.update(time, still);

    let ticking = false;
    for (const tick of this.tickers) ticking = tick(now, dt) || ticking;

    const ambient =
      (this.layers.units && this.units.activeCount > 0) ||
      (this.layers.events && this.pulses.current.length > 0) ||
      this.journey.animating ||
      (this.layers.fronts && this.fronts.group.children.some((c) => c.visible));
    const moving = this.dirty || ticking || this.interacting;
    if (!moving && !(ambient && now - this.lastRender >= AMBIENT_FRAME_MS))
      return;
    if (moving && now - this.lastRender < 40) this.adaptQuality(dt * 1000);
    this.lastRender = now;
    this.dirty = false;

    const lightDir = this.lightDir
      .copy(this.camera.position)
      .normalize()
      .multiplyScalar(1.4)
      .add(this.scratchA.copy(this.camera.up).multiplyScalar(0.55))
      .add(
        this.scratchB
          .crossVectors(this.camera.up, this.camera.position)
          .normalize()
          .multiplyScalar(0.45)
      )
      .normalize();
    this.light.position.copy(lightDir);
    this.ocean.material.uniforms.uCamPos!.value.copy(this.camera.position);
    this.ocean.material.uniforms.uLightDir!.value.copy(lightDir);
    this.atmosphere.material.uniforms.uCamPos!.value.copy(this.camera.position);
    const hatch = Math.max(
      0.004,
      Math.min(3, (this.camera.position.length() - 1) * 1.1)
    );
    for (const pending of [
      this.activeLayer,
      ...this.fading.map((f) => f.layer),
    ]) {
      if (!pending) continue;
      pending.material.uniforms.uCamPos!.value.copy(this.camera.position);
      pending.material.uniforms.uLightDir!.value.copy(lightDir);
      pending.material.uniforms.uHatch!.value = hatch;
    }

    this.renderer.render(this.scene, this.camera);
    this.overlay.setEvents(
      this.layers.events
        ? this.pulses.current.map((e) => ({
            id: e.id,
            lonLat: e.lonLat,
            label: this.eventLabels.get(e.id) ?? "",
            major: e.major,
          }))
        : []
    );
    const cameraMoved =
      !this.lastCamPos.equals(this.camera.position) ||
      !this.lastCamQuat.equals(this.camera.quaternion);
    if (cameraMoved || this.overlayStale || this.overlay.stale) {
      this.lastCamPos.copy(this.camera.position);
      this.lastCamQuat.copy(this.camera.quaternion);
      this.overlayStale = false;
      this.overlay.update(
        this.camera,
        this.width,
        this.height,
        distance,
        this.layers.labels
      );
    }
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.hoverFrame);
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener(
      "pointermove",
      this.onPointerMove
    );
    this.renderer.domElement.removeEventListener(
      "pointerleave",
      this.onPointerLeave
    );
    this.options.container.removeEventListener("wheel", this.onWheel, {
      capture: true,
    });
    this.tickers.clear();
    this.controls.dispose();
    this.overlay.dispose();
    this.units.dispose();
    this.fronts.dispose();
    this.journey.dispose();
    this.pulses.dispose();
    for (const pending of this.countryLayers.values())
      void pending.then((layer) => layer.dispose()).catch(() => {});
    this.ocean.geometry.dispose();
    this.ocean.material.dispose();
    this.atmosphere.geometry.dispose();
    this.atmosphere.material.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}
