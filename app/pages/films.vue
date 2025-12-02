<template>
  <div class="films-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">WW2 Films Collection</h1>
        <p class="page-subtitle">Explore World War II through cinema</p>
      </div>

      <!-- Search and Filter -->
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
            placeholder="Search films..."
            class="search-input"
          />
        </div>

        <select v-model="sortBy" class="sort-select">
          <option value="year">Sort by Year</option>
          <option value="title">Sort by Title</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>
    </header>

    <!-- Films List -->
    <div class="films-container">
      <div v-if="filteredFilms.length === 0" class="no-results">
        <p>No films found</p>
      </div>

      <article
        v-for="film in filteredFilms"
        :key="film.id"
        class="film-card"
      >
        <!-- Poster -->
        <div class="poster-container">
          <img
            :src="film.poster"
            :alt="film.title"
            class="poster-image"
            loading="lazy"
          />
          <div class="poster-overlay">
            <div class="rating-badge">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="star-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <span>{{ film.imdbRating }}</span>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="film-info">
          <div class="film-header">
            <h2 class="film-title">{{ film.title }}</h2>
            <div class="film-meta">
              <span class="meta-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="meta-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {{ film.year }}
              </span>
              <span class="meta-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="meta-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ film.country }}
              </span>
              <span class="meta-item event-years">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="meta-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {{ film.eventYears.start }}-{{ film.eventYears.end }}
              </span>
            </div>
          </div>

          <p class="film-synopsis">{{ film.synopsis }}</p>

          <div class="film-locations">
            <h4 class="locations-title">Locations</h4>
            <ul class="locations-list">
              <li
                v-for="loc in film.locations"
                :key="loc.name"
                class="location-item"
              >
                <span
                  class="location-dot"
                  :class="{ primary: loc.isPrimary }"
                ></span>
                <span class="location-name">{{ loc.name }}</span>
                <span class="location-type">{{ loc.type }}</span>
              </li>
            </ul>
          </div>

          <div class="film-actions">
            <a
              :href="getWikipediaUrl(film.title)"
              target="_blank"
              rel="noopener noreferrer"
              class="wiki-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="button-icon"
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
              View on Wikipedia
            </a>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Film } from '../../types';
import filmsData from '../../data/films.json';

// State
const searchQuery = ref('');
const sortBy = ref('year');

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
      case 'year':
        return b.year - a.year;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'rating':
        return b.imdbRating - a.imdbRating;
      default:
        return 0;
    }
  });

  return films;
});

// Methods
const getWikipediaUrl = (title: string) => {
  const formattedTitle = title.replace(/ /g, '_');
  return `https://en.wikipedia.org/wiki/${formattedTitle}`;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;

.films-page {
  min-height: 100vh;
  background: $bg-darker;
  padding: 100px $spacing-lg $spacing-2xl;

  @media (max-width: 768px) {
    padding: 80px $spacing-md $spacing-xl;
  }
}

/* ===== HEADER ===== */
.page-header {
  max-width: 1600px;
  margin: 0 auto $spacing-2xl;
}

.header-content {
  margin-bottom: $spacing-xl;
  text-align: center;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: $beige;
  margin-bottom: $spacing-sm;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: serif;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.page-subtitle {
  font-size: 1.125rem;
  color: $text-muted;
  font-weight: 300;
}

/* ===== CONTROLS ===== */
.controls {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.search-box {
  flex: 1;
  position: relative;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: $gray;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: $spacing-md $spacing-md $spacing-md 48px;
  background: $bg-card;
  border: 2px solid rgba($beige, 0.2);
  border-radius: $border-radius-md;
  color: $text-primary;
  font-size: 1rem;
  transition: $transition-normal;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    outline: none;
    border-color: rgba($beige, 0.5);
    background: rgba($bg-card, 1);
  }
}

.sort-select {
  padding: $spacing-md $spacing-xl $spacing-md $spacing-lg;
  background: $bg-card;
  border: 2px solid rgba($beige, 0.2);
  border-radius: $border-radius-md;
  color: $text-primary;
  font-size: 1rem;
  cursor: pointer;
  transition: $transition-normal;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23c9b896'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right $spacing-md center;
  background-size: 20px;

  &:focus {
    outline: none;
    border-color: rgba($beige, 0.5);
  }

  option {
    background: $bg-darker;
  }
}

/* ===== FILMS CONTAINER ===== */
.films-container {
  max-width: 1800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-lg;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: $spacing-2xl;
  color: $text-muted;
  font-size: 1.25rem;
}

/* ===== FILM CARD ===== */
.film-card {
  display: flex;
  flex-direction: column;
  background: $bg-card;
  border: 2px solid rgba($beige, 0.15);
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition: $transition-normal;
  height: 100%;

  &:hover {
    border-color: rgba($beige, 0.4);
    box-shadow: $shadow-lg, 0 0 30px rgba($beige, 0.15);
  }
}

/* ===== POSTER ===== */
.poster-container {
  position: relative;
  width: 100%;
  height: 320px;
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 280px;
  }
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: $transition-slow;

  .film-card:hover & {
    transform: scale(1.05);
  }
}

.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  display: flex;
  align-items: flex-end;
  padding: $spacing-md;
}

.rating-badge {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background: rgba($beige, 0.9);
  color: $bg-darker;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
  font-weight: 700;
  font-size: 0.875rem;
  backdrop-filter: blur(8px);
}

.star-icon {
  width: 16px;
  height: 16px;
}

/* ===== FILM INFO ===== */
.film-info {
  flex: 1;
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  min-width: 0;
}

.film-header {
  margin-bottom: $spacing-xs;
}

.film-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: $beige;
  margin-bottom: $spacing-xs;
  font-family: serif;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.film-meta {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  color: $text-secondary;
  font-size: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.event-years {
  color: $beige-light;
  font-weight: 600;
}

.film-synopsis {
  color: $text-secondary;
  line-height: 1.6;
  font-size: 0.875rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== LOCATIONS ===== */
.film-locations {
  margin-top: auto;
}

.locations-title {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: $gray;
  margin-bottom: 6px;
  font-weight: 600;
}

.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba($beige, 0.1);
  border: 1px solid rgba($beige, 0.2);
  border-radius: $border-radius-sm;
  font-size: 0.75rem;
}

.location-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: $gray;
  flex-shrink: 0;

  &.primary {
    background: $danger;
  }
}

.location-name {
  color: $text-primary;
  font-weight: 500;
}

.location-type {
  color: $text-muted;
  font-size: 0.625rem;
  text-transform: uppercase;
}

/* ===== ACTIONS ===== */
.film-actions {
  margin-top: $spacing-sm;
  padding-top: 16px;
  border-top: 1px solid rgba($beige, 0.1);
}

.wiki-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: $spacing-xs $spacing-md;
  background: linear-gradient(
    135deg,
    rgba($beige, 0.15) 0%,
    rgba($beige, 0.1) 100%
  );
  border: 2px solid rgba($beige, 0.3);
  border-radius: $border-radius-md;
  color: $beige;
  font-weight: 600;
  font-size: 0.75rem;
  text-decoration: none;
  transition: $transition-normal;
  cursor: pointer;

  &:hover {
    background: linear-gradient(
      135deg,
      rgba($beige, 0.25) 0%,
      rgba($beige, 0.2) 100%
    );
    border-color: rgba($beige, 0.5);
    box-shadow: 0 4px 12px rgba($beige, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }
}

.button-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Custom scrollbar */
* {
  @include custom-scrollbar;
}
</style>
