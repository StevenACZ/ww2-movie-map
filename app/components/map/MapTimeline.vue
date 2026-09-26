<template>
  <section class="tl" :aria-label="t('map.timeline')">
    <div class="tl__controls">
      <button
        type="button"
        class="btn btn--icon tl__play"
        :class="{ 'is-playing': playing }"
        :aria-label="playing ? t('map.pause') : t('map.play')"
        :title="playing ? t('map.pause') : t('map.play')"
        @click="$emit('toggle-play')"
      >
        <Icon :name="playing ? 'pause' : 'play'" />
      </button>
      <button
        type="button"
        class="tl__speed mono"
        :aria-label="`${t('map.speed')}: ${speed}×`"
        @click="$emit('speed')"
      >
        {{ speed }}×
      </button>
      <div class="tl__eras" role="group" :aria-label="t('era.all')">
        <button
          v-for="key in ERA_KEYS"
          :key="key"
          type="button"
          class="chip tl__era"
          :class="`tl__era--${key}`"
          :aria-pressed="era === key"
          @click="$emit('era', key)"
        >
          {{ t(`era.short.${key}`) }}
        </button>
      </div>
      <Transition name="fade">
        <p v-if="dateFilter" class="tl__filter" aria-live="polite">
          <span>{{
            t("map.dateFilter", { date: formatMonth(modelValue, locale) })
          }}</span>
          <button type="button" @click="$emit('clear-date')">
            {{ t("map.showAll") }}
          </button>
        </p>
      </Transition>
    </div>

    <div
      ref="track"
      class="tl__track"
      @pointerdown="startScrub"
      @pointermove="moveScrub"
      @pointerup="endScrub"
      @pointercancel="endScrub"
    >
      <svg
        class="tl__density"
        :viewBox="`0 0 ${TIME_MAX} 30`"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect
          v-for="bar in density"
          :key="bar.year"
          :x="bar.x + 1"
          :y="30 - bar.h"
          width="10"
          :height="bar.h"
          rx="1.5"
        />
      </svg>
      <div class="tl__bands" aria-hidden="true">
        <span
          v-for="band in BANDS"
          :key="band.key"
          class="tl__band"
          :class="`tl__band--${band.key}`"
          :style="{ left: pct(band.from), width: pct(band.to - band.from) }"
        >
          <span v-if="band.label">{{ t(`era.short.${band.key}`) }}</span>
        </span>
      </div>
      <div class="tl__years" aria-hidden="true">
        <span
          v-for="year in YEARS"
          :key="year"
          class="tl__year mono"
          :class="[
            `tl__year--${yearTier(year)}`,
            { 'is-major': MAJOR_YEARS.includes(year) },
          ]"
          :style="{ left: pct((year - 1914) * 12) }"
        >
          {{ year }}
        </span>
      </div>
      <div class="tl__events">
        <button
          v-for="event in majorEvents"
          :key="event.id"
          type="button"
          class="tl__event"
          :style="{ left: pct(toMonths(event.date)) }"
          :aria-label="`${formatDate(event.date, locale)} · ${event.title}`"
          :title="`${formatDate(event.date, locale)} · ${event.title}`"
          @pointerdown.stop
          @click="$emit('jump', toMonths(event.date))"
        />
      </div>
      <div
        class="tl__fill"
        :style="{ width: pct(modelValue) }"
        aria-hidden="true"
      />
      <div
        class="tl__thumb"
        role="slider"
        tabindex="0"
        :aria-label="t('map.timeline')"
        :aria-valuemin="TIME_MIN"
        :aria-valuemax="TIME_MAX"
        :aria-valuenow="Math.round(modelValue)"
        :aria-valuetext="formatMonth(modelValue, locale)"
        :style="{ left: pct(modelValue) }"
        @keydown="onKey"
      >
        <span class="tl__flag mono">{{ formatMonth(modelValue, locale) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Era } from "~~/types/data";
import type { EventCard, TitleCard } from "~~/types/view";
import {
  ERA_RANGES,
  TIME_MAX,
  TIME_MIN,
  formatDate,
  formatMonth,
  toMonths,
} from "~~/shared/utils/time";

const ERA_KEYS = ["all", "ww1", "interwar", "ww2"] as const;
const YEARS = Array.from({ length: 32 }, (_, i) => 1914 + i);
const MAJOR_YEARS = [1914, 1918, 1939, 1945];
const SMALL_YEARS = [1925, 1930, 1935];
const MEDIUM_YEARS = [1920, 1925, 1930, 1935];

function yearTier(year: number) {
  if (MAJOR_YEARS.includes(year) || SMALL_YEARS.includes(year)) return "sm";
  return MEDIUM_YEARS.includes(year) ? "md" : "lg";
}
const BANDS = [
  { key: "ww1", from: ERA_RANGES.ww1[0], to: ERA_RANGES.ww1[1], label: true },
  {
    key: "interwar",
    from: ERA_RANGES.interwar[0],
    to: ERA_RANGES.interwar[1],
    label: true,
  },
  { key: "ww2", from: ERA_RANGES.ww2[0], to: ERA_RANGES.ww2[1], label: true },
];

const props = defineProps<{
  modelValue: number;
  playing: boolean;
  speed: number;
  era: "all" | Era;
  dateFilter: boolean;
  events: EventCard[];
  titles: TitleCard[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number];
  scrub: [value: number];
  jump: [value: number];
  "toggle-play": [];
  speed: [];
  era: [value: "all" | Era];
  "clear-date": [];
}>();

const { t, locale } = useI18n();
const track = ref<HTMLElement>();
let scrubbing = false;

const majorEvents = computed(() => props.events.filter((event) => event.major));

const density = computed(() => {
  const counts = YEARS.map((year) => {
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;
    return props.titles.filter(
      (title) => title.period.start <= to && title.period.end >= from
    ).length;
  });
  const max = Math.max(1, ...counts);
  return counts.map((n, i) => ({
    year: YEARS[i]!,
    x: i * 12,
    h: n ? 3 + (n / max) * 27 : 0,
  }));
});

function pct(months: number) {
  return `${((months / TIME_MAX) * 100).toFixed(3)}%`;
}

function valueAt(clientX: number) {
  const rect = track.value!.getBoundingClientRect();
  const u = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  return Math.min(TIME_MAX - 0.01, u * TIME_MAX);
}

function startScrub(event: PointerEvent) {
  if (event.button !== 0) return;
  scrubbing = true;
  track.value?.setPointerCapture(event.pointerId);
  emit("scrub", valueAt(event.clientX));
}

function moveScrub(event: PointerEvent) {
  if (scrubbing) emit("scrub", valueAt(event.clientX));
}

function endScrub(event: PointerEvent) {
  scrubbing = false;
  if (track.value?.hasPointerCapture(event.pointerId))
    track.value.releasePointerCapture(event.pointerId);
}

function onKey(event: KeyboardEvent) {
  const steps: Record<string, number> = {
    ArrowRight: 1,
    ArrowUp: 1,
    ArrowLeft: -1,
    ArrowDown: -1,
    PageUp: 12,
    PageDown: -12,
  };
  let next: number | undefined;
  if (event.key in steps) next = props.modelValue + steps[event.key]!;
  else if (event.key === "Home") next = TIME_MIN;
  else if (event.key === "End") next = TIME_MAX - 0.01;
  if (next === undefined) return;
  event.preventDefault();
  emit(
    "scrub",
    Math.max(TIME_MIN, Math.min(TIME_MAX - 0.01, Math.round(next)))
  );
}
</script>

<style lang="scss" scoped>
.tl {
  @include panel(1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 18px 14px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.tl__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.tl__play {
  width: 40px;
  min-height: 40px;
  border-color: var(--gold);
  color: var(--gold);

  svg {
    width: 16px;
    height: 16px;
  }

  &.is-playing {
    background: var(--gold);
    color: #17130a;
  }
}

.tl__speed {
  min-width: 38px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--line-strong);
  font-size: 0.74rem;
  color: var(--muted);

  &:hover {
    color: var(--text);
  }
}

.tl__eras {
  display: flex;
  gap: 4px;
  margin-left: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.tl__era {
  min-height: 30px;
  padding: 0 0.8em;
  font-size: 0.78rem;
}

.tl__filter {
  display: none;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--muted);
  white-space: nowrap;

  button {
    color: var(--gold);
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @include up($bp-md) {
    display: flex;
  }
}

.tl__track {
  position: relative;
  height: 58px;
  margin: 0 6px;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}

.tl__density {
  position: absolute;
  inset: 0 0 auto;
  width: 100%;
  height: 22px;
  fill: rgb(236 230 214 / 0.14);
}

.tl__bands {
  position: absolute;
  inset: 24px 0 auto;
  height: 10px;
  border-radius: 999px;
  background: var(--surface-3);
  overflow: hidden;
}

.tl__band {
  position: absolute;
  top: 0;
  bottom: 0;

  span {
    display: none;
  }

  &--ww1 {
    background: linear-gradient(90deg, #6d5431, #a07c47);
  }

  &--interwar {
    background: linear-gradient(90deg, #5a302a, #7c3f33 60%, #5a302a);
  }

  &--ww2 {
    background: linear-gradient(90deg, #58642f, #8d9a52);
  }
}

.tl__years {
  position: absolute;
  inset: 38px 0 0;
  container-type: inline-size;
}

.tl__year {
  position: absolute;
  top: 0;
  translate: -50% 0;
  font-size: 0.62rem;
  color: var(--faint);

  &.is-major {
    color: var(--text);
  }

  &--md {
    display: none;

    @container (min-width: 560px) {
      display: block;
    }
  }

  &--lg {
    display: none;

    @container (min-width: 1100px) {
      display: block;
    }
  }
}

.tl__events {
  position: absolute;
  inset: 24px 0 auto;
  height: 10px;
}

.tl__event {
  position: absolute;
  top: 50%;
  width: 9px;
  height: 9px;
  translate: -50% -50%;
  rotate: 45deg;
  background: var(--red-2);
  border: 1.5px solid var(--bg);
  transition: scale 0.2s $ease-spring;

  &:hover,
  &:focus-visible {
    scale: 1.6;
    background: var(--gold-2);
  }
}

.tl__fill {
  position: absolute;
  left: 0;
  top: 24px;
  height: 10px;
  border-radius: 999px 0 0 999px;
  background: rgb(243 215 142 / 0.16);
  pointer-events: none;
}

.tl__thumb {
  position: absolute;
  top: 16px;
  width: 4px;
  height: 26px;
  translate: -50% 0;
  border-radius: 2px;
  background: var(--gold-2);
  box-shadow:
    0 0 0 2px rgb(11 12 9 / 0.8),
    0 0 16px rgb(243 215 142 / 0.8);
  cursor: grab;

  &:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 4px;
  }
}

.tl__flag {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  translate: -50% 0;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--gold);
  color: #17130a;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  text-transform: uppercase;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s $ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
