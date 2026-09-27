<template>
  <div ref="host" class="globe" :class="{ 'is-ready': ready }">
    <div v-if="!ready && !failed" class="globe__loading" role="status">
      <span class="globe__spinner" aria-hidden="true" />
      <span>{{ t("map.loading") }}</span>
    </div>
    <p v-if="failed" class="globe__fallback" role="status">
      {{ t("map.webglFallback") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { EventCard, TitleCard, WorldData } from "~~/types/view";
import type { GlobeEngine, GlobeHover, GlobeLayers } from "~/globe/engine";
import type { LonLat } from "~/globe/geo";
import type { TagInput } from "~/globe/overlay";
import type { PaletteMode } from "~/globe/palette";
import { TMDB_IMAGE } from "~/utils/seo";
import { SET_PIECE_BY_EVENT, SET_PIECES } from "~/globe/setpieces/catalog";

const props = withDefaults(
  defineProps<{
    titles: TitleCard[];
    events: EventCard[];
    t: number;
    mode: PaletteMode;
    layers: GlobeLayers;
    selected: string | null;
    journey: { lonLat: LonLat; label: string }[] | null;
    activeStop: number | null;
    initial?: { lonLat: LonLat; distance?: number };
    lazy?: boolean;
    zoom?: boolean;
    fit?: LonLat[];
    tags?: TagInput[];
    setpieces?: boolean;
  }>(),
  { zoom: true }
);

const emit = defineEmits<{
  select: [id: string];
  cluster: [ids: string[], x: number, y: number];
  hover: [hover: GlobeHover | null];
  ready: [world: WorldData];
  setpiece: [id: string];
}>();

const { t, locale } = useI18n();
const host = ref<HTMLElement>();
const ready = ref(false);
const failed = ref(false);
let engine: GlobeEngine | undefined;
let world: WorldData | undefined;

function primaryStop(title: TitleCard) {
  return title.stops.find((stop) => stop.primary) ?? title.stops[0];
}

function pushMarkers() {
  engine?.setMarkers(
    props.titles.flatMap((title) => {
      const stop = primaryStop(title);
      if (!stop) return [];
      return [
        {
          id: title.id,
          lonLat: stop.coordinates,
          title: title.title,
          year: title.year,
          era: title.era,
          gold: title.gold,
          ...(title.poster ? { poster: title.poster } : {}),
        },
      ];
    })
  );
}

function pushLabels() {
  if (!engine || !world) return;
  const index = locale.value === "es" ? 1 : 0;
  engine.setLabels(
    Object.entries(world.countries).flatMap(([id, country]) =>
      country.label
        ? [
            {
              id,
              lonLat: country.label,
              name: country.name[index],
              rank: country.labelRank ?? 3,
            },
          ]
        : []
    )
  );
}

function pushEvents() {
  if (!engine) return;
  const located = props.events.filter((event) => event.coordinates);
  engine.setEvents(
    located.map((event) => ({
      id: event.id,
      lonLat: event.coordinates!,
      t: toMonths(event.date),
      major: !!event.major,
    }))
  );
  const cta = t("setpieces.in3d");
  engine.setEventLabels(
    new Map(located.map((event) => [event.id, event.title])),
    new Map(
      props.setpieces
        ? located.flatMap((event) => {
            const id = SET_PIECE_BY_EVENT.get(event.id);
            return id ? [[event.id, { id, cta }] as const] : [];
          })
        : []
    )
  );
}

function pushPieces() {
  if (!engine) return;
  const cta = t("setpieces.in3d");
  engine.setPieces(
    props.setpieces
      ? SET_PIECES.map((piece) => ({
          id: piece.id,
          lonLat: piece.at,
          t: toMonths(piece.date),
          title: t(`setpieces.scenes.${piece.id}.title`),
          date: formatDate(piece.date, locale.value),
          cta,
          icon: piece.vignette,
        }))
      : []
  );
}

async function init() {
  try {
    const [{ GlobeEngine, webglAvailable }, data] = await Promise.all([
      import("~/globe/engine"),
      $fetch<WorldData>("/data/world.json"),
    ]);
    if (!host.value) return;
    if (!webglAvailable()) {
      failed.value = true;
      return;
    }
    world = data;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    engine = new GlobeEngine({
      container: host.value,
      world: data,
      mobile: window.innerWidth < 900,
      reducedMotion,
      posterBase: `${TMDB_IMAGE}/w92`,
      ...(props.initial ? { initial: props.initial } : {}),
      zoom: props.zoom !== false,
      onSelect: (id) => emit("select", id),
      onCluster: (ids, x, y) => emit("cluster", ids, x, y),
      onHover: (hover) => emit("hover", hover),
      onSetPiece: (id) => emit("setpiece", id),
      onError: () => {
        failed.value = true;
      },
    });
    engine.setLayers(props.layers);
    engine.setMode(props.mode);
    engine.setTime(props.t, false);
    pushMarkers();
    pushLabels();
    pushEvents();
    pushPieces();
    engine.select(props.selected);
    engine.showJourney(props.journey);
    engine.setTags(props.tags ?? []);
    ready.value = true;
    emit("ready", data);
    const idle =
      window.requestIdleCallback ??
      ((fn: () => void) => window.setTimeout(fn, 1200));
    if (props.fit?.length) engine.fitStops(props.fit);
    if (!props.lazy) {
      const queue = ["1938", "1945", "1930", "1914", "1920"];
      const next = () => {
        const key = queue.shift();
        if (!key || !engine) return;
        engine.preload([key]);
        window.setTimeout(() => idle(next), 1500);
      };
      window.setTimeout(() => idle(next), 2500);
    }
  } catch {
    failed.value = true;
  }
}

let observer: IntersectionObserver | undefined;

onMounted(() => {
  if (!props.lazy) {
    void init();
    return;
  }
  let started = false;
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !started) {
        started = true;
        void init();
      }
      engine?.setVisible(visible);
    },
    { rootMargin: "200px" }
  );
  if (host.value) observer.observe(host.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  engine?.dispose();
  engine = undefined;
});

