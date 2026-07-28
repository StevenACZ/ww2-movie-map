<template>
  <main
    class="film-page"
    role="main"
    :aria-label="`${film.title} film details`"
  >
    <!-- Background Elements -->
    <div class="world-map-bg" aria-hidden="true"></div>
    <div class="grid-pattern" aria-hidden="true"></div>

    <article class="film-detail" itemscope itemtype="https://schema.org/Movie">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <NuxtLink to="/" class="crumb">Map</NuxtLink>
        <span class="crumb-divider" aria-hidden="true">/</span>
        <NuxtLink to="/films/" class="crumb">Films</NuxtLink>
        <span class="crumb-divider" aria-hidden="true">/</span>
        <span class="crumb current" aria-current="page">{{ film.title }}</span>
      </nav>

      <!-- Header -->
      <header class="film-header">
        <span class="film-badge">{{ film.country }} · {{ film.year }}</span>
        <h1 class="film-title" itemprop="name">{{ film.title }}</h1>
        <p class="film-subtitle">
          A World War II film set in
          {{ primaryLocation?.name ?? film.country }}, depicting events of
          {{ eventPeriod }}
        </p>
        <div class="film-meta">
          <span class="meta-item rating" aria-label="IMDb rating">
            <StarIcon class="star" />
            {{ film.imdbRating }} on IMDb
          </span>
          <span class="meta-divider" aria-hidden="true">•</span>
          <time itemprop="datePublished" :datetime="String(film.year)">
            {{ film.year }}
          </time>
          <span class="meta-divider" aria-hidden="true">•</span>
          <span itemprop="countryOfOrigin">{{ film.country }}</span>
        </div>
      </header>

      <!-- Body: poster + info -->
      <div class="film-body">
        <div class="poster-column">
          <img
            :src="film.poster"
            :alt="`${film.title} movie poster`"
            class="poster-image"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            width="300"
            height="450"
            itemprop="image"
          />
        </div>

        <div class="info-column">
          <section class="info-section" aria-labelledby="synopsis-heading">
            <h2 id="synopsis-heading" class="section-heading">Synopsis</h2>
            <p class="synopsis" itemprop="description">{{ film.synopsis }}</p>
          </section>

          <section class="info-section" aria-labelledby="events-heading">
            <h2 id="events-heading" class="section-heading">
              Historical setting
            </h2>
            <p
              v-for="paragraph in film.historicalContext ?? []"
              :key="paragraph.slice(0, 40)"
              class="setting-text"
            >
              {{ paragraph }}
            </p>
            <p class="setting-text">
              The events portrayed in {{ film.title }} take place in
              <strong>{{ eventPeriod }}</strong
              >, during the Second World War. Explore the same period alongside
              other films on the
              <NuxtLink to="/timeline/">WW2 timeline</NuxtLink>.
            </p>
          </section>

          <section class="info-section" aria-labelledby="locations-heading">
            <h2 id="locations-heading" class="section-heading">Locations</h2>
            <ul class="locations-list">
              <li
                v-for="loc in film.locations"
                :key="loc.name"
                class="location-item"
                :class="{ primary: loc.isPrimary }"
              >
                <NuxtLink
                  :to="mapLink"
                  class="location-link"
                  :aria-label="`View ${loc.name} on the interactive map`"
                >
                  <MapPinIcon class="pin" />
                  <span>{{ loc.name }}</span>
                  <span class="location-type">{{ loc.type }}</span>
                </NuxtLink>
              </li>
            </ul>
          </section>

          <!-- Actions -->
          <div class="actions-section">
            <NuxtLink :to="mapLink" class="action-btn map-btn">
              View on the map
            </NuxtLink>
            <a
              :href="wikipediaUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="action-btn"
              :aria-label="`Read about ${film.title} on Wikipedia`"
            >
              Wikipedia
            </a>
            <a
              v-if="film.imdbUrl"
              :href="film.imdbUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="action-btn"
              :aria-label="`${film.title} on IMDb`"
            >
              IMDb
            </a>
            <a
              v-if="film.trailerUrl"
              :href="film.trailerUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="action-btn"
              :aria-label="`Watch the ${film.title} trailer`"
            >
              Trailer
            </a>
          </div>
        </div>
      </div>

      <!-- Related films -->
      <section
        v-if="relatedFilms.length > 0"
        class="related-section"
        aria-labelledby="related-heading"
      >
        <h2 id="related-heading" class="section-heading">
          More films from this period
        </h2>
        <ul class="related-list">
          <li v-for="rel in relatedFilms" :key="rel.id" class="related-item">
            <NuxtLink :to="`/films/${rel.id}/`" class="related-link">
              <img
                :src="rel.poster"
                :alt="`${rel.title} movie poster`"
                class="related-poster"
                loading="lazy"
                decoding="async"
                width="120"
                height="180"
              />
              <span class="related-title">{{ rel.title }}</span>
              <span class="related-year">{{ rel.year }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Film } from "../../../types";
