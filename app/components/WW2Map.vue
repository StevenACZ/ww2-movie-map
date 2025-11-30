<template>
  <div class="map-container">
    <div id="map" class="map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Map instance
const map = ref<any>(null)

// Leaflet module (loaded dynamically for SSR)
let L: any = null

// WASD navigation state
const keysPressed: Record<string, boolean> = {}
let animationFrameId: number | null = null

// Map configuration
const MAP_CENTER: [number, number] = [50, 20] // Europe center (matching reference)
const MAP_ZOOM = 4
const PAN_SPEED = 10 // pixels per frame (matching reference)

/**
 * Initialize Leaflet and create map
 */
onMounted(async () => {
  // Only run in browser (SSR-safe)
  if (typeof window === 'undefined') return

  // Dynamic import for SSR compatibility
  const leafletModule = await import('leaflet')
  L = leafletModule.default || leafletModule

  // Import CSS
  await import('leaflet/dist/leaflet.css')

  // Initialize map
  map.value = L.map('map', {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    zoomControl: false,
    attributionControl: true,
    keyboard: false // Disable default keyboard (we implement WASD)
  })

  // Add CartoDB Dark Matter tile layer (the black style you like!)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map.value)

  // Add zoom control to top-right
  L.control.zoom({ position: 'topright' }).addTo(map.value)

  // Set up keyboard event listeners
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // Start WASD animation loop
  animateMap()

  console.log('Map initialized with Leaflet + CartoDB Dark Matter')
})

/**
 * Cleanup on unmount
 */
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)

  // Cancel animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  // Destroy map instance
  if (map.value) {
    map.value.remove()
  }
})

/**
 * Handle keydown events - track pressed keys
 */
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase()
  keysPressed[key] = true

  // Prevent default for WASD keys to avoid scrolling
  if (['w', 'a', 's', 'd'].includes(key)) {
    e.preventDefault()
  }
}

/**
 * Handle keyup events - release pressed keys
 */
const handleKeyUp = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase()
  keysPressed[key] = false
}

/**
 * Animation loop for smooth WASD navigation
 * Runs at 60fps using requestAnimationFrame
 */
const animateMap = () => {
  if (!map.value) return

  let dx = 0
  let dy = 0

  // Calculate movement delta based on pressed keys
  if (keysPressed['w']) dy -= PAN_SPEED  // Up (north)
  if (keysPressed['s']) dy += PAN_SPEED  // Down (south)
  if (keysPressed['a']) dx -= PAN_SPEED  // Left (west)
  if (keysPressed['d']) dx += PAN_SPEED  // Right (east)

  // Apply panning if any movement detected
  if (dx !== 0 || dy !== 0) {
    map.value.panBy([dx, dy], { animate: false })
  }

  // Continue animation loop
  animationFrameId = requestAnimationFrame(animateMap)
}
</script>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

.map {
  width: 100%;
  height: 100%;
  outline: none;
}
</style>