watch(() => props.titles, pushMarkers);
watch(
  () => [props.tags, props.layers.units] as const,
  ([tags]) => engine?.setTags(tags ?? [])
);
watch(() => props.events, pushEvents);
watch(locale, () => {
  pushLabels();
  pushEvents();
  pushPieces();
});
watch(
  () => props.t,
  (value) => engine?.setTime(value)
);
watch(
  () => props.mode,
  (value) => engine?.setMode(value)
);
watch(
  () => props.layers,
  (value) => engine?.setLayers(value),
  { deep: true }
);
watch(
  () => props.selected,
  (value) => engine?.select(value)
);
watch(
  () => props.journey,
  (value) => engine?.showJourney(value)
);
watch(
  () => props.fit,
  (value) => {
    if (value?.length) engine?.fitStops(value);
  }
);
watch(
  () => props.activeStop,
  (value) => engine?.setActiveStop(value)
);

defineExpose({
  flyTo: (lonLat: LonLat, distance?: number) => engine?.flyTo(lonLat, distance),
  fitStops: (stops: LonLat[]) => engine?.fitStops(stops),
  zoomBy: (factor: number) => engine?.zoomBy(factor),
  resetView: () => engine?.resetView(),
  context: () => engine?.context ?? null,
  distance: () => engine?.distance ?? 3,
  countryName: (id: string) => {
    const country = world?.countries[id];
    return country ? country.name[locale.value === "es" ? 1 : 0] : id;
  },
});
</script>

<style lang="scss" scoped>
.globe {
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(60% 55% at 50% 48%, rgb(40 44 32 / 0.55), transparent 70%),
    radial-gradient(120% 90% at 50% 40%, #11130d, #060705 75%);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgb(236 230 214 / 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgb(236 230 214 / 0.035) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(70% 70% at 50% 50%, #000 40%, transparent 100%);
    pointer-events: none;
  }
}

