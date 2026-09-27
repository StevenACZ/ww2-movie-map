<template>
  <div
    class="map"
    :class="{
      'has-panel': !!selectedCard,
      'sheet-open': sheetOpen,
      'is-cinematic': cinematic,
    }"
  >
    <MapGlobe
      ref="globe"
      class="map__globe"
      :titles="cinematic ? [] : visibleTitles"
      :events="events"
      :t="time"
      :mode="cinematic ? 'terrain' : mode"
      :layers="
        cinematic
          ? {
              ...layers,
              units: false,
              fronts: false,
              events: false,
              labels: false,
            }
          : layers
      "
      :selected="selectedId"
      :journey="journey"
      :active-stop="activeStop"
      :initial="initialView"
      :tags="tags"
      setpieces
      @select="(id: string) => select(id)"
      @setpiece="(id: string) => setPieces?.watch(id as SetPieceId)"
      @cluster="onCluster"
      @hover="onHover"
      @ready="onReady"
      @pointerdown="interacted = true"
      @wheel.capture.passive="interacted = true"
    />

    <MapSidebar
      class="map__side"
      :titles="visibleTitles"
      :selected="selectedId"
      :filtered="filtered"
      :place-label="placeLabel"
      v-model:query="query"
      v-model:kind="kind"
      v-model:gold-only="goldOnly"
      @select="(id: string) => select(id)"
      @reset="resetFilters"
      @clear-place="placeFilter = null"
    />

    <button
      type="button"
      class="map__sheet-toggle"
      :aria-expanded="sheetOpen"
      @click="sheetOpen = !sheetOpen"
    >
      <Icon name="list" />
      {{ t("map.results", { n: visibleTitles.length }) }}
      <Icon :name="sheetOpen ? 'chevron-down' : 'chevron-up'" />
    </button>

    <MapTitlePanel
      v-if="selectedCard"
      :key="selectedCard.id"
      class="map__panel"
      :card="selectedCard"
      :detail="detail"
      :active-stop="activeStop"
      :touring="touring"
      @close="closePanel"
      @stop="goToStop"
      @tour="toggleTour"
    />

    <div class="map__corner">
      <MapLegend
        v-model:mode="mode"
        v-model:layers="layers"
        :open="corner === 'legend'"
        @update:open="(value: boolean) => (corner = value ? 'legend' : null)"
      />
      <MapNations
        :world="world"
        :time="time"
        :open="corner === 'nations'"
        @update:open="(value: boolean) => (corner = value ? 'nations' : null)"
        @focus="focusCountry"
      />
    </div>

    <div class="map__zoom" role="group" :aria-label="t('map.resetView')">
      <button
        type="button"
        class="btn btn--icon"
        :aria-label="t('map.zoomIn')"
        @click="globe?.zoomBy(0.72)"
      >
        <Icon name="plus" />
      </button>
      <button
        type="button"
        class="btn btn--icon"
        :aria-label="t('map.zoomOut')"
        @click="globe?.zoomBy(1.38)"
      >
        <Icon name="minus" />
      </button>
      <button
        type="button"
        class="btn btn--icon"
        :aria-label="t('map.resetView')"
        @click="globe?.resetView()"
      >
        <Icon name="compass" />
      </button>
    </div>

    <Transition name="dispatch">
      <aside v-if="sitrep" class="map__dispatch">
        <p class="map__sitrep-month">{{ formatMonth(time, locale) }}</p>
        <div aria-live="polite">
          <Transition name="dispatch" mode="out-in">
            <p v-if="dispatch" :key="dispatch.id" class="map__sitrep-event">
              <span class="map__dispatch-icon"
                ><Icon :name="CATEGORY_ICONS[dispatch.category] ?? 'flag'"
              /></span>
              <span>
                <span class="map__dispatch-date mono">{{
                  formatDate(dispatch.date, locale)
                }}</span>
                <strong>{{ dispatch.title }}</strong>
              </span>
            </p>
          </Transition>
        </div>
        <div v-if="activeOps.length" class="map__sitrep-ops">
          <span class="map__dispatch-date mono">{{ t("map.inProgress") }}</span>
          <ul>
            <li v-for="op in activeOps" :key="op.id">
              <button
                type="button"
                :title="op.name"
                :style="{ '--c': op.color }"
                @click="globe?.flyTo(op.lonLat, 1.8)"
              >
                {{ op.label }}
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </Transition>

    <MapTimeline
      class="map__timeline"
      :model-value="time"
      :playing="playing"
      :speed="SPEEDS[speedIndex]!"
      :era="era"
      :date-filter="dateFilter"
      :events="events"
      :titles="titles"
      @scrub="onScrub"
      @jump="onJump"
      @toggle-play="togglePlay"
      @speed="speedIndex = (speedIndex + 1) % SPEEDS.length"
      @era="setEra"
      @clear-date="dateFilter = false"
    >
      <template #aside>
        <MapSetPieceMenu
          :time="time"
          @watch="(id: SetPieceId) => setPieces?.watch(id)"
        />
      </template>
    </MapTimeline>

    <div
      v-if="hover"
      class="map__tooltip"
      :style="{
        transform: `translate3d(${hover.x + 14}px, ${hover.y + 14}px, 0)`,
      }"
      aria-hidden="true"
    >
      <strong
        ><img
          v-if="hover.flag"
          :src="hover.flag.file"
          alt=""
          :width="Math.round(hover.flag.ratio * 14)"
          height="14"
        />{{ hover.name }}</strong
      >
      <span :class="`status status--${hover.status}`">{{
        t(`status.${hover.status}`)
      }}</span>
    </div>

    <div
      v-if="cluster"
      class="map__cluster"
      :style="{ left: `${cluster.x}px`, top: `${cluster.y}px` }"
      role="dialog"
      :aria-label="t('map.clusterTitle', { n: cluster.ids.length })"
    >
      <p class="eyebrow">
        {{ t("map.clusterTitle", { n: cluster.ids.length }) }}
      </p>
      <ul data-lenis-prevent>
        <li v-for="id in cluster.ids" :key="id">
          <button type="button" @click="select(id)">
            <span>{{ titleById.get(id)?.title }}</span>
            <small class="mono">{{ titleById.get(id)?.year }}</small>
            <Icon v-if="titleById.get(id)?.gold" name="medal" />
          </button>
        </li>
      </ul>
    </div>

    <p class="map__hint" :class="{ 'is-hidden': interacted }">
      {{ t("map.hint") }}
    </p>

    <MapSetPieces
      ref="setPieces"
      :context="() => globe?.context() ?? null"
      @time="onSetPieceTime"
      @start="onSetPieceStart"
      @end="cinematic = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { Era } from "~~/types/data";
