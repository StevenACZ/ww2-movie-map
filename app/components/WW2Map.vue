<template>
  <div class="map-container relative">
    <div id="map" class="map z-0"></div>

    <button class="reset-view-btn" @click="resetView" aria-label="Reset View">
      🌍
    </button>

    <!-- Film Hover Tooltip (on hover) -->
    <Transition name="fade">
      <div v-if="hoveredFilm && !selectedFilm" class="film-hover-tooltip">
        <h3 class="film-title">{{ hoveredFilm.title }}</h3>
        <p class="film-year">{{ hoveredFilm.year }}</p>
      </div>
    </Transition>

    <!-- Film Info Tooltip (on click) -->
    <Transition name="slide-in">
      <div v-if="selectedFilm" class="film-info-panel">
        <button class="close-btn" @click="clearSelection" aria-label="Close">
          ✕
        </button>
        
        <div class="film-info-content">
          <!-- Poster -->
          <div class="film-poster">
            <img :src="selectedFilm.poster" :alt="selectedFilm.title" />
          </div>
          
          <!-- Info -->
          <div class="film-details">
            <h2 class="film-title">{{ selectedFilm.title }}</h2>
            <p class="film-year">{{ selectedFilm.year }}</p>
            
            <p class="film-synopsis">{{ selectedFilm.synopsis }}</p>
            
            <div class="film-meta">
              <span class="film-rating">
                <span class="rating-label">⭐</span>
                <span class="rating-value">{{ selectedFilm.imdbRating }}/10</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- UI Components -->
    <Timeline />

    <SelectedFilm :film="selectedFilm" @view-details="openModal" />

    <FilmModal
      v-if="selectedFilm"
      :film="selectedFilm"
      :is-open="isModalOpen"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import type { Film, Location } from "../../types";
import FilmModal from "./FilmModal.vue";
import SelectedFilm from "./SelectedFilm.vue";
import Timeline from "./Timeline.vue";
import { useTimeline } from "../composables/useTimeline";

// Get filtered films from timeline
const { filteredFilms } = useTimeline();

// Import all films data for creating all markers
import filmsData from "../../data/films.json";

// Map instance
const map = ref<any>(null);

// State
const selectedFilm = ref<Film | null>(null);
const hoveredFilm = ref<Film | null>(null);
const isModalOpen = ref(false);
const allFilmMarkers = new Map(); // Map<filmId, marker> - created once, never removed
const highlightLayer = ref<any>(null);

// Leaflet module (loaded dynamically for SSR)
let L: any = null;

// WASD navigation state
const keysPressed: Record<string, boolean> = {};
let animationFrameId: number | null = null;

// Map configuration
const MAP_CENTER: [number, number] = [50, 15]; // Europe center
const ASIA_CENTER: [number, number] = [25, 120]; // Asia center
const MAP_ZOOM = 4;
const PAN_SPEED = 10;

/**
 * Initialize Leaflet and create map
 */
onMounted(async () => {
  if (typeof window === "undefined") return;

  const leafletModule = await import("leaflet");
  L = leafletModule.default || leafletModule;
  await import("leaflet/dist/leaflet.css");

  // Initialize map
  map.value = L.map("map", {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    zoomControl: false,
    attributionControl: true,
    keyboard: false,
  });

  // Add CartoDB Dark Matter tile layer
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(map.value);

  L.control.zoom({ position: "topleft" }).addTo(map.value);

  // Create all film markers once
  createAllMarkers();

  // Event listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  map.value.on("zoom", handleZoomUpdates);
  map.value.on("click", clearSelection); // Clear selection when clicking on map
  handleZoomUpdates();

  animateMap();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (map.value) {
    map.value.off("zoom", handleZoomUpdates);
    map.value.off("click", clearSelection);
    map.value.remove();
  }
});

// Watch for timeline changes and update marker visibility
watch(filteredFilms, () => {
  updateMarkerVisibility();
});

const handleZoomUpdates = () => {
  if (!map.value) return;
  const zoom = map.value.getZoom();

  // Marker scaling based on zoom level
  const scale = 1 + (zoom - 4) * 0.15;
  const mapContainer = document.querySelector(".map-container") as HTMLElement;
  if (mapContainer) {
    mapContainer.style.setProperty(
      "--marker-scale",
      Math.max(1, scale).toString()
    );
  }

  // Hide highlight layer at low zoom levels
  if (highlightLayer.value) {
    if (zoom < 7) {
      highlightLayer.value.setStyle({ opacity: 0, fillOpacity: 0 });
    } else {
      highlightLayer.value.setStyle({ opacity: 1, fillOpacity: 0.2 });
    }
  }
};

