<template>
  <div
    ref="root"
    class="atlas"
    :class="{
      'is-shown': shown,
      'is-live': live,
      'has-active': !!active,
    }"
    data-lenis-prevent
  >
    <div
      class="atlas__regions"
      role="group"
      :aria-label="t('placesPage.map.regions')"
    >
      <button
        v-for="id in ATLAS_REGIONS"
        :key="id"
        type="button"
        class="atlas__region"
        :aria-pressed="region === id"
        @click="fly(id)"
      >
        {{ t(`placesPage.map.region.${id}`) }}
      </button>
    </div>

    <svg
      ref="svg"
      class="atlas__svg"
      :viewBox="`0 0 ${size.w || 1} ${size.h || 1}`"
      role="group"
      :aria-label="t('placesPage.map.label')"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <g ref="world">
        <path class="atlas__ocean" :d="data.outline" />
        <path class="atlas__grat" :d="data.graticule" />
        <g class="atlas__land">
          <path
            v-for="land in data.land"
            :key="land.id"
            :class="`atlas__land--${land.id}`"
            :d="land.d"
          />
        </g>
        <g class="atlas__areas" aria-hidden="true">
          <text
            v-for="label in data.labels"
            :key="label.id"
            :style="pin(label.x, label.y)"
          >
            {{ t(`placesPage.map.area.${label.id}`) }}
          </text>
        </g>
        <g class="atlas__arcs" aria-hidden="true">
          <path
            v-for="(arc, i) in links"
            :key="`${active}-${arc.id}`"
            :d="arc.d"
            :style="{ '--w': Math.min(3, 0.8 + arc.shared * 0.5), '--i': i }"
          />
        </g>
        <g class="atlas__markers">
          <a
            v-for="marker in markers"
            :key="marker.id"
            :href="marker.href"
            class="atlas__marker"
            :class="{
              'is-out': !visible.has(marker.id),
              'is-active': active === marker.id,
              'is-linked': linked.has(marker.id),
            }"
            :tabindex="visible.has(marker.id) ? 0 : -1"
            :aria-label="`${marker.name}, ${t('places.count', { n: marker.count })}`"
            :style="{
              ...pin(marker.x, marker.y),
              '--c': marker.color,
              '--i': marker.rank,
            }"
            @pointerenter="onEnter($event, marker.id)"
            @pointerleave="onLeave($event)"
            @focus="enter(marker.id)"
            @blur="leave"
            @click.prevent="onMarkerClick(marker.id)"
          >
            <circle
              v-if="marker.rank <= 8"
              class="atlas__pulse"
              :r="marker.r"
            />
            <circle class="atlas__dot" :r="marker.r" />
          </a>
        </g>
        <g class="atlas__labels" aria-hidden="true">
          <text
            v-for="label in placedLabels"
            :key="label.id"
            :class="[
              `atlas__label--${label.side}`,
              { 'is-active': active === label.id },
            ]"
            :style="pin(label.x, label.y)"
            :x="label.dx"
            :y="label.dy"
          >
            {{ label.name }}
          </text>
        </g>
      </g>
    </svg>

    <div class="atlas__grain" aria-hidden="true" />

    <div class="atlas__zoom">
      <button
        type="button"
        :aria-label="t('placesPage.map.zoomIn')"
        @click="zoomBy(1.7)"
      >
        <Icon name="plus" />
      </button>
      <button
        type="button"
        :aria-label="t('placesPage.map.zoomOut')"
        @click="zoomBy(1 / 1.7)"
      >
        <Icon name="minus" />
      </button>
    </div>

    <p class="atlas__hint mono" aria-hidden="true">
      {{ t("placesPage.map.hint") }}
    </p>

    <div
      v-if="card"
      ref="cardEl"
      class="atlas__card"
      :style="{ '--c': card.color }"
      @pointerenter="cancelLeave"
      @pointerleave="leave"
      @focusin="cancelLeave"
      @focusout="leave"
    >
      <p class="atlas__card-top mono">
        <span class="atlas__card-dot" />
        {{ card.country ?? t("placesPage.map.atSea") }}
      </p>
      <p class="atlas__card-name">{{ card.name }}</p>
      <p class="atlas__card-count mono">
        {{ t("places.count", { n: card.count }) }}
      </p>
      <ul class="atlas__card-posters">
        <li v-for="(item, i) in card.titles" :key="i">
          <TitlePoster
            :path="item.poster"
            :title="item.title"
            :year="item.year"
            :era="item.era"
            :kind="item.kind"
            :gold="item.gold"
            sizes="80px"
          />
          <span class="atlas__card-title">{{ item.title }}</span>
        </li>
      </ul>
      <NuxtLinkLocale :to="`/places/${card.id}/`" class="atlas__card-open">
        {{ t("placesPage.map.open") }}
        <Icon name="arrow-right" />
      </NuxtLinkLocale>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlaceSummary } from "~~/types/view";