import type {
  EventCard,
  TitleCard,
  TitleDetail,
  WorldData,
} from "~~/types/view";
import type { GlobeContext, GlobeHover, GlobeLayers } from "~/globe/engine";
import type { LonLat } from "~/globe/geo";
import type { SetPieceId } from "~/globe/setpieces/catalog";
import { FACTION_COLORS, type ColorMode } from "~/globe/palette";
import type { IconName } from "~/utils/icons";
import { flagAt, type Flag } from "~/utils/nations";
import {
  ERA_RANGES,
  TIME_MAX,
  formatDate,
  formatMonth,
  toMonths,
} from "~~/shared/utils/time";

definePageMeta({ layout: "map" });

const SPEEDS = [1, 3, 8];
const ERA_FOCUS: Record<Era, string> = {
  ww1: "1916-07-01",
  interwar: "1936-07-18",
  ww2: "1942-11-19",
};
const DEFAULT_DATE = "1942-11-19";
const CATEGORY_ICONS: Record<string, IconName> = {
  war: "swords",
  battle: "crosshair",
  politics: "landmark",
  diplomacy: "handshake",
  holocaust: "flame",
  "home-front": "home",
  technology: "radio",
  naval: "ship",
  air: "plane",
};

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const sound = useSound();
const { data } = await useIndexData();

