<template>
  <Transition name="modal">
    <div v-if="film" class="mobile-film-modal" @click.self="emit('close')">
      <div class="mobile-modal-content">
        <button class="mobile-modal-close" @click="emit('close')">×</button>
        <div class="mobile-modal-body">
          <img
            :src="film.poster"
            :alt="film.title"
            class="mobile-modal-poster"
          />
          <div class="mobile-modal-info">
            <h3>{{ film.title }}</h3>
            <p class="mobile-modal-year">{{ film.year }}</p>
            <div class="mobile-modal-meta">
              <span class="imdb-rating">⭐ {{ film.imdbRating }}</span>
              <span class="country">{{ film.country }}</span>
            </div>
            <p class="mobile-modal-desc">{{ film.synopsis }}</p>
            <div class="mobile-modal-actions">
              <a
                v-if="film.trailerUrl"
                :href="film.trailerUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary"
              >
                Watch Trailer
              </a>
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
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { PositionedFilm } from "../../../types/timeline";

defineProps<{
  film: PositionedFilm | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.mobile-film-modal {
  @include fixed-fill;
  background: rgba(0, 0, 0, 0.85);
  z-index: $z-modal;
  @include flex-center;
  padding: $spacing-md;
  backdrop-filter: blur(8px);
}

.mobile-modal-content {
  background: $bg-dark;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-lg;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.mobile-modal-close {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: $text-primary;
  font-size: 1.5rem;
  @include flex-center;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.mobile-modal-body {
  padding: $spacing-lg;
}

.mobile-modal-poster {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-md;
}

.mobile-modal-info {
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 $spacing-xs 0;
    color: $text-primary;
  }
}

.mobile-modal-year {
  font-size: 0.9rem;
  color: $beige;
  margin: 0 0 $spacing-sm 0;
}

.mobile-modal-meta {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
  font-size: 0.85rem;

  .imdb-rating {
    color: $beige;
    font-weight: 600;
  }

  .country {
    color: $text-secondary;
  }
}

.mobile-modal-desc {
  font-size: 0.9rem;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0;
}

.mobile-modal-actions {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-md;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
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

// Modal Transitions
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .mobile-modal-content {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .mobile-modal-content {
    transform: translateY(20px) scale(0.95);
  }
}
</style>