import {
  ATLAS_REGIONS,
  ERA_COLOR,
  arcPath,
  placeLabels,
  type AtlasBox,
  type AtlasData,
  type AtlasRegion,
  type LabelSide,
} from "~/utils/atlas";

const props = defineProps<{
  data: AtlasData;
  places: PlaceSummary[];
  visible: Set<string>;
}>();

const active = defineModel<string | null>("active", { default: null });

const { t, locale } = useI18n();
const localePath = useLocalePath();

const MAX_ZOOM = 28;
const CARD_W = 292;

const root = ref<HTMLElement>();
const svg = ref<SVGSVGElement>();
const world = ref<SVGGElement>();
const cardEl = ref<HTMLElement>();
const size = reactive({ w: 0, h: 0 });
const region = ref<AtlasRegion | null>("world");
const shown = ref(false);
const live = ref(false);
const pinned = ref<string | null>(null);
const labelSet = shallowRef<{ id: string; side: LabelSide }[]>([]);

const markers = computed(() =>
  props.places.flatMap((place, index) => {
    const spot = props.data.places[place.id];
    if (!spot) return [];
    return [
      {
        id: place.id,
        name: place.name,
        count: place.count,
        x: spot.x,
        y: spot.y,
        r: Math.round((2.6 + Math.sqrt(place.count) * 1.5) * 10) / 10,
        color: ERA_COLOR[spot.e],
        rank: index + 1,
        href: localePath(`/places/${place.id}/`),
      },
    ];
  })
);

const byId = computed(() => new Map(markers.value.map((m) => [m.id, m])));

const titleSets = computed(
  () =>
    new Map(
      Object.entries(props.data.places).map(([id, p]) => [id, new Set(p.t)])
    )
);

const links = computed(() => {
  const id = active.value;
  const own = id ? titleSets.value.get(id) : undefined;
  const from = id ? byId.value.get(id) : undefined;
  if (!id || !own || !from) return [];
  return markers.value
    .flatMap((m) => {
      if (m.id === id || !props.visible.has(m.id)) return [];
      const shared = props.data.places[m.id]!.t.filter((i) =>
        own.has(i)
      ).length;
      return shared
        ? [{ id: m.id, shared, d: arcPath(from.x, from.y, m.x, m.y) }]
        : [];
    })
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 40);
});

const linked = computed(() => new Set(links.value.map((link) => link.id)));

const placedLabels = computed(() =>
  labelSet.value.flatMap(({ id, side }) => {
    const m = byId.value.get(id);
    if (!m) return [];
    const gap = m.r + 5;
    const offset: Record<LabelSide, [number, number]> = {
      r: [gap, 4],
      l: [-gap, 4],
      t: [0, -gap - 3],
      b: [0, gap + 10],
    };
    return [
      {
        id,
        side,
        name: m.name,
        x: m.x,
        y: m.y,
        dx: offset[side][0],
        dy: offset[side][1],
      },
    ];
  })
);

const card = computed(() => {
  const id = pinned.value;
  const m = id ? byId.value.get(id) : undefined;
  const spot = id ? props.data.places[id] : undefined;
  if (!id || !m || !spot) return null;
  const es = locale.value === "es" ? 1 : 0;
  return {
    id,
    name: m.name,
    count: m.count,
    color: m.color,
    country: spot.c ? props.data.countries[spot.c]?.[es] : undefined,
    titles: spot.t.slice(0, 3).map((index) => {
      const item = props.data.titles[index]!;
      return {
        title: (es && item.t[1]) || item.t[0],
        year: item.y,
        era: item.e,
        kind: item.k,
        gold: !!item.g,
        poster: (es && item.pe) || item.p,
      };
    }),
  };
});