usePageSeo(() => ({
  path: "/",
  title: t("map.title"),
  description: t("site.description", { count: config.public.titleCount }),
}));

const titles = computed<TitleCard[]>(() => data.value?.titles ?? []);
const events = computed<EventCard[]>(() => data.value?.events ?? []);
const titleById = computed(
  () => new Map(titles.value.map((title) => [title.id, title]))
);

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const haystacks = computed(
  () =>
    new Map(
      titles.value.map((title) => [
        title.id,
        normalize(
          [
            title.title,
            title.altTitle ?? "",
            ...title.stops.map((s) => s.name),
          ].join(" ")
        ),
      ])
    )
);

const queryTitle =
  typeof route.query.title === "string" ? route.query.title : null;
const queryEra = ["ww1", "interwar", "ww2"].includes(String(route.query.era))
  ? (route.query.era as Era)
  : null;
const queryPlace =
  typeof route.query.place === "string" ? route.query.place : null;

const query = ref("");
const kind = ref<"all" | "film" | "series">("all");
const goldOnly = ref(false);
const era = ref<"all" | Era>(queryEra ?? "all");
const placeFilter = ref<string | null>(queryPlace);
const dateFilter = ref(false);
const mode = ref<ColorMode>("side");
const layers = ref<GlobeLayers>({
  units: true,
  fronts: true,
  events: true,
  labels: true,
});
const selectedId = ref<string | null>(null);
const detail = ref<TitleDetail | null>(null);
const activeStop = ref<number | null>(null);
const touring = ref(false);
const playing = ref(false);
const speedIndex = ref(0);
const sheetOpen = ref(false);
const interacted = ref(false);
const hover = ref<{
  name: string;
  flag: Flag | null;
  status: string;
  x: number;
  y: number;
} | null>(null);
const cluster = ref<{ ids: string[]; x: number; y: number } | null>(null);
const corner = ref<"legend" | "nations" | null>(null);
const globe = ref<{
  flyTo: (lonLat: LonLat, distance?: number) => void;
  fitStops: (stops: LonLat[]) => void;
  zoomBy: (factor: number) => void;
  resetView: () => void;
  distance: () => number;
  countryName: (id: string) => string;
  context: () => GlobeContext | null;
}>();
const cinematic = ref(false);
const setPieces = ref<{ watch: (id: SetPieceId) => void }>();

function onSetPieceStart() {
  cinematic.value = true;
  interacted.value = true;
  cluster.value = null;
  sheetOpen.value = false;
  stopTour();
  stopPlaying();
}

function onSetPieceTime(value: number) {
  stopPlaying();
  cancelAnimationFrame(travelFrame);
  time.value = value;
}

function primaryStop(title: TitleCard) {
  return title.stops.find((stop) => stop.primary) ?? title.stops[0];
}

function placeStops(id: string) {
  return titles.value.flatMap((title) =>
    title.stops.filter((stop) => stop.place === id)
  );
}

const initialTitle = queryTitle ? titleById.value.get(queryTitle) : undefined;
const initialDate = initialTitle
  ? (primaryStop(initialTitle)?.date ?? initialTitle.period.start)
  : queryEra
    ? ERA_FOCUS[queryEra]
    : DEFAULT_DATE;
const time = ref(toMonths(initialDate));
const filterMonth = ref(Math.floor(time.value));
const opClock = ref(Math.floor(time.value * 4) / 4);
const world = shallowRef<WorldData | null>(null);

const initialView = (() => {
  if (initialTitle) {
    const stop = primaryStop(initialTitle);
    if (stop) return { lonLat: stop.coordinates, distance: 2.1 };
  }
  if (queryPlace) {
    const stop = placeStops(queryPlace)[0];
    if (stop) return { lonLat: stop.coordinates, distance: 1.7 };
  }
  return undefined;
})();

