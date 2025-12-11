<template>
  <article
    class="film-card"
    :style="{ '--delay': index * 0.05 + 's' }"
    itemscope
    itemtype="https://schema.org/Movie"
  >
    <!-- Poster Section -->
    <div class="poster-section">
      <img
        :src="film.poster"
        :alt="`${film.title} movie poster`"
        class="poster-image"
        loading="lazy"
        itemprop="image"
      />
      <div class="poster-overlay">
        <div class="rating-badge">
          <span class="star" aria-hidden="true">⭐</span>
          <span
            class="rating-value"
            itemprop="aggregateRating"
            itemscope
            itemtype="https://schema.org/AggregateRating"
          >
            <meta itemprop="ratingValue" :content="String(film.imdbRating)" />
            <meta itemprop="bestRating" content="10" />
            <meta itemprop="worstRating" content="1" />
            <meta itemprop="ratingCount" content="1000" />
            {{ film.imdbRating }}
          </span>
        </div>
        <div class="year-badge">
          <time itemprop="datePublished" :datetime="String(film.year)">
            {{ film.year }}
          </time>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <div class="content-header">
        <h3 class="film-title" itemprop="name">{{ film.title }}</h3>
        <div class="film-meta">
          <span class="meta-country" itemprop="countryOfOrigin">{{
            film.country
          }}</span>
          <span class="meta-divider" aria-hidden="true">•</span>
          <span class="meta-period"
            >{{ film.eventYears.start }}-{{ film.eventYears.end }}</span
          >
        </div>
      </div>

      <p class="film-synopsis" itemprop="description">{{ film.synopsis }}</p>

      <!-- Locations -->
      <div class="locations-section">
        <div class="locations-header">
          <span class="locations-icon" aria-hidden="true">📍</span>
          <span class="locations-label">Filming Locations</span>
        </div>
        <div
          class="locations-list"
          itemprop="contentLocation"
          itemscope
          itemtype="https://schema.org/Place"
        >
          <button
            v-for="loc in film.locations"
            :key="loc.name"
            class="location-tag"
            :class="{ primary: loc.isPrimary }"
            @click="$emit('viewOnMap', film.id)"
            :aria-label="`View ${loc.name} on map`"
          >
            <span itemprop="name">{{ loc.name }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="map-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <a
          :href="wikipediaUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="action-btn wiki-btn"
          :aria-label="`Read about ${film.title} on Wikipedia`"
        >
          <span>Wikipedia</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="action-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
        <button
          class="action-btn map-btn"
          @click="$emit('viewOnMap', film.id)"
          :aria-label="`View ${film.title} on map`"
        >
          <span>View on Map</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="action-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Film } from "../../../types";

const props = defineProps<{
  film: Film;
  index: number;
}>();

defineEmits<{
  (e: "viewOnMap", filmId: string): void;
}>();

const wikipediaUrl = computed(() => {
  const formattedTitle = props.film.title.replace(/ /g, "_");
  return `https://en.wikipedia.org/wiki/${formattedTitle}`;
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.film-card {
  background: $bg-card;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition: all $transition-normal;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;

  @include mobile {
    border-radius: $border-radius-md;
  }

  &:hover {
    border-color: rgba($beige, 0.3);
    box-shadow: $shadow-lg, 0 0 40px rgba($beige, 0.1);
  }
}

// Poster Section
.poster-section {
  position: relative;
  height: 280px;
  overflow: hidden;

  @include mobile {
    height: 220px;
  }

  @include mobile-small {
    height: 200px;
  }
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform $transition-slow;

  .film-card:hover & {
    transform: scale(1.08);
  }
}

.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(20, 25, 30, 1) 0%,
    rgba(20, 25, 30, 0.4) 40%,
    transparent 100%
  );
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;

  @include mobile {
    padding: 10px;
  }
}

.rating-badge {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 6px 10px;
  border-radius: $border-radius-sm;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @include mobile {
    padding: 5px 8px;
  }
}

.star {
  font-size: 0.85rem;

  @include mobile {
    font-size: 0.8rem;
  }
}

.rating-value {
  color: $beige;
  font-weight: 700;
  font-size: 0.9rem;

  @include mobile {
    font-size: 0.85rem;
  }
}

.year-badge {
  background: rgba($danger, 0.8);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: $border-radius-sm;
  font-weight: 600;
  font-size: 0.85rem;
  color: $text-primary;

  @include mobile {
    padding: 5px 10px;
    font-size: 0.8rem;
  }
}

// Content Section
.content-section {
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  flex: 1;

  @include mobile {
    padding: $spacing-md;
    gap: $spacing-sm;
  }
}

.content-header {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  @include mobile {
    gap: $spacing-xs;
  }
}

.film-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
  line-height: 1.3;

  @include mobile {
    font-size: 1.1rem;
  }
}

.film-meta {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 0.85rem;
  color: $text-secondary;
  flex-wrap: wrap;

  @include mobile {
    font-size: 0.8rem;
    gap: $spacing-xs;
  }
}

.meta-divider {
  opacity: 0.5;
}

.meta-period {
  color: $beige;
  font-weight: 600;
}

.film-synopsis {
  color: $text-secondary;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  @include line-clamp(3);

  @include mobile {
    font-size: 0.85rem;
    line-height: 1.5;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}

// Locations Section
.locations-section {
  margin-top: auto;
}

.locations-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;

  @include mobile {
    margin-bottom: 8px;
  }
}

.locations-icon {
  font-size: 0.85rem;
}

.locations-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: $text-muted;
  font-weight: 600;

  @include mobile {
    font-size: 0.7rem;
  }
}

.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;

  @include mobile {
    gap: 6px;
  }
}

.location-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-sm;
  color: $text-primary;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all $transition-fast;

  @include mobile {
    padding: 5px 10px;
    font-size: 0.75rem;
  }

  &:hover {
    background: rgba($beige, 0.15);
    border-color: rgba($beige, 0.3);
  }

  &.primary {
    border-color: rgba($danger, 0.3);

    &:hover {
      background: rgba($danger, 0.15);
      border-color: rgba($danger, 0.5);
    }
  }
}

.map-icon {
  width: 14px;
  height: 14px;
  opacity: 0.5;
  transition: all $transition-fast;

  @include mobile {
    width: 12px;
    height: 12px;
  }

  .location-tag:hover & {
    opacity: 1;
  }
}

// Actions Section
.actions-section {
  display: flex;
  gap: 10px;
  padding-top: $spacing-md;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  @include mobile {
    padding-top: $spacing-sm;
    gap: 8px;
  }
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px $spacing-md;
  border-radius: $border-radius-sm;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-fast;
  text-decoration: none;
  @include touch-target;

  @include mobile {
    padding: 12px;
    font-size: 0.8rem;
    min-height: 44px;
  }
}

.wiki-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: $text-primary;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.map-btn {
  background: rgba($beige, 0.15);
  border: 1px solid rgba($beige, 0.3);
  color: $beige;

  &:hover {
    background: rgba($beige, 0.25);
    border-color: rgba($beige, 0.5);
    box-shadow: 0 4px 15px rgba($beige, 0.2);
  }
}

.action-icon {
  width: 16px;
  height: 16px;

  @include mobile {
    width: 14px;
    height: 14px;
  }
}
</style>