function pin(x: number, y: number) {
  return { transform: `translate(${x}px, ${y}px) scale(var(--ik))` };
}

type View = { cx: number; cy: number; k: number };

const cam = { x: 0, y: 0, k: 1 };
const velocity = { x: 0, y: 0 };
let goal: { k: number; ax: number; ay: number } | null = null;
let flight: { from: View; to: View; start: number; duration: number } | null =
  null;
let frame = 0;
let last = 0;
let reduced = false;
let worldK = 1;

function fit(id: AtlasRegion): View {
  const [x0, y0, x1, y1] = props.data.regions[id];
  const w = x1 - x0;
  const h = y1 - y0;
  const contain = Math.min(size.w / (w * 1.06), size.h / (h * 1.1));
  const k =
    id === "world"
      ? Math.max(contain, Math.max(size.w / w, size.h / h) * 0.8)
      : contain;
  return { cx: x0 + w / 2, cy: y0 + h / 2, k: clampK(k) };
}

function minK() {
  const [x0, y0, x1, y1] = props.data.regions.world;
  return Math.min(size.w / (x1 - x0), size.h / (y1 - y0)) * 0.9;
}

function clampK(k: number) {
  return Math.min(Math.max(k, minK()), MAX_ZOOM);
}

function setView(view: View) {
  cam.k = view.k;
  cam.x = size.w / 2 - view.cx * view.k;
  cam.y = size.h / 2 - view.cy * view.k;
}

function currentView(): View {
  return {
    cx: (size.w / 2 - cam.x) / cam.k,
    cy: (size.h / 2 - cam.y) / cam.k,
    k: cam.k,
  };
}

function zoomAt(k: number, ax: number, ay: number) {
  const next = clampK(k);
  cam.x = ax - ((ax - cam.x) * next) / cam.k;
  cam.y = ay - ((ay - cam.y) * next) / cam.k;
  cam.k = next;
}

function clamp() {
  cam.k = clampK(cam.k);
  const [, y0, , y1] = props.data.regions.world;
  const cx = Math.min(Math.max((size.w / 2 - cam.x) / cam.k, 0), props.data.w);
  const cy = Math.min(Math.max((size.h / 2 - cam.y) / cam.k, y0), y1);
  cam.x = size.w / 2 - cx * cam.k;
  cam.y = size.h / 2 - cy * cam.k;
}

function apply() {
  world.value?.setAttribute(
    "transform",
    `translate(${cam.x} ${cam.y}) scale(${cam.k})`
  );
  root.value?.style.setProperty("--ik", String(1 / cam.k));
  root.value?.classList.toggle("is-deep", cam.k / worldK > 3.2);
  placeCard();
}

function placeCard() {
  const el = cardEl.value;
  const m = pinned.value ? byId.value.get(pinned.value) : undefined;
  if (!el || !m || size.w < 640) return;
  const sx = m.x * cam.k + cam.x;
  const sy = m.y * cam.k + cam.y;
  const left =
    sx + m.r + 16 + CARD_W < size.w - 12
      ? sx + m.r + 16
      : sx - m.r - 16 - CARD_W;
  const top = Math.min(Math.max(sy - 60, 56), size.h - el.offsetHeight - 12);
  el.style.transform = `translate(${Math.max(12, left)}px, ${Math.max(12, top)}px)`;
}

function ease(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
}

function tick(now: number) {
  frame = 0;
  const dt = last ? Math.min(64, now - last) : 16;
  last = now;
  let moving = false;
  if (flight) {
    const p = flight.duration
      ? Math.min(1, (now - flight.start) / flight.duration)
      : 1;
    const e = ease(p);
    const { from, to } = flight;
    setView({
      cx: from.cx + (to.cx - from.cx) * e,
      cy: from.cy + (to.cy - from.cy) * e,
      k: Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * e),
    });
    if (p < 1) moving = true;
    else flight = null;
  } else if (goal) {
    const step = 1 - 0.8 ** (dt / 16);
    zoomAt(
      Math.exp(Math.log(cam.k) + Math.log(goal.k / cam.k) * step),
      goal.ax,
      goal.ay
    );
    if (Math.abs(Math.log(goal.k / cam.k)) > 0.003) moving = true;
    else goal = null;
  } else if (!dragging && Math.hypot(velocity.x, velocity.y) > 0.01) {
    cam.x += velocity.x * dt;
    cam.y += velocity.y * dt;
    const decay = 0.92 ** (dt / 16);
    velocity.x *= decay;
    velocity.y *= decay;
    moving = true;
  }
  clamp();
  apply();
  if (moving) schedule();
  else settle();
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function settle() {
  last = 0;
  relabel();
}