const placeLabel = computed(() => {
  if (!placeFilter.value) return undefined;
  const names = placeStops(placeFilter.value).map((stop) => stop.name);
  return names.sort((a, b) => a.length - b.length)[0];
});

watch(time, (value) => {
  const month = Math.floor(value);
  if (month !== filterMonth.value) filterMonth.value = month;
  const quarter = Math.floor(value * 4) / 4;
  if (quarter !== opClock.value) opClock.value = quarter;
});

function pathAt(path: LonLat[], fraction: number): LonLat {
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const [lon0, lat0] = path[i - 1]!;
    const [lon1, lat1] = path[i]!;
    const length = Math.hypot(
      (lon1 - lon0) * Math.cos((((lat0 + lat1) / 2) * Math.PI) / 180),
      lat1 - lat0
    );
    lengths.push(length);
    total += length;
  }
  let remaining = fraction * total;
  for (let i = 0; i < lengths.length; i++) {
    const length = lengths[i]!;
    if (remaining <= length) {
      const u = length ? remaining / length : 0;
      const [lon0, lat0] = path[i]!;
      const [lon1, lat1] = path[i + 1]!;
      return [lon0 + (lon1 - lon0) * u, lat0 + (lat1 - lat0) * u];
    }
    remaining -= length;
  }
  return path[path.length - 1]!;
}

const LABEL_BREAK = /:| and the | y la | y el /;

function shortLabel(name: string) {
  const head = name.split(LABEL_BREAK)[0]!.trim();
  return head.length <= 36
    ? head
    : `${head.slice(0, head.lastIndexOf(" ", 34))}…`;
}

const activeOps = computed(() => {
  const operations = world.value?.operations;
  if (!operations) return [];
  const now = opClock.value;
  const index = locale.value === "es" ? 1 : 0;
  const seen = new Set<string>();
  return operations
    .filter(
      (op) =>
        op.path.length &&
        now >= op.start &&
        now <= Math.max(op.end, op.start + 0.6)
    )
    .map((op) => ({
      op,
      weight: op.count * (1 + Math.min(op.end - op.start, 6) / 6),
    }))
    .sort((a, b) => b.weight - a.weight)
    .map(({ op }) => ({ op, label: shortLabel(op.name[index]) }))
    .filter(({ label }) => !seen.has(label) && !!seen.add(label))
    .slice(0, 3)
    .map(({ op, label }) => {
      const fraction = Math.max(
        0,
        Math.min(1, (now - op.start) / Math.max(op.end - op.start, 0.01))
      );
      return {
        id: op.id,
        lonLat: pathAt(op.path, fraction),
        label,
        name: op.name[index],
        color: FACTION_COLORS[op.faction] ?? FACTION_COLORS.neutral!,
      };
    });
});

const sitrep = computed(() => dateFilter.value || playing.value);
const tags = computed(() => (sitrep.value ? activeOps.value : []));

const filtered = computed(
  () =>
    !!query.value ||
    kind.value !== "all" ||
    goldOnly.value ||
    era.value !== "all" ||
    dateFilter.value ||
    !!placeFilter.value
);

const visibleTitles = computed(() => {
  const q = normalize(query.value.trim());
  const month = dateFilter.value ? filterMonth.value : 0;
  return titles.value.filter((title) => {
    if (era.value !== "all" && title.era !== era.value) return false;
    if (kind.value !== "all" && title.kind !== kind.value) return false;
    if (goldOnly.value && !title.gold) return false;
    if (
      placeFilter.value &&
      !title.stops.some((stop) => stop.place === placeFilter.value)
    )
      return false;
    if (dateFilter.value) {
      const start = toMonths(title.period.start);
      const end = toMonths(title.period.end) + 1;
      if (start > month + 2 || end < month - 1) return false;
    }
    if (q && !haystacks.value.get(title.id)?.includes(q)) return false;
    return true;
  });
});

const selectedCard = computed(() =>
  selectedId.value ? titleById.value.get(selectedId.value) : undefined
);

