<template>
  <div class="timeline-container">
    <div class="timeline-header">
      <h3>TIMELINE</h3>
      <button @click="reset" class="reset-btn">Reset</button>
    </div>
    
    <div class="year-display">
      <span class="year-label">{{ startYear }}</span>
      <span class="separator">-</span>
      <span class="year-label">{{ endYear }}</span>
    </div>
    
    <div class="slider-container">
      <input
        v-model.number="localStartYear"
        type="range"
        min="1936"
        max="1945"
        class="slider slider-start"
        @input="updateRange"
      />
      <input
        v-model.number="localEndYear"
        type="range"
        min="1936"
        max="1945"
        class="slider slider-end"
        @input="updateRange"
      />
      <div class="slider-track">
        <div 
          class="slider-range" 
          :style="rangeStyle"
        ></div>
      </div>
    </div>
    
    <div class="year-markers">
      <span v-for="year in yearMarkers" :key="year" class="year-marker">
        {{ year }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeline } from '~/composables/useTimeline'

const { startYear, endYear, setYearRange, resetYearRange } = useTimeline()

const localStartYear = ref(startYear.value)
const localEndYear = ref(endYear.value)

const yearMarkers = [1936, 1938, 1940, 1942, 1944, 1945]

const rangeStyle = computed(() => {
  const min = 1936
  const max = 1945
  const range = max - min
  const leftPercent = ((localStartYear.value - min) / range) * 100
  const rightPercent = ((max - localEndYear.value) / range) * 100
  
  return {
    left: `${leftPercent}%`,
    right: `${rightPercent}%`
  }
})

const updateRange = () => {
  setYearRange(localStartYear.value, localEndYear.value)
}

const reset = () => {
  resetYearRange()
  localStartYear.value = 1936
  localEndYear.value = 1945
}

// Sync with composable state
watch([startYear, endYear], () => {
  localStartYear.value = startYear.value
  localEndYear.value = endYear.value
})
</script>

<style scoped>
.timeline-container {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(30, 30, 35, 0.95);
  border: 2px solid rgba(139, 69, 19, 0.6);
  border-radius: 8px;
  padding: 16px 20px;
  min-width: 280px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: 1000;
  font-family: 'Courier New', monospace;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-header h3 {
  color: #d4af37;
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.reset-btn {
  background: rgba(139, 69, 19, 0.4);
  border: 1px solid rgba(139, 69, 19, 0.6);
  color: #d4af37;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(139, 69, 19, 0.6);
  border-color: #d4af37;
}

.year-display {
  text-align: center;
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: bold;
  color: #d4af37;
  letter-spacing: 2px;
}

.year-label {
  display: inline-block;
  min-width: 60px;
}

.separator {
  margin: 0 8px;
  color: rgba(212, 175, 55, 0.5);
}

.slider-container {
  position: relative;
  height: 40px;
  margin-bottom: 8px;
}

.slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(139, 69, 19, 0.3);
  transform: translateY(-50%);
  pointer-events: none;
  border-radius: 2px;
}

.slider-range {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #8b4513, #d4af37);
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.slider {
  position: absolute;
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #d4af37;
  cursor: pointer;
  border-radius: 50%;
  pointer-events: all;
  border: 2px solid rgba(30, 30, 35, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  background: #f4cf5f;
  transform: scale(1.15);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #d4af37;
  cursor: pointer;
  border-radius: 50%;
  pointer-events: all;
  border: 2px solid rgba(30, 30, 35, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  background: #f4cf5f;
  transform: scale(1.15);
}

.slider-end {
  pointer-events: none;
}

.slider-end::-webkit-slider-thumb {
  pointer-events: all;
}

.slider-end::-moz-range-thumb {
  pointer-events: all;
}

.year-markers {
  display: flex;
  justify-content: space-between;
  color: rgba(212, 175, 55, 0.6);
  font-size: 11px;
  padding: 0 2px;
}

.year-marker {
  font-family: 'Courier New', monospace;
}
</style>