// Create all film markers once (never removed, only shown/hidden)
const createAllMarkers = () => {
  if (!map.value || !L) return;

  // Reverse to give earlier films higher z-index
  filmsData.films.forEach((film: Film, filmIndex: number) => {
    film.locations.forEach((location) => {
      if (!location.isPrimary) return;

      const icon = L.divIcon({
        className: "custom-film-marker",
        html: `<div class="film-marker-content" style="background-image: url('${film.poster}'); box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);"></div>`,
        iconSize: [40, 60],
        iconAnchor: [20, 60],
        popupAnchor: [0, -60],
      });

      const coords = [location.coordinates[1], location.coordinates[0]];
      // Give higher z-index to earlier films (reverse order)
      const zIndexOffset = (filmsData.films.length - filmIndex) * 100;
      const marker = L.marker(coords, { 
        icon,
        zIndexOffset 
      })
        .on("click", () => selectFilm(film, location))
        .addTo(map.value);

      // Add hover events to the marker's DOM element after Vue updates DOM
      setTimeout(() => {
        const markerElement = marker.getElement();
        if (markerElement) {
          markerElement.addEventListener("mouseenter", () => {
            console.log("Hover IN:", film.title);
            hoverFilm(film);
          });
          markerElement.addEventListener("mouseleave", () => {
            console.log("Hover OUT");
            unhoverFilm();
          });
        }
      }, 100);

      allFilmMarkers.set(film.id, marker);
    });
  });

  updateMarkerVisibility();
};

// Toggle marker visibility based on timeline filter
const updateMarkerVisibility = () => {
  const filteredIds = new Set(filteredFilms.value.map((f) => f.id));

  allFilmMarkers.forEach((marker, filmId) => {
    const shouldShow = filteredIds.has(filmId);
    const markerElement = marker.getElement();

    if (markerElement) {
      markerElement.style.display = shouldShow ? "" : "none";
    }
  });
};

const hoverFilm = (film: Film) => {
  console.log("hoverFilm called", film.title, "selectedFilm:", selectedFilm.value);
  if (!selectedFilm.value) {
    hoveredFilm.value = film;
    console.log("hoveredFilm set to:", hoveredFilm.value?.title);
  }
};

const unhoverFilm = () => {
  console.log("unhoverFilm called");
  hoveredFilm.value = null;
};

const selectFilm = (film: Film, location: Location) => {
  selectedFilm.value = film;
  hoveredFilm.value = null; // Clear hover when clicking

  if (highlightLayer.value) {
    map.value.removeLayer(highlightLayer.value);
  }

  // Determine highlight radius based on location type
  const radiusMap = { city: 5000, region: 30000, country: 200000 };
  const radius = radiusMap[location.type] || 5000;

    highlightLayer.value = L.circle(
    [location.coordinates[1], location.coordinates[0]],
    {
      color: "#dc2626",
      fillColor: "#dc2626",
      fillOpacity: 0.4,
      weight: 1,
      className: "combat-zone-pulse",
      radius,
    }
  ).addTo(map.value);

  map.value.flyTo([location.coordinates[1], location.coordinates[0]], 12, {
    duration: 2.0,
    easeLinearity: 0.25,
  });
};

const resetView = () => {
  if (!map.value) return;

  clearSelection(); // Clear selection when resetting view
  const center = map.value.getCenter();
  const targetCenter = center.lng > 60 ? ASIA_CENTER : MAP_CENTER;
  map.value.flyTo(targetCenter, MAP_ZOOM, { duration: 1.5 });
};

const clearSelection = () => {
  selectedFilm.value = null;
  if (highlightLayer.value) {
    map.value.removeLayer(highlightLayer.value);
    highlightLayer.value = null;
  }
};

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// WASD keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (["w", "a", "s", "d"].includes(key)) {
    keysPressed[key] = true;
    e.preventDefault();
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  keysPressed[e.key.toLowerCase()] = false;
};

const animateMap = () => {
  if (!map.value) return;

  const dx =
    (keysPressed["d"] ? PAN_SPEED : 0) - (keysPressed["a"] ? PAN_SPEED : 0);
  const dy =
    (keysPressed["s"] ? PAN_SPEED : 0) - (keysPressed["w"] ? PAN_SPEED : 0);

  if (dx !== 0 || dy !== 0) {
    map.value.panBy([dx, dy], { animate: false });
  }

  animationFrameId = requestAnimationFrame(animateMap);
};
</script>