const journey = computed(() => {
  const card = selectedCard.value;
  if (!card) return null;
  const stops = detail.value?.journey ?? card.stops;
  return stops.map((stop) => ({ lonLat: stop.coordinates, label: stop.name }));
});

const dispatch = computed(() => {
  if (!dateFilter.value && !playing.value) return null;
  const now = time.value;
  let best: EventCard | null = null;
  for (const event of events.value) {
    const at = toMonths(event.date);
    if (
      at <= now + 0.1 &&
      at >= now - 1.4 &&
      (!best || at > toMonths(best.date))
    )
      best = event;
  }
  return best;
});

let travelFrame = 0;
function travelTo(target: number, duration = 900) {
  cancelAnimationFrame(travelFrame);
  const from = time.value;
  const clamped = Math.max(0, Math.min(TIME_MAX - 0.01, target));
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    Math.abs(clamped - from) < 0.05
  ) {
    time.value = clamped;
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const u = Math.min(1, (now - start) / duration);
    const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    time.value = from + (clamped - from) * e;
    if (u < 1) travelFrame = requestAnimationFrame(step);
  };
  travelFrame = requestAnimationFrame(step);
}

let playFrame = 0;
let playLast = 0;
function playStep(now: number) {
  const dt = Math.min(0.1, (now - playLast) / 1000);
  playLast = now;
  const next = time.value + dt * 1.5 * SPEEDS[speedIndex.value]!;
  if (next >= TIME_MAX - 0.01) {
    time.value = TIME_MAX - 0.01;
    playing.value = false;
    return;
  }
  time.value = next;
  playFrame = requestAnimationFrame(playStep);
}

function togglePlay() {
  interacted.value = true;
  if (playing.value) {
    playing.value = false;
    cancelAnimationFrame(playFrame);
    return;
  }
  cancelAnimationFrame(travelFrame);
  if (time.value >= TIME_MAX - 0.5) time.value = 0;
  playing.value = true;
  dateFilter.value = true;
  sound.play("click");
  playLast = performance.now();
  playFrame = requestAnimationFrame(playStep);
}

function stopPlaying() {
  playing.value = false;
  cancelAnimationFrame(playFrame);
}

function onScrub(value: number) {
  interacted.value = true;
  stopPlaying();
  cancelAnimationFrame(travelFrame);
  time.value = value;
  dateFilter.value = true;
}

function onJump(value: number) {
  interacted.value = true;
  stopPlaying();
  dateFilter.value = true;
  travelTo(value);
}

function setEra(value: "all" | Era) {
  interacted.value = true;
  stopPlaying();
  era.value = value;
  dateFilter.value = false;
  if (value !== "all") {
    sound.play(value);
    const [from, to] = ERA_RANGES[value];
    if (time.value < from || time.value > to)
      travelTo(toMonths(ERA_FOCUS[value]), 1200);
  } else {
    sound.play("click");
  }
}

function resetFilters() {
  query.value = "";
  kind.value = "all";
  goldOnly.value = false;
  era.value = "all";
  dateFilter.value = false;
  placeFilter.value = null;
}

let tourTimer: ReturnType<typeof setTimeout> | undefined;
function stopTour() {
  touring.value = false;
  clearTimeout(tourTimer);
}

async function select(
  id: string,
  options: { fly?: boolean; travel?: boolean; silent?: boolean } = {}
) {
  const card = titleById.value.get(id);
  if (!card) return;
  interacted.value = true;
  cluster.value = null;
  sheetOpen.value = false;
  stopTour();
  stopPlaying();
  selectedId.value = id;
  activeStop.value = null;
  detail.value = null;
  if (!options.silent) sound.play(card.era);
  if (route.query.title !== id) void router.replace({ query: { title: id } });
  const stop = primaryStop(card);
  if (options.travel !== false && stop) travelTo(toMonths(stop.date), 1100);
  if (options.fly !== false)
    globe.value?.fitStops(card.stops.map((s) => s.coordinates));
  try {
    const loaded = await $fetch<TitleDetail>(
      `/data/titles/${locale.value}/${id}.json`
    );
    if (selectedId.value === id) detail.value = loaded;
  } catch {
    if (selectedId.value === id) detail.value = null;
  }
}

