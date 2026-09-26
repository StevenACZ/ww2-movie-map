<template>
  <div class="sp" :class="{ 'is-playing': !!active }">
    <button
      v-if="!active"
      type="button"
      class="sp__open"
      :aria-expanded="open"
      aria-controls="setpieces-panel"
      @click="open = !open"
    >
      <Icon name="flame" />
      <span>{{ t("setpieces.open") }}</span>
    </button>

    <Transition name="sp-panel">
      <section
        v-if="open && !active"
        id="setpieces-panel"
        class="sp__panel"
        role="dialog"
        :aria-label="t('setpieces.title')"
      >
        <header class="sp__head">
          <div>
            <h2 class="sp__title">{{ t("setpieces.title") }}</h2>
            <p class="sp__intro">{{ t("setpieces.intro") }}</p>
          </div>
          <button
            type="button"
            class="btn btn--icon btn--ghost"
            :aria-label="t('setpieces.close')"
            @click="open = false"
          >
            <Icon name="x" />
          </button>
        </header>
        <ul class="sp__list" data-lenis-prevent>
          <li v-for="piece in SET_PIECES" :key="piece.id">
            <button
              type="button"
              class="sp__card"
              :style="{ '--era': ERA_COLORS[piece.era] }"
              :disabled="!!loading"
              @click="watch(piece.id)"
            >
              <svg
                class="sp__vignette"
                viewBox="0 0 64 56"
                aria-hidden="true"
                v-html="piece.vignette"
              />
              <span class="sp__meta">
                <span class="sp__date mono">
                  <span class="sp__era">{{ t(`era.short.${piece.era}`) }}</span>
                  {{ formatDate(piece.date, locale)
                  }}{{ piece.clock ? ` · ${piece.clock}` : "" }}
                </span>
                <strong class="sp__name">{{
                  t(`setpieces.scenes.${piece.id}.title`)
                }}</strong>
                <span class="sp__place">{{
                  t(`setpieces.scenes.${piece.id}.place`)
                }}</span>
                <span class="sp__teaser">{{
                  t(`setpieces.scenes.${piece.id}.teaser`)
                }}</span>
              </span>
              <span class="sp__watch">
                <Icon name="play" />
                {{
                  loading === piece.id
                    ? t("setpieces.loading")
                    : t("setpieces.watch")
                }}
              </span>
            </button>
          </li>
        </ul>
      </section>
    </Transition>

    <section
      v-if="active && meta"
      class="sp__caption"
      :aria-label="t(`setpieces.scenes.${active}.title`)"
    >
      <div
        class="sp__progress"
        role="progressbar"
        :aria-label="t('setpieces.progress')"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="
          Math.round(((meta.beats[beat] ?? 0) / meta.duration) * 100)
        "
      >
        <span ref="bar" class="sp__bar" />
        <span
          v-for="(at, index) in meta.beats"
          :key="index"
          class="sp__tick"
          :class="{ 'is-past': index <= beat }"
          :style="{ left: `${(at / meta.duration) * 100}%` }"
        />
      </div>
      <div class="sp__row">
        <p class="sp__clock mono">{{ current?.time }}</p>
        <div class="sp__copy" aria-live="polite">
          <p class="sp__label">
            {{ t(`setpieces.scenes.${active}.title`) }} ·
            {{ formatDate(meta.date, locale) }}
            <span class="sp__count mono"
              >{{ beat + 1 }}/{{ meta.beats.length }}</span
            >
          </p>
          <p class="sp__text">{{ current?.text }}</p>
        </div>
        <div class="sp__controls">
          <button
            v-if="still"
            type="button"
            class="btn btn--icon"
            :aria-label="t('setpieces.previous')"
            :disabled="beat === 0"
            @click="player?.previous()"
          >
            <Icon name="chevron-left" />
          </button>
          <button
            type="button"
            class="btn btn--icon btn--gold"
            :aria-label="
              still
                ? t('setpieces.next')
                : playing
                  ? t('setpieces.pause')
                  : t('setpieces.play')
            "
            @click="player?.toggle()"
          >
            <Icon
              :name="still ? 'chevron-right' : playing ? 'pause' : 'play'"
            />
          </button>
          <button
            type="button"
            class="btn btn--icon"
            :aria-label="t('setpieces.replay')"
            @click="player?.replay()"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 3.5V9h5.5" />
            </svg>
          </button>
          <button
            type="button"
            class="btn btn--icon"
            :aria-label="t('setpieces.close')"
            @click="player?.close()"
          >
            <Icon name="x" />
          </button>
        </div>
      </div>
      <p class="sp__keys">
        {{ still ? t("setpieces.keysStill") : t("setpieces.keys") }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { GlobeContext } from "~/globe/engine";
import { SET_PIECES, type SetPieceId } from "~/globe/setpieces/catalog";
import type { SetPiecePlayer } from "~/globe/setpieces/player";
import { formatDate, toMonths } from "~~/shared/utils/time";

const ERA_COLORS = { ww1: "#a07c47", ww2: "#8d9a52" } as const;

const props = defineProps<{ context: () => GlobeContext | null }>();
const emit = defineEmits<{
  time: [value: number];
  start: [id: SetPieceId];
  end: [];
}>();

const { t, tm, rt, locale } = useI18n();
const sound = useSound();

const open = ref(false);
const active = ref<SetPieceId | null>(null);
const loading = ref<SetPieceId | null>(null);
const playing = ref(false);
const still = ref(false);
const beat = ref(0);
const bar = ref<HTMLElement | null>(null);
const player = shallowRef<SetPiecePlayer | null>(null);
let lastScale = -1;

const meta = computed(
  () => SET_PIECES.find((piece) => piece.id === active.value) ?? null
);

const current = computed(() => {
  if (!active.value) return null;
  const beats = tm(`setpieces.scenes.${active.value}.beats`) as unknown as {
    time: unknown;
    text: unknown;
  }[];
  const entry = beats[beat.value];
  if (!entry) return null;
  return { time: rt(entry.time as string), text: rt(entry.text as string) };
});

const hooks = {
  frame(time: number, duration: number) {
    const scale = Math.round((time / duration) * 1000) / 1000;
    if (scale === lastScale || !bar.value) return;
    lastScale = scale;
    bar.value.style.transform = `scaleX(${scale})`;
  },
  beat(index: number) {
    beat.value = index;
  },
  state(value: boolean) {
    playing.value = value;
  },
  end() {
    active.value = null;
    playing.value = false;
    emit("end");
  },
};

async function watch(id: SetPieceId) {
  const context = props.context();
  const piece = SET_PIECES.find((entry) => entry.id === id);
  if (!context || !piece || loading.value) return;
  loading.value = id;
  try {
    if (!player.value) {
      const { SetPiecePlayer } = await import("~/globe/setpieces/player");
      player.value = new SetPiecePlayer(context, hooks);
    }
  } finally {
    loading.value = null;
  }
  open.value = false;
  still.value = context.reducedMotion;
  beat.value = 0;
  lastScale = -1;
  active.value = id;
  emit("time", toMonths(piece.date));
  emit("start", id);
  player.value.start(id, sound.enabled.value);
}

function onKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.closest("input, textarea, select, [contenteditable]")) return;
  if (!active.value) {
    if (event.key === "Escape" && open.value) open.value = false;
    return;
  }
  if (event.key === " " || event.code === "Space") {
    if (target?.closest("button")) return;
    event.preventDefault();
    player.value?.toggle();
  } else if (event.key === "Escape") {
    player.value?.close();
  } else if (still.value && event.key === "ArrowRight") {
    player.value?.next();
  } else if (still.value && event.key === "ArrowLeft") {
    player.value?.previous();
  }
}

