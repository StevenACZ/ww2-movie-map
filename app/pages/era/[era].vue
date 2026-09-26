<template>
  <div class="era" :class="`era--${era}`">
    <header class="hero">
      <CollectionEraBackdrop :era="era" class="hero__backdrop" />
      <div class="hero__inner container">
        <p class="hero__eyebrow eyebrow">
          <NuxtLinkLocale to="/films" class="hero__crumb">{{
            t("nav.films")
          }}</NuxtLinkLocale>
          <span aria-hidden="true">/</span>
          <span>{{ t(`era.${era}`) }}</span>
        </p>
        <p class="hero__years stencil" aria-hidden="true">
          {{ t(`era.years.${era}`) }}
        </p>
        <h1 class="hero__title">{{ t(`era_page.${era}.h1`) }}</h1>
        <p class="hero__intro">{{ t(`era_page.${era}.intro`) }}</p>
        <NuxtLinkLocale
          :to="{ path: '/', query: { era } }"
          class="btn btn--gold hero__cta"
        >
          <Icon name="globe" />{{ t("filmsPage.exploreGlobe") }}
        </NuxtLinkLocale>
      </div>
    </header>

    <section class="stats container" :aria-label="t('filmsPage.stats.label')">
      <dl class="stats__list">
        <div v-for="stat in stats" :key="stat.key" class="stats__item">
          <dt class="stats__label eyebrow">
            {{ t(`filmsPage.stats.${stat.key}`) }}
          </dt>
          <dd class="stats__value mono">{{ stat.value }}</dd>
        </div>
      </dl>
    </section>

    <CollectionGold v-if="gold.length" :titles="gold" />

    <CollectionBrowser :titles="titles" :locked-era="era" />

    <section class="others container" :aria-labelledby="othersId">
      <h2 :id="othersId" class="others__heading">
        {{ t("filmsPage.otherEras") }}
      </h2>
      <ul class="others__list">
        <li v-for="other in others" :key="other">
          <NuxtLinkLocale
            :to="`/era/${other}`"
            class="others__card"
            :class="`others__card--${other}`"
          >
            <span class="others__years stencil">{{
              t(`era.years.${other}`)
            }}</span>
            <span class="others__name">{{ t(`era.${other}`) }}</span>
            <span class="others__count mono">
              {{ t("films.count", { n: countFor(other) }) }}
              <Icon name="arrow-right" />
            </span>
          </NuxtLinkLocale>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Era, Locale } from "~~/types/data";

const ERAS: Era[] = ["ww1", "interwar", "ww2"];

const route = useRoute();
const param = String(route.params.era);
if (!ERAS.includes(param as Era)) {
  throw createError({ statusCode: 404, fatal: true });
}
const era = param as Era;

const { t, locale } = useI18n();
const { data } = await useIndexData();
const othersId = useId();

const all = computed(() => data.value?.titles ?? []);
const titles = computed(() => all.value.filter((title) => title.era === era));
const gold = computed(() => titles.value.filter((title) => title.gold));
const others = ERAS.filter((other) => other !== era);

function countFor(other: Era) {
  return all.value.filter((title) => title.era === other).length;
}

const stats = computed(() => {
  const films = titles.value.filter((title) => title.kind === "film").length;
  const places = new Set(
    titles.value.flatMap((title) => title.stops.map((stop) => stop.place))
  );
  return [
    { key: "titles", value: titles.value.length },
    { key: "films", value: films },
    { key: "series", value: titles.value.length - films },
    { key: "gold", value: gold.value.length },
    { key: "places", value: places.size },
  ];
});

usePageSeo(() => {
  const current = locale.value as Locale;
  const path = `/era/${era}`;
  const title = t(`era_page.${era}.title`);
  const description = t(`era_page.${era}.intro`);
  return {
    path,
    title,
    description,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: absoluteUrl(path, current),
        inLanguage: current,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: titles.value.length,
          itemListElement: titles.value.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/films/${item.id}`, current),
            name: item.title,
          })),
        },
      },
      breadcrumbGraph(current, [
        { name: t("nav.map"), path: "/" },
        { name: t("nav.films"), path: "/films" },
        { name: t(`era.${era}`), path },
      ]),
    ],
  };
});
</script>

<style lang="scss" scoped>
.era {
  --accent: var(--red-2);

  &--ww1 {
    --accent: var(--olive);
  }

  &--interwar {
    --accent: var(--blue);
  }
}

.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: clamp(48px, 10vw, 120px) clamp(56px, 9vw, 110px);
  border-bottom: 1px solid var(--line);
  background: radial-gradient(
    90% 70% at 70% 100%,
    var(--surface),
    var(--bg) 70%
  );
}

.hero__backdrop {
  z-index: -1;
}

.hero__inner {
  position: relative;
}

.hero__eyebrow {
  display: flex;
  gap: 0.7em;
}

.hero__crumb {
  color: var(--text);

  &:hover {
    color: var(--gold-2);
  }
}

.hero__years {
  margin-top: 14px;
  font-size: clamp(4.2rem, 19vw, 15rem);
  font-weight: 800;
  line-height: 0.82;
  letter-spacing: -0.02em;
  white-space: nowrap;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--accent) 80%, transparent);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--accent) 38%, transparent),
    transparent 85%
  );
  background-clip: text;
  -webkit-background-clip: text;

  @include motion {
    animation: hero-in 1s $ease-out both;
  }
}

.hero__title {
  margin-top: clamp(14px, 2vw, 22px);
  @include display(clamp(2.4rem, 7vw, 5rem));

  @include motion {
    animation: hero-in 0.9s 0.12s $ease-out both;
  }
}

.hero__intro {
  margin-top: 16px;
  max-width: 56ch;
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  color: var(--muted);

  @include motion {
    animation: hero-in 0.9s 0.22s $ease-out both;
  }
}

.hero__cta {
  margin-top: clamp(24px, 3vw, 34px);

  @include motion {
    animation: hero-in 0.9s 0.32s $ease-out both;
  }
}

.stats {
  padding-block: clamp(28px, 5vw, 48px);
}

.stats__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--line);

  @include up($bp-md) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.stats__item {
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  padding: clamp(16px, 2.5vw, 26px);
  background: var(--bg-2);

  &:first-child {
    grid-column: 1 / -1;

    @include up($bp-md) {
      grid-column: auto;
    }
  }
}

.stats__value {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 600;
  line-height: 1;
  color: var(--text);

  .stats__item:first-child & {
    color: var(--accent);
  }
}

.others {
  padding-block: 0 clamp(64px, 10vw, 120px);
}

.others__heading {
  @include display(clamp(1.8rem, 4.5vw, 2.8rem));
}

.others__list {
  list-style: none;
  display: grid;
  gap: 14px;
  margin-top: 22px;

  @include up($bp-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.others__card {
  --card: var(--red-2);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: clamp(20px, 3vw, 32px);
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  transition:
    border-color 0.3s $ease-out,
    transform 0.3s $ease-out;

  &--ww1 {
    --card: var(--olive);
  }

  &--interwar {
    --card: var(--blue);
  }

  &:hover {
    border-color: var(--card);

    @include motion {
      transform: translateY(-3px);
    }
  }
}

.others__years {
  font-size: clamp(2.6rem, 8vw, 4.4rem);
  font-weight: 800;
  line-height: 0.9;
  color: var(--card);
}

.others__name {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
}

.others__count {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--muted);

  svg {
    width: 15px;
    height: 15px;
    transition: transform 0.3s $ease-out;
  }

  .others__card:hover & svg {
    transform: translateX(4px);
  }
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}
</style>