function relabel() {
  if (!size.w) return;
  const factor = cam.k / worldK;
  const limit = Math.round(Math.min(44, 6 + 7 * (factor - 1)));
  labelSet.value = placeLabels(
    markers.value
      .filter((m) => props.visible.has(m.id))
      .map((m) => ({
        id: m.id,
        x: m.x * cam.k + cam.x,
        y: m.y * cam.k + cam.y,
        r: m.r,
        w: m.name.length * 7.4 + 6,
      })),
    limit,
    size.w,
    size.h - 24
  );
}

function fly(id: AtlasRegion) {
  region.value = id;
  goal = null;
  velocity.x = velocity.y = 0;
  flight = {
    from: currentView(),
    to: fit(id),
    start: performance.now(),
    duration: reduced ? 0 : 950,
  };
  schedule();
}

function zoomBy(factor: number) {
  flight = null;
  region.value = null;
  goal = {
    k: clampK((goal?.k ?? cam.k) * factor),
    ax: size.w / 2,
    ay: size.h / 2,
  };
  schedule();
}

function onWheel(event: WheelEvent) {
  event.preventDefault();
  const rect = svg.value!.getBoundingClientRect();
  const speed = event.ctrlKey ? 0.012 : event.deltaMode ? 0.06 : 0.0022;
  flight = null;
  region.value = null;
  goal = {
    k: clampK((goal?.k ?? cam.k) * Math.exp(-event.deltaY * speed)),
    ax: event.clientX - rect.left,
    ay: event.clientY - rect.top,
  };
  schedule();
}

const pointers = new Map<number, { x: number; y: number }>();
let dragging = false;
let moved = 0;
let lastMove = 0;
let pointerType = "mouse";
let pinch: { d: number; x: number; y: number } | null = null;

function local(event: PointerEvent) {
  const rect = svg.value!.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function onDown(event: PointerEvent) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  pointerType = event.pointerType;
  pointers.set(event.pointerId, local(event));
  flight = null;
  goal = null;
  velocity.x = velocity.y = 0;
  if (pointers.size === 1) moved = 0;
  pinch = null;
  lastMove = performance.now();
}

function onMove(event: PointerEvent) {
  const prev = pointers.get(event.pointerId);
  if (!prev) return;
  const pos = local(event);
  pointers.set(event.pointerId, pos);
  const now = performance.now();
  const dt = Math.max(1, now - lastMove);
  lastMove = now;
  if (pointers.size === 1) {
    const dx = pos.x - prev.x;
    const dy = pos.y - prev.y;
    moved += Math.abs(dx) + Math.abs(dy);
    if (!dragging && moved > 5) {
      dragging = true;
      region.value = null;
      svg.value?.setPointerCapture(event.pointerId);
      root.value?.classList.add("is-dragging");
    }
    if (!dragging) return;
    cam.x += dx;
    cam.y += dy;
    velocity.x = velocity.x * 0.5 + (dx / dt) * 0.5;
    velocity.y = velocity.y * 0.5 + (dy / dt) * 0.5;
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()] as [
      { x: number; y: number },
      { x: number; y: number },
    ];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const x = (a.x + b.x) / 2;
    const y = (a.y + b.y) / 2;
    if (pinch) {
      zoomAt((cam.k * d) / pinch.d, x, y);
      cam.x += x - pinch.x;
      cam.y += y - pinch.y;
    }
    pinch = { d, x, y };
    moved += 10;
    dragging = true;
    region.value = null;
  }
  clamp();
  apply();
}