:deep(.globe-canvas) {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  opacity: 0;
  transform: scale(0.94);
  transition:
    opacity 1.2s $ease-out,
    transform 1.6s $ease-out;
  touch-action: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.globe.is-ready :deep(.globe-canvas) {
  opacity: 1;
  transform: none;
}

.globe__loading,
.globe__fallback {
  position: absolute;
  left: 50%;
  top: 46%;
  translate: -50% -50%;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(90vw, 420px);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: center;
  color: var(--muted);
}

.globe__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--line-strong);
  border-top-color: var(--gold);
  border-radius: 50%;

  @include motion {
    animation: spin 0.9s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style lang="scss">
.globe-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.globe-overlay__labels,
.globe-overlay__stops,
.globe-overlay__markers {
  position: absolute;
  inset: 0;
}

.globe-overlay__markers {
  z-index: 1;
}

.gl,
.gm,
.gs,
.ge,
.gt,
.gp,
.gc {
  will-change: transform, opacity;
}

.gl.is-off,
.gm.is-hidden,
.gp.is-hidden {
  will-change: auto;
}

.globe-overlay__stops {
  z-index: 2;
}

.gl {
  position: absolute;
  left: 0;
  top: 0;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgb(236 230 214 / 0.62);
  text-shadow:
    0 1px 2px rgb(0 0 0 / 0.9),
    0 0 12px rgb(0 0 0 / 0.6);
  transition: opacity 0.3s linear;

  &.is-off {
    visibility: hidden;
    transition:
      opacity 0.3s linear,
      visibility 0s 0.3s;
  }

  &--r1 {
    font-size: 15px;
  }

  &--r2 {
    font-size: 12px;
  }

  &--r3 {
    font-size: 10px;
    letter-spacing: 0.16em;
  }

  &--r4 {
    font-size: 9px;
    letter-spacing: 0.12em;
  }
}

.gm {
  --c: #8f9b63;
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: auto;
  transition: opacity 0.25s linear;

  &--ww1 {
    --c: #c49a5c;
  }

  &--interwar {
    --c: #c5634f;
  }

  &--gold {
    --c: var(--gold);
  }

  &.is-hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .has-selection &:not(.is-selected) {
    filter: saturate(0.3) brightness(0.55);
  }
}

.gm__pin {
  position: absolute;
  left: 0;
  top: 0;
  width: 14px;
  height: 14px;
  translate: -50% -50%;
  rotate: 45deg;
  scale: var(--gk, 1);
  background: var(--c);
  border: 1.5px solid #0b0c09;
  box-shadow:
    0 0 0 1px rgb(236 230 214 / 0.35),
    0 4px 12px rgb(0 0 0 / 0.6);
  transition:
    scale 0.25s $ease-spring,
    box-shadow 0.25s $ease-out;

  .gm--gold & {
    box-shadow:
      0 0 0 1px rgb(243 215 142 / 0.8),
      0 0 16px rgb(216 174 82 / 0.55);
  }

  .gm--poster & {
    width: 30px;
    height: 45px;
    rotate: none;
    translate: -50% -100%;
    transform-origin: 50% 100%;
    border-radius: 4px;
    border: 1px solid rgb(236 230 214 / 0.35);
    overflow: hidden;
    background: #1d2016;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .gm--poster.gm--gold & {
    border-color: var(--gold);
  }

  .gm:hover &,
  .gm:focus-visible &,
  .gm.is-selected & {
    scale: calc(var(--gk, 1) * 1.35);
  }

  .gm.is-selected & {
    box-shadow:
      0 0 0 2px var(--gold-2),
      0 0 24px rgb(243 215 142 / 0.7);
  }
}

.gm__label {
  position: absolute;
  left: calc(7px + 7px * var(--gk, 1));
  top: 0;
  translate: 0 -50%;
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgb(11 12 9 / 0.88);
  border: 1px solid var(--line-strong);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--text);
  opacity: 0;
  scale: 0.92;
  transform-origin: left center;
  transition:
    opacity 0.2s $ease-out,
    scale 0.2s $ease-out;
  pointer-events: none;

  small {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--muted);
  }

  .gm--poster & {
    left: calc(5px + 15px * var(--gk, 1));
    top: calc(-2px - 22px * var(--gk, 1));
  }

  .gm:hover &,
  .gm:focus-visible &,
  .gm.is-selected & {
    opacity: 1;
    scale: 1;
  }

  .gm.is-selected & {
    border-color: var(--gold);
  }
}

.gm:focus-visible {
  outline: none;

  .gm__pin {
    outline: 2px solid var(--gold);
    outline-offset: 3px;
  }
}

.gc {
  position: absolute;
  left: 0;
  top: 0;
  margin: calc(-24px * var(--gk, 1)) 0 0 calc(6px * var(--gk, 1));
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--text);
  color: #12130d;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  pointer-events: auto;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.5);
  z-index: 40;
  transition: background-color 0.2s $ease-out;

  &:hover {
    background: var(--gold-2);
  }

  &[hidden] {
    display: none;
  }
}

.gt {
  position: absolute;
  left: 0;
  top: 0;
  margin: -30px 0 0 10px;
  padding: 2px 7px 2px 16px;
  border-radius: 4px;
  background: rgb(11 12 9 / 0.78);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--paper);
  pointer-events: none;
  transition: opacity 0.3s linear;

  &::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 50%;
    width: 5px;
    height: 5px;
    margin-top: -2.5px;
    border-radius: 50%;
    background: var(--c);
    box-shadow: 0 0 6px var(--c);
  }
}