<style lang="scss">
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;

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

/* Reset View Button */
.reset-view-btn {
  position: absolute;
  top: 150px; /* Below info button */
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
  z-index: $z-modal;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all $transition-normal;
  border-radius: 8px;
  backdrop-filter: blur(10px);

  &:hover {
    background: linear-gradient(
      135deg,
      rgba($beige, 0.15) 0%,
      rgba($beige-dark, 0.2) 100%
    );
    border-color: rgba($beige, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5),
                0 0 20px rgba($beige, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Leaflet Zoom Controls Custom Styles */
.leaflet-control-zoom {
  border: 1.5px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
  margin-top: 80px !important;
  backdrop-filter: blur(10px);

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

    &:hover {
      background: linear-gradient(
        135deg,
        rgba($beige, 0.15) 0%,
        rgba($beige-dark, 0.2) 100%
      ) !important;
      color: $beige !important;
      transform: scale(1.05);
    }

    &:last-child {
      border-bottom: none !important;
    }
  }
}

/* Marker Styles */
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
              box-shadow 0.3s ease,
              border-color 0.3s ease;
  cursor: pointer;
  transform: scale(var(--marker-scale));
  transform-origin: bottom center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  &:hover {
    transform: scale(calc(var(--marker-scale) * 1.25));
    box-shadow: 0 0 30px rgba($beige, 0.9),
                0 8px 24px rgba(0, 0, 0, 0.7) !important;
    border-color: $beige;
    z-index: $z-modal;
  }
}

/* Combat Zone Animation */
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

/* Film Hover Tooltip (appears on hover) */
.film-hover-tooltip {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: $z-tooltip;
  background: linear-gradient(
    135deg,
    rgba(20, 25, 30, 0.98) 0%,
    rgba(15, 20, 25, 0.96) 100%
  );
  border: 2px solid rgba($beige, 0.6);
  border-radius: 10px;
  padding: 14px 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8),
              0 0 20px rgba($beige, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  min-width: 280px;
  text-align: center;
  pointer-events: none;

  .film-title {
    font-family: 'Cinzel', serif;
    font-size: 22px;
    font-weight: 700;
    color: $beige;
    margin: 0 0 6px 0;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8),
                 0 0 20px rgba($beige, 0.4);
    letter-spacing: 0.5px;
  }

  .film-year {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-weight: 500;
    letter-spacing: 2px;
  }
}

/* Film Info Panel (appears on click) - Top Right */
.film-info-panel {
  position: fixed;
  top: 90px;
  right: 25px;
  width: 500px;
  max-width: calc(100vw - 60px);
  z-index: $z-popover;
  background: linear-gradient(
    135deg,
    rgba(20, 25, 30, 0.98) 0%,
    rgba(15, 20, 25, 0.96) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.9),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px) saturate(180%);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;
  z-index: 10;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 1);
  }
}

.film-info-content {
  display: flex;
  gap: $spacing-lg;
  padding: $spacing-lg;
}

.film-poster {
  flex-shrink: 0;
  width: 160px;
  height: 240px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.film-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding-right: $spacing-xl;
  min-width: 0;

  .film-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: $beige;
    margin: 0;
    line-height: 1.2;
  }

  .film-year {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    font-weight: 500;
  }

  .film-synopsis {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
    margin: $spacing-sm 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }
}

.film-meta {
  display: flex;
  gap: $spacing-md;
  margin-top: auto;
  margin-bottom: 5px;
  padding-top: $spacing-sm;
}

.film-rating {
  display: flex;
  align-items: baseline;
  gap: $spacing-xs;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: $beige;

  .rating-label {
    font-size: 20px;
    line-height: 1;
  }

  .rating-value {
    color: rgba(255, 255, 255, 0.9);
  }
}

/* Slide-in Transition */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-in-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-in-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-in-enter-to,
.slide-in-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .film-info-panel {
    top: 70px;
    right: 15px;
    left: 15px;
    width: auto;
    max-width: none;
  }

  .film-info-content {
    flex-direction: column;
    gap: $spacing-md;
  }

  .film-poster {
    width: 120px;
    height: 180px;
    margin: 0 auto;
  }

  .film-details {
    padding-right: 0;

    .film-title {
      font-size: 20px;
    }

    .film-synopsis {
      -webkit-line-clamp: 4;
    }
  }
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
