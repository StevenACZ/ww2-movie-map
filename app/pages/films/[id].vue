<template>
  <article v-if="film" class="title-page">
    <TitleHero :film="film" :countries="countries" :languages="languages" />

    <section class="section container" aria-labelledby="journey-title">
      <header class="section__head">
        <h2 id="journey-title" class="section__title">
          {{ t("title.journey") }}
        </h2>
        <p class="section__intro">
          {{ t("title.journeyIntro", { n: film.journey.length }) }}
        </p>
      </header>
      <TitleJourney :journey="film.journey" :place-pages="film.placePages" />
    </section>

    <section
      v-if="film.history.length"
      class="section container"
      aria-labelledby="history-title"
    >
      <header class="section__head">
        <h2 id="history-title" class="section__title">
          {{ t("title.history") }}
        </h2>
      </header>
      <div class="history">
        <p
          v-for="(paragraph, index) in film.history"
          :key="index"
          class="reveal"
        >
          {{ paragraph }}
        </p>
      </div>
    </section>

    <section id="watch" class="section container" aria-labelledby="watch-title">
      <header class="section__head">
        <h2 id="watch-title" class="section__title">{{ t("title.watch") }}</h2>
      </header>
      <TitleWatchProviders
        :id="film.id"
        :title="film.altTitle ?? film.title"
        :available="film.streaming"
      />
    </section>

    <section class="section container" aria-labelledby="details-title">
      <header class="section__head">
        <h2 id="details-title" class="section__title">
          {{ t("title.details") }}
        </h2>
      </header>
      <TitleDetails
        :film="film"
        :countries="countries"
        :languages="languages"
      />
    </section>

    <section class="section container" aria-labelledby="links-title">
      <header class="section__head">
        <h2 id="links-title" class="section__title">{{ t("title.links") }}</h2>
      </header>
      <ul class="links">
        <li v-for="link in links" :key="link.href">
          <a
            :href="link.href"
            target="_blank"
            rel="noopener"
            class="links__card"
          >
            <span class="links__label">{{ link.label }}</span>
            <span class="links__host mono">{{ link.host }}</span>
            <Icon name="external" class="links__icon" />
            <span class="visually-hidden">{{ t("common.external") }}</span>
          </a>
        </li>
      </ul>
    </section>

    <section
      v-if="film.related.length"
      class="section container"
      aria-labelledby="related-title"
    >
      <header class="section__head">
        <h2 id="related-title" class="section__title">
          {{ t("title.related") }}
        </h2>
      </header>
      <ul class="related">
        <li v-for="item in film.related" :key="item.id">
          <TitleTile
            :title="item"
            :level="3"
            sizes="(min-width: 900px) 200px, 42vw"
          />
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import type { Locale } from "~~/types/data";
import type { TitleDetail } from "~~/types/view";

const SEO_TITLE_MAX = 65;
const SEO_DESCRIPTION_MAX = 155;

const route = useRoute();
const { t, locale } = useI18n();
const id = String(route.params.id);

const { data } = await useFetch<TitleDetail>(
  () => `/api/titles/${locale.value}/${id}`
);
if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Title not found",
    fatal: true,
  });
}

const film = computed(() => data.value);

function displayName(type: "region" | "language", code: string): string {
  try {
    return new Intl.DisplayNames([locale.value], { type }).of(code) ?? code;
  } catch {
    return code;
  }
}

const countries = computed(
  () => film.value?.countries.map((c) => displayName("region", c)) ?? []
);
const languages = computed(
  () => film.value?.languages.map((c) => displayName("language", c)) ?? []
);

const links = computed(() => {
  const f = film.value;
  if (!f) return [];
  const items = [
    { label: t("title.wikipedia"), href: f.links.wikipedia },
    {
      label: t("title.imdb"),
      href: `https://www.imdb.com/title/${f.ids.imdb}/`,
    },
    {
      label: t("title.tmdb"),
      href: `https://www.themoviedb.org/${f.ids.tmdbType}/${f.ids.tmdb}`,
    },
    ...(f.links.fandom
      ? [{ label: t("title.fandom"), href: f.links.fandom }]
      : []),
    ...(f.links.official
      ? [{ label: t("titlePage.official"), href: f.links.official }]
      : []),
  ];
  return items.map((item) => ({
    ...item,
    host: new URL(item.href).hostname.replace(/^www\./, ""),
  }));
});

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const end = cut.lastIndexOf(" ");
  return `${cut.slice(0, end > 0 ? end : cut.length).replace(/[\s,;:.]+$/, "")}…`;
}