.gs {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: -12px 0 0 -12px;
  pointer-events: none;

  b {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--gold);
    color: #17130a;
    font-family: var(--font-mono);
    font-size: 11px;
    box-shadow:
      0 0 0 3px rgb(11 12 9 / 0.8),
      0 0 18px rgb(216 174 82 / 0.6);
  }

  span {
    padding: 3px 8px;
    border-radius: 6px;
    background: rgb(11 12 9 / 0.8);
    font-size: 12px;
    font-weight: 600;
    color: var(--paper);
    max-width: 40vw;
    opacity: 0.85;
  }

  b {
    position: relative;
    transition:
      scale 0.4s $ease-spring,
      background-color 0.3s $ease-out;

    &::before,
    &::after {
      content: "";
      position: absolute;
      inset: -3px;
      border: 2px solid var(--gold-2);
      border-radius: 50%;
      opacity: 0;
      pointer-events: none;
    }
  }

  &.is-active {
    z-index: 1;
    gap: 14px;
  }

  &.gs--twin {
    translate: 0 -30px;
  }

  &.gs--twin:not(.is-active) span {
    display: none;
  }

  &.is-active b {
    scale: 1.45;
    background: var(--gold-2);

    &::before,
    &::after {
      opacity: 0.8;
    }
  }

  &.is-active span {
    opacity: 1;
    border: 1px solid var(--gold);
  }

  @media (prefers-reduced-motion: no-preference) {
    animation: stop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    animation-delay: calc(var(--i) * 120ms + 300ms);

    &.is-active b::before,
    &.is-active b::after {
      animation: stop-ping 2.2s $ease-out infinite;
    }

    &.is-active b::after {
      animation-delay: 1.1s;
    }
  }
}

@keyframes stop-ping {
  from {
    opacity: 0.85;
    scale: 1;
  }
  to {
    opacity: 0;
    scale: 3.2;
  }
}

@keyframes stop-in {
  from {
    opacity: 0;
    scale: 0.4;
  }
}

.ge {
  position: absolute;
  left: 0;
  top: 0;
  margin: 14px 0 0 12px;
  max-width: 220px;
  padding: 4px 9px;
  border-radius: 6px;
  border: 1px solid rgb(216 174 82 / 0.45);
  background: rgb(11 12 9 / 0.82);
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--paper);
  pointer-events: none;

  &--major {
    border-color: rgb(224 69 47 / 0.6);
  }

  &--3d {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 3px 10px 3px 3px;
    border-radius: 999px;
    border-color: var(--gold);
    background: rgb(20 17 9 / 0.92);
    box-shadow: 0 0 18px rgb(216 174 82 / 0.28);
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    pointer-events: auto;
    transition:
      background-color 0.2s ease,
      box-shadow 0.2s ease;

    b {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 3px 7px 3px 6px;
      border-radius: 999px;
      background: var(--gold);
      color: #17130a;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;

      &::before {
        content: "";
        border-block: 4px solid transparent;
        border-left: 6px solid currentColor;
      }
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover,
    &:focus-visible {
      outline: none;
      background: rgb(40 32 14 / 0.96);
      box-shadow: 0 0 26px rgb(216 174 82 / 0.5);
    }
  }
}

.gp {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  width: 0;
  height: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--gold-2);
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 0.25s linear;

  &.is-hidden {
    visibility: hidden;
    pointer-events: none;
  }

  &:focus-visible {
    outline: none;
  }
}

.gp__badge {
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  translate: -50% -50%;
  border-radius: 50%;
  border: 1.5px solid var(--gold);
  background: radial-gradient(circle at 50% 35%, #2b2412, #120f07 75%);
  box-shadow:
    0 0 0 3px rgb(11 12 9 / 0.7),
    0 0 20px rgb(216 174 82 / 0.45);
  transition:
    scale 0.25s $ease-spring,
    box-shadow 0.25s $ease-out;

  svg {
    width: 26px;
    height: 23px;
  }

  b {
    position: absolute;
    right: -9px;
    bottom: -5px;
    padding: 1px 5px;
    border-radius: 999px;
    background: var(--gold);
    color: #17130a;
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    line-height: 1.4;
  }

  .gp:hover &,
  .gp:focus-visible & {
    scale: 1.14;
    box-shadow:
      0 0 0 3px rgb(11 12 9 / 0.75),
      0 0 30px rgb(243 215 142 / 0.7);
  }

  .gp:focus-visible & {
    outline: 2px solid var(--gold-2);
    outline-offset: 3px;
  }
}

.gp__label {
  position: absolute;
  left: 30px;
  top: 0;
  translate: 0 -50%;
  display: grid;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid var(--gold);
  background: rgb(14 12 7 / 0.94);
  white-space: nowrap;
  text-align: left;
  opacity: 0;
  scale: 0.94;
  transform-origin: left center;
  transition:
    opacity 0.2s $ease-out,
    scale 0.2s $ease-out;
  pointer-events: none;

  strong {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text);
  }

  small {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--gold-2);
  }

  .gp:hover &,
  .gp:focus-visible & {
    opacity: 1;
    scale: 1;
  }
}
</style>
