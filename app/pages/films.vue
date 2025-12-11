<template>
  <main class="films-page" role="main" aria-label="WW2 Film Collection">
    <!-- Background Elements -->
    <div class="world-map-bg" aria-hidden="true"></div>
    <div class="grid-pattern" aria-hidden="true"></div>

    <!-- Header -->
    <header class="page-header">
      <span class="collection-badge" aria-label="Film count">
        {{ filteredFilms.length }} Films
      </span>
      <h1 class="page-title">Film Collection</h1>
      <h2 class="page-subtitle">World War II Through Cinema</h2>
      <p class="page-description">
        Explore iconic films depicting the events, battles, and human stories of
        the Second World War
      </p>
    </header>

    <!-- Search and Filter Controls -->
    <FilmSearchControls
      v-model:search-query="searchQuery"
      v-model:sort-by="sortBy"
      :sort-options="sortOptions"
      @clear="clearSearch"
    />

    <!-- Films Grid -->
    <section class="films-container" aria-label="Films list">
      <TransitionGroup name="film-card">
        <div
          v-if="filteredFilms.length === 0"
          key="no-results"
          class="no-results"
          role="status"
        >
          <div class="no-results-icon" aria-hidden="true">🎬</div>
          <p class="no-results-text">No films found</p>
          <p class="no-results-hint">Try adjusting your search</p>
        </div>

        <FilmCard
          v-for="(film, index) in filteredFilms"
          :key="film.id"
          :film="film"
          :index="index"
          @view-on-map="viewOnMap"
        />
      </TransitionGroup>
    </section>

    <!-- Results Info -->
    <footer class="results-info" role="status" aria-live="polite">
      <span class="info-text">
        Showing {{ filteredFilms.length }} of {{ totalFilms }} films
      </span>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useFilmsFilter, sortOptions } from "../composables/useFilmsFilter";
import type { Film } from "../../types";
import filmsData from "../../data/films.json";

// Import components
import FilmSearchControls from "../components/films/FilmSearchControls.vue";
import FilmCard from "../components/films/FilmCard.vue";

const router = useRouter();

// SEO Configuration for Films Page
useSeoMeta({
  title: "WW2 Film Collection",
  ogTitle: "World War II Film Collection - 30+ Iconic WW2 Movies",
  description:
    "Browse our curated collection of World War II films. Discover classics like Saving Private Ryan, Schindler's List, Dunkirk, and more. Filter by rating, year, or search by title.",
  ogDescription:
    "Curated collection of 30+ iconic World War II films. Discover classics like Saving Private Ryan, Schindler's List, and Dunkirk.",
  ogUrl: "https://ww2.stevenacz.com/films",
  ogImage: "https://ww2.stevenacz.com/og-image.png",
  twitterCard: "summary_large_image",
  twitterTitle: "WW2 Film Collection - 30+ Iconic Movies",
  twitterDescription:
    "Browse our curated collection of World War II films including Saving Private Ryan, Schindler's List, and more.",
  twitterImage: "https://ww2.stevenacz.com/og-image.png",
});

// Canonical URL and Structured Data
useHead({
  link: [{ rel: "canonical", href: "https://ww2.stevenacz.com/films" }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "World War II Film Collection",
        description:
          "Curated collection of the most impactful films depicting World War II events, battles, and human stories.",
        url: "https://ww2.stevenacz.com/films",
        isPartOf: {
          "@type": "WebSite",
          name: "WW2 Film Map",
          url: "https://ww2.stevenacz.com",
        },
        about: {
          "@type": "Thing",
          name: "World War II",
          sameAs: "https://en.wikipedia.org/wiki/World_War_II",
        },
        mainEntity: {
          "@type": "ItemList",
          name: "WW2 Films",
          numberOfItems: filmsData.films.length,
        },
      }),
    },
  ],
});

// Use the films filter composable
const { searchQuery, sortBy, filteredFilms, clearSearch } = useFilmsFilter({
  films: filmsData.films as Film[],
});

const totalFilms = filmsData.films.length;

// Navigation to map
const viewOnMap = (filmId: string) => {
  router.push({
    path: "/",
    query: { filmId },
  });
};
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.films-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(20, 25, 30, 0.98) 0%,
    rgba(15, 20, 25, 0.96) 50%,
    rgba(25, 30, 35, 0.95) 100%
  );
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
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

// Header
.page-header {
  text-align: center;
  margin-bottom: $spacing-2xl;
  position: relative;
  z-index: $z-dropdown;

  @include mobile {
    margin-bottom: $spacing-lg;
  }
}

.collection-badge {
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
    margin-bottom: $spacing-sm;
  }
}

.page-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 $spacing-sm 0;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    rgba(255, 255, 255, 0.85) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;

  @include mobile {
    font-size: 2rem;
  }

  @include mobile-small {
    font-size: 1.75rem;
  }
}

.page-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0 0 $spacing-md 0;
  color: $text-secondary;
  letter-spacing: 4px;
  text-transform: uppercase;

  @include mobile {
    font-size: 0.85rem;
    letter-spacing: 2px;
    margin-bottom: $spacing-sm;
  }

  @include mobile-small {
    font-size: 0.75rem;
    letter-spacing: 1px;
  }
}

.page-description {
  color: $text-muted;
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;

  @include mobile {
    font-size: 0.9rem;
    padding: 0 $spacing-sm;
  }

  @include mobile-small {
    font-size: 0.85rem;
    display: none;
  }
}

// Films Grid
.films-container {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: $spacing-lg;
  position: relative;
  z-index: $z-dropdown;

  @include mobile {
    grid-template-columns: 1fr;
    gap: $spacing-md;
  }
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px $spacing-lg;

  @include mobile {
    padding: 60px $spacing-md;
  }
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: $spacing-md;
  opacity: 0.5;

  @include mobile {
    font-size: 3rem;
  }
}

.no-results-text {
  font-size: 1.5rem;
  color: $text-secondary;
  margin: 0 0 $spacing-sm 0;

  @include mobile {
    font-size: 1.25rem;
  }
}

.no-results-hint {
  color: $text-muted;
  margin: 0;
}

// Results Info
.results-info {
  text-align: center;
  margin-top: $spacing-2xl;
  position: relative;
  z-index: $z-dropdown;

  @include mobile {
    margin-top: $spacing-lg;
  }
}

.info-text {
  font-size: 0.85rem;
  color: $text-muted;
  background: $bg-card;
  padding: $spacing-sm $spacing-lg;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  @include mobile {
    font-size: 0.8rem;
    padding: $spacing-sm $spacing-md;
  }
}

// Animations
.film-card-enter-active {
  transition: all 0.4s ease;
  transition-delay: var(--delay, 0s);
}

.film-card-leave-active {
  transition: all $transition-normal;
}

.film-card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.film-card-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