import filmsData from "../../../data/films.json";
import {
  buildPageSeo,
  canonicalUrl,
  jsonLdScript,
  SITE_URL,
} from "~/utils/seo";
import MapPinIcon from "../../components/icons/MapPinIcon.vue";
import StarIcon from "../../components/icons/StarIcon.vue";

const route = useRoute();

const films = filmsData.films as Film[];
const film = films.find((entry) => entry.id === route.params.id);

if (!film) {
  throw createError({ statusCode: 404, statusMessage: "Film not found" });
}

const pagePath = `/films/${film.id}`;

const eventPeriod = computed(() =>
  film.eventYears.start === film.eventYears.end
    ? String(film.eventYears.start)
    : `${film.eventYears.start}–${film.eventYears.end}`
);

const primaryLocation = computed(
  () => film.locations.find((loc) => loc.isPrimary) ?? film.locations[0]
);

const mapLink = computed(() => `/#film-${encodeURIComponent(film.id)}`);

const wikipediaUrl = computed(() => {
  if (film.wikipediaUrl) return film.wikipediaUrl;
  return `https://en.wikipedia.org/wiki/${film.title.replace(/ /g, "_")}`;
});

// Interlink films that depict the closest historical period.
const relatedFilms = computed(() =>
  films
    .filter((entry) => entry.id !== film.id)
    .sort(
      (a, b) =>
        Math.abs(a.eventYears.start - film.eventYears.start) -
          Math.abs(b.eventYears.start - film.eventYears.start) ||
        b.imdbRating - a.imdbRating
    )
    .slice(0, 3)
);

const metaDescription = (() => {
  const base = `${film.title} (${film.year}) on the WW2 Film Map: ${film.synopsis}`;
  if (base.length <= 158) return base;
  return `${base.slice(0, 155).replace(/\s+\S*$/, "")}…`;
})();

useSeoMeta({
  ...buildPageSeo({
    path: pagePath,
    title: `${film.title} (${film.year})`,
    description: metaDescription,
    ogTitle: `${film.title} (${film.year}) — WW2 Film Map`,
    ogDescription: metaDescription,
    imageAlt: `${film.title} movie poster`,
  }),
  ogImage: film.poster,
  ogImageWidth: 300,
  ogImageHeight: 450,
});

