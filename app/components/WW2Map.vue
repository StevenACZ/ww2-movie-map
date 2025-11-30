<template>
  <div class="map-container">
    <MglMap
      :map-style="mapStyle"
      :center="center"
      :zoom="zoom"
      @load="onMapLoad"
    >
      <MglNavigationControl position="top-right" />
    </MglMap>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MglMap, MglNavigationControl } from '@indoorequal/vue-maplibre-gl'
import type { Map } from 'maplibre-gl'

// Map configuration - Using OpenFreeMap bright style (free, no API key)
// We'll customize it to dark in a future iteration
const mapStyle = 'https://tiles.openfreemap.org/styles/bright'
const center = ref<[number, number]>([13.41, 52.52]) // Berlin, Europe
const zoom = ref(4)

// Map instance
const mapInstance = ref<Map | null>(null)

// WASD navigation configuration
const panSpeed = 100 // pixels to pan
const easing = (t: number) => t * (2 - t) // Smooth easing function

/**
 * Handle map load event
 */
const onMapLoad = (event: { map: Map }) => {
  mapInstance.value = event.map

  // Focus the canvas to receive keyboard events
  const canvas = mapInstance.value.getCanvas()
  canvas.focus()
}

/**
 * Handle keyboard navigation (WASD keys)
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (!mapInstance.value) return

  const key = e.key.toLowerCase()

  // Define pan directions for each key
  const keyMap: Record<string, [number, number]> = {
    'w': [0, -panSpeed],  // Up
    'a': [-panSpeed, 0],  // Left
    's': [0, panSpeed],   // Down
    'd': [panSpeed, 0]    // Right
  }

  if (keyMap[key]) {
    e.preventDefault()
    mapInstance.value.panBy(keyMap[key], { easing })
  }
}

// Lifecycle hooks for keyboard event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

:deep(.maplibregl-map) {
  width: 100%;
  height: 100%;
}

:deep(.maplibregl-canvas) {
  outline: none;
}
</style>
