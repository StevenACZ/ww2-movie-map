<template>
  <main class="films-page" role="main" aria-label="WW2 Film Collection">
    <!-- Background Elements -->
    <div class="world-map-bg" aria-hidden="true"></div>
    <div class="grid-pattern" aria-hidden="true"></div>

    <!-- Header -->
    <header class="page-header">
      <span class="collection-badge" aria-label="Film count">{{ filteredFilms.length }} Films</span>
      <h1 class="page-title">Film Collection</h1>
      <h2 class="page-subtitle">World War II Through Cinema</h2>
      <p class="page-description">
        Explore iconic films depicting the events, battles, and human stories of
        the Second World War
      </p>
    </header>

    <!-- Search and Filter Controls -->
    <nav class="controls-wrapper" aria-label="Film search and filters">
      <div class="controls">
        <div class="search-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="search-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search by title, country, or synopsis..."
            class="search-input"
            aria-label="Search films"
          />
          <button
            v-if="searchQuery"
            class="clear-search"
            @click="searchQuery = ''"
            aria-label="Clear search"
          >
            ×
          </button>
        </div>

        <div class="filter-group" role="group" aria-label="Sort options">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="filter-btn"
            :class="{ active: sortBy === option.value }"
            @click="sortBy = option.value"
            :aria-pressed="sortBy === option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </nav>

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

        <article
          v-for="(film, index) in filteredFilms"
          :key="film.id"
          class="film-card"
          :style="{ '--delay': index * 0.05 + 's' }"
          itemscope
          itemtype="https://schema.org/Movie"
        >
          <!-- Poster Section -->
          <div class="poster-section">
            <img
              :src="film.poster"
              :alt="`${film.title} movie poster`"
              class="poster-image"
              loading="lazy"
              itemprop="image"
            />
            <div class="poster-overlay">
              <div class="rating-badge">
                <span class="star" aria-hidden="true">⭐</span>
                <span class="rating-value" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                  <meta itemprop="ratingValue" :content="String(film.imdbRating)" />
                  <meta itemprop="bestRating" content="10" />
                  {{ film.imdbRating }}
                </span>
              </div>
              <div class="year-badge">
                <time itemprop="datePublished" :datetime="String(film.year)">{{ film.year }}</time>
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="content-section">
            <div class="content-header">
              <h3 class="film-title" itemprop="name">{{ film.title }}</h3>
              <div class="film-meta">
                <span class="meta-country" itemprop="countryOfOrigin">{{ film.country }}</span>
                <span class="meta-divider" aria-hidden="true">•</span>
                <span class="meta-period">{{ film.eventYears.start }}-{{ film.eventYears.end }}</span>
              </div>
            </div>

            <p class="film-synopsis" itemprop="description">{{ film.synopsis }}</p>

            <!-- Locations -->
            <div class="locations-section">
              <div class="locations-header">
                <span class="locations-icon" aria-hidden="true">📍</span>
                <span class="locations-label">Filming Locations</span>
              </div>
              <div class="locations-list" itemprop="contentLocation" itemscope itemtype="https://schema.org/Place">
                <button
                  v-for="loc in film.locations"
                  :key="loc.name"
                  class="location-tag"
                  :class="{ primary: loc.isPrimary }"
                  @click="viewOnMap(film.id)"
                  :aria-label="`View ${loc.name} on map`"
                >
                  <span itemprop="name">{{ loc.name }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="map-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="actions-section">
              <a
                v-if="film.trailerUrl"
                :href="film.trailerUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn trailer-btn"
                :aria-label="`Watch ${film.title} trailer`"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="action-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Trailer</span>
              </a>
              <a
                v-if="film.imdbUrl"
                :href="film.imdbUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn imdb-btn"
                :aria-label="`View ${film.title} on IMDb`"
              >
                <span class="imdb-logo">IMDb</span>
              </a>
              <button 
                class="action-btn map-btn" 
                @click="viewOnMap(film.id)"
                :aria-label="`View ${film.title} on map`"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="action-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Map</span>
              </button>
            </div>
          </div>
        </article>
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { Film } from "../../types";
import filmsData from "../../data/films.json";

const router = useRouter();

// SEO Configuration for Films Page
useSeoMeta({
  title: 'WW2 Film Collection',
  ogTitle: 'World War II Film Collection - 30+ Iconic WW2 Movies',
  description: 'Browse our curated collection of World War II films. Discover classics like Saving Private Ryan, Schindler\'s List, Dunkirk, and more. Filter by rating, year, or search by title.',
  ogDescription: 'Curated collection of 30+ iconic World War II films. Discover classics like Saving Private Ryan, Schindler\'s List, and Dunkirk.',
  ogUrl: 'https://ww2.stevenacz.com/films',
  ogImage: 'https://ww2.stevenacz.com/og-image.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'WW2 Film Collection - 30+ Iconic Movies',
  twitterDescription: 'Browse our curated collection of World War II films including Saving Private Ryan, Schindler\'s List, and more.',
  twitterImage: 'https://ww2.stevenacz.com/og-image.png',
});

// Canonical URL and Structured Data
useHead({
  link: [
    { rel: 'canonical', href: 'https://ww2.stevenacz.com/films' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'World War II Film Collection',
        'description': 'Curated collection of the most impactful films depicting World War II events, battles, and human stories.',
        'url': 'https://ww2.stevenacz.com/films',
        'isPartOf': {
          '@type': 'WebSite',
          'name': 'WW2 Film Map',
          'url': 'https://ww2.stevenacz.com'
        },
        'about': {
          '@type': 'Thing',
          'name': 'World War II',
          'sameAs': 'https://en.wikipedia.org/wiki/World_War_II'
        },
        'mainEntity': {
          '@type': 'ItemList',
          'name': 'WW2 Films',
          'numberOfItems': filmsData.films.length
        }
      })
    }
  ]
});

