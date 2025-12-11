<template>
  <div class="map-container relative">
    <div id="map" class="map z-0"></div>

    <button
      class="reset-view-btn"
      @click="handleResetView"
      aria-label="Reset View"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="reset-icon"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
        />
      </svg>
    </button>

    <!-- Film Hover Tooltip (on hover) -->
    <MapHoverTooltip v-if="!selectedFilm" :film="hoveredFilm" />

    <!-- Film Info Panel (on click) -->
    <MapFilmPanel
      :film="selectedFilm"
      @close="clearSelection"
      @open-trailer="openTrailer"
    />

    <!-- UI Components -->
    <Timeline />

    <SelectedFilm :film="selectedFilm" @view-details="openModal" />

    <FilmModal
      v-if="selectedFilm"
      :film="selectedFilm"
      :is-open="isModalOpen"
      @close="closeModal"
    />

    <!-- Trailer Modal (Desktop Only) -->
    <TrailerModal
      :is-open="isTrailerOpen"
      :trailer-url="activeTrailerUrl"
      :film-title="activeFilmTitle"
      @close="closeTrailer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import type { Film, Location } from "../../types";
import { useLeafletMap, isMobile } from "../composables/useLeafletMap";
import { useTimeline } from "../composables/useTimeline";

// Import components
import FilmModal from "./FilmModal.vue";
import SelectedFilm from "./SelectedFilm.vue";
import Timeline from "./Timeline.vue";
import MapHoverTooltip from "./map/MapHoverTooltip.vue";
import MapFilmPanel from "./map/MapFilmPanel.vue";

// Import film data
import filmsData from "../../data/films.json";

// Get route for query params
const route = useRoute();

// Get filtered films from timeline
const { filteredFilms } = useTimeline();

// State
const selectedFilm = ref<Film | null>(null);
const hoveredFilm = ref<Film | null>(null);
const isModalOpen = ref(false);
const isTrailerOpen = ref(false);
const activeTrailerUrl = ref("");
const activeFilmTitle = ref("");

// Film selection handler
const handleFilmSelect = (film: Film, location: Location) => {
  selectedFilm.value = film;
  hoveredFilm.value = null;
  flyToLocation(location);
};

// Film hover handler
const handleFilmHover = (film: Film | null) => {
  if (!selectedFilm.value) {
    hoveredFilm.value = film;
  }
};

// Initialize map with composable
const { initializeMap, flyToLocation, clearHighlight, resetView, cleanup } =
  useLeafletMap({
    elementId: "map",
    films: filmsData.films as Film[],
    filteredFilms,
    onFilmSelect: handleFilmSelect,
    onFilmHover: handleFilmHover,
  });

// Handle filmId from URL query parameter
const handleFilmIdFromUrl = () => {
  const filmId = route.query.filmId as string;
  if (filmId) {
    const film = filmsData.films.find((f) => f.id === filmId);
    if (film) {
      const primaryLocation = film.locations.find((loc) => loc.isPrimary);
      if (primaryLocation) {
        setTimeout(() => {
          handleFilmSelect(film as Film, primaryLocation as Location);
        }, 500);
      }
    }
  }
};

onMounted(async () => {
  await initializeMap();
  handleFilmIdFromUrl();
});

onUnmounted(() => {
  cleanup();
});

// Clear selection
const clearSelection = () => {
  selectedFilm.value = null;
  clearHighlight();
};

// Reset view
const handleResetView = () => {
  clearSelection();
  resetView();
};

// Modal handlers
const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// Trailer handlers
const openTrailer = (film: Film) => {
  if (!film.trailerUrl) return;

  if (isMobile()) {
    window.open(film.trailerUrl, "_blank");
  } else {
    activeTrailerUrl.value = film.trailerUrl;
    activeFilmTitle.value = `${film.title} (${film.year})`;
    isTrailerOpen.value = true;
  }
};

const closeTrailer = () => {
  isTrailerOpen.value = false;
  activeTrailerUrl.value = "";
  activeFilmTitle.value = "";
};
</script>

<style lang="scss">
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.map {
  &-container {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    background-color: #000;
    --marker-scale: 1;
  }
}

.map {
  width: 100%;
  height: 100%;
  outline: none;
}

// Reset View Button
.reset-view-btn {
  position: absolute;
  top: 160px;
  left: 10px;
  width: 38px;
  height: 38px;
  background: linear-gradient(
    135deg,
    rgba(30, 30, 35, 0.9) 0%,
    rgba(20, 25, 30, 0.95) 100%
  );
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  z-index: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all $transition-normal;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  color: $beige;

  .reset-icon {
    width: 20px;
    height: 20px;
    transition: transform $transition-fast;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      rgba($beige, 0.15) 0%,
      rgba($beige-dark, 0.2) 100%
    );
    border-color: rgba($beige, 0.5);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba($beige, 0.2);

    .reset-icon {
      transform: rotate(20deg);
    }
  }

  @include mobile {
    top: 160px;
    width: 44px;
    height: 44px;

    .reset-icon {
      width: 22px;
      height: 22px;
    }
  }
}

// Leaflet Controls
.leaflet-top,
.leaflet-bottom {
  z-index: 500 !important;
}

.leaflet-control {
  z-index: 500 !important;
}

.leaflet-control-zoom {
  border: 1.5px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
  margin-top: 80px !important;
  backdrop-filter: blur(10px);
  z-index: 500 !important;

  @include mobile {
    margin-top: 70px !important;
  }

  a {
    background: linear-gradient(
      135deg,
      rgba(30, 30, 35, 0.9) 0%,
      rgba(20, 25, 30, 0.95) 100%
    ) !important;
    color: rgba(255, 255, 255, 0.8) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    font-weight: bold;
    transition: all $transition-normal !important;
    width: 34px !important;
    height: 34px !important;
    line-height: 34px !important;

    @include mobile {
      width: 40px !important;
      height: 40px !important;
      line-height: 40px !important;
    }

    &:hover {
      background: linear-gradient(
        135deg,
        rgba($beige, 0.15) 0%,
        rgba($beige-dark, 0.2) 100%
      ) !important;
      color: $beige !important;
    }

    &:last-child {
      border-bottom: none !important;
    }
  }
}

// Marker Styles
.custom-film-marker {
  background: transparent;
  border: none;
}

.film-marker-content {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  border: 2.5px solid rgba(255, 255, 255, 0.9);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
  transform: scale(var(--marker-scale));
  transform-origin: bottom center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  @include mobile {
    border-width: 2px;
    border-radius: 4px;
  }

  &:hover {
    transform: scale(calc(var(--marker-scale) * 1.25));
    box-shadow: 0 0 30px rgba($beige, 0.9), 0 8px 24px rgba(0, 0, 0, 0.7) !important;
    border-color: $beige;
    z-index: $z-modal;
  }
}

// Combat Zone Animation
.combat-zone-pulse {
  transform-origin: center;
  transform-box: fill-box;
  animation: pulse-red 3s infinite ease-in-out;
}

@keyframes pulse-red {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
