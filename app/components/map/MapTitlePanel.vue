<template>
  <article
    class="panel"
    :class="[`panel--${card.era}`, { 'panel--gold': card.gold }]"
    :aria-label="card.title"
  >
    <div class="panel__media">
      <img
        v-if="card.backdrop"
        class="panel__backdrop"
        :src="`${TMDB_IMAGE}/w780${card.backdrop}`"
        alt=""
        decoding="async"
      />
      <span v-else class="panel__watermark" aria-hidden="true">{{
        card.title
      }}</span>
      <button
        type="button"
        class="btn btn--icon panel__close"
        :aria-label="t('common.close')"
        @click="$emit('close')"
      >
        <Icon name="x" />
      </button>
    </div>

    <div class="panel__scroll" data-lenis-prevent>
      <header class="panel__head">
        <TitlePoster
          class="panel__poster"
          :path="card.poster"
          :title="card.title"
          :year="card.year"
          :era="card.era"
          :kind="card.kind"
          :gold="card.gold"
          sizes="120px"
          eager
        />
        <div class="panel__heading">
          <p class="eyebrow">
            {{ t(`era.${card.era}`) }} · {{ t(`kind.${card.kind}`) }}
          </p>
          <h2 class="panel__title">{{ card.title }}</h2>
          <p class="panel__sub mono">
            {{ card.endYear ? `${card.year}–${card.endYear}` : card.year }}
            <template v-if="card.altTitle"> · {{ card.altTitle }}</template>
          </p>
          <span v-if="card.gold" class="gold-badge"
            ><Icon name="medal" />{{ t("gold.label") }}</span
          >
        </div>
      </header>

      <p v-if="detail?.goldReason" class="panel__why">
        <strong>{{ t("gold.why") }}</strong>
        {{ detail.goldReason }}
      </p>

      <p class="panel__synopsis">{{ card.synopsis }}</p>

      <div class="panel__actions">
        <button
          v-if="detail?.trailer"
          type="button"
          class="btn btn--gold"
          @click="openTrailer"
        >
          <Icon name="play" />{{ t("title.trailer") }}
        </button>
        <NuxtLinkLocale :to="`/films/${card.id}`" class="btn btn--ghost">
          {{ t("title.details") }}<Icon name="arrow-right" />
        </NuxtLinkLocale>
      </div>

      <section class="panel__section">
        <div class="panel__section-head">
          <h3>{{ t("title.journey") }}</h3>
          <button
            v-if="stops.length > 1"
            type="button"
            class="chip"
            :aria-pressed="touring"
            @click="$emit('tour')"
          >
            <Icon :name="touring ? 'pause' : 'route'" />{{
              t("title.playJourney")
            }}
          </button>
        </div>
        <ol class="stops">
          <li
            v-for="(stop, index) in stops"
            :key="`${stop.place}-${index}`"
            class="stop"
            :class="{
              'is-active': index === activeStop,
              'is-primary': stop.primary,
            }"
          >
            <button
              type="button"
              class="stop__btn"
              :aria-expanded="index === activeStop"
              @click="$emit('stop', index)"
            >
              <span class="stop__num mono">{{ index + 1 }}</span>
              <span class="stop__text">
                <span class="stop__name">{{ stop.name }}</span>
                <span class="stop__meta mono">
                  {{ formatDate(stop.date, locale) }} ·
                  {{ t(`stopKind.${stop.kind}`) }}
                </span>
              </span>
            </button>
            <div
              v-if="index === activeStop && detailStop(index)"
              class="stop__story"
            >
              <p>{{ detailStop(index)!.story }}</p>
              <p v-if="detailStop(index)!.history" class="stop__history">
                <strong>{{ t("title.history") }}</strong>
                {{ detailStop(index)!.history }}
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section v-if="detail?.history?.length" class="panel__section">
        <h3>{{ t("title.context") }}</h3>
        <p class="panel__history">{{ detail.history[0] }}</p>
        <NuxtLinkLocale :to="`/films/${card.id}`" class="panel__more">
          {{ t("common.more") }}<Icon name="arrow-right" />
        </NuxtLinkLocale>
      </section>

      <section class="panel__section">
        <h3>{{ t("title.watch") }}</h3>
        <TitleWatchProviders
          :id="card.id"
          :title="detail?.originalTitle ?? card.altTitle ?? card.title"
          :available="detail?.streaming"
        />
      </section>
    </div>

    <TitleTrailerDialog
      v-if="detail?.trailer"
      ref="trailer"
      :video-key="detail.trailer"
      :label="`${t('title.trailer')}: ${card.title}`"
    />
  </article>
</template>

<script setup lang="ts">
import type { StopCard, TitleCard, TitleDetail } from "~~/types/view";
import { formatDate } from "~~/shared/utils/time";
import { TMDB_IMAGE } from "~/utils/seo";