function closePanel() {
  stopTour();
  selectedId.value = null;
  detail.value = null;
  activeStop.value = null;
  void router.replace({ query: {} });
}

function goToStop(index: number) {
  const card = selectedCard.value;
  const stops = detail.value?.journey ?? card?.stops;
  const stop = stops?.[index];
  if (!stop) return;
  if (activeStop.value === index && !touring.value) {
    activeStop.value = null;
    return;
  }
  activeStop.value = index;
  globe.value?.flyTo(stop.coordinates, 1.75);
  travelTo(toMonths(stop.date), 800);
}

function toggleTour() {
  if (touring.value) {
    stopTour();
    return;
  }
  const stops = detail.value?.journey ?? selectedCard.value?.stops ?? [];
  if (stops.length < 2) return;
  touring.value = true;
  sound.play("whoosh");
  let index = 0;
  const next = () => {
    if (!touring.value) return;
    goToStop(index);
    index++;
    if (index < stops.length) tourTimer = setTimeout(next, 4800);
    else tourTimer = setTimeout(() => (touring.value = false), 4800);
  };
  next();
}

function onCluster(ids: string[], x: number, y: number) {
  interacted.value = true;
  const first = titleById.value.get(ids[0]!);
  const stop = first ? primaryStop(first) : undefined;
  const distance = globe.value?.distance() ?? 3;
  if (stop && distance > 1.5) {
    cluster.value = null;
    globe.value?.flyTo(stop.coordinates, Math.max(1.3, distance * 0.55));
    return;
  }
  cluster.value = {
    ids,
    x: Math.min(x, window.innerWidth - 280),
    y: Math.min(y, window.innerHeight - 260),
  };
}

function onHover(value: GlobeHover | null) {
  hover.value = value
    ? {
        name: globe.value?.countryName(value.id) ?? value.id,
        flag: world.value ? flagAt(world.value, value.id, time.value) : null,
        status: value.status,
        x: value.x,
        y: value.y,
      }
    : null;
}

function focusCountry(id: string) {
  const label = world.value?.countries[id]?.label;
  if (label) globe.value?.flyTo(label, 2.2);
}

function onReady(data: WorldData) {
  world.value = data;
  if (queryTitle && titleById.value.has(queryTitle)) {
    void select(queryTitle, { fly: true, travel: false, silent: true });
  }
}

function onKey(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  if (cluster.value) cluster.value = null;
  else if (selectedId.value) closePanel();
}

function onDocumentClick(event: MouseEvent) {
  if (
    cluster.value &&
    !(event.target as HTMLElement).closest(".map__cluster, .gc")
  )
    cluster.value = null;
}

watch(
  () => route.query.title,
  (value) => {
    if (!value && selectedId.value) closePanel();
    else if (typeof value === "string" && value !== selectedId.value)
      void select(value, { silent: true });
  }
);

onMounted(() => {
  window.addEventListener("keydown", onKey);
  document.addEventListener("click", onDocumentClick);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  document.removeEventListener("click", onDocumentClick);
  cancelAnimationFrame(playFrame);
  cancelAnimationFrame(travelFrame);
  clearTimeout(tourTimer);
});
</script>

<style lang="scss" scoped>
.map {
  --side-w: 360px;
  --panel-w: 400px;
  --edge: 16px;
  --timeline-h: 136px;
  position: absolute;
  inset: 0;
  overflow: hidden;

  :deep(.globe-overlay) {
    mask-image: linear-gradient(
      to bottom,
      transparent calc(var(--header-h) - 6px),
      #000 calc(var(--header-h) + 18px)
    );
  }
}