useHead({
  link: [{ rel: "canonical", href: canonicalUrl(pagePath) }],
  script: [
    jsonLdScript({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Movie",
          "@id": `${canonicalUrl(pagePath)}#movie`,
          name: film.title,
          url: canonicalUrl(pagePath),
          datePublished: String(film.year),
          description: film.synopsis,
          image: film.poster,
          countryOfOrigin: film.country,
          about: {
            "@type": "Thing",
            name: "World War II",
            sameAs: "https://en.wikipedia.org/wiki/World_War_II",
          },
          sameAs: [film.wikipediaUrl, film.imdbUrl].filter(Boolean),
          contentLocation: film.locations.map((location) => ({
            "@type": "Place",
            name: location.name,
            geo: {
              "@type": "GeoCoordinates",
              longitude: location.coordinates[0],
              latitude: location.coordinates[1],
            },
          })),
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl(pagePath)}#breadcrumbs`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Map",
              item: `${SITE_URL}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Films",
              item: canonicalUrl("/films"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: film.title,
              item: canonicalUrl(pagePath),
            },
          ],
        },
      ],
    }),
  ],
});
</script>

<style scoped lang="scss">
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.film-page {
  min-height: 100vh;
  background: $bg-page;
  color: $text-primary;
  font-family: "Inter", sans-serif;
  position: relative;
  padding: 120px $spacing-lg 100px;

  @include mobile {
    padding: 80px $spacing-md 60px;
  }

  @include mobile-small {
    padding: 70px $spacing-sm 40px;
  }
}

.world-map-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  opacity: 0.03;
  pointer-events: none;
  filter: invert(1);
}

.grid-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.film-detail {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xl;
  font-size: 0.9rem;

  .crumb {
    color: $text-muted;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: $beige;
    }

    &.current {
      color: $text-secondary;
    }
  }

  .crumb-divider {
    color: $text-muted;
  }
}

.film-header {
  margin-bottom: $spacing-2xl;

  @include mobile {
    margin-bottom: $spacing-xl;
  }
}

.film-badge {
  display: inline-block;
  padding: 6px $spacing-md;
  background: rgba($beige, 0.12);
  border: 1px solid rgba($beige, 0.25);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: $beige;
  letter-spacing: 2px;
  margin-bottom: $spacing-md;
  text-transform: uppercase;

  @include mobile {
    font-size: 0.75rem;
    padding: 4px 12px;
    letter-spacing: 1px;
  }
}

.film-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 $spacing-sm 0;
  letter-spacing: -1px;

  @include mobile {
    font-size: 2rem;
  }
}

.film-subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  color: $text-secondary;
  margin: 0 0 $spacing-md 0;
  max-width: 640px;
}

.film-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-sm;
  color: $text-muted;
  font-size: 0.95rem;

  .rating {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: $beige;
    font-weight: 600;
  }

  .star {
    width: 16px;
    height: 16px;
  }
}

.film-body {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: $spacing-2xl;
  margin-bottom: $spacing-2xl;

  @include mobile {
    grid-template-columns: 1fr;
    gap: $spacing-lg;
  }
}

.poster-column {
  .poster-image {
    width: 100%;
    height: auto;
    border-radius: $border-radius-md;
    border: 1px solid $surface-border;
    display: block;
  }

  @include mobile {
    max-width: 240px;
  }
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.section-heading {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: $beige;
  margin: 0 0 $spacing-md 0;
}

.synopsis,
.setting-text {
  font-size: 1.05rem;
  line-height: 1.7;
  color: $text-secondary;
  margin: 0;

  a {
    color: $beige;
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover {
      color: $beige-light;
    }
  }
}

.locations-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.location-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: $bg-card;
  border: 1px solid $surface-border;
  border-radius: 20px;
  color: $text-secondary;
  text-decoration: none;
  font-size: 0.9rem;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;

  .pin {
    width: 14px;
    height: 14px;
    color: $beige;
  }

  .location-type {
    color: $text-muted;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  &:hover {
    border-color: rgba($beige, 0.5);
    color: $text-primary;
  }
}

.location-item.primary .location-link {
  border-color: rgba($beige, 0.4);
}

.actions-section {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: $bg-card;
  border: 1px solid $surface-border;
  border-radius: $border-radius-sm;
  color: $text-secondary;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: rgba($beige, 0.5);
    color: $text-primary;
  }

  &.map-btn {
    background: rgba($beige, 0.14);
    border-color: rgba($beige, 0.4);
    color: $beige;

    &:hover {
      background: rgba($beige, 0.22);
      color: $beige-light;
    }
  }
}

.related-section {
  border-top: 1px solid $surface-border;
  padding-top: $spacing-xl;
}

.related-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: $spacing-lg;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.related-link {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-card;
  border: 1px solid $surface-border;
  border-radius: $border-radius-md;
  text-decoration: none;
  color: $text-secondary;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    border-color: rgba($beige, 0.5);
    color: $text-primary;
  }

  .related-poster {
    width: 60px;
    height: 90px;
    object-fit: cover;
    border-radius: $border-radius-sm;
    flex-shrink: 0;
  }

  .related-title {
    font-weight: 600;
    display: block;
  }

  .related-year {
    color: $text-muted;
    font-size: 0.85rem;
    margin-left: auto;
  }
}
</style>
