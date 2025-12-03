<template>
  <div class="films-page">
    <!-- Background Elements -->
    <div class="world-map-bg"></div>
    <div class="grid-pattern"></div>

    <!-- Header -->
    <header class="page-header">
      <span class="collection-badge">{{ filteredFilms.length }} Films</span>
      <h1 class="page-title">Film Collection</h1>
      <h2 class="page-subtitle">World War II Through Cinema</h2>
      <p class="page-description">
        Explore iconic films depicting the events, battles, and human stories of
        the Second World War
      </p>
    </header>

    <!-- Search and Filter Controls -->
    <div class="controls-wrapper">
      <div class="controls">
        <div class="search-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="search-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
            type="text"
            placeholder="Search by title, country, or synopsis..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            class="clear-search"
            @click="searchQuery = ''"
          >
            ×
          </button>
        </div>

        <div class="filter-group">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="filter-btn"
            :class="{ active: sortBy === option.value }"
            @click="sortBy = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Films Grid -->
    <div class="films-container">
      <TransitionGroup name="film-card">
        <div
          v-if="filteredFilms.length === 0"
          key="no-results"
          class="no-results"
        >
          <div class="no-results-icon">🎬</div>
          <p class="no-results-text">No films found</p>
          <p class="no-results-hint">Try adjusting your search</p>
        </div>

        <article
          v-for="(film, index) in filteredFilms"
          :key="film.id"
          class="film-card"
          :style="{ '--delay': index * 0.05 + 's' }"
        >
          <!-- Poster Section -->
          <div class="poster-section">
            <img
              :src="film.poster"
              :alt="film.title"
              class="poster-image"
              loading="lazy"
            />
            <div class="poster-overlay">
              <div class="rating-badge">
                <span class="star">⭐</span>
                <span class="rating-value">{{ film.imdbRating }}</span>
              </div>
              <div class="year-badge">{{ film.year }}</div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="content-section">
            <div class="content-header">
              <h3 class="film-title">{{ film.title }}</h3>
              <div class="film-meta">
                <span class="meta-country">{{ film.country }}</span>
                <span class="meta-divider">•</span>
                <span class="meta-period"
                  >{{ film.eventYears.start }}-{{ film.eventYears.end }}</span
                >
              </div>
            </div>

            <p class="film-synopsis">{{ film.synopsis }}</p>

            <!-- Locations -->
            <div class="locations-section">
              <div class="locations-header">
                <span class="locations-icon">📍</span>
                <span class="locations-label">Filming Locations</span>
              </div>
              <div class="locations-list">
                <button
                  v-for="loc in film.locations"
                  :key="loc.name"
                  class="location-tag"
                  :class="{ primary: loc.isPrimary }"
                  @click="viewOnMap(film.id)"
                >
                  {{ loc.name }}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="map-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                :href="getWikipediaUrl(film.title)"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn wiki-btn"
              >
                <span>Wikipedia</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="action-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <button class="action-btn map-btn" @click="viewOnMap(film.id)">
                <span>View on Map</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="action-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
              </button>
            </div>
          </div>
        </article>
      </TransitionGroup>
    </div>

    <!-- Results Info -->
    <div class="results-info">
      <span class="info-text">
        Showing {{ filteredFilms.length }} of {{ totalFilms }} films
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { Film } from "../../types";
import filmsData from "../../data/films.json";

const router = useRouter();

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
const getWikipediaUrl = (title: string) => {
  const formattedTitle = title.replace(/ /g, "_");
  return `https://en.wikipedia.org/wiki/${formattedTitle}`;
};

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
}

.page-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0 0 $spacing-md 0;
  color: $text-secondary;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.page-description {
  color: $text-muted;
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

// ===== CONTROLS =====
.controls-wrapper {
  max-width: 1200px;
  margin: 0 auto 40px;
  position: relative;
  z-index: $z-dropdown;
}

.controls {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.search-box {
  flex: 1;
  max-width: 400px;
  min-width: 280px;
  position: relative;
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

  &::placeholder {
    color: $text-muted;
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
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px $spacing-lg;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: $spacing-md;
  opacity: 0.5;
}

.no-results-text {
  font-size: 1.5rem;
  color: $text-secondary;
  margin: 0 0 $spacing-sm 0;
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
}

.star {
  font-size: 0.85rem;
}

.rating-value {
  color: $beige;
  font-weight: 700;
  font-size: 0.9rem;
}

.year-badge {
  background: rgba($danger, 0.8);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: $border-radius-sm;
  font-weight: 600;
  font-size: 0.85rem;
  color: $text-primary;
}

// ===== CONTENT SECTION =====
.content-section {
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  flex: 1;
}

.content-header {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.film-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
  line-height: 1.3;
}

.film-meta {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 0.85rem;
  color: $text-secondary;
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
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
}

.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
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
}

// ===== RESULTS INFO =====
.results-info {
  text-align: center;
  margin-top: $spacing-2xl;
  position: relative;
  z-index: $z-dropdown;
}

.info-text {
  font-size: 0.85rem;
  color: $text-muted;
  background: $bg-card;
  padding: $spacing-sm $spacing-lg;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
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

// ===== RESPONSIVE =====
@include mobile {
  .films-page {
    padding: 100px $spacing-md 80px;
  }

  .page-title {
    font-size: 2.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
    letter-spacing: 2px;
  }

  .controls {
    flex-direction: column;
    gap: 12px;
  }

  .search-box {
    width: 100%;
    max-width: none;
  }

  .filter-group {
    width: 100%;
    justify-content: center;
  }

  .films-container {
    grid-template-columns: 1fr;
  }
}
</style>
