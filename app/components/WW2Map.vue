<template>
  <div class="map-container relative">
    <div id="map" class="map z-0"></div>

    <button class="reset-view-btn" @click="resetView" aria-label="Reset View">
      🌍
    </button>

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

  L.control.zoom({ position: "bottomright" }).addTo(map.value);

  // Create all film markers once
  createAllMarkers();

  // Event listeners
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  map.value.on("zoom", handleZoomUpdates);
  handleZoomUpdates();

  animateMap();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (map.value) {
    map.value.off("zoom", handleZoomUpdates);
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

  filmsData.films.forEach((film: Film) => {
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
      const marker = L.marker(coords, { icon })
        .on("click", () => selectFilm(film, location))
        .addTo(map.value);

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

const selectFilm = (film: Film, location: Location) => {
  selectedFilm.value = film;

  if (highlightLayer.value) {
    map.value.removeLayer(highlightLayer.value);
  }

  // Determine highlight radius based on location type
  const radiusMap = { city: 5000, region: 30000, country: 200000 };
  const radius = radiusMap[location.type] || 5000;

  highlightLayer.value = L.circle(
    [location.coordinates[1], location.coordinates[0]],
    {
      color: "#ef4444",
      fillColor: "#ef4444",
      fillOpacity: 0.2,
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

  const center = map.value.getCenter();
  const targetCenter = center.lng > 60 ? ASIA_CENTER : MAP_CENTER;
  map.value.flyTo(targetCenter, MAP_ZOOM, { duration: 1.5 });
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

<style>
.map-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #000;
  --marker-scale: 1;
}

.map {
  width: 100%;
  height: 100%;
  outline: none;
}

/* Reset View Button */
.reset-view-btn {
  position: absolute;
  bottom: 95px;
  right: 12px;
  width: 30px;
  height: 30px;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
  transition: background-color 0.2s;
}

.reset-view-btn:hover {
  background-color: #f4f4f4;
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
  border-radius: 4px;
  border: 2px solid #fff;
  transition: transform 0.1s linear, box-shadow 0.2s;
  cursor: pointer;
  transform: scale(var(--marker-scale));
  transform-origin: bottom center;
}

.film-marker-content:hover {
  transform: scale(calc(var(--marker-scale) * 1.2));
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.9) !important;
  border-color: #ef4444;
  z-index: 1000;
}

/* Combat Zone Animation */
.combat-zone-pulse {
  transform-origin: center;
  transform-box: fill-box;
  animation: pulse-red 3s infinite ease-in-out;
}

@keyframes pulse-red {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 0.2;
  }
}
</style>
