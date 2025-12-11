<template>
  <div
    class="timeline-card film-card"
    :class="{ active: isSelected }"
    :style="{
      left: film.position + '%',
      top: film.offsetY + 'px',
      '--delay': index * 0.05 + 's',
      zIndex: 20 - film.level,
    }"
    @click.stop="emit('select', film)"
  >
    <!-- Connector (Up to axis) -->
    <div class="timeline-dot"></div>
    <div
      class="connector-line"
      :style="{ height: film.connectorHeight + 'px' }"
    ></div>

    <div class="card-body">
      <div class="card-icon-wrapper">
        <span class="card-icon">🎬</span>
      </div>
      <div class="card-text">
        <h3>{{ film.title }}</h3>
        <p class="card-date">
          {{ film.year }}
          <span class="event-period">• {{ formatEventPeriod(film) }}</span>
        </p>
      </div>
    </div>

    <!-- Detail Popup -->
    <Transition name="popup">
      <div v-if="isSelected" class="film-popup">
        <button class="close-btn" @click.stop="emit('select', film)">×</button>
        <div class="popup-content">
          <img :src="film.poster" :alt="film.title" class="popup-poster" />
          <div class="popup-info">
            <h4>{{ film.title }} ({{ film.year }})</h4>
            <p class="popup-meta">
              <span class="imdb-rating">⭐ {{ film.imdbRating }}</span>
              <span class="country">{{ film.country }}</span>
            </p>
            <p class="popup-desc">{{ film.synopsis }}</p>
            <div class="popup-actions">
              <button
                v-if="film.trailerUrl"
                class="btn-primary"
                @click.stop="emit('openTrailer', film)"
              >
                Watch Trailer
              </button>
              <a
                v-if="film.imdbUrl"
                :href="film.imdbUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-secondary"
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { PositionedFilm } from "../../../types/timeline";

const props = defineProps<{
  film: PositionedFilm;
  index: number;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: "select", film: PositionedFilm): void;
  (e: "openTrailer", film: PositionedFilm): void;
}>();

// Format event period display
const formatEventPeriod = (film: PositionedFilm): string => {
  if (film.eventYears.start === film.eventYears.end) {
    return String(film.eventYears.start);
  }
  return `${film.eventYears.start}-${film.eventYears.end}`;
};
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.timeline-card {
  position: absolute;
  width: 220px;
  transform: translateX(-50%);
  cursor: pointer;
}

.card-body {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: $border-radius-md;
  backdrop-filter: blur(10px);
  border: 1px solid;
  box-shadow: $shadow-md;
  transition: transform $transition-normal, box-shadow $transition-normal;
  position: relative;
  z-index: 2;
}

.card-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.card-text {
  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
    color: $text-primary;
  }
}

.card-date {
  font-size: 0.75rem;
  margin: $spacing-xs 0 0 0;
  opacity: 0.8;
  color: $beige-light;
}

.event-period {
  font-size: 0.7rem;
  opacity: 0.7;
}

// Film Cards (Beige)
.film-card {
  .card-body {
    background: rgba(50, 40, 30, 0.85);
    border-color: $beige;
  }

  .card-icon-wrapper {
    background: rgba($beige, 0.2);
    color: $beige-light;
  }

  // Hover state (only when not active)
  &:hover:not(.active) {
    z-index: 50 !important;

    .card-body {
      transform: scale(1.05);
      box-shadow: 0 10px 40px rgba($beige, 0.5);
    }
  }

  // Active state - always on top
  &.active {
    z-index: 9999 !important;

    .card-body {
      background: rgba($beige, 0.15);
      box-shadow: 0 0 30px rgba($beige, 0.3);
      border-color: $beige-light;
    }

    &:hover {
      z-index: 9999 !important;
    }
  }
}

// Connectors
.connector-line {
  position: absolute;
  left: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(-50%);
  z-index: -1;
  pointer-events: none;
  bottom: 100%;
  transform-origin: bottom;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: $z-base;
  bottom: 100%;
  background: $beige;
  box-shadow: 0 0 10px rgba($beige, 0.8);
}

// Popup Modal
.film-popup {
  position: absolute;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  background: $bg-dark;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-lg;
  z-index: 9999;
  backdrop-filter: blur(20px);
  animation: fadeIn $transition-normal ease;
}

.close-btn {
  position: absolute;
  top: $spacing-sm;
  right: 12px;
  background: none;
  border: none;
  color: $text-secondary;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color $transition-fast;

  &:hover {
    color: $text-primary;
  }
}

.popup-content {
  display: flex;
  gap: $spacing-md;
}

.popup-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: $border-radius-sm;
}

.popup-info {
  flex: 1;

  h4 {
    margin: 0 0 $spacing-sm 0;
    font-size: 1rem;
    color: $text-primary;
  }
}

.popup-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 0.8rem;
}

.imdb-rating {
  color: $beige;
  font-weight: 600;
}

.country {
  color: $text-secondary;
}

.popup-desc {
  font-size: 0.75rem;
  color: $text-secondary;
  margin-bottom: 12px;
  line-height: 1.4;
  @include line-clamp(3);
}

.popup-actions {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all $transition-fast;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.btn-primary {
  background: $beige;
  color: $bg-darker;

  &:hover {
    background: $beige-light;
    transform: translateY(-1px);
  }
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: $text-primary;
  border: 1px solid rgba(255, 255, 255, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
}

// Popup Transitions
.popup-enter-active,
.popup-leave-active {
  transition: all $transition-normal;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px) scale(0.95);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
