<template>
  <div class="map-container relative">
    <div id="map" class="map z-0"></div>
    
    <button class="reset-view-btn" @click="resetView" aria-label="Reset View">
      🌍
    </button>

    <!-- UI Components -->
    <Timeline />
    
    <SelectedFilm 
      :film="selectedFilm" 
      @view-details="openModal" 
    />
    
    <FilmModal 
      v-if="selectedFilm"
      :film="selectedFilm" 
      :is-open="isModalOpen" 
      @close="closeModal" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Film, Location } from '../../types'
import FilmModal from './FilmModal.vue'
import SelectedFilm from './SelectedFilm.vue'
import Timeline from './Timeline.vue'
import { useTimeline } from '../composables/useTimeline'

// Get filtered films from timeline
const { filteredFilms } = useTimeline()

// Map instance
const map = ref<any>(null)

// State
const selectedFilm = ref<Film | null>(null)
const isModalOpen = ref(false)
let markerLayerGroup: any = null
const highlightLayer = ref<any>(null)

// Leaflet module (loaded dynamically for SSR)
let L: any = null

// WASD navigation state
const keysPressed: Record<string, boolean> = {}
let animationFrameId: number | null = null

// Map configuration
const MAP_CENTER: [number, number] = [50, 15] // Europe center
const ASIA_CENTER: [number, number] = [25, 120] // Asia center
const MAP_ZOOM = 4
const PAN_SPEED = 10 

/**
 * Initialize Leaflet and create map
 */
onMounted(async () => {
  if (typeof window === 'undefined') return

  const leafletModule = await import('leaflet')
  L = leafletModule.default || leafletModule
  await import('leaflet/dist/leaflet.css')

  // Initialize map
  map.value = L.map('map', {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    zoomControl: false,
    attributionControl: true,
    keyboard: false
  })

  // Add CartoDB Dark Matter tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map.value)

  L.control.zoom({ position: 'bottomright' }).addTo(map.value)

  // Initialize Marker Layer Group
  markerLayerGroup = L.layerGroup().addTo(map.value)

  // Add Film Markers
  addFilmMarkers()

  // Event listeners
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  
  // Zoom listener for dynamic marker scaling and highlight visibility
  map.value.on('zoom', handleZoomUpdates)
  handleZoomUpdates() // Initial call

  animateMap()

  console.log('Map initialized with Films')
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (map.value) {
    map.value.off('zoom', handleZoomUpdates)
    map.value.remove()
  }
})

// Watch for changes in filtered films and update markers
watch(filteredFilms, () => {
  updateMarkers()
}, { deep: true })

const handleZoomUpdates = () => {
  if (!map.value) return
  const zoom = map.value.getZoom()
  
  // 1. Marker Scaling
  // Base scale 1 at zoom 4, increasing by 0.15 per zoom level
  const scale = 1 + (zoom - 4) * 0.15
  const mapContainer = document.querySelector('.map-container') as HTMLElement
  if (mapContainer) {
    mapContainer.style.setProperty('--marker-scale', Math.max(1, scale).toString())
  }

  // 2. Highlight Layer Visibility
  // Hide the combat zone circle when zooming out to country view (zoom < 7)
  if (highlightLayer.value) {
    if (zoom < 7) {
      highlightLayer.value.setStyle({ opacity: 0, fillOpacity: 0 })
    } else {
      highlightLayer.value.setStyle({ opacity: 1, fillOpacity: 0.2 })
    }
  }
}

const updateMarkers = () => {
  if (!markerLayerGroup) return
  
  markerLayerGroup.clearLayers()
  addFilmMarkers()
}

const addFilmMarkers = () => {
  if (!markerLayerGroup) return;

  (filteredFilms.value as Film[]).forEach((film) => {
    film.locations.forEach((location) => {
      if (!location.isPrimary) return // Only show primary locations for now to avoid clutter

      // Create custom icon
      const icon = L.divIcon({
        className: 'custom-film-marker',
        html: `<div class="film-marker-content" style="background-image: url('${film.poster}'); box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);"></div>`,
        iconSize: [40, 60],
        iconAnchor: [20, 60],
        popupAnchor: [0, -60]
      })

      // Note: Leaflet uses [lat, lng], but our data is [lng, lat]
      const marker = L.marker([location.coordinates[1], location.coordinates[0]], { icon })
        .on('click', () => selectFilm(film, location))
      
      markerLayerGroup.addLayer(marker)
    })
  })
}

const selectFilm = (film: Film, location: Location) => {
  selectedFilm.value = film
  
  // Remove existing highlight
  if (highlightLayer.value) {
    map.value.removeLayer(highlightLayer.value)
  }

  // Determine radius based on location type
  let radius = 5000 // Default 5km for city
  if (location.type === 'region') radius = 30000 // 30km
  if (location.type === 'country') radius = 200000 // 200km

  // Create highlight circle (Combat Zone)
  highlightLayer.value = L.circle([location.coordinates[1], location.coordinates[0]], {
    color: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 0.2,
    weight: 1,
    className: 'combat-zone-pulse',
    radius: radius
  }).addTo(map.value)

  // Fly to location with high zoom (city level)
  map.value.flyTo([location.coordinates[1], location.coordinates[0]], 12, {
    duration: 2.0,
    easeLinearity: 0.25
  })
}

const resetView = () => {
  if (!map.value) return
  
  const center = map.value.getCenter()
  // Rough longitude check: > 60 is Asia, else Europe
  if (center.lng > 60) {
    map.value.flyTo(ASIA_CENTER, MAP_ZOOM, { duration: 1.5 })
  } else {
    map.value.flyTo(MAP_CENTER, MAP_ZOOM, { duration: 1.5 })
  }
}

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// WASD Logic
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase()
  keysPressed[key] = true
  if (['w', 'a', 's', 'd'].includes(key)) e.preventDefault()
}

const handleKeyUp = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase()
  keysPressed[key] = false
}

const animateMap = () => {
  if (!map.value) return
  let dx = 0
  let dy = 0
  if (keysPressed['w']) dy -= PAN_SPEED
  if (keysPressed['s']) dy += PAN_SPEED
  if (keysPressed['a']) dx -= PAN_SPEED
  if (keysPressed['d']) dx += PAN_SPEED

  if (dx !== 0 || dy !== 0) {
    map.value.panBy([dx, dy], { animate: false })
  }
  animationFrameId = requestAnimationFrame(animateMap)
}
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
  border: 2px solid rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.65);
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
  0% { opacity: 0.2; }
  50% { opacity: 0.4; }
  100% { opacity: 0.2; }
}
</style>
