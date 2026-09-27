<template>
  <section
    class="tour"
    :class="`tour--${card.era}`"
    :aria-label="`${t('title.journey')}: ${card.title}`"
  >
    <header class="tour__film">
      <TitlePoster
        class="tour__poster"
        :path="card.poster"
        :title="card.title"
        :year="card.year"
        :era="card.era"
        :kind="card.kind"
        :gold="card.gold"
        sizes="36px"
      />
      <p class="tour__film-text">
        <strong>{{ card.title }}</strong>
        <span class="mono">{{
          t("map.journeyStop", { n: index + 1, total: stops.length })
        }}</span>
      </p>
      <button
        type="button"
        class="btn btn--icon tour__exit"
        :aria-label="t('map.tour.exit')"
        @click="$emit('exit')"
      >
        <Icon name="x" />
      </button>
    </header>

    <div class="tour__body" data-lenis-prevent aria-live="polite">
      <Transition name="tour-stop" mode="out-in">
        <article :key="index" class="tour__stop">
          <p class="eyebrow">
            {{ formatDate(stop.date, locale) }} ·
            {{ t(`stopKind.${stop.kind}`) }}
          </p>
          <h2 class="tour__name">{{ stop.name }}</h2>
          <p v-if="stop.story" class="tour__story">{{ stop.story }}</p>
          <p v-if="stop.history" class="tour__history">
            <strong>{{ t("title.history") }}</strong>
            {{ stop.history }}
          </p>
        </article>
      </Transition>
    </div>

    <footer class="tour__controls">
      <ol class="tour__steps">
        <li v-for="(item, i) in stops" :key="`${item.place}-${i}`">
          <button
            type="button"
            class="tour__step"
            :class="{ 'is-done': i < index, 'is-active': i === index }"
            :aria-label="`${i + 1}. ${item.name}`"
            :aria-current="i === index ? 'step' : undefined"
            @click="$emit('go', i)"
          >
            <span
              v-if="i === index"
              :key="`bar-${index}-${ended}`"
              class="tour__bar"
              :class="{ 'is-paused': paused || ended }"
              :style="{ animationDuration: `${duration}ms` }"
            />
          </button>
        </li>
      </ol>
      <div class="tour__buttons">
        <button
          type="button"
          class="btn btn--icon"
          :disabled="index === 0"
          :aria-label="t('map.tour.prev')"
          @click="$emit('go', index - 1)"
        >
          <Icon name="chevron-left" />
        </button>
        <button
          type="button"
          class="btn btn--gold tour__play"
          @click="$emit('toggle')"
        >
          <Icon :name="ended ? 'route' : paused ? 'play' : 'pause'" />
          {{
            ended
              ? t("map.tour.replay")
              : paused
                ? t("map.tour.resume")
                : t("map.pause")
          }}
        </button>
        <button
          type="button"
          class="btn btn--icon"
          :disabled="index >= stops.length - 1"
          :aria-label="t('map.tour.next')"
          @click="$emit('go', index + 1)"
        >
          <Icon name="chevron-right" />
        </button>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import type { StopCard, StopDetail, TitleCard } from "~~/types/view";
import { formatDate } from "~~/shared/utils/time";

const props = defineProps<{
  card: TitleCard;
  stops: (StopCard & Partial<Pick<StopDetail, "story" | "history">>)[];
  index: number;
  paused: boolean;
  ended: boolean;
  duration: number;
}>();

defineEmits<{
  go: [index: number];
  toggle: [];
  exit: [];
}>();

const { t, locale } = useI18n();

const stop = computed(() => props.stops[props.index]!);
</script>

<style lang="scss" scoped>
.tour {
  @include panel(0.97);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px 14px;
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.tour__film {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tour__poster {
  flex: none;
  width: 30px;
  border-radius: 4px;
}

.tour__film-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;

  strong {
    overflow: hidden;
    font-family: var(--font-display);
    font-size: 0.95rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--gold);
  }

  span {
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }
}

.tour__exit {
  flex: none;
  margin-left: auto;
  width: 34px;
  min-height: 34px;

  svg {
    width: 15px;
    height: 15px;
  }
}

.tour__body {
  max-height: min(34dvh, 300px);

  @include down($bp-md) {
    max-height: 20dvh;
  }

  overflow-y: auto;
  overscroll-behavior: contain;
}

.tour__stop {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tour__name {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  line-height: 1.02;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.tour__story {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--paper);
}

.tour__history {
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: rgb(216 174 82 / 0.06);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--muted);

  strong {
    display: block;
    margin-bottom: 2px;
    font-family: var(--font-display);
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
  }
}

.tour__controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tour__steps {
  display: flex;
  gap: 6px;
  list-style: none;

  li {
    flex: 1;
  }
}

.tour__step {
  position: relative;
  display: block;
  width: 100%;
  height: 16px;

  &::before {
    content: "";
    position: absolute;
    inset: 6px 0;
    border-radius: 2px;
    background: var(--line-strong);
    transition: background-color 0.3s $ease-out;
  }

  &.is-done::before {
    background: var(--gold);
  }

  &:hover::before {
    background: var(--gold-deep);
  }
}

.tour__bar {
  position: absolute;
  inset: 6px 0;
  border-radius: 2px;
  background: var(--gold);
  transform-origin: left center;
}

@include motion {
  .tour__bar {
    animation-name: tour-bar;
    animation-timing-function: linear;
    animation-fill-mode: both;

    &.is-paused {
      animation-play-state: paused;
    }
  }
}

.tour__buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .btn--icon {
    width: 40px;
    min-height: 40px;

    &:disabled {
      opacity: 0.35;
      pointer-events: none;
    }
  }
}

.tour__play {
  min-width: 132px;
  justify-content: center;
}

.tour-stop-enter-active,
.tour-stop-leave-active {
  transition:
    opacity 0.35s $ease-out,
    transform 0.35s $ease-out;
}

.tour-stop-enter-from {
  opacity: 0;
  transform: translateX(18px);
}

.tour-stop-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}

@keyframes tour-bar {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>
