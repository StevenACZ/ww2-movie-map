<template>
  <div v-if="place" class="place">
    <header class="place__hero container">
      <div class="place__intro">
        <NuxtLinkLocale to="/places" class="place__back eyebrow">
          <Icon name="arrow-left" />{{ t("placesPage.back") }}
        </NuxtLinkLocale>
        <h1 class="place__name stencil">{{ place.name }}</h1>
        <p class="place__facts">
          <span class="place__fact"
            ><Icon name="crosshair" /><PlaceCoords
              :coordinates="place.coordinates"
          /></span>
          <span class="place__fact mono"
            ><Icon name="film" />{{
              t("places.count", { n: place.count })
            }}</span
          >
        </p>
        <PlaceLocator :coordinates="place.coordinates" class="place__locator" />
        <NuxtLinkLocale
          :to="{ path: '/', query: { place: place.id } }"
          class="btn btn--gold place__cta"
        >
          <Icon name="globe" />{{ t("title.backToMap") }}
        </NuxtLinkLocale>
      </div>
      <div class="place__globe" aria-hidden="true">
        <MapGlobe
          lazy
          :zoom="false"
          :titles="[]"
          :events="[]"
          :t="globeTime"
          mode="side"
          :layers="GLOBE_LAYERS"
          :selected="null"
          :journey="globeStops"
          :active-stop="null"
          :fit="globeFit"
        />
      </div>
    </header>

    <section
      v-if="place.description"
      class="place__section container"
      aria-labelledby="place-history"
    >
      <h2 id="place-history" class="place__h2">
        {{ t("places.whatHappened") }}
      </h2>
      <div class="place__description">
        <p v-for="(paragraph, index) in paragraphs" :key="index">
          {{ paragraph }}
        </p>
      </div>
    </section>

    <section class="place__section container" aria-labelledby="place-titles">
      <h2 id="place-titles" class="place__h2">
        {{ t("places.setHere", { place: place.name }) }}
      </h2>
      <ol class="place__titles">
        <li v-for="title in place.titles" :key="title.id" class="place__title">
          <PlaceTitleRow :title="title" />
        </li>
      </ol>
    </section>

    <section
      v-if="place.events.length"
      class="place__section container"
      aria-labelledby="place-events"
    >
      <h2 id="place-events" class="place__h2">
        {{ t("places.events", { place: place.name }) }}
      </h2>
      <ol class="place__events">
        <li v-for="event in place.events" :key="event.id" class="place__event">
          <p class="place__event-head mono">
            <time :datetime="event.date">{{
              formatDate(event.date, locale)
            }}</time>
            <span class="place__event-cat">{{
              t(`timeline.category.${event.category}`)
            }}</span>
          </p>
          <h3 class="place__event-title">{{ event.title }}</h3>
          <p class="place__event-summary">{{ event.summary }}</p>
          <a
            :href="event.wikipedia"
            target="_blank"
            rel="noopener"
            class="place__event-link"
          >
            {{ t("timeline.readMore") }}<Icon name="external" />
            <span class="visually-hidden">{{ t("common.external") }}</span>
          </a>
        </li>
      </ol>
    </section>

    <section
      v-if="place.nearby.length"
      class="place__section container"
      aria-labelledby="place-nearby"
    >
      <h2 id="place-nearby" class="place__h2">{{ t("places.nearby") }}</h2>
      <ul class="place__nearby">
        <li v-for="near in place.nearby" :key="near.id">
          <PlaceCard :place="near" />
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Locale } from "~~/types/data";
import type { PlaceDetail } from "~~/types/view";
import { formatDate, toMonths } from "~~/shared/utils/time";

const { t, locale } = useI18n();
const route = useRoute();
const id = String(route.params.id);

const { data: place } = await useFetch<PlaceDetail>(
  () => `/api/places/${locale.value}/${id}`,
  {
    key: `place-${locale.value}-${id}`,
  }
);

if (!place.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t("common.notFound"),
    fatal: true,
  });
}

const GLOBE_LAYERS = { units: true, fronts: true, events: false, labels: true };
const globeStops = computed(() =>
  place.value
    ? [{ lonLat: place.value.coordinates, label: place.value.name }]
    : []
);
const globeFit = computed(() => globeStops.value.map((stop) => stop.lonLat));
const globeTime = computed(() => {
  const dates = (place.value?.titles ?? [])
    .flatMap((title) => title.here.map((stop) => stop.date))
    .sort();
  return toMonths(
    dates[Math.floor(dates.length / 2)] ??
      place.value?.events[0]?.date ??
      "1942-01-01"
  );
});

const paragraphs = computed(() =>
  (place.value?.description ?? "").split(/\n\s*\n/).filter((p) => p.trim())
);

function seoDescription(detail: PlaceDetail): string {
  const names = detail.titles.map((title) => title.title);
  for (let take = Math.min(3, names.length); take >= 1; take--) {
    const text = t("placesPage.seoDescription", {
      n: detail.count,
      place: detail.name,
      titles: names.slice(0, take).join(", "),
    });
    if (text.length <= 155) return text;
  }
  return t("placesPage.seoDescriptionShort", {
    n: detail.count,
    place: detail.name,
  }).slice(0, 155);
}

