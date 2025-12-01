<template>
  <div class="timeline-container">
    <div class="timeline-header">
      <h3>TIMELINE:</h3>

      <div class="year-display">
        <span class="year-label">{{ startYear }}</span>
        <span class="separator">-</span>
        <span class="year-label">{{ endYear }}</span>
      </div>

      <button @click="reset" class="reset-btn">Reset</button>
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
      <span v-for="year in yearMarkers" :key="year" class="year-marker">
        {{ year }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTimeline } from "~/composables/useTimeline";

const { startYear, endYear, setYearRange, resetYearRange } = useTimeline();

const localStartYear = ref(startYear.value);
const localEndYear = ref(endYear.value);

const yearMarkers = [1936, 1938, 1940, 1942, 1944, 1945];

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
    bottom: 30px;
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
    max-width: 700px;
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
    font-size: 24px;
    font-weight: bold;
    color: $gold;
    letter-spacing: 4px;
    text-shadow: 0 0 10px rgba($gold, 0.3);
  }

  &-label {
    display: inline-block;
    min-width: 80px;
  }

  &-markers {
    display: flex;
    justify-content: space-between;
    color: rgba($gold, 0.7);
    font-size: 13px;
    padding: 0 $spacing-xs;
    margin: 0 auto;
    width: 100%;
    max-width: 1200px;
    font-weight: 600;
  }

  &-marker {
    font-family: "Courier New", monospace;
    text-shadow: 0 0 5px rgba($gold, 0.3);
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
    max-width: 1200px;
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
