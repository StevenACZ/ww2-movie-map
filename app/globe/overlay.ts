import { PerspectiveCamera, Vector3 } from "three";
import { toVec3, type LonLat } from "./geo";

export interface MarkerInput {
  id: string;
  lonLat: LonLat;
  title: string;
  year: number;
  era: string;
  gold: boolean;
  poster?: string;
}

export interface TagInput {
  id: string;
  lonLat: LonLat;
  label: string;
  color: string;
}

export interface LabelInput {
  id: string;
  lonLat: LonLat;
  name: string;
  rank: number;
}

const edgeOf = (horizon: number) => Math.min(0.02, (1 - horizon) * 0.1);

interface Placed {
  el: HTMLElement;
  world: Vector3;
  x: number;
  y: number;
  visible: boolean;
  facing: number;
  css?: string;
  alpha?: string;
}

type PlacedMarker = Placed & {
  data: MarkerInput;
  img?: HTMLImageElement;
  full?: string;
};

function place(
  el: HTMLElement,
  placed: Placed,
  transform: string,
  alpha: string
) {
  if (placed.css !== transform) {
    placed.css = transform;
    el.style.transform = transform;
  }
  if (placed.alpha !== alpha) {
    placed.alpha = alpha;
    el.style.opacity = alpha;
  }
}

const px = (value: number) => Math.round(value * 2) / 2;

const CLUSTER_RADIUS = 30;

export class Overlay {
  readonly root: HTMLElement;
  private markerLayer: HTMLElement;
  private labelLayer: HTMLElement;
  private stopLayer: HTMLElement;
  private markers = new Map<string, PlacedMarker>();
  private scale = 1;
  private labels = new Map<string, Placed & { data: LabelInput }>();
  private stops: (Placed & { index: number })[] = [];
  private events: (Placed & { id: string })[] = [];
  private tags = new Map<string, Placed & { label: string }>();
  private clusterPool: HTMLButtonElement[] = [];
  private selected: string | null = null;
  private labelFilter: Set<string> | null = null;
  private readonly v = new Vector3();
  private readonly camDir = new Vector3();
  stale = true;

  constructor(
    container: HTMLElement,
    private readonly handlers: {
      select: (id: string) => void;
      cluster: (ids: string[], x: number, y: number) => void;
      setpiece?: (id: string) => void;
    }
  ) {
    this.root = document.createElement("div");
    this.root.className = "globe-overlay";
    this.labelLayer = document.createElement("div");
    this.labelLayer.className = "globe-overlay__labels";
    this.stopLayer = document.createElement("div");
    this.stopLayer.className = "globe-overlay__stops";
    this.markerLayer = document.createElement("div");
    this.markerLayer.className = "globe-overlay__markers";
    this.root.append(this.labelLayer, this.markerLayer, this.stopLayer);
    container.append(this.root);
    this.markerLayer.addEventListener("click", this.onClick);
    this.stopLayer.addEventListener("click", this.onStopClick);
  }

