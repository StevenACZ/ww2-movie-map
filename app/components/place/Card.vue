<template>
  <NuxtLinkLocale
    :to="`/places/${place.id}`"
    class="place-card"
    :class="{ 'place-card--feature': feature, 'is-active': active }"
  >
    <div class="place-card__map">
      <PlaceMiniMap
        v-if="map"
        :x="map.x"
        :y="map.y"
        :span="feature ? 90 : 64"
        :near="map.near"
      />
      <PlaceLocator v-else :coordinates="place.coordinates" />
      <span v-if="rank" class="place-card__rank mono">{{
        String(rank).padStart(2, "0")
      }}</span>
      <ul v-if="posters?.length" class="place-card__posters" aria-hidden="true">
        <li v-for="poster in posters" :key="poster.path">
          <TitlePoster
            :path="poster.path"
            :title="poster.title"
            :year="poster.year"
            :era="poster.era"
            :kind="poster.kind"
            sizes="92px"
          />
        </li>
      </ul>
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
      <p v-if="eras" class="place-card__eras mono">
        <template v-for="(n, i) in eras" :key="i">
          <span
            v-if="n"
            class="place-card__era"
            :class="`place-card__era--${ATLAS_ERAS[i]}`"
            >{{ t(`era.short.${ATLAS_ERAS[i]}`) }} {{ n }}</span
          >
        </template>
      </p>
    </div>
    <Icon name="arrow-right" class="place-card__arrow" />
  </NuxtLinkLocale>
</template>

<script setup lang="ts">
import type { PlaceSummary } from "~~/types/view";
import { ATLAS_ERAS, type CardPoster } from "~/utils/atlas";

withDefaults(
  defineProps<{
    place: PlaceSummary;
    feature?: boolean;
    rank?: number;
    level?: 2 | 3 | 4;
    eras?: [number, number, number];
    active?: boolean;
    map?: { x: number; y: number; near: [number, number][] };
    posters?: CardPoster[];
  }>(),
  {
    level: 3,
    rank: undefined,
    eras: undefined,
    map: undefined,
    posters: undefined,
  }
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
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: #121812;
}

.place-card__posters {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  list-style: none;

  li {
    width: 46px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 6px 18px rgb(0 0 0 / 0.55);
    transition: transform 0.35s $ease-out;
  }

  li + li {
    margin-left: -14px;
  }

  .place-card--feature & li {
    width: 64px;
  }

  .place-card:hover & li:nth-child(1) {
    transform: translateX(-6px) rotate(-3deg);
  }

  .place-card:hover & li:nth-child(3) {
    transform: translateX(6px) rotate(3deg);
  }
}

.place-card__rank {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgb(14 15 11 / 0.72);
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
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 2px;
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.place-card__era {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--c);
  }

  &--ww1 {
    --c: #c49a5c;
  }

  &--interwar {
    --c: #c5634f;
  }

  &--ww2 {
    --c: #a9b870;
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
