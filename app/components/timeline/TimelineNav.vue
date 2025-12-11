<template>
  <div class="timeline-nav">
    <button
      class="nav-btn prev"
      @click="emit('prev')"
      :disabled="currentIndex === 0"
      aria-label="Previous period"
    >
      <span class="arrow">‹</span>
    </button>

    <div class="year-ranges">
      <button
        v-for="(period, index) in periods"
        :key="index"
        class="range-btn"
        :class="{ active: currentIndex === index }"
        @click="emit('setPeriod', index)"
        :aria-label="`View ${period.label}`"
        :aria-current="currentIndex === index ? 'true' : undefined"
      >
        <span class="range-label">{{ period.label }}</span>
        <span class="range-indicator"></span>
      </button>
    </div>

    <button
      class="nav-btn next"
      @click="emit('next')"
      :disabled="currentIndex === periods.length - 1"
      aria-label="Next period"
    >
      <span class="arrow">›</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TimelinePeriod } from "../../../types/timeline";

defineProps<{
  periods: TimelinePeriod[];
  currentIndex: number;
}>();

const emit = defineEmits<{
  (e: "prev"): void;
  (e: "next"): void;
  (e: "setPeriod", index: number): void;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.timeline-nav {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: $bg-dark;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px;
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  z-index: $z-modal;
  box-shadow: $shadow-lg;

  @include mobile {
    bottom: 20px;
    left: $spacing-sm;
    right: $spacing-sm;
    transform: none;
    padding: 4px;
    gap: 4px;
    @include safe-area-bottom;
  }
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-md;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $text-secondary;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;

  @include mobile {
    width: 44px;
    height: 44px;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: $text-primary;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .arrow {
    line-height: 1;
  }
}

.year-ranges {
  display: flex;
  gap: $spacing-xs;

  @include mobile {
    flex: 1;
    gap: 2px;
  }
}

.range-btn {
  position: relative;
  padding: 10px $spacing-lg;
  border-radius: $border-radius-sm;
  font-size: 0.9rem;
  font-weight: 500;
  color: $text-muted;
  cursor: pointer;
  transition: all $transition-normal;
  background: transparent;
  border: none;
  overflow: hidden;

  @include mobile {
    flex: 1;
    padding: 10px 8px;
    font-size: 0.75rem;
  }

  @include mobile-small {
    font-size: 0.7rem;
    padding: 10px 4px;
  }

  &:hover {
    color: $text-secondary;
    background: rgba(255, 255, 255, 0.03);
  }

  &.active {
    color: $text-primary;
    background: rgba($beige, 0.15);

    .range-indicator {
      transform: scaleX(1);
    }
  }
}

.range-indicator {
  position: absolute;
  bottom: $spacing-xs;
  left: 20%;
  right: 20%;
  height: 2px;
  background: linear-gradient(90deg, $beige, $beige-light);
  border-radius: 2px;
  transform: scaleX(0);
  transition: transform $transition-normal;
}

.range-label {
  position: relative;
  z-index: $z-base;
  letter-spacing: 1px;

  @include mobile {
    letter-spacing: 0;
  }
}
</style>