usePageSeo(() => {
  const f = film.value!;
  const current = locale.value as Locale;
  const path = `/films/${f.id}`;
  const base = `${f.title} (${f.year})`;
  const long = `${base}${t("titlePage.seoSuffix")}`;
  const title =
    long.length + SITE_NAME.length + 3 <= SEO_TITLE_MAX ? long : base;
  const image = f.backdrop
    ? {
        image: tmdbImage(f.backdrop, "w1280"),
        imageWidth: 1280,
        imageHeight: 720,
      }
    : f.poster
      ? {
          image: tmdbImage(f.poster, "w780"),
          ...(f.poster.startsWith("/img/posters/")
            ? { imageWidth: 342, imageHeight: 513 }
            : { imageWidth: 780, imageHeight: 1170 }),
        }
      : {};
  const people = f.directors.map((name) => ({ "@type": "Person", name }));
  const places = [
    ...new Map(f.journey.map((stop) => [stop.place, stop])).values(),
  ].map((stop) => ({
    "@type": "Place",
    name: stop.name,
    geo: {
      "@type": "GeoCoordinates",
      latitude: stop.coordinates[1],
      longitude: stop.coordinates[0],
    },
  }));
  const alternateName = [...new Set([f.altTitle, f.originalTitle])].filter(
    (name): name is string => !!name && name !== f.title
  );
  const work = {
    "@context": "https://schema.org",
    "@type": f.kind === "series" ? "TVSeries" : "Movie",
    name: f.title,
    ...(alternateName.length ? { alternateName } : {}),
    url: absoluteUrl(path, current),
    ...(f.poster ? { image: tmdbImage(f.poster, "w780") } : {}),
    dateCreated: String(f.year),
    ...(people.length
      ? { [f.kind === "series" ? "creator" : "director"]: people }
      : {}),
    countryOfOrigin: countries.value.map((name) => ({
      "@type": "Country",
      name,
    })),
    description: f.synopsis,
    sameAs: [
      f.links.wikipedia,
      `https://www.imdb.com/title/${f.ids.imdb}/`,
      `https://www.themoviedb.org/${f.ids.tmdbType}/${f.ids.tmdb}`,
    ],
    contentLocation: places,
  };
  return {
    path,
    title,
    description: clip(f.synopsis, SEO_DESCRIPTION_MAX),
    ...image,
    imageAlt: f.title,
    type: f.kind === "series" ? "video.tv_show" : "video.movie",
    jsonLd: [
      work,
      breadcrumbGraph(current, [
        { name: t("nav.map"), path: "/" },
        { name: t("nav.films"), path: "/films" },
        { name: f.title, path },
      ]),
    ],
  };
});
</script>

<style lang="scss" scoped>
.section {
  padding-block: clamp(48px, 7vw, 96px) 0;

  &:last-child {
    padding-bottom: clamp(64px, 9vw, 128px);
  }
}

#watch {
  scroll-margin-top: calc(var(--header-h) + 16px);
}

.section__head {
  margin-bottom: clamp(24px, 3vw, 40px);
}

.section__title {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: clamp(2rem, 5vw, 3.4rem);
  text-transform: uppercase;
  color: var(--paper);

  &::before {
    content: "";
    flex: none;
    width: clamp(24px, 4vw, 48px);
    height: 3px;
    background: var(--red);
  }
}

.section__intro {
  margin-top: 12px;
  color: var(--muted);
}

.history {
  max-width: 68ch;
  font-size: clamp(1.05rem, 1.4vw, 1.2rem);
  line-height: 1.75;
  color: var(--paper);

  p + p {
    margin-top: 1.2em;
  }

  p:first-child::first-letter {
    float: left;
    margin: 0.08em 0.12em 0 0;
    font-family: var(--font-stencil);
    font-size: 4.6em;
    font-weight: 800;
    line-height: 0.8;
    color: var(--gold);
  }
}

.links {
  display: grid;
  gap: 12px;
  list-style: none;

  @include up($bp-sm) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

.links__card {
  position: relative;
  display: grid;
  gap: 4px;
  min-height: 88px;
  padding: 18px 48px 18px 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  transition:
    border-color 0.25s $ease-out,
    transform 0.25s $ease-out,
    background-color 0.25s $ease-out;

  &:hover {
    border-color: var(--gold);
    background: var(--surface-2);
    transform: translateY(-2px);
  }
}

.links__label {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.links__host {
  font-size: 0.72rem;
  color: var(--faint);
  overflow-wrap: anywhere;
}

.links__icon {
  position: absolute;
  right: 18px;
  top: 20px;
  width: 16px;
  height: 16px;
  color: var(--muted);
  transition: color 0.25s $ease-out;

  .links__card:hover & {
    color: var(--gold);
  }
}

.related {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(150px, 42%);
  gap: 16px;
  list-style: none;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 12px;
  overscroll-behavior-x: contain;

  > li {
    scroll-snap-align: start;
  }

  @include up($bp-md) {
    grid-auto-flow: row;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    overflow: visible;
    padding-bottom: 0;
  }
}
</style>