  private onStopClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-setpiece]"
    );
    if (!target?.dataset.setpiece) return;
    event.stopPropagation();
    this.handlers.setpiece?.(target.dataset.setpiece);
  };

  private onClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-id],[data-ids]"
    );
    if (!target) return;
    event.stopPropagation();
    if (target.dataset.id) this.handlers.select(target.dataset.id);
    else if (target.dataset.ids) {
      const rect = target.getBoundingClientRect();
      this.handlers.cluster(
        target.dataset.ids.split(","),
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    }
  };

  setMarkers(list: MarkerInput[], posterBase: string) {
    this.stale = true;
    const keep = new Set(list.map((m) => m.id));
    for (const [id, placed] of this.markers) {
      if (!keep.has(id)) {
        placed.el.remove();
        this.markers.delete(id);
      }
    }
    for (const data of list) {
      if (this.markers.has(data.id)) continue;
      const el = document.createElement("button");
      el.type = "button";
      el.className = `gm gm--${data.era}${data.gold ? " gm--gold" : ""}${data.poster ? " gm--poster" : ""}`;
      el.dataset.id = data.id;
      el.setAttribute("aria-label", `${data.title} (${data.year})`);
      const pin = document.createElement("span");
      pin.className = "gm__pin";
      let img: HTMLImageElement | undefined;
      const local = data.poster?.startsWith("/img/posters/");
      if (data.poster) {
        img = document.createElement("img");
        img.src = local
          ? data.poster.replace("/img/posters/", "/img/posters/sm/")
          : `${posterBase}${data.poster}`;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        pin.append(img);
      }
      const label = document.createElement("span");
      label.className = "gm__label";
      label.textContent = data.title;
      const year = document.createElement("small");
      year.textContent = String(data.year);
      label.append(year);
      el.append(pin, label);
      this.markerLayer.append(el);
      this.markers.set(data.id, {
        el,
        data,
        img,
        full: local ? data.poster : undefined,
        world: toVec3(data.lonLat[0], data.lonLat[1], 1.004),
        x: 0,
        y: 0,
        visible: false,
        facing: 0,
      });
    }
    this.applySelection();
  }

  setSelected(id: string | null) {
    this.stale = true;
    this.selected = id;
    this.applySelection();
  }

  private applySelection() {
    for (const [id, placed] of this.markers)
      placed.el.classList.toggle("is-selected", id === this.selected);
    this.root.classList.toggle("has-selection", !!this.selected);
  }

  setLabels(list: LabelInput[]) {
    this.stale = true;
    this.labelLayer.replaceChildren();
    this.labels.clear();
    for (const data of list) {
      const el = document.createElement("span");
      el.className = `gl gl--r${Math.min(data.rank, 4)}`;
      el.textContent = data.name;
      this.labelLayer.append(el);
      this.labels.set(data.id, {
        el,
        data,
        world: toVec3(data.lonLat[0], data.lonLat[1], 1.003),
        x: 0,
        y: 0,
        visible: false,
        facing: 0,
      });
    }
  }

  setLabelFilter(ids: Set<string> | null) {
    this.stale = true;
    this.labelFilter = ids;
  }

  setStops(stops: { lonLat: LonLat; label: string }[] | null) {
    this.stale = true;
    this.stopLayer.querySelectorAll(".gs").forEach((el) => el.remove());
    this.stops = [];
    for (const [index, stop] of (stops ?? []).entries()) {
      const el = document.createElement("span");
      el.className = "gs";
      el.style.setProperty("--i", String(index));
      const num = document.createElement("b");
      num.textContent = String(index + 1);
      const name = document.createElement("span");
      name.textContent = stop.label;
      if ((stops ?? []).length > 1) el.append(num);
      el.append(name);
      this.stopLayer.append(el);
      this.stops.push({
        el,
        index,
        world: toVec3(stop.lonLat[0], stop.lonLat[1], 1.004),
        x: 0,
        y: 0,
        visible: false,
        facing: 0,
      });
    }
  }

  setActiveStop(index: number | null) {
    this.stale = true;
    for (const stop of this.stops)
      stop.el.classList.toggle("is-active", stop.index === index);
  }

  setEvents(
    events: {
      id: string;
      lonLat: LonLat;
      label: string;
      major: boolean;
      setpiece?: { id: string; cta: string };
    }[]
  ) {
    const key = events.map((e) => e.id).join(",");
    if (this.stopLayer.dataset.events === key) return;
    this.stopLayer.dataset.events = key;
    this.stale = true;
    this.events.forEach((e) => e.el.remove());
    this.events = events.map((event) => {
      const piece = event.setpiece;
      const el = document.createElement(piece ? "button" : "span");
      el.className = `ge${event.major ? " ge--major" : ""}${piece ? " ge--3d" : ""}`;
      if (piece) {
        (el as HTMLButtonElement).type = "button";
        el.dataset.setpiece = piece.id;
        el.setAttribute("aria-label", `${piece.cta}: ${event.label}`);
        const badge = document.createElement("b");
        badge.textContent = "3D";
        const text = document.createElement("span");
        text.textContent = event.label;
        el.append(badge, text);
      } else el.textContent = event.label;
      this.stopLayer.append(el);
      return {
        el,
        id: event.id,
        world: toVec3(event.lonLat[0], event.lonLat[1], 1.004),
        x: 0,
        y: 0,
        visible: false,
        facing: 0,
      };
    });
  }

  setTags(list: TagInput[]) {
    const keep = new Set(list.map((tag) => tag.id));
    for (const [id, placed] of this.tags) {
      if (!keep.has(id)) {
        placed.el.remove();
        this.tags.delete(id);
        this.stale = true;
      }
    }
    for (const tag of list) {
      let placed = this.tags.get(tag.id);
      if (!placed) {
        const el = document.createElement("span");
        el.className = "gt";
        el.style.setProperty("--c", tag.color);
        this.stopLayer.append(el);
        placed = {
          el,
          label: "",
          world: new Vector3(),
          x: 0,
          y: 0,
          visible: false,
          facing: 0,
        };
        this.tags.set(tag.id, placed);
      }
      if (placed.label !== tag.label) {
        placed.label = tag.label;
        placed.el.textContent = tag.label;
      }
      const next = toVec3(tag.lonLat[0], tag.lonLat[1], 1.004);
      if (!next.equals(placed.world)) {
        placed.world.copy(next);
        this.stale = true;
      }
    }
  }

  private project(
    placed: Placed,
    camera: PerspectiveCamera,
    width: number,
    height: number
  ) {
    this.camDir.copy(camera.position).normalize();
    placed.facing = placed.world.clone().normalize().dot(this.camDir);
    const horizon = 1 / camera.position.length();
    placed.visible = placed.facing > horizon + edgeOf(horizon);
    if (!placed.visible) return;
    this.v.copy(placed.world).project(camera);
    placed.x = (this.v.x * 0.5 + 0.5) * width;
    placed.y = (-this.v.y * 0.5 + 0.5) * height;
  }

  update(
    camera: PerspectiveCamera,
    width: number,
    height: number,
    distance: number,
    showLabels: boolean
  ) {
    this.stale = false;
    const horizon = 1 / camera.position.length();
    const edge = edgeOf(horizon);
    const band = Math.min(0.12, (1 - horizon) * 0.35);
    const fadeOf = (facing: number) =>
      Math.max(0, Math.min(1, (facing - horizon - edge) / band));

    const maxRank = distance > 2.6 ? 2 : distance > 1.8 ? 3 : 5;
    const scale =
      Math.round(Math.min(2.4, Math.max(1, 1 + (2 - distance) * 1.6)) * 20) /
      20;
    if (scale !== this.scale) {
      this.scale = scale;
      this.markerLayer.style.setProperty("--gk", String(scale));
    }
    for (const placed of this.labels.values()) {
      const allowed =
        showLabels &&
        placed.data.rank <= maxRank &&
        (!this.labelFilter || this.labelFilter.has(placed.data.id));
      if (!allowed) {
        place(placed.el, placed, placed.css ?? "", "0");
        continue;
      }
      this.project(placed, camera, width, height);
      place(
        placed.el,
        placed,
        placed.visible
          ? `translate(${px(placed.x)}px, ${px(placed.y)}px) translate(-50%, -50%)`
          : (placed.css ?? ""),
        placed.visible ? fadeOf(placed.facing).toFixed(2) : "0"
      );
    }

    for (const placed of [
      ...this.stops,
      ...this.events,
      ...this.tags.values(),
    ]) {
      this.project(placed, camera, width, height);
      place(
        placed.el,
        placed,
        placed.visible
          ? `translate(${px(placed.x)}px, ${px(placed.y)}px)`
          : (placed.css ?? ""),
        placed.visible ? fadeOf(placed.facing).toFixed(2) : "0"
      );
    }

    const visible: PlacedMarker[] = [];
    for (const placed of this.markers.values()) {
      this.project(placed, camera, width, height);
      if (placed.visible) visible.push(placed);
      else placed.el.classList.add("is-hidden");
    }
    visible.sort(
      (a, b) =>
        Number(b.data.id === this.selected) -
          Number(a.data.id === this.selected) ||
        Number(b.data.gold) - Number(a.data.gold) ||
        b.facing - a.facing
    );
    const clusters: {
      x: number;
      y: number;
      members: PlacedMarker[];
    }[] = [];
    const radius = CLUSTER_RADIUS * Math.max(1, scale * 0.8);
    for (const placed of visible) {
      const hit = clusters.find(
        (c) => Math.hypot(c.x - placed.x, c.y - placed.y) < radius
      );
      if (hit && placed.data.id !== this.selected) hit.members.push(placed);
      else clusters.push({ x: placed.x, y: placed.y, members: [placed] });
    }

    let pool = 0;
    for (const cluster of clusters) {
      const [lead, ...rest] = cluster.members;
      if (!lead) continue;
      lead.el.classList.remove("is-hidden");
      if (scale >= 1.6 && lead.full && lead.img) {
        lead.img.src = lead.full;
        lead.full = undefined;
      }
      place(
        lead.el,
        lead,
        `translate(${px(lead.x)}px, ${px(lead.y)}px)`,
        fadeOf(lead.facing).toFixed(2)
      );
      const z =
        lead.data.id === this.selected ? "30" : lead.data.gold ? "20" : "10";
      if (lead.el.style.zIndex !== z) lead.el.style.zIndex = z;
      for (const member of rest) member.el.classList.add("is-hidden");
      if (rest.length) {
        let badge = this.clusterPool[pool];
        if (!badge) {
          badge = document.createElement("button");
          badge.type = "button";
          badge.className = "gc";
          this.clusterPool.push(badge);
          this.markerLayer.append(badge);
        }
        pool++;
        badge.hidden = false;
        badge.dataset.ids = cluster.members.map((m) => m.data.id).join(",");
        badge.textContent = `+${rest.length}`;
        badge.setAttribute("aria-label", `${cluster.members.length}`);
        badge.style.transform = `translate(${px(lead.x)}px, ${px(lead.y)}px)`;
        badge.style.opacity = lead.el.style.opacity;
      }
    }
    for (let i = pool; i < this.clusterPool.length; i++)
      this.clusterPool[i]!.hidden = true;
  }

  dispose() {
    this.markerLayer.removeEventListener("click", this.onClick);
    this.stopLayer.removeEventListener("click", this.onStopClick);
    this.root.remove();
  }
}