function onUp(event: PointerEvent) {
  if (!pointers.delete(event.pointerId)) return;
  pinch = null;
  if (pointers.size) return;
  if (performance.now() - lastMove > 90) velocity.x = velocity.y = 0;
  dragging = false;
  root.value?.classList.remove("is-dragging");
  schedule();
}

let leaveTimer: ReturnType<typeof setTimeout> | undefined;

function enter(id: string) {
  cancelLeave();
  active.value = id;
  pinned.value = id;
  nextTick(placeCard);
}

function cancelLeave() {
  clearTimeout(leaveTimer);
}

function leave() {
  cancelLeave();
  leaveTimer = setTimeout(() => {
    pinned.value = null;
    active.value = null;
  }, 260);
}

function onEnter(event: PointerEvent, id: string) {
  if (event.pointerType === "mouse" && !dragging) enter(id);
}

function onLeave(event: PointerEvent) {
  if (event.pointerType === "mouse") leave();
}

function onMarkerClick(id: string) {
  if (moved > 5) return;
  if (pointerType !== "mouse" && pinned.value !== id) {
    enter(id);
    return;
  }
  navigateTo(localePath(`/places/${id}/`));
}

watch(
  () => [props.visible, markers.value],
  () => relabel()
);

let resize: ResizeObserver | undefined;
let seen: IntersectionObserver | undefined;

onMounted(() => {
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.value!.addEventListener("wheel", onWheel, { passive: false });
  resize = new ResizeObserver(([entry]) => {
    if (!entry) return;
    const first = !size.w;
    const view = first ? null : currentView();
    size.w = entry.contentRect.width;
    size.h = entry.contentRect.height;
    worldK = fit("world").k;
    if (first || region.value) setView(fit(region.value ?? "world"));
    else if (view) setView(view);
    clamp();
    apply();
    relabel();
  });
  resize.observe(svg.value!);
  seen = new IntersectionObserver(([entry]) => {
    live.value = !!entry?.isIntersecting;
    if (live.value) shown.value = true;
  });
  seen.observe(root.value!);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  cancelLeave();
  resize?.disconnect();
  seen?.disconnect();
  root.value?.removeEventListener("wheel", onWheel);
});
</script>

