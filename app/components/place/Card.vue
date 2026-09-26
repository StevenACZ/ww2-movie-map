<template>
  <NuxtLinkLocale
    :to="`/places/${place.id}`"
    class="place-card"
    :class="{ 'place-card--feature': feature, 'is-active': active }"
  >
    <div class="place-card__map">
      <PlaceLocator :coordinates="place.coordinates" />
      <span v-if="rank" class="place-card__rank mono">{{
        String(rank).padStart(2, "0")
      }}</span>
    </div>
    <div class="place-card__body">
      <component :is="`h${level}`" class="place-card__name">{{
        place.name
      }}</component>
      <p class="place-card__meta">
        <span class="place-card__count mono">{{
          t("places.count", { n: place.count })
        }}</span>
        <PlaceCoords
          :coordinates="place.coordinates"
          class="place-card__coords"
        />
      </p>
      <span class="place-card__eras" aria-hidden="true">
        <span
          v-for="(n, i) in eras ?? [0, 0, 0]"
          :key="i"
          :class="`place-card__era place-card__era--${ATLAS_ERAS[i]}`"
          :style="{ flexGrow: n }"
        />
      </span>
    </div>
    <Icon name="arrow-right" class="place-card__arrow" />
  </NuxtLinkLocale>
</template>

<script setup lang="ts">
import type { PlaceSummary } from "~~/types/view";
import { ATLAS_ERAS } from "~/utils/atlas";

withDefaults(
  defineProps<{
    place: PlaceSummary;
    feature?: boolean;
    rank?: number;
    level?: 2 | 3 | 4;
    eras?: [number, number, number];
    active?: boolean;
  }>(),
  { level: 3, rank: undefined, eras: undefined }
);

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.place-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  padding: 10px 10px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    radial-gradient(
      120% 60% at 50% 0%,
      rgb(125 138 79 / 0.08),
      transparent 70%
    ),
    linear-gradient(180deg, var(--surface), var(--bg-2));
  transition:
    transform 0.35s $ease-out,
    border-color 0.35s $ease-out,
    box-shadow 0.35s $ease-out;

  &:hover,
  &:focus-visible,
  &.is-active {
    border-color: rgb(216 174 82 / 0.55);
    box-shadow: var(--shadow);
  }

  @include motion {
    &:hover,
    &:focus-visible,
    &.is-active {
      transform: translateY(-4px);
    }
  }

  &--feature {
    gap: 16px;
    padding: 12px 12px 18px;
    background:
      radial-gradient(
        90% 70% at 100% 0%,
        rgb(216 174 82 / 0.1),
        transparent 60%
      ),
      linear-gradient(180deg, var(--surface-2), var(--bg-2));
    border-color: var(--line-strong);
  }
}

.place-card__map {
  position: relative;
  padding: 6px;
  border-radius: var(--radius-sm);
  background: #0f1511;
}

.place-card__rank {
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  color: var(--gold);
}

.place-card__body {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding-inline: 4px;
}

.place-card__name {
  @include display(clamp(1.3rem, 1.1rem + 0.8vw, 1.6rem));
  color: var(--paper);
  overflow-wrap: anywhere;

  .place-card--feature & {
    font-family: var(--font-stencil);
    font-size: clamp(2rem, 1.4rem + 2.4vw, 3.2rem);
  }
}

.place-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  font-size: 0.74rem;
  color: var(--muted);
}

.place-card__count {
  color: var(--text);
}

.place-card__coords {
  color: var(--faint);
}

.place-card__eras {
  display: flex;
  gap: 2px;
  height: 4px;
  margin-top: 4px;
  margin-right: 26px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--line);
}

.place-card__era {
  flex-basis: 0;
  border-radius: 2px;
  transition: flex-grow 0.6s $ease-out;

  &--ww1 {
    background: #c49a5c;
  }

  &--interwar {
    background: #c5634f;
  }

  &--ww2 {
    background: #a9b870;
  }
}

.place-card__arrow {
  position: absolute;
  right: 12px;
  bottom: 10px;
  width: 18px;
  height: 18px;
  color: var(--gold);
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity 0.3s $ease-out,
    transform 0.3s $ease-out;

  .place-card:hover &,
  .place-card:focus-visible &,
  .place-card.is-active & {
    opacity: 1;
    transform: none;
  }
}
</style>
