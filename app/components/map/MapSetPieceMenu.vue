<template>
  <div ref="root" class="spm">
    <div
      :key="featured?.id ?? 'none'"
      class="sp__launch"
      :class="{ 'is-featured': !!featured, 'is-open': open }"
    >
      <button
        type="button"
        class="sp__open"
        :aria-expanded="featured ? undefined : open"
        :aria-controls="featured ? undefined : 'setpieces-panel'"
        @click="launch"
      >
        <svg
          class="sp__open-art"
          viewBox="0 0 64 56"
          aria-hidden="true"
          v-html="(featured ?? SET_PIECES[4]!).vignette"
        />
        <span class="sp__open-copy">
          <span class="sp__open-eyebrow mono">{{
            t("setpieces.eyebrow", { n: SET_PIECES.length })
          }}</span>
          <span ref="title" class="sp__open-title">{{
            featured
              ? t(`setpieces.scenes.${featured.id}.title`)
              : t("setpieces.tagline")
          }}</span>
          <span class="sp__open-short">{{ t("setpieces.short") }}</span>
        </span>
        <span class="sp__open-tiny mono" aria-hidden="true">
          <Icon name="play" />3D
        </span>
        <span class="sp__open-play">
          <Icon
            :name="featured ? 'play' : open ? 'chevron-down' : 'chevron-up'"
          />
        </span>
      </button>
      <button
        v-if="featured"
        type="button"
        class="sp__all"
        :aria-label="t('setpieces.all')"
        :title="t('setpieces.all')"
        :aria-expanded="open"
        aria-controls="setpieces-panel"
        @click="open = !open"
      >
        <Icon name="list" />
      </button>
    </div>

    <Transition name="sp-panel">
      <section
        v-if="open"
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
              :class="{ 'is-featured': featured?.id === piece.id }"
              :style="{ '--era': ERA_COLORS[piece.era] }"
              @click="play(piece.id)"
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
                <span v-if="featured?.id === piece.id" class="sp__now mono">{{
                  t("setpieces.now")
                }}</span>
                <span class="sp__place">{{
                  t(`setpieces.scenes.${piece.id}.place`)
                }}</span>
                <span class="sp__teaser">{{
                  t(`setpieces.scenes.${piece.id}.teaser`)
                }}</span>
              </span>
              <span class="sp__watch">
                <Icon name="play" />
                {{ t("setpieces.watch") }}
              </span>
            </button>
          </li>
        </ul>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  SET_PIECES,
  featuredPiece,
  type SetPieceId,
} from "~/globe/setpieces/catalog";
import { formatDate } from "~~/shared/utils/time";

const ERA_COLORS = { ww1: "#a07c47", ww2: "#8d9a52" } as const;

const props = defineProps<{ time: number }>();
const emit = defineEmits<{ watch: [id: SetPieceId] }>();

const { t, locale } = useI18n();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const title = ref<HTMLElement | null>(null);
const featured = computed(() => featuredPiece(props.time));

function play(id: SetPieceId) {
  open.value = false;
  emit("watch", id);
}

function launch() {
  if (featured.value && title.value?.getClientRects().length) {
    play(featured.value.id);
  } else open.value = !open.value;
}

function onKey(event: KeyboardEvent) {
  if (event.key === "Escape" && open.value) open.value = false;
}

function onPointer(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) {
    open.value = false;
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKey);
  document.addEventListener("pointerdown", onPointer);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  document.removeEventListener("pointerdown", onPointer);
});
</script>

<style lang="scss" scoped>
.sp__launch {
  display: flex;
  gap: 6px;
  min-width: 0;
}

.sp__open {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  height: 40px;
  padding: 0 4px 0 3px;
  border-radius: 999px;
  border: 1px solid rgb(216 174 82 / 0.55);
  background: linear-gradient(
    90deg,
    rgb(216 174 82 / 0.16),
    rgb(216 174 82 / 0.05)
  );
  box-shadow: 0 0 22px rgb(216 174 82 / 0.12);
  text-align: left;
  transition:
    border-color 0.2s $ease-out,
    box-shadow 0.3s $ease-out,
    background-color 0.2s $ease-out;

  &:hover,
  .is-featured & {
    border-color: var(--gold);
    box-shadow: 0 0 28px rgb(216 174 82 / 0.26);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

.sp__open-art {
  flex: none;
  width: 40px;
  height: 32px;
  padding: 2px 5px;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.3);
  color: var(--gold);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sp__open-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sp__open-eyebrow {
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  white-space: nowrap;
}

.sp__open-title {
  overflow: hidden;
  max-width: 230px;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--paper);
}

.sp__open-short {
  display: none;
  padding-right: 10px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--paper);
}

.sp__open-tiny {
  display: none;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;

  svg {
    width: 11px;
    height: 11px;
  }
}

.sp__open-play {
  flex: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-left: 2px;
  border-radius: 50%;
  border: 1px solid rgb(216 174 82 / 0.5);
  color: var(--gold);
  transition:
    background-color 0.2s $ease-out,
    color 0.2s $ease-out;

  svg {
    width: 13px;
    height: 13px;
  }

  .is-featured &,
  .sp__open:hover & {
    background: var(--gold);
    color: #17130a;
  }
}

.sp__all {
  flex: none;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  color: var(--muted);
  transition:
    color 0.2s $ease-out,
    border-color 0.2s $ease-out;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover,
  .is-open & {
    color: var(--text);
    border-color: var(--gold);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

@container (max-width: 760px) {
  .sp__open-eyebrow,
  .sp__open-title,
  .sp__open-play,
  .sp__all {
    display: none;
  }

  .sp__open {
    gap: 8px;
  }

  .sp__open-short {
    display: block;
  }
}

@container (max-width: 560px) {
  .sp__open {
    gap: 5px;
    padding: 0 12px 0 11px;
    background: var(--gold);
    color: #17130a;
  }

  .sp__open-art,
  .sp__open-copy {
    display: none;
  }

  .sp__open-tiny {
    display: flex;
  }
}

@include motion {
  .sp__open::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    border: 1px solid var(--gold);
    opacity: 0;
    pointer-events: none;
    animation: sp-ping 1.9s $ease-out 1.2s 2;
  }

  .is-featured .sp__open::after {
    animation-delay: 0s;
    animation-iteration-count: 3;
  }

  .is-open .sp__open::after {
    animation: none;
  }
}

@keyframes sp-ping {
  from {
    opacity: 0.85;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(1.08, 1.45);
  }
}

.sp__panel {
  position: absolute;
  z-index: 2;
  right: 0;
  bottom: calc(100% + 10px);
  display: flex;
  flex-direction: column;
  width: min(420px, 100%);
  max-height: calc(100dvh - var(--header-h) - var(--timeline-h) - 40px);

  @include down($bp-md) {
    max-height: calc(100dvh - var(--header-h) - var(--timeline-h) - 96px);
  }
  border-radius: var(--radius);
  @include panel(1);
  box-shadow: var(--shadow);
  overflow: hidden;
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
  &:focus-visible,
  &.is-featured {
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

.sp__now {
  justify-self: start;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--gold);
  color: #17130a;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
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

.sp-panel-enter-active,
.sp-panel-leave-active {
  transition:
    opacity 0.25s $ease-out,
    transform 0.3s $ease-out;
}

.sp-panel-enter-from,
.sp-panel-leave-to {
  opacity: 0;
  transform: translateY(10px);
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