usePageSeo(() => {
  const current = locale.value as Locale;
  const detail = place.value!;
  const path = `/places/${detail.id}`;
  const description = seoDescription(detail);
  return {
    path,
    title: t("places.setHere", { place: detail.name }),
    description,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Place",
        name: detail.name,
        url: absoluteUrl(path, current),
        geo: {
          "@type": "GeoCoordinates",
          latitude: detail.coordinates[1],
          longitude: detail.coordinates[0],
        },
        ...(detail.description ? { description: detail.description } : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: t("places.setHere", { place: detail.name }),
        numberOfItems: detail.titles.length,
        itemListElement: detail.titles.map((title, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: title.title,
          url: absoluteUrl(`/films/${title.id}`, current),
        })),
      },
      breadcrumbGraph(current, [
        { name: t("nav.map"), path: "/" },
        { name: t("nav.places"), path: "/places" },
        { name: detail.name, path },
      ]),
    ],
  };
});
</script>

<style lang="scss" scoped>
.place {
  padding-bottom: clamp(64px, 10vw, 140px);
}

.place__hero {
  display: grid;
  gap: 32px;
  align-items: center;
  padding-block: clamp(36px, 7vw, 96px) clamp(32px, 6vw, 72px);

  @include up($bp-lg) {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 56px;
  }
}

.place__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  min-width: 0;

  @include motion {
    > * {
      animation: place-in 0.8s $ease-out both;
    }

    @for $i from 2 through 5 {
      > :nth-child(#{$i}) {
        animation-delay: #{($i - 1) * 0.07}s;
      }
    }
  }
}

@keyframes place-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.place__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s $ease-out;

  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.25s $ease-out;
  }

  &:hover {
    color: var(--gold);

    svg {
      transform: translateX(-3px);
    }
  }
}

.place__name {
  max-width: 100%;
  font-size: clamp(3.4rem, 1.6rem + 9vw, 9.5rem);
  font-weight: 800;
  line-height: 0.86;
  text-transform: uppercase;
  color: var(--paper);
  overflow-wrap: anywhere;
}

.place__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  font-size: 0.86rem;
  color: var(--muted);
}

.place__fact {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
    color: var(--gold);
  }
}

.place__locator {
  width: min(100%, 420px);

  @include up($bp-lg) {
    display: none;
  }
}

.place__cta {
  margin-top: 6px;
}

.place__globe {
  display: none;

  @include up($bp-lg) {
    display: block;
    position: relative;
    overflow: hidden;
    min-height: 360px;
    aspect-ratio: 1;
    border: 1px solid var(--line);
    border-radius: 50%;
    background:
      radial-gradient(
        circle at 50% 50%,
        transparent 58%,
        rgb(216 174 82 / 0.06) 70%,
        transparent 71%
      ),
      radial-gradient(circle at 35% 30%, var(--surface-2), var(--bg) 70%);
    box-shadow:
      inset 0 0 0 12px rgb(11 12 9 / 0.6),
      0 0 0 1px var(--line);
  }
}

.place__section {
  padding-top: clamp(40px, 7vw, 88px);
}

.place__h2 {
  @include display(clamp(2rem, 1.3rem + 3vw, 3.6rem));
  max-width: 22ch;
  margin-bottom: clamp(20px, 3vw, 32px);
  color: var(--paper);
}

.place__description {
  display: grid;
  gap: 1em;
  max-width: 70ch;
  font-size: clamp(1.02rem, 0.96rem + 0.3vw, 1.16rem);
  color: var(--text);

  p:first-child::first-letter {
    float: left;
    margin: 0.06em 0.12em 0 0;
    font-family: var(--font-stencil);
    font-size: 3.4em;
    line-height: 0.8;
    color: var(--gold);
  }
}

.place__titles {
  display: grid;
  gap: 16px;
  list-style: none;
}

.place__events {
  display: grid;
  gap: 16px;
  list-style: none;

  @include up($bp-md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.place__event {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    linear-gradient(180deg, rgb(200 65 47 / 0.07), transparent 60%),
    var(--surface);
}

.place__event-head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text);
}

.place__event-cat {
  color: var(--red-2);
}

.place__event-title {
  @include display(clamp(1.4rem, 1.2rem + 0.8vw, 1.8rem));
  color: var(--paper);
}

.place__event-summary {
  color: var(--muted);
}

.place__event-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--gold);

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: var(--gold-2);
  }
}

.place__nearby {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  list-style: none;

  @include up($bp-md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  @include up($bp-lg) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@supports (animation-timeline: view()) {
  @include motion {
    .place__title,
    .place__event,
    .place__nearby > li {
      animation-name: place-in;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: view();
      animation-range: entry 0% entry 60%;
    }
  }
}
</style>