onMounted(() => window.addEventListener("keydown", onKey));

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  player.value?.dispose();
  player.value = null;
});
</script>

<style lang="scss" scoped>
.sp {
  position: absolute;
  inset: 0;
  z-index: 32;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.sp__open {
  position: absolute;
  bottom: calc(var(--timeline-h) + var(--edge) + 10px);
  left: calc(var(--side-w) + var(--edge) * 2);
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 42px;
  padding: 0 16px 0 13px;
  border-radius: 999px;
  @include panel(0.9);
  box-shadow: var(--shadow);
  font-family: var(--font-display);
  font-size: 0.96rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: border-color 0.2s $ease-out;

  svg {
    width: 17px;
    height: 17px;
    color: var(--gold);
  }

  &:hover {
    border-color: var(--gold);
  }

  &:focus-visible {
    @include focus-ring;
  }

  @include down($bp-md) {
    top: calc(var(--header-h) + 4px);
    bottom: auto;
    left: 8px;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;

    span {
      @include visually-hidden;
    }
  }
}

.sp__panel {
  position: absolute;
  bottom: calc(var(--timeline-h) + var(--edge) + 62px);
  left: calc(var(--side-w) + var(--edge) * 2);
  display: flex;
  flex-direction: column;
  width: min(420px, calc(100vw - var(--side-w) - var(--edge) * 3));
  max-height: calc(100% - var(--header-h) - var(--timeline-h) - 90px);
  border-radius: var(--radius);
  @include panel(0.95);
  box-shadow: var(--shadow);
  overflow: hidden;

  @include down($bp-md) {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    max-height: 78dvh;
    border-radius: var(--radius) var(--radius) 0 0;
    border-bottom: 0;
  }
}

.sp__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 12px 12px 18px;
  border-bottom: 1px solid var(--line);

  .btn {
    width: 38px;
    min-height: 38px;
    flex: none;
  }
}

