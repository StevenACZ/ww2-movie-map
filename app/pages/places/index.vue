<template>
  <div class="places">
    <header class="places__hero container">
      <p class="eyebrow places__eyebrow">
        <Icon name="pin" />{{ t("placesPage.eyebrow", { n: places.length }) }}
      </p>
      <h1 class="places__h1 stencil">{{ t("places.h1") }}</h1>
      <p class="places__intro">{{ t("places.intro") }}</p>
    </header>

    <section class="places__atlas container" aria-labelledby="places-atlas">
      <h2 id="places-atlas" class="visually-hidden">
        {{ t("placesPage.atlas") }}
      </h2>
      <div class="places__toolbar" role="search">
        <label class="places__search">
          <span class="visually-hidden">{{ t("placesPage.search") }}</span>
          <Icon name="search" class="places__search-icon" />
          <input
            v-model="query"
            type="search"
            autocomplete="off"
            spellcheck="false"
            :placeholder="t('placesPage.searchPlaceholder')"
          />
          <button
            v-if="query"
            type="button"
            class="places__clear"
            :aria-label="t('placesPage.clear')"
            @click="query = ''"
          >
            <Icon name="x" />
          </button>
        </label>
        <div
          class="places__eras"
          role="group"
          :aria-label="t('placesPage.eraFilter')"
        >
          <button
            v-for="id in ERA_FILTERS"
            :key="id"
            type="button"
            class="places__era"
            :class="`places__era--${id}`"
            :aria-pressed="era === id"
            @click="era = id"
          >
            {{ t(`era.short.${id}`) }}
          </button>
        </div>
        <p class="places__results mono" aria-live="polite">
          {{
            t("placesPage.results", {
              n: filtered.length,
              total: places.length,
            })
          }}
        </p>
      </div>

      <div class="places__map">
        <LazyPlacePlacesAtlas
          v-if="atlas"
          v-model:active="active"
          :data="atlas"
          :places="places"
          :visible="visible"
        />
        <div v-else class="places__placeholder" aria-hidden="true">
          <span class="mono">{{ t("placesPage.map.loading") }}</span>
        </div>
      </div>

      <ul v-if="filtered.length" class="places__grid">
        <li
          v-for="item in filtered"
          :key="item.place.id"
          class="places__item"
          :class="item.rank <= 3 && `places__item--f${item.rank}`"
          :style="{ '--i': item.index % 6 }"
          @mouseenter="active = item.place.id"
          @mouseleave="active = null"
          @focusin="active = item.place.id"
          @focusout="active = null"
        >
          <PlaceCard
            :place="item.place"
            :feature="item.rank <= 3"
            :rank="item.rank"
            :eras="atlas?.places[item.place.id]?.n"
            :active="active === item.place.id"
          />
        </li>
      </ul>
      <p v-else class="places__empty">
        {{ t("placesPage.noResults", { q: query }) }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Era, Locale } from "~~/types/data";
import type { PlaceSummary } from "~~/types/view";
import { ATLAS_ERAS, type AtlasData } from "~/utils/atlas";

const ERA_FILTERS = ["all", ...ATLAS_ERAS] as const;

const { t, locale } = useI18n();

const { data } = await useFetch<PlaceSummary[]>(
  () => `/api/places/${locale.value}`,
  {
    key: `places-${locale.value}`,
  }
);

const places = computed(() => data.value ?? []);
const query = ref("");
const era = ref<"all" | Era>("all");
const active = ref<string | null>(null);
const atlas = shallowRef<AtlasData | null>(null);

onMounted(async () => {
  atlas.value = await $fetch<AtlasData>("/data/atlas.json");
});

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const filtered = computed(() => {
  const needle = fold(query.value);
  const eraIndex = era.value === "all" ? -1 : ATLAS_ERAS.indexOf(era.value);
  return places.value
    .map((place, i) => ({ place, rank: i + 1 }))
    .filter(({ place }) => !needle || fold(place.name).includes(needle))
    .filter(
      ({ place }) =>
        eraIndex < 0 ||
        !atlas.value ||
        (atlas.value.places[place.id]?.n[eraIndex] ?? 0) > 0
    )
    .map((item, index) => ({ ...item, index }));
});

const visible = computed(
  () => new Set(filtered.value.map((item) => item.place.id))
);