// State
const searchQuery = ref("");
const sortBy = ref("rating");

const sortOptions = [
  { value: "rating", label: "Top Rated" },
  { value: "year", label: "Newest" },
  { value: "title", label: "A-Z" },
  { value: "period", label: "War Period" },
];

const totalFilms = filmsData.films.length;

// Computed
const filteredFilms = computed(() => {
  let films = [...filmsData.films] as Film[];

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    films = films.filter(
      (film) =>
        film.title.toLowerCase().includes(query) ||
        film.synopsis.toLowerCase().includes(query) ||
        film.country.toLowerCase().includes(query)
    );
  }

  // Sort
  films.sort((a, b) => {
    switch (sortBy.value) {
      case "year":
        return b.year - a.year;
      case "title":
        return a.title.localeCompare(b.title);
      case "rating":
        return b.imdbRating - a.imdbRating;
      case "period":
        return a.eventYears.start - b.eventYears.start;
      default:
        return 0;
    }
  });

  return films;
});

// Methods
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

// ===== HEADER =====
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
    display: none; // Hide on very small screens to save space
  }
}

// ===== CONTROLS =====
.controls-wrapper {
  max-width: 1200px;
  margin: 0 auto 40px;
  position: relative;
  z-index: $z-dropdown;

  @include mobile {
    margin-bottom: $spacing-lg;
  }
}

.controls {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;

  @include mobile {
    flex-direction: column;
    gap: $spacing-sm;
  }
}

.search-box {
  flex: 1;
  max-width: 400px;
  min-width: 280px;
  position: relative;

  @include mobile {
    width: 100%;
    max-width: none;
    min-width: auto;
  }
}

.search-icon {
  position: absolute;
  left: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: $text-muted;
  pointer-events: none;

  @include mobile {
    width: 18px;
    height: 18px;
    left: 12px;
  }
}

.search-input {
  width: 100%;
  padding: 14px 40px 14px 48px;
  background: $bg-card;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-md;
  color: $text-primary;
  font-size: 0.95rem;
  transition: all $transition-normal;
  backdrop-filter: blur(10px);

  @include mobile {
    padding: 12px 36px 12px 40px;
    font-size: 16px; // Prevent zoom on iOS
    border-radius: 12px;
  }

  &::placeholder {
    color: $text-muted;

    @include mobile {
      font-size: 14px;
    }
  }

  &:focus {
    outline: none;
    border-color: rgba($beige, 0.5);
    box-shadow: 0 0 20px rgba($beige, 0.1);
  }
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: $text-secondary;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;

  @include mobile {
    width: 28px;
    height: 28px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: $text-primary;
  }
}

.filter-group {
  display: flex;
  gap: $spacing-xs;
  background: $bg-card;
  padding: $spacing-xs;
  border-radius: $border-radius-md;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  @include mobile {
    width: 100%;
    justify-content: stretch;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 4px;

    // Hide scrollbar
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

.filter-btn {
  padding: 10px $spacing-md;
  background: transparent;
  border: none;
  border-radius: $border-radius-sm;
  color: $text-muted;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-fast;
  white-space: nowrap;

  @include mobile {
    flex: 1;
    padding: 10px 8px;
    font-size: 0.8rem;
    min-width: fit-content;
  }

  @include mobile-small {
    font-size: 0.75rem;
    padding: 8px 6px;
  }

  &:hover {
    color: $text-secondary;
  }

  &.active {
    background: rgba($beige, 0.15);
    color: $beige;
  }
}

// ===== FILMS GRID =====
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

// ===== FILM CARD =====
.film-card {
  background: $bg-card;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition: all $transition-normal;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;

  @include mobile {
    border-radius: $border-radius-md;
  }

  &:hover {
    border-color: rgba($beige, 0.3);
    box-shadow: $shadow-lg, 0 0 40px rgba($beige, 0.1);
  }
}

// ===== POSTER SECTION =====
.poster-section {
  position: relative;
  height: 280px;
  overflow: hidden;

  @include mobile {
    height: 220px;
  }

  @include mobile-small {
    height: 200px;
  }
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform $transition-slow;

  .film-card:hover & {
    transform: scale(1.08);
  }
}

.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(20, 25, 30, 1) 0%,
    rgba(20, 25, 30, 0.4) 40%,
    transparent 100%
  );
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;

  @include mobile {
    padding: 10px;
  }
}