.map__side {
  position: absolute;
  z-index: 20;
  left: var(--edge);
  top: calc(var(--header-h) + 4px);
  bottom: var(--edge);
  width: var(--side-w);

  @include down($bp-md) {
    left: 8px;
    right: 8px;
    top: auto;
    bottom: calc(var(--timeline-h) + 8px);
    width: auto;
    height: min(62dvh, 520px);
    transform: translateY(calc(100% + var(--timeline-h) + 20px));
    transition: transform 0.45s $ease-out;

    .sheet-open & {
      transform: none;
    }
  }
}

.map__sheet-toggle {
  display: none;

  @include down($bp-md) {
    position: absolute;
    z-index: 21;
    left: 50%;
    bottom: calc(var(--timeline-h) + 16px);
    translate: -50% 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    @include panel(0.94);
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    box-shadow: var(--shadow);
    transition: bottom 0.45s $ease-out;

    svg {
      width: 16px;
      height: 16px;
      color: var(--gold);
    }

    .sheet-open & {
      bottom: calc(var(--timeline-h) + min(62dvh, 520px) + 16px);
    }

    .has-panel & {
      display: none;
    }
  }
}

.map__panel {
  position: absolute;
  z-index: 30;
  right: var(--edge);
  top: calc(var(--header-h) + 4px);
  bottom: var(--edge);
  width: var(--panel-w);

  @include down($bp-md) {
    left: 8px;
    right: 8px;
    top: auto;
    bottom: 8px;
    width: auto;
    height: min(72dvh, 640px);
  }
}

@mixin corner-row {
  flex-direction: row;
  align-items: flex-start;
  width: auto;

  :deep(.legend),
  :deep(.nations) {
    width: auto;
    overflow: visible;
  }

  :deep(.legend__body),
  :deep(.nations__body) {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: min(280px, calc(100vw - 16px));
    padding-top: 12px;
    border-radius: var(--radius);
    @include panel(1);
    box-shadow: var(--shadow);
  }

  :deep(.nations__title) {
    @include visually-hidden;
  }
}

.map__corner {
  position: absolute;
  z-index: 19;
  right: var(--edge);
  top: calc(var(--header-h) + 4px);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;

  .has-panel & {
    right: calc(var(--panel-w) + var(--edge) * 2);
  }

  @media (max-width: 1099px) {
    .has-panel & {
      display: none;
    }
  }

  @media (max-width: 1405px) {
    .has-panel & {
      @include corner-row;
    }
  }

  @media (max-width: 989px) {
    @include corner-row;
  }

  @include down($bp-md) {
    right: 8px;

    .has-panel & {
      display: none;
    }
  }
}

.map__zoom {
  position: absolute;
  z-index: 15;
  right: var(--edge);
  bottom: calc(var(--timeline-h) + var(--edge) + 10px);
  display: flex;
  flex-direction: column;
  gap: 6px;

  .btn {
    @include panel(0.88);
    width: 40px;
    min-height: 40px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .has-panel & {
    right: calc(var(--panel-w) + var(--edge) * 2);
  }

  @include down($bp-md) {
    display: none;
  }
}

.map__timeline {
  position: absolute;
  z-index: 25;
  left: calc(var(--side-w) + var(--edge) * 2);
  right: var(--edge);
  bottom: var(--edge);

  .has-panel & {
    right: calc(var(--panel-w) + var(--edge) * 2);
  }

  @include down($bp-lg) {
    left: var(--edge);
  }

  @include down($bp-md) {
    left: 8px;
    right: 8px;
    bottom: 8px;
    padding: 10px 12px 10px;

    .has-panel & {
      display: none;
    }
  }
}

@include up($bp-md) {
  .map__side {
    @include down($bp-lg) {
      bottom: calc(var(--timeline-h) + var(--edge) + 10px);
    }
  }
}

.map.is-cinematic {
  .map__side,
  .map__panel,
  .map__corner,
  .map__zoom,
  .map__dispatch,
  .map__sheet-toggle,
  .map__hint,
  .map__timeline {
    opacity: 0;
    pointer-events: none;
  }
}

.map__side,
.map__panel,
.map__corner,
.map__zoom,
.map__sheet-toggle,
.map__timeline {
  transition: opacity 0.4s $ease-out;
}

.map__dispatch {
  --legend-room: calc(250px + 12px);
  position: absolute;
  z-index: 18;
  left: calc(var(--side-w) + var(--edge) * 2);
  right: calc(var(--edge) + var(--legend-room));
  top: calc(var(--header-h) + 4px);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 440px;
  padding: 10px 12px 12px;
  border-radius: 12px;
  @include panel(1);
  box-shadow: var(--shadow);

  strong {
    display: block;
    font-family: var(--font-display);
    font-size: 1.08rem;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    line-height: 1.1;
  }

  .has-panel & {
    right: calc(var(--panel-w) + var(--edge) * 2 + var(--legend-room));
  }

  @media (max-width: 989px) {
    --legend-room: 0px;
    top: calc(var(--header-h) + 56px);
  }

  @media (max-width: 1405px) {
    .has-panel & {
      --legend-room: 0px;
      top: calc(var(--header-h) + 56px);
    }
  }

  @media (max-width: 1099px) {
    .has-panel & {
      top: calc(var(--header-h) + 4px);
    }
  }

  @include down($bp-md) {
    left: 16px;
    right: 16px;
  }
}

.map__sitrep-month {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gold);
}