usePageSeo(() => {
  const current = locale.value as Locale;
  return {
    path: "/places",
    title: t("places.title"),
    description: t("places.intro"),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t("places.title"),
        description: t("places.intro"),
        url: absoluteUrl("/places", current),
        inLanguage: current,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: places.value.length,
          itemListElement: places.value.map((place, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: place.name,
            url: absoluteUrl(`/places/${place.id}`, current),
          })),
        },
      },
      breadcrumbGraph(current, [
        { name: t("nav.map"), path: "/" },
        { name: t("nav.places"), path: "/places" },
      ]),
    ],
  };
});
</script>

<style lang="scss" scoped>
.places {
  padding-bottom: clamp(64px, 10vw, 140px);
}

.places__hero {
  display: grid;
  gap: 18px;
  padding-block: clamp(48px, 9vw, 120px) clamp(28px, 5vw, 56px);
}

.places__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--gold);

  svg {
    width: 14px;
    height: 14px;
  }
}

.places__h1 {
  font-size: clamp(4.2rem, 2rem + 11vw, 11rem);
  font-weight: 800;
  line-height: 0.84;
  text-transform: uppercase;
  color: var(--paper);
}

.places__intro {
  max-width: 58ch;
  font-size: clamp(1.02rem, 0.95rem + 0.35vw, 1.2rem);
  color: var(--muted);
}

@include motion {
  .places__hero > * {
    animation: places-in 0.8s $ease-out both;
  }

  .places__hero > :nth-child(2) {
    animation-delay: 0.08s;
  }

  .places__hero > :nth-child(3) {
    animation-delay: 0.16s;
  }
}

@keyframes places-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.places__toolbar {
  position: relative;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 20px;
  margin-bottom: 24px;
  padding: 10px;
  border-radius: 28px;
  @include panel(0.94);

  @include up($bp-sm) {
    position: sticky;
    top: calc(var(--header-h) + 8px);
  }
}

.places__search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 240px;
  max-width: 400px;

  input {
    width: 100%;
    min-height: 44px;
    padding: 0 44px 0 42px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background: var(--bg-2);
    transition: border-color 0.2s $ease-out;

    &::placeholder {
      color: var(--faint);
    }

    &:focus-visible {
      border-color: var(--gold);
      outline: none;
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }
}

.places__search-icon {
  position: absolute;
  left: 15px;
  width: 17px;
  height: 17px;
  color: var(--muted);
  pointer-events: none;
}

.places__clear {
  position: absolute;
  right: 4px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--muted);

  &:hover {
    color: var(--text);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.places__eras {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.places__era {
  --c: var(--gold);
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  transition:
    color 0.2s $ease-out,
    border-color 0.2s $ease-out,
    background-color 0.2s $ease-out;

  &::before {
    content: "";
    width: 7px;
    height: 7px;
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

  &:hover {
    color: var(--text);
    border-color: var(--line-strong);
  }

  &[aria-pressed="true"] {
    color: var(--text);
    border-color: var(--c);
    background: rgb(236 230 214 / 0.06);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

.places__map {
  height: 58vh;
  min-height: 360px;
  margin-bottom: clamp(28px, 4vw, 48px);

  @include down($bp-sm) {
    margin-inline: calc(-1 * var(--gutter));

    .places__placeholder,
    :deep(.atlas) {
      border-inline: 0;
      border-radius: 0;
    }
  }

  @include up($bp-sm) {
    height: clamp(460px, 72vh, 760px);
  }
}

.places__placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background:
    repeating-linear-gradient(
      90deg,
      rgb(233 225 201 / 0.05) 0 1px,
      transparent 1px 60px
    ),
    repeating-linear-gradient(
      0deg,
      rgb(233 225 201 / 0.05) 0 1px,
      transparent 1px 60px
    ),
    radial-gradient(120% 90% at 50% 40%, #121812 0%, #0a0d0a 70%);

  span {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--faint);
  }
}

.places__results {
  padding-right: 12px;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.places__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  list-style: none;

  @include up($bp-sm) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  @include up($bp-lg) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

.places__item {
  min-width: 0;

  &--f1,
  &--f2,
  &--f3 {
    grid-column: span 2;
  }

  @include up($bp-sm) {
    &--f1 {
      grid-column: span 4;
    }
  }

  @include up($bp-lg) {
    &--f1 {
      grid-column: span 2;
    }
  }
}

@supports (animation-timeline: view()) {
  @include motion {
    .places__item {
      animation-name: places-in;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: view();
      animation-range: entry calc(var(--i) * 6%) entry calc(60% + var(--i) * 6%);
    }
  }
}

.places__empty {
  padding: 48px 0;
  text-align: center;
  color: var(--muted);
}
</style>