.rating-badge {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 6px 10px;
  border-radius: $border-radius-sm;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @include mobile {
    padding: 5px 8px;
  }
}

.star {
  font-size: 0.85rem;

  @include mobile {
    font-size: 0.8rem;
  }
}

.rating-value {
  color: $beige;
  font-weight: 700;
  font-size: 0.9rem;

  @include mobile {
    font-size: 0.85rem;
  }
}

.year-badge {
  background: rgba($danger, 0.8);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: $border-radius-sm;
  font-weight: 600;
  font-size: 0.85rem;
  color: $text-primary;

  @include mobile {
    padding: 5px 10px;
    font-size: 0.8rem;
  }
}

// ===== CONTENT SECTION =====
.content-section {
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  flex: 1;

  @include mobile {
    padding: $spacing-md;
    gap: $spacing-sm;
  }
}

.content-header {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  @include mobile {
    gap: $spacing-xs;
  }
}

.film-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
  line-height: 1.3;

  @include mobile {
    font-size: 1.1rem;
  }
}

.film-meta {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 0.85rem;
  color: $text-secondary;
  flex-wrap: wrap;

  @include mobile {
    font-size: 0.8rem;
    gap: $spacing-xs;
  }
}

.meta-divider {
  opacity: 0.5;
}

.meta-period {
  color: $beige;
  font-weight: 600;
}

.film-synopsis {
  color: $text-secondary;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  @include line-clamp(3);

  @include mobile {
    font-size: 0.85rem;
    line-height: 1.5;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}

// ===== LOCATIONS SECTION =====
.locations-section {
  margin-top: auto;
}

.locations-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;

  @include mobile {
    margin-bottom: 8px;
  }
}

.locations-icon {
  font-size: 0.85rem;
}

.locations-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: $text-muted;
  font-weight: 600;

  @include mobile {
    font-size: 0.7rem;
  }
}

.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;

  @include mobile {
    gap: 6px;
  }
}

.location-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-sm;
  color: $text-primary;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all $transition-fast;

  @include mobile {
    padding: 5px 10px;
    font-size: 0.75rem;
  }

  &:hover {
    background: rgba($beige, 0.15);
    border-color: rgba($beige, 0.3);
  }

  &.primary {
    border-color: rgba($danger, 0.3);

    &:hover {
      background: rgba($danger, 0.15);
      border-color: rgba($danger, 0.5);
    }
  }
}

.map-icon {
  width: 14px;
  height: 14px;
  opacity: 0.5;
  transition: all $transition-fast;

  @include mobile {
    width: 12px;
    height: 12px;
  }

  .location-tag:hover & {
    opacity: 1;
  }
}

// ===== ACTIONS SECTION =====
.actions-section {
  display: flex;
  gap: 10px;
  padding-top: $spacing-md;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  @include mobile {
    padding-top: $spacing-sm;
    gap: 8px;
  }
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px $spacing-md;
  border-radius: $border-radius-sm;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-fast;
  text-decoration: none;
  @include touch-target;

  @include mobile {
    padding: 12px;
    font-size: 0.8rem;
    min-height: 44px;
  }
}

.trailer-btn {
  background: rgba($danger, 0.2);
  border: 1px solid rgba($danger, 0.4);
  color: #ff6b6b;

  &:hover {
    background: rgba($danger, 0.3);
    border-color: rgba($danger, 0.6);
    box-shadow: 0 4px 15px rgba($danger, 0.2);
  }
}

.imdb-btn {
  background: rgba(245, 197, 24, 0.15);
  border: 1px solid rgba(245, 197, 24, 0.3);
  color: #f5c518;

  .imdb-logo {
    font-weight: 800;
    font-size: 0.8rem;
    letter-spacing: -0.5px;
  }

  &:hover {
    background: rgba(245, 197, 24, 0.25);
    border-color: rgba(245, 197, 24, 0.5);
    box-shadow: 0 4px 15px rgba(245, 197, 24, 0.2);
  }
}

.wiki-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $text-primary;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.map-btn {
  background: rgba($beige, 0.15);
  border: 1px solid rgba($beige, 0.3);
  color: $beige;

  &:hover {
    background: rgba($beige, 0.25);
    border-color: rgba($beige, 0.5);
    box-shadow: 0 4px 15px rgba($beige, 0.2);
  }
}

.action-icon {
  width: 16px;
  height: 16px;

  @include mobile {
    width: 14px;
    height: 14px;
  }
}

// ===== RESULTS INFO =====
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

// ===== ANIMATIONS =====
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