.map__sitrep-event {
  display: flex;
  align-items: center;
  gap: 12px;
}

.map__sitrep-ops {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--line);

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    list-style: none;
  }

  li:nth-child(n + 3) {
    @include down($bp-md) {
      display: none;
    }
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 28px;
    padding: 3px 10px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--paper);
    transition: border-color 0.2s $ease-out;

    &::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--c);
      box-shadow: 0 0 6px var(--c);
    }

    &:hover {
      border-color: var(--c);
    }
  }
}

.map__dispatch-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgb(200 65 47 / 0.2);
  color: var(--red-2);

  svg {
    width: 18px;
    height: 18px;
  }
}

.map__dispatch-date {
  display: block;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.dispatch-enter-active,
.dispatch-leave-active {
  transition:
    opacity 0.35s $ease-out,
    transform 0.35s $ease-out;
}

.dispatch-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.dispatch-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.map__tooltip {
  position: absolute;
  z-index: 40;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 10px;
  @include panel(0.96);
  pointer-events: none;
  font-size: 0.8rem;

  strong {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-display);
    font-size: 1rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  img {
    flex: none;
    height: 14px;
    width: auto;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.55);
  }
}

.status {
  color: var(--muted);

  &--allies,
  &--entente {
    color: var(--blue);
  }

  &--axis,
  &--central,
  &--occupied-axis,
  &--occupied-central {
    color: #c9ccbd;
  }

  &--soviet,
  &--occupied-soviet,
  &--war {
    color: var(--red-2);
  }
}

.map__cluster {
  position: fixed;
  z-index: 50;
  width: 270px;
  padding: 12px;
  border-radius: 12px;
  @include panel(0.96);
  box-shadow: var(--shadow);

  .eyebrow {
    margin-bottom: 8px;
  }

  ul {
    list-style: none;
    max-height: 220px;
    overflow-y: auto;
  }

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 8px;
    border-radius: 8px;
    text-align: left;
    font-weight: 600;

    &:hover {
      background: rgb(236 230 214 / 0.08);
    }

    small {
      margin-left: auto;
      color: var(--faint);
    }

    svg {
      width: 14px;
      height: 14px;
      color: var(--gold);
    }
  }
}

.map__hint {
  position: absolute;
  z-index: 10;
  left: calc(50% + (var(--side-w) + var(--edge)) / 2);
  bottom: calc(var(--timeline-h) + var(--edge) + 18px);
  translate: -50% 0;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgb(11 12 9 / 0.6);
  font-size: 0.78rem;
  color: var(--muted);
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.6s $ease-out;

  &.is-hidden {
    opacity: 0;
  }

  @include down($bp-lg) {
    display: none;
  }
}
</style>
