<template>
  <div class="map-container relative">
    <div id="map" class="map z-0"></div>
    
    <!-- UI Components -->
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
import { ref, onMounted, onUnmounted } from 'vue'
import { films } from '../../data/films.json'
import type { Film, Location } from '../../types'
import FilmModal from './FilmModal.vue'
import SelectedFilm from './SelectedFilm.vue'

// Map instance
const map = ref<any>(null)

// State
const selectedFilm = ref<Film | null>(null)
const isModalOpen = ref(false)
const markers: any[] = []

// Leaflet module (loaded dynamically for SSR)
let L: any = null

// WASD navigation state
const keysPressed: Record<string, boolean> = {}
let animationFrameId: number | null = null

// Map configuration
const MAP_CENTER: [number, number] = [50, 15] // Europe center
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

  L.control.zoom({ position: 'topright' }).addTo(map.value)

  // Add Film Markers
  addFilmMarkers()

  // Event listeners
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  
  // Zoom listener for dynamic marker scaling
  map.value.on('zoom', updateMarkerScale)
  updateMarkerScale() // Initial call

  animateMap()

  console.log('Map initialized with Films')
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (map.value) {
    map.value.off('zoom', updateMarkerScale)
    map.value.remove()
  }
})

const updateMarkerScale = () => {
  if (!map.value) return
  const zoom = map.value.getZoom()
  // Base scale 1 at zoom 4, increasing by 0.15 per zoom level
  // At zoom 15 (city), scale will be ~2.65
  const scale = 1 + (zoom - 4) * 0.15
  const mapContainer = document.querySelector('.map-container') as HTMLElement
  if (mapContainer) {
    mapContainer.style.setProperty('--marker-scale', Math.max(1, scale).toString())
  }
}

const addFilmMarkers = () => {
  (films as Film[]).forEach((film) => {
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
        .addTo(map.value)
        .on('click', () => selectFilm(film, location))
      
      markers.push(marker)
    })
  })
}

const selectFilm = (film: Film, location: Location) => {
  selectedFilm.value = film
  
  // Fly to location with high zoom (city level)
  map.value.flyTo([location.coordinates[1], location.coordinates[0]], 12, {
    duration: 2.0,
    easeLinearity: 0.25
  })
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
</style>
