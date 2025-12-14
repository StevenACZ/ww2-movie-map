import { ref, onMounted, onUnmounted, watch } from "vue";
import type { Ref } from "vue";
import type { Film, Location } from "../../types";

// Map configuration constants
export const MAP_CENTER: [number, number] = [50, 15]; // Europe center
export const MAP_ZOOM = 4;
export const MOBILE_ZOOM = 3;
export const PAN_SPEED = 10;

// Check if mobile
export const isMobile = (): boolean => {
  return typeof window !== "undefined" && window.innerWidth <= 768;
};

interface UseLeafletMapOptions {
  elementId: string;
  films: Film[];
  filteredFilms: Ref<Film[]>;
  onFilmSelect: (film: Film, location: Location) => void;
  onFilmHover: (film: Film | null) => void;
}

export const useLeafletMap = ({
  elementId,
  films,
  filteredFilms,
  onFilmSelect,
  onFilmHover,
}: UseLeafletMapOptions) => {
  const map = ref<any>(null);
  const highlightLayer = ref<any>(null);
  const allFilmMarkers = new Map<string, any>();
  let L: any = null;

  // WASD navigation state
  const keysPressed: Record<string, boolean> = {};
  let animationFrameId: number | null = null;

  /**
   * Initialize Leaflet and create map
   */
  const initializeMap = async () => {
    if (typeof window === "undefined") return;

    const leafletModule = await import("leaflet");
    L = leafletModule.default || leafletModule;
    await import("leaflet/dist/leaflet.css");

    const initialZoom = isMobile() ? MOBILE_ZOOM : MAP_ZOOM;

    map.value = L.map(elementId, {
      center: MAP_CENTER,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true,
      keyboard: false,
      tap: true,
      touchZoom: true,
      dragging: true,
    });

    // Add CartoDB Dark Matter tile layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
        noWrap: true,
      }
    ).addTo(map.value);

    // Set max bounds
    const worldBounds = L.latLngBounds(L.latLng(-60, -180), L.latLng(85, 180));
    map.value.setMaxBounds(worldBounds);
    map.value.options.maxBoundsViscosity = 1.0;

    L.control.zoom({ position: "topleft" }).addTo(map.value);

    // Create markers
    createAllMarkers();

    // Event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    map.value.on("zoom", handleZoomUpdates);
    handleZoomUpdates();

    animateMap();
  };

  /**
   * Create all film markers
   */
  const createAllMarkers = () => {
    if (!map.value || !L) return;

    const markerWidth = isMobile() ? 32 : 40;
    const markerHeight = isMobile() ? 48 : 60;

    films.forEach((film, filmIndex) => {
      film.locations.forEach((location) => {
        if (!location.isPrimary) return;

        // Offset the anchor to position poster to the right of the location
        // This prevents the poster from covering city/location names on the map
        const anchorOffsetX = isMobile() ? markerWidth + 5 : markerWidth + 10;

        const icon = L.divIcon({
          className: "custom-film-marker",
          html: `<div class="film-marker-content" style="background-image: url('${film.poster}'); box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);"></div>`,
          iconSize: [markerWidth, markerHeight],
          iconAnchor: [anchorOffsetX, markerHeight],
          popupAnchor: [0, -markerHeight],
        });

        const coords = [location.coordinates[1], location.coordinates[0]];
        const zIndexOffset = (films.length - filmIndex) * 100;
        const marker = L.marker(coords, { icon, zIndexOffset })
          .on("click", () => onFilmSelect(film, location))
          .addTo(map.value);

        // Hover events
        setTimeout(() => {
          const markerElement = marker.getElement();
          if (markerElement) {
            markerElement.addEventListener("mouseenter", () =>
              onFilmHover(film)
            );
            markerElement.addEventListener("mouseleave", () =>
              onFilmHover(null)
            );
          }
        }, 100);

        allFilmMarkers.set(film.id, marker);
      });
    });

    updateMarkerVisibility();
  };

  /**
   * Update marker visibility based on filtered films
   */
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

  /**
   * Handle zoom level changes
   */
  const handleZoomUpdates = () => {
    if (!map.value) return;
    const zoom = map.value.getZoom();

    const baseScale = isMobile() ? 0.8 : 1;
    const scale = baseScale + (zoom - 4) * 0.15;
    const mapContainer = document.querySelector(
      ".map-container"
    ) as HTMLElement;
    if (mapContainer) {
      mapContainer.style.setProperty(
        "--marker-scale",
        Math.max(0.7, scale).toString()
      );
    }

    if (highlightLayer.value) {
      if (zoom < 7) {
        highlightLayer.value.setStyle({ opacity: 0, fillOpacity: 0 });
      } else {
        highlightLayer.value.setStyle({ opacity: 1, fillOpacity: 0.2 });
      }
    }
  };

  /**
   * Fly to a location and show highlight
   */
  const flyToLocation = (location: Location) => {
    if (!map.value || !L) return;

    if (highlightLayer.value) {
      map.value.removeLayer(highlightLayer.value);
    }

    const radiusMap: Record<string, number> = {
      city: 5000,
      region: 30000,
      country: 200000,
    };
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

    const targetZoom = isMobile() ? 10 : 12;

    map.value.flyTo(
      [location.coordinates[1], location.coordinates[0]],
      targetZoom,
      { duration: 2.0, easeLinearity: 0.25 }
    );
  };

  /**
   * Clear highlight layer
   */
  const clearHighlight = () => {
    if (highlightLayer.value && map.value) {
      map.value.removeLayer(highlightLayer.value);
      highlightLayer.value = null;
    }
  };

  /**
   * Reset view to initial state
   */
  const resetView = () => {
    if (!map.value) return;
    const targetZoom = isMobile() ? 4 : 5;
    map.value.flyTo(map.value.getCenter(), targetZoom, { duration: 1.0 });
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

  // Watch for filtered films changes
  watch(filteredFilms, updateMarkerVisibility);

  // Cleanup
  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (map.value) {
      map.value.off("zoom", handleZoomUpdates);
      map.value.remove();
    }
  };

  return {
    map,
    initializeMap,
    flyToLocation,
    clearHighlight,
    resetView,
    cleanup,
    updateMarkerVisibility,
  };
};
