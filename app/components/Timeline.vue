<template>
  <div class="timeline-container">
    <div class="timeline-header">
      <h3>TIMELINE:</h3>

      <div class="year-display">
        <span class="year-label">{{ startYear }}</span>
        <span class="separator">-</span>
        <span class="year-label">{{ endYear }}</span>
      </div>

      <button @click="reset" class="reset-btn">RESET</button>
    </div>

    <div class="slider-container">
      <div class="slider-track">
        <div class="slider-range" :style="rangeStyle"></div>
      </div>
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
    </div>

    <div class="year-markers">
      <div
        v-for="yearData in yearMarkers"
        :key="yearData.year"
        class="year-marker"
      >
        <div class="year-number">{{ yearData.year }}</div>
        <div class="year-event" v-html="yearData.event"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTimeline } from "~/composables/useTimeline";

const { startYear, endYear, setYearRange, resetYearRange } = useTimeline();

const localStartYear = ref(startYear.value);
const localEndYear = ref(endYear.value);

const yearMarkers = [
  { year: 1936, event: "Spanish<br>Civil War" },
  { year: 1937, event: "" },
  { year: 1938, event: "Anschluss" },
  { year: 1939, event: "War Begins" },
  { year: 1940, event: "" },
  { year: 1941, event: "Pearl Harbor" },
  { year: 1942, event: "Midway" },
  { year: 1943, event: "" },
  { year: 1944, event: "D-Day" },
  { year: 1945, event: "War Ends" },
];

const rangeStyle = computed(() => {
  const min = 1936;
  const max = 1945;
  const range = max - min;
  const leftPercent = ((localStartYear.value - min) / range) * 100;
  const rightPercent = ((max - localEndYear.value) / range) * 100;

  return {
    left: `${leftPercent}%`,
    right: `${rightPercent}%`,
  };
});

const updateRange = () => {
  setYearRange(localStartYear.value, localEndYear.value);
};

const reset = () => {
  resetYearRange();
  localStartYear.value = 1936;
  localEndYear.value = 1945;
};

// Sync with composable state
watch([startYear, endYear], () => {
  localStartYear.value = startYear.value;
  localEndYear.value = endYear.value;
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;

.timeline {
  &-container {
    position: fixed;
    bottom: -125px; /* Hidden by default */
    left: 50%;
    transform: translateX(-50%);
    background: $bg-dark;
    border: $border-width solid rgba($brown, 0.6);
    border-radius: $border-radius-sm;
    padding: $spacing-lg $spacing-xl;
    box-shadow: $shadow-md;
    backdrop-filter: blur(10px);
    z-index: $z-modal;
    font-family: "Courier New", monospace;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    width: 90%;
    max-width: 800px;
    transition: bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smooth slide up */

    &:hover {
      bottom: 30px; /* Show on hover */
    }
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      color: $gold;
      font-size: 14px;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  }
}

.year {
  &-display {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    color: $gold;
    letter-spacing: 6px;
    text-shadow: 0 0 10px rgba($gold, 0.4);
  }

  &-label {
    display: inline-block;
    min-width: 85px;
  }

  &-markers {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 0;
    width: 107%;
    box-sizing: border-box;
    margin: 0 -25px;
  }

  &-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  &-number {
    font-family: "Courier New", monospace;
    color: $gold;
    font-size: 15px;
    font-weight: 700;
    text-shadow: 0 0 5px rgba($gold, 0.3);
    margin-bottom: 2px;
  }

  &-event {
    font-family: "Inter", sans-serif;
    color: rgba($gold-light, 0.7);
    font-size: 10px;
    font-style: italic;
    line-height: 1.2;
    white-space: normal; /* Allow text wrapping */
  }
}

.reset-btn {
  background: rgba($brown, 0.4);
  border: 1px solid rgba($brown, 0.6);
  color: $gold;
  padding: 6px $spacing-md;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all $transition-normal;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;

  &:hover {
    background: rgba($brown, 0.6);
    border-color: $gold;
  }
}

.separator {
  margin: 0 $spacing-md;
  color: rgba($gold, 0.5);
}

.slider {
  &-container {
    position: relative;
    height: 50px;
    margin: 0 auto;
    width: 100%;
  }

  &-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 6px;
    background: rgba($brown, 0.3);
    transform: translateY(-50%);
    pointer-events: none;
    border-radius: 3px;
  }

  &-range {
    position: absolute;
    height: 100%;
    background: linear-gradient(90deg, $brown, $gold);
    border-radius: 3px;
    box-shadow: 0 0 15px rgba($gold, 0.6);
  }
}

.slider {
  position: absolute;
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    background: $gold;
    cursor: pointer;
    border-radius: 50%;
    pointer-events: all;
    border: 3px solid $bg-dark;
    box-shadow: $shadow-sm;
    transition: all $transition-fast;

    &:hover {
      background: $gold-light;
      transform: scale(1.2);
      box-shadow: $shadow-glow;
    }
  }

  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    background: $gold;
    cursor: pointer;
    border-radius: 50%;
    pointer-events: all;
    border: 3px solid $bg-dark;
    box-shadow: $shadow-sm;
    transition: all $transition-fast;

    &:hover {
      background: $gold-light;
      transform: scale(1.2);
      box-shadow: $shadow-glow;
    }
  }
}

.slider-end {
  pointer-events: none;

  &::-webkit-slider-thumb {
    pointer-events: all;
  }

  &::-moz-range-thumb {
    pointer-events: all;
  }
}
</style>