<style lang="scss" scoped>
.atlas {
  --ik: 1;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background:
    radial-gradient(120% 90% at 50% 40%, #121812 0%, #0a0d0a 70%), #0a0d0a;
  isolation: isolate;
}

.atlas__svg {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;

  .is-dragging & {
    cursor: grabbing;
  }
}

.atlas__ocean {
  fill: #0f1511;
  stroke: rgb(233 225 201 / 0.14);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.atlas__grat {
  fill: none;
  stroke: rgb(233 225 201 / 0.06);
  stroke-width: 0.6;
  stroke-dasharray: 2 3;
  vector-effect: non-scaling-stroke;
}

.atlas__land path {
  fill-rule: evenodd;
  stroke: rgb(233 225 201 / 0.2);
  stroke-width: 0.6;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.atlas__land--allies {
  fill: #2a3221;
}

.atlas__land--axis {
  fill: #3a2f23;
}

.atlas__land--occupied {
  fill: #302e22;
}

.atlas__land--neutral {
  fill: #20241b;
}

.atlas__areas text {
  font-family: var(--font-stencil);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.32em;
  text-anchor: middle;
  text-transform: uppercase;
  fill: rgb(233 225 201 / 0.17);
  transition: opacity 0.4s $ease-out;

  .is-deep & {
    opacity: 0;
  }
}

.atlas__arcs path {
  fill: none;
  stroke: var(--gold);
  stroke-width: calc(var(--w) * 1px);
  stroke-linecap: round;
  stroke-dasharray: 3 6;
  opacity: 0.85;
  vector-effect: non-scaling-stroke;
}

.atlas__marker {
  cursor: pointer;
  outline: none;
  transition: opacity 0.3s $ease-out;

  &.is-out {
    opacity: 0;
    pointer-events: none;
  }

  .has-active &:not(.is-active, .is-linked, .is-out) {
    opacity: 0.28;
  }
}

.atlas__dot {
  fill: var(--c);
  stroke: #0b0c09;
  stroke-width: 1.5;
  transform-box: fill-box;
  transform-origin: center;
  transition:
    stroke 0.2s $ease-out,
    scale 0.3s $ease-spring;

  .is-linked > & {
    stroke: var(--gold-2);
  }

  .is-active > & {
    stroke: var(--paper);
    stroke-width: 2;
    scale: 1.35;
  }

  .atlas__marker:focus-visible > & {
    stroke: var(--gold);
    stroke-width: 3;
  }
}

.atlas__pulse {
  fill: none;
  pointer-events: none;
  stroke: var(--c);
  stroke-width: 1.5;
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.atlas__labels text {
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  fill: var(--paper);
  paint-order: stroke;
  stroke: rgb(10 13 10 / 0.9);
  stroke-width: 3px;
  stroke-linejoin: round;
  pointer-events: none;

  &.is-active {
    fill: var(--gold-2);
  }
}

.atlas__label--l {
  text-anchor: end;
}

.atlas__label--t,
.atlas__label--b {
  text-anchor: middle;
}

.atlas__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.1;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  box-shadow: inset 0 0 120px rgb(0 0 0 / 0.55);
}

.atlas__regions {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  pointer-events: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.atlas__region {
  flex: none;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  pointer-events: auto;
  @include panel(0.86);
  transition:
    color 0.2s $ease-out,
    border-color 0.2s $ease-out,
    background-color 0.2s $ease-out;

  &:hover {
    color: var(--text);
    border-color: var(--line-strong);
  }

  &[aria-pressed="true"] {
    color: #17130a;
    background: var(--gold);
    border-color: var(--gold);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

.atlas__zoom {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  display: grid;
  overflow: hidden;
  border-radius: var(--radius-sm);
  @include panel(0.86);

  button {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    color: var(--text);

    & + button {
      border-top: 1px solid var(--line);
    }

    &:hover {
      color: var(--gold);
    }

    &:focus-visible {
      @include focus-ring;
      outline-offset: -2px;
    }
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.atlas__hint {
  position: absolute;
  left: 14px;
  bottom: 12px;
  z-index: 1;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--faint);
  pointer-events: none;

  @include down($bp-sm) {
    display: none;
  }
}

.atlas__card {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  display: grid;
  gap: 8px;
  width: 292px;
  padding: 14px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  @include panel(0.95);

  @include down($bp-sm) {
    top: auto;
    right: 10px;
    bottom: 10px;
    left: 10px;
    width: auto;
    transform: none !important;
  }

  @include motion {
    animation: atlas-card 0.28s $ease-out both;
  }
}

.atlas__card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.atlas__card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
}

.atlas__card-name {
  @include display(1.7rem);
  color: var(--paper);
}

.atlas__card-count {
  font-size: 0.74rem;
  color: var(--gold);
}

.atlas__card-posters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  list-style: none;

  li {
    display: grid;
    gap: 5px;
    align-content: start;
    min-width: 0;
  }
}

.atlas__card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.7rem;
  line-height: 1.25;
  color: var(--muted);
}

.atlas__card-open {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  margin-top: 2px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text);
  transition:
    border-color 0.2s $ease-out,
    color 0.2s $ease-out;

  &:hover,
  &:focus-visible {
    border-color: var(--gold);
    color: var(--gold-2);
  }

  svg {
    width: 15px;
    height: 15px;
  }
}

@include motion {
  .atlas__dot {
    animation: atlas-pop 0.6s $ease-spring both paused;
    animation-delay: calc(120ms + var(--i) * 16ms);

    .is-shown & {
      animation-play-state: running;
    }
  }

  .is-live .atlas__pulse {
    animation: atlas-pulse 2.6s $ease-out infinite;
    animation-delay: calc(var(--i) * 0.3s);
  }

  .atlas__arcs path {
    animation:
      atlas-arc-in 0.5s $ease-out both,
      atlas-dash 1.1s linear infinite;
    animation-delay: calc(var(--i) * 18ms), 0s;
  }
}

@keyframes atlas-pop {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes atlas-pulse {
  from {
    opacity: 0.7;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(2.8);
  }
}

@keyframes atlas-dash {
  to {
    stroke-dashoffset: -9;
  }
}

@keyframes atlas-arc-in {
  from {
    opacity: 0;
  }
}

@keyframes atlas-card {
  from {
    opacity: 0;
    translate: 0 6px;
  }
}
</style>
