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

<style scoped>
.films-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1a 0%, #0f172a 50%, #1a1f2e 100%);
  color: white;
  font-family: "DM Sans", "Inter", sans-serif;
  position: relative;
  padding: 120px 24px 100px;
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

/* ===== HEADER ===== */
.page-header {
  text-align: center;
  margin-bottom: 48px;
  position: relative;
  z-index: 10;
}

.collection-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fcd34d;
  letter-spacing: 2px;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.page-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0 0 16px 0;
  color: #94a3b8;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.page-description {
  color: #64748b;
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ===== CONTROLS ===== */
.controls-wrapper {
  max-width: 1200px;
  margin: 0 auto 40px;
  position: relative;
  z-index: 10;
}

.controls {
  display: flex;
  gap: 16px;
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
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 14px 40px 14px 48px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-input::placeholder {
  color: #64748b;
}

.search-input:focus {
  outline: none;
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
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
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.filter-group {
  display: flex;
  gap: 4px;
  background: rgba(15, 23, 42, 0.8);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.filter-btn {
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  color: #94a3b8;
}

.filter-btn.active {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
}

/* ===== FILMS GRID ===== */
.films-container {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
  position: relative;
  z-index: 10;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 24px;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results-text {
  font-size: 1.5rem;
  color: #94a3b8;
  margin: 0 0 8px 0;
}

.no-results-hint {
  color: #64748b;
  margin: 0;
}

/* ===== FILM CARD ===== */
.film-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.film-card:hover {
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(245, 158, 11, 0.1);
}

/* ===== POSTER SECTION ===== */
.poster-section {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.film-card:hover .poster-image {
  transform: scale(1.08);
}

.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 15, 26, 1) 0%,
    rgba(10, 15, 26, 0.4) 40%,
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
  gap: 4px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.star {
  font-size: 0.85rem;
}

.rating-value {
  color: #fcd34d;
  font-weight: 700;
  font-size: 0.9rem;
}

.year-badge {
  background: rgba(239, 68, 68, 0.8);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  color: white;
}

/* ===== CONTENT SECTION ===== */
.content-section {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.content-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.film-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.3;
}

.film-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #94a3b8;
}

.meta-divider {
  opacity: 0.5;
}

.meta-period {
  color: #fcd34d;
  font-weight: 600;
}

.film-synopsis {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== LOCATIONS SECTION ===== */
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
  color: #64748b;
  font-weight: 600;
}

.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-tag:hover {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
}

.location-tag.primary {
  border-color: rgba(239, 68, 68, 0.3);
}

.location-tag.primary:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
}

.map-icon {
  width: 14px;
  height: 14px;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.location-tag:hover .map-icon {
  opacity: 1;
}

/* ===== ACTIONS SECTION ===== */
.actions-section {
  display: flex;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.wiki-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.wiki-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.map-btn {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

.map-btn:hover {
  background: rgba(245, 158, 11, 0.25);
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
}

.action-icon {
  width: 16px;
  height: 16px;
}

/* ===== RESULTS INFO ===== */
.results-info {
  text-align: center;
  margin-top: 48px;
  position: relative;
  z-index: 10;
}

.info-text {
  font-size: 0.85rem;
  color: #64748b;
  background: rgba(15, 23, 42, 0.8);
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* ===== ANIMATIONS ===== */
.film-card-enter-active {
  transition: all 0.4s ease;
  transition-delay: var(--delay, 0s);
}

.film-card-leave-active {
  transition: all 0.3s ease;
}

.film-card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.film-card-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .films-page {
    padding: 100px 16px 80px;
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