const props = defineProps<{
  card: TitleCard;
  detail: TitleDetail | null;
  activeStop: number | null;
  touring: boolean;
}>();

defineEmits<{
  close: [];
  stop: [index: number];
  tour: [];
}>();

const { t, locale } = useI18n();
const sound = useSound();
const trailer = ref<{ show: () => void }>();

const stops = computed<StopCard[]>(
  () => props.detail?.journey ?? props.card.stops
);

function detailStop(index: number) {
  return props.detail?.journey[index];
}

function openTrailer() {
  sound.play("click");
  trailer.value?.show();
}
</script>

<style lang="scss" scoped>
.panel {
  @include panel(0.96);
  --tint: #2b3120;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;

  &--ww1 {
    --tint: #3d3325;
  }

  &--interwar {
    --tint: #3a2522;
  }

  &--gold {
    border-color: rgb(216 174 82 / 0.45);
  }

  @include motion {
    animation: panel-in 0.55s $ease-out both;
  }
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateX(28px);
  }
}

.panel__media {
  position: relative;
  flex: none;
  height: 120px;
  overflow: hidden;
  background: radial-gradient(120% 120% at 20% 0%, var(--tint), #0d0e0a);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgb(11 12 9 / 0.1),
      rgb(14 15 11 / 0.95)
    );
  }
}

.panel__backdrop {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.panel__watermark {
  position: absolute;
  left: -8px;
  bottom: -18px;
  font-family: var(--font-stencil);
  font-size: 5.4rem;
  font-weight: 800;
  line-height: 0.85;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgb(236 230 214 / 0.07);
}

.panel__close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 38px;
  min-height: 38px;
  background: rgb(11 12 9 / 0.7);
}

.panel__scroll {
  flex: 1;
  min-height: 0;
  margin-top: -64px;
  position: relative;
  z-index: 1;
  padding: 0 18px 22px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.panel__head {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 14px;
  align-items: end;
}

.panel__poster {
  width: 96px;
  box-shadow: 0 16px 40px rgb(0 0 0 / 0.6);
}

.panel__heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;

  .eyebrow {
    color: var(--gold);
  }
}

.panel__title {
  @include display(clamp(1.6rem, 2.4vw, 2.1rem));
  overflow-wrap: anywhere;
}

.panel__sub {
  font-size: 0.72rem;
  color: var(--muted);
}

.panel__why {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid rgb(216 174 82 / 0.4);
  background: linear-gradient(
    135deg,
    rgb(216 174 82 / 0.14),
    rgb(216 174 82 / 0.03)
  );
  font-size: 0.86rem;
  line-height: 1.5;

  strong {
    display: block;
    margin-bottom: 2px;
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold);
  }
}

.panel__synopsis {
  margin-top: 14px;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--text);
}

.panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;

  .btn {
    min-height: 40px;
    font-size: 0.92rem;
  }
}

.panel__section {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--line);

  h3 {
    @include eyebrow;
    color: var(--text);
    margin-bottom: 12px;
  }
}

.panel__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;

  h3 {
    margin: 0;
  }
}

.stops {
  list-style: none;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 13px;
    top: 14px;
    bottom: 14px;
    border-left: 1.5px dashed rgb(243 215 142 / 0.35);
  }
}

.stop {
  position: relative;
}

.stop__btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 6px 4px 6px 0;
  text-align: left;
  border-radius: 8px;

  &:hover .stop__name {
    color: var(--gold-2);
  }
}

.stop__num {
  flex: none;
  display: grid;
  place-items: center;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  border: 1.5px solid var(--gold);
  background: var(--bg);
  font-size: 0.72rem;
  color: var(--gold);
  transition:
    background-color 0.2s $ease-out,
    color 0.2s $ease-out;

  .is-active & {
    background: var(--gold);
    color: #17130a;
  }
}

.stop__text {
  display: flex;
  flex-direction: column;
  padding-top: 2px;
}

.stop__name {
  font-weight: 600;
  line-height: 1.3;
  transition: color 0.2s $ease-out;
}

.stop__meta {
  font-size: 0.68rem;
  color: var(--faint);
}

.stop__story {
  margin: 4px 0 10px 39px;
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--muted);

  @include motion {
    animation: story-in 0.4s $ease-out both;
  }
}

@keyframes story-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}

.stop__history {
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid rgb(224 69 47 / 0.3);
  border-radius: var(--radius-sm);
  background: rgb(224 69 47 / 0.07);

  strong {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--red-2);
  }
}

.panel__history {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--muted);
}

.panel__more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-weight: 600;
  color: var(--gold);

  svg {
    width: 14px;
    height: 14px;
  }
}
</style>
