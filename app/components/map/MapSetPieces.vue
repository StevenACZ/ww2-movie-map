<template>
  <div class="sp" :class="{ 'is-playing': !!active }">
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

const props = defineProps<{
  context: () => GlobeContext | null;
}>();
const emit = defineEmits<{
  time: [value: number];
  start: [id: SetPieceId];
  end: [];
}>();

const { t, tm, rt, locale } = useI18n();
const sound = useSound();

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
  if (!active.value) return;
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

defineExpose({ watch });

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

.sp__caption {
  position: absolute;
  left: 50%;
  bottom: calc(var(--timeline-h) + var(--edge) + 10px);
  width: min(760px, calc(100vw - 32px));
  translate: -50% 0;
  border-radius: var(--radius);
  @include panel(1);
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
</style>
