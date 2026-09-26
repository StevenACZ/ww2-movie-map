<template>
  <section class="gold" :aria-labelledby="headingId">
    <div class="gold__head container">
      <div class="gold__copy">
        <p class="gold__eyebrow eyebrow">
          <Icon name="medal" />{{
            t("filmsPage.goldCount", { n: titles.length })
          }}
        </p>
        <h2 :id="headingId" class="gold__heading">
          {{ heading ?? t("films.gold") }}
        </h2>
        <p class="gold__intro">{{ t("films.goldIntro") }}</p>
      </div>
      <div class="gold__nav">
        <button
          type="button"
          class="btn btn--icon btn--ghost"
          :aria-label="t('filmsPage.previous')"
          :aria-controls="trackId"
          :disabled="atStart"
          @click="step(-1)"
        >
          <Icon name="chevron-left" />
        </button>
        <button
          type="button"
          class="btn btn--icon btn--ghost"
          :aria-label="t('filmsPage.next')"
          :aria-controls="trackId"
          :disabled="atEnd"
          @click="step(1)"
        >
          <Icon name="chevron-right" />
        </button>
      </div>
    </div>
    <ul :id="trackId" ref="track" class="gold__track" @scroll.passive="measure">
      <li v-for="(title, index) in titles" :key="title.id" class="gold__item">
        <TitleTile
          :title="title"
          sizes="(min-width: 900px) 280px, (min-width: 640px) 38vw, 62vw"
          :eager="eager && index < 2"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { TitleCard } from "~~/types/view";

defineProps<{ titles: TitleCard[]; heading?: string; eager?: boolean }>();

const { t } = useI18n();
const uid = useId();
const headingId = `${uid}-heading`;
const trackId = `${uid}-track`;
const track = ref<HTMLElement>();
const atStart = ref(true);
const atEnd = ref(false);

function measure() {
  const el = track.value;
  if (!el) return;
  atStart.value = el.scrollLeft < 8;
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
}

function step(direction: 1 | -1) {
  const el = track.value;
  if (!el) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollBy({
    left: direction * el.clientWidth * 0.8,
    behavior: smooth ? "smooth" : "auto",
  });
}

onMounted(measure);
</script>

<style lang="scss" scoped>
.gold {
  position: relative;
  isolation: isolate;
  padding-block: clamp(40px, 7vw, 80px);
  overflow: hidden;
  background:
    radial-gradient(80% 60% at 15% 0%, rgb(216 174 82 / 0.1), transparent 70%),
    linear-gradient(to bottom, rgb(216 174 82 / 0.04), transparent);

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      rgb(216 174 82 / 0.7) 20%,
      var(--gold-2) 50%,
      rgb(216 174 82 / 0.7) 80%,
      transparent
    );
  }

  &::before {
    top: 0;
  }

  &::after {
    bottom: 0;
    opacity: 0.45;
  }
}

.gold__head {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: clamp(20px, 3vw, 32px);

  &::after {
    content: "";
    position: absolute;
    inset: -40% -10%;
    z-index: -1;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgb(243 215 142 / 0.07) 50%,
      transparent 60%
    );
    background-size: 250% 100%;
    background-position: 100% 0;
    pointer-events: none;

    @include motion {
      animation: sheen 9s $ease-in-out infinite;
    }
  }
}

.gold__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6em;
  color: var(--gold);

  svg {
    width: 14px;
    height: 14px;
  }
}

.gold__heading {
  margin-top: 10px;
  @include display(clamp(2.2rem, 6vw, 3.8rem));
  background: linear-gradient(100deg, var(--gold-2), var(--gold) 45%, #b8893a);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.gold__intro {
  margin-top: 12px;
  max-width: 52ch;
  color: var(--muted);
}

.gold__nav {
  display: none;
  gap: 8px;

  @include up($bp-md) {
    display: flex;
  }

  .btn {
    border-color: rgb(216 174 82 / 0.45);
    color: var(--gold-2);

    &:hover:not(:disabled) {
      border-color: var(--gold);
      background: rgb(216 174 82 / 0.12);
    }

    &:disabled {
      opacity: 0.35;
      cursor: default;
    }
  }
}

.gold__track {
  list-style: none;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: clamp(170px, 58vw, 280px);
  gap: clamp(14px, 2vw, 24px);
  padding: 14px max(var(--gutter), calc((100% - var(--max)) / 2)) 18px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: max(var(--gutter), calc((100% - var(--max)) / 2));
  scrollbar-width: thin;
  scrollbar-color: var(--gold-deep) transparent;

  @include up($bp-sm) {
    grid-auto-columns: clamp(200px, 36vw, 280px);
  }

  @include up($bp-md) {
    grid-auto-columns: 260px;
  }

  @include up($bp-lg) {
    grid-auto-columns: 280px;
  }
}

.gold__item {
  scroll-snap-align: start;
}

.gold__item :deep(.tile__title) {
  font-size: 1.4rem;
}

@keyframes sheen {
  0%,
  35% {
    background-position: 100% 0;
  }
  70%,
  100% {
    background-position: 0% 0;
  }
}
</style>
