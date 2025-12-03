<template>
  <div class="timeline-container" :class="{ 'is-expanded': isExpanded }">
    <!-- Mobile Toggle Button -->
    <button class="timeline-toggle" @click="toggleExpanded" aria-label="Toggle timeline">
      <span class="toggle-icon">{{ isExpanded ? '▼' : '▲' }}</span>
    </button>

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
        v-for="yearData in displayedYearMarkers"
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
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useTimeline } from "~/composables/useTimeline";

const { startYear, endYear, setYearRange, resetYearRange } = useTimeline();

const localStartYear = ref(startYear.value);
const localEndYear = ref(endYear.value);
const isExpanded = ref(false);
const isMobile = ref(false);

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

// Simplified year markers for mobile (only key years)
const mobileYearMarkers = [
  { year: 1936, event: "" },
  { year: 1939, event: "War<br>Begins" },
  { year: 1941, event: "Pearl<br>Harbor" },
  { year: 1944, event: "D-Day" },
  { year: 1945, event: "War<br>Ends" },
];

// Use simplified markers on mobile
const displayedYearMarkers = computed(() => {
  return isMobile.value ? mobileYearMarkers : yearMarkers;
});

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

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  // Auto-collapse on desktop
  if (!isMobile.value) {
    isExpanded.value = false;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

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
    bottom: -130px; /* Hidden by default */
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(
      180deg,
      rgba(20, 25, 30, 0.98) 0%,
      rgba(15, 20, 25, 0.96) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: $spacing-lg $spacing-xl;
    backdrop-filter: blur(20px) saturate(180%);
    z-index: $z-modal;
    font-family: "Inter", sans-serif;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    width: 90%;
    max-width: 800px;
    transition: bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                box-shadow 0.4s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

    &:hover {
      bottom: 30px; /* Show on hover */
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
    }

    @include mobile {
      bottom: -150px;
      left: $spacing-sm;
      right: $spacing-sm;
      transform: none;
      width: auto;
      max-width: none;
      padding: $spacing-md;
      border-radius: 16px 16px 0 0;
      border-bottom: none;
      gap: $spacing-sm;

      &:hover {
        bottom: -150px; // Disable hover on mobile
      }

      &.is-expanded {
        bottom: 0 !important;
      }
    }

    @include mobile-small {
      padding: $spacing-sm;
    }
  }

  &-toggle {
    display: none;
    position: absolute;
    top: -32px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 32px;
    background: linear-gradient(
      180deg,
      rgba(20, 25, 30, 0.98) 0%,
      rgba(15, 20, 25, 0.96) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-bottom: none;
    border-radius: 12px 12px 0 0;
    cursor: pointer;
    @include flex-center;
    color: $beige;
    font-size: 12px;
    transition: all $transition-normal;

    @include mobile {
      display: flex;
    }

    &:hover {
      background: rgba($beige, 0.1);
    }
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @include mobile {
      flex-wrap: wrap;
      gap: $spacing-sm;
    }

    h3 {
      color: $beige;
      font-size: 14px;
      font-weight: 700;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;

      @include mobile {
        font-size: 12px;
        letter-spacing: 1px;
      }
    }
  }
}

.year {
  &-display {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: $beige;
    letter-spacing: 6px;

    @include mobile {
      font-size: 22px;
      letter-spacing: 4px;
      order: -1;
      width: 100%;
    }

    @include mobile-small {
      font-size: 20px;
      letter-spacing: 2px;
    }
  }

  &-label {
    display: inline-block;
    min-width: 85px;

    @include mobile {
      min-width: 60px;
    }
  }

  &-markers {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 0;
    width: 107%;
    box-sizing: border-box;
    margin: 0 -25px;

    @include mobile {
      grid-template-columns: repeat(5, 1fr);
      width: 100%;
      margin: 0;
    }
  }

  &-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  &-number {
    font-family: "Inter", sans-serif;
    color: $beige;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 2px;

    @include mobile {
      font-size: 12px;
    }

    @include mobile-small {
      font-size: 11px;
    }
  }

  &-event {
    font-family: "Inter", sans-serif;
    color: rgba(255, 255, 255, 0.6);
    font-size: 10px;
    font-style: italic;
    line-height: 1.2;
    white-space: normal;

    @include mobile {
      font-size: 9px;
    }

    @include mobile-small {
      font-size: 8px;
    }
  }
}

.reset-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  padding: 8px $spacing-md;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all $transition-normal;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  @include touch-target;

  @include mobile {
    padding: 6px 12px;
    font-size: 11px;
    min-height: 36px;
    min-width: auto;
  }

  &:hover {
    background: rgba($beige, 0.15);
    border-color: rgba($beige, 0.5);
    color: $beige;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.separator {
  margin: 0 $spacing-md;
  color: rgba($beige, 0.6);

  @include mobile {
    margin: 0 $spacing-sm;
  }
}

.slider {
  &-container {
    position: relative;
    height: 50px;
    margin: 0 auto;
    width: 100%;

    @include mobile {
      height: 44px;
    }
  }

  &-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%);
    pointer-events: none;
    border-radius: 3px;

    @include mobile {
      height: 8px;
      border-radius: 4px;
    }
  }

  &-range {
    position: absolute;
    height: 100%;
    background: linear-gradient(90deg, rgba($beige-dark, 0.8), $beige);
    border-radius: 3px;
    box-shadow: 0 0 15px rgba($beige, 0.4);

    @include mobile {
      border-radius: 4px;
    }
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

  @include mobile {
    height: 8px;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    background: $beige;
    cursor: pointer;
    border-radius: 50%;
    pointer-events: all;
    border: 3px solid rgba(20, 25, 30, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition: all $transition-fast;

    @include mobile {
      width: 28px;
      height: 28px;
      border-width: 3px;
    }

    &:hover {
      background: $beige-light;
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
    }
  }

  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    background: $beige;
    cursor: pointer;
    border-radius: 50%;
    pointer-events: all;
    border: 3px solid rgba(20, 25, 30, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition: all $transition-fast;

    @include mobile {
      width: 28px;
      height: 28px;
      border-width: 3px;
    }

    &:hover {
      background: $beige-light;
      transform: scale(1.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
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
