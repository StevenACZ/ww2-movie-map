<template>
  <Transition name="slide-in">
    <div v-if="film" class="film-info-panel">
      <button class="close-btn" @click="$emit('close')" aria-label="Close">
        ✕
      </button>

      <div class="film-info-content">
        <!-- Poster -->
        <div class="film-poster">
          <img :src="film.poster" :alt="film.title" />
        </div>

        <!-- Info -->
        <div class="film-details">
          <h2 class="film-title">{{ film.title }}</h2>
          <p class="film-year">{{ film.year }}</p>

          <p class="film-synopsis">{{ film.synopsis }}</p>

          <div class="film-meta">
            <span class="film-rating">
              <span class="rating-label">⭐</span>
              <span class="rating-value">{{ film.imdbRating }}/10</span>
            </span>
          </div>

          <!-- Action Buttons -->
          <div class="film-actions">
            <button
              v-if="film.trailerUrl"
              class="film-action-btn trailer-btn"
              @click="$emit('openTrailer', film)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="action-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Trailer
            </button>
            <a
              v-if="film.imdbUrl"
              :href="film.imdbUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="film-action-btn imdb-btn"
            >
              IMDb
            </a>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Film } from "../../../types";

defineProps<{
  film: Film | null;
}>();

defineEmits<{
  (e: "close"): void;
  (e: "openTrailer", film: Film): void;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.film-info-panel {
  position: fixed;
  top: 90px;
  right: 25px;
  width: 500px;
  max-width: calc(100vw - 60px);
  z-index: $z-popover;
  background: linear-gradient(
    135deg,
    rgba(20, 25, 30, 0.98) 0%,
    rgba(15, 20, 25, 0.96) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px) saturate(180%);

  @include mobile {
    top: auto;
    bottom: 100px;
    left: $spacing-sm;
    right: $spacing-sm;
    width: auto;
    max-width: none;
    max-height: 280px;
    border-radius: 16px;
  }

  @include mobile-small {
    bottom: 70px;
    max-height: 250px;
  }
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;
  z-index: 10;
  border-radius: 4px;

  @include mobile {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 1);
  }
}

.film-info-content {
  display: flex;
  gap: $spacing-lg;
  padding: $spacing-lg;

  @include mobile {
    gap: $spacing-md;
    padding: $spacing-md;
  }
}

.film-poster {
  flex-shrink: 0;
  width: 160px;
  height: 240px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);

  @include mobile {
    width: 90px;
    height: 135px;
    border-radius: 8px;
  }

  @include mobile-small {
    width: 80px;
    height: 120px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.film-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding-right: $spacing-xl;
  min-width: 0;

  @include mobile {
    padding-right: $spacing-md;
    gap: $spacing-xs;
  }

  .film-title {
    font-family: "Inter", sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: $beige;
    margin: 0;
    line-height: 1.2;

    @include mobile {
      font-size: 18px;
    }

    @include mobile-small {
      font-size: 16px;
    }
  }

  .film-year {
    font-family: "Inter", sans-serif;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    font-weight: 500;

    @include mobile {
      font-size: 14px;
    }
  }

  .film-synopsis {
    font-family: "Inter", sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
    margin: $spacing-sm 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;

    @include mobile {
      font-size: 13px;
      line-height: 1.5;
      -webkit-line-clamp: 3;
      margin: $spacing-xs 0;
    }
  }
}

.film-meta {
  display: flex;
  gap: $spacing-md;
  margin-top: auto;
  margin-bottom: 5px;
  padding-top: $spacing-sm;

  @include mobile {
    padding-top: $spacing-xs;
  }
}

.film-rating {
  display: flex;
  align-items: baseline;
  gap: $spacing-xs;
  font-family: "Inter", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: $beige;

  @include mobile {
    font-size: 14px;
  }

  .rating-label {
    font-size: 20px;
    line-height: 1;

    @include mobile {
      font-size: 16px;
    }
  }

  .rating-value {
    color: rgba(255, 255, 255, 0.9);
  }
}

.film-actions {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
  flex-wrap: wrap;

  @include mobile {
    gap: $spacing-xs;
    margin-top: $spacing-xs;
  }
}

.film-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all $transition-fast;
  cursor: pointer;

  @include mobile {
    padding: 8px 12px;
    font-size: 13px;
  }

  .action-icon {
    width: 16px;
    height: 16px;

    @include mobile {
      width: 14px;
      height: 14px;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &.trailer-btn {
    background: rgba(220, 38, 38, 0.15);
    border-color: rgba(220, 38, 38, 0.3);
    color: #fca5a5;

    &:hover {
      background: rgba(220, 38, 38, 0.25);
      border-color: rgba(220, 38, 38, 0.5);
    }
  }

  &.imdb-btn {
    background: rgba(234, 179, 8, 0.15);
    border-color: rgba(234, 179, 8, 0.3);
    color: #fde047;

    &:hover {
      background: rgba(234, 179, 8, 0.25);
      border-color: rgba(234, 179, 8, 0.5);
    }
  }
}

// Slide-in Transition
.slide-in-enter-active,
.slide-in-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-in-enter-from {
  transform: translateX(100%);
  opacity: 0;

  @include mobile {
    transform: translateY(100%);
  }
}

.slide-in-leave-to {
  transform: translateX(100%);
  opacity: 0;

  @include mobile {
    transform: translateY(100%);
  }
}

.slide-in-enter-to,
.slide-in-leave-from {
  transform: translateX(0);
  opacity: 1;

  @include mobile {
    transform: translateY(0);
  }
}
</style>