.sp__title {
  @include display(1.7rem);
  color: var(--paper);
}

.sp__intro {
  margin-top: 6px;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--muted);
}

.sp__list {
  list-style: none;
  display: grid;
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.sp__card {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 12px 12px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: rgb(236 230 214 / 0.025);
  text-align: left;
  transition:
    border-color 0.2s $ease-out,
    background-color 0.2s $ease-out;

  &:hover,
  &:focus-visible {
    border-color: var(--gold);
    background: rgb(216 174 82 / 0.06);

    .sp__watch {
      background: var(--gold);
      color: #17130a;
    }
  }

  &:focus-visible {
    @include focus-ring;
  }

  &:disabled {
    cursor: progress;
  }
}

.sp__vignette {
  width: 64px;
  height: 56px;
  padding: 4px;
  border-radius: 8px;
  background: rgb(0 0 0 / 0.28);
  border: 1px solid var(--line);
  color: var(--gold);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sp__meta {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.sp__date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sp__era {
  padding: 1px 6px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--era) 30%, transparent);
  border: 1px solid color-mix(in srgb, var(--era) 70%, transparent);
  color: var(--paper);
  font-size: 0.62rem;
}

.sp__name {
  font-family: var(--font-stencil);
  font-size: 1.14rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.05;
  color: var(--text);
}

.sp__place {
  font-size: 0.76rem;
  color: var(--gold-2);
}

.sp__teaser {
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--muted);
}

.sp__watch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  border: 1px solid var(--gold-deep);
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gold);
  transition:
    background-color 0.2s $ease-out,
    color 0.2s $ease-out;

  svg {
    width: 11px;
    height: 11px;
  }

  @include down($bp-sm) {
    grid-column: 2 / 4;
    justify-self: start;
  }
}

.sp__caption {
  position: absolute;
  left: 50%;
  bottom: calc(var(--timeline-h) + var(--edge) + 10px);
  width: min(760px, calc(100vw - 32px));
  translate: -50% 0;
  border-radius: var(--radius);
  @include panel(0.94);
  box-shadow: var(--shadow);
  overflow: hidden;

  @include down($bp-md) {
    left: 8px;
    right: 8px;
    bottom: calc(var(--timeline-h) + 8px);
    width: auto;
    translate: none;
  }
}

.sp__progress {
  position: relative;
  height: 3px;
  background: rgb(236 230 214 / 0.08);
}

.sp__bar {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--gold-deep), var(--gold));
  transform: scaleX(0);
  transform-origin: left center;
}

.sp__tick {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  translate: -1px 0;
  background: rgb(0 0 0 / 0.55);

  &.is-past {
    background: rgb(23 19 10 / 0.8);
  }
}

.sp__row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 12px 12px 6px 18px;

  @include down($bp-sm) {
    grid-template-columns: 1fr auto;
    gap: 8px 12px;
    padding: 10px 10px 4px 14px;
  }
}

.sp__clock {
  min-width: 72px;
  font-family: var(--font-stencil);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: var(--gold);

  @include down($bp-sm) {
    grid-column: 1 / -1;
    font-size: 1.2rem;
  }
}

.sp__label {
  @include eyebrow;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.64rem;
}

.sp__count {
  margin-left: auto;
  color: var(--faint);
}

.sp__text {
  margin-top: 4px;
  font-size: 0.98rem;
  line-height: 1.4;
  color: var(--text);
  text-wrap: pretty;
}

.sp__controls {
  display: flex;
  gap: 6px;

  .btn {
    width: 38px;
    min-height: 38px;

    svg {
      width: 15px;
      height: 15px;
    }
  }

  .btn:disabled {
    opacity: 0.4;
  }

  @include down($bp-sm) {
    grid-row: 2;
    grid-column: 2;
    align-self: end;
  }
}

.sp__keys {
  padding: 0 18px 9px;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--faint);

  @include down($bp-md) {
    display: none;
  }
}

.sp-panel-enter-active,
.sp-panel-leave-active {
  transition:
    opacity 0.25s $ease-out,
    transform 0.3s $ease-out;
}

.sp-panel-enter-from,
.sp-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);

  @include down($bp-md) {
    transform: translateY(24px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sp-panel-enter-active,
  .sp-panel-leave-active {
    transition: opacity 0.15s linear;
  }

  .sp-panel-enter-from,
  .sp-panel-leave-to {
    transform: none;
  }
}
</style>
