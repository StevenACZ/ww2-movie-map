<template>
  <nav class="controls-wrapper" aria-label="Film search and filters">
    <div class="controls">
      <div class="search-box">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="search-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          :value="searchQuery"
          @input="
            $emit(
              'update:searchQuery',
              ($event.target as HTMLInputElement).value
            )
          "
          type="search"
          placeholder="Search by title, country, or synopsis..."
          class="search-input"
          aria-label="Search films"
        />
        <button
          v-if="searchQuery"
          class="clear-search"
          @click="$emit('clear')"
          aria-label="Clear search"
        >
          ×
        </button>
      </div>

      <div class="filter-group" role="group" aria-label="Sort options">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          class="filter-btn"
          :class="{ active: sortBy === option.value }"
          @click="$emit('update:sortBy', option.value)"
          :aria-pressed="sortBy === option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { SortOption } from "../../composables/useFilmsFilter";

defineProps<{
  searchQuery: string;
  sortBy: string;
  sortOptions: SortOption[];
}>();

defineEmits<{
  (e: "update:searchQuery", value: string): void;
  (e: "update:sortBy", value: string): void;
  (e: "clear"): void;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.controls-wrapper {
  max-width: 1200px;
  margin: 0 auto 40px;
  position: relative;
  z-index: $z-dropdown;

  @include mobile {
    margin-bottom: $spacing-lg;
  }
}

.controls {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;

  @include mobile {
    flex-direction: column;
    gap: $spacing-sm;
  }
}

.search-box {
  flex: 1;
  max-width: 400px;
  min-width: 280px;
  position: relative;

  @include mobile {
    width: 100%;
    max-width: none;
    min-width: auto;
  }
}

.search-icon {
  position: absolute;
  left: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: $text-muted;
  pointer-events: none;

  @include mobile {
    width: 18px;
    height: 18px;
    left: 12px;
  }
}

.search-input {
  width: 100%;
  padding: 14px 40px 14px 48px;
  background: $bg-card;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-md;
  color: $text-primary;
  font-size: 0.95rem;
  transition: all $transition-normal;
  backdrop-filter: blur(10px);

  @include mobile {
    padding: 12px 36px 12px 40px;
    font-size: 16px;
    border-radius: 12px;
  }

  &::placeholder {
    color: $text-muted;

    @include mobile {
      font-size: 14px;
    }
  }

  &:focus {
    outline: none;
    border-color: rgba($beige, 0.5);
    box-shadow: 0 0 20px rgba($beige, 0.1);
  }
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: $text-secondary;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-fast;

  @include mobile {
    width: 28px;
    height: 28px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: $text-primary;
  }
}

.filter-group {
  display: flex;
  gap: $spacing-xs;
  background: $bg-card;
  padding: $spacing-xs;
  border-radius: $border-radius-md;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  @include mobile {
    width: 100%;
    justify-content: stretch;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 4px;

    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

.filter-btn {
  padding: 10px $spacing-md;
  background: transparent;
  border: none;
  border-radius: $border-radius-sm;
  color: $text-muted;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-fast;
  white-space: nowrap;

  @include mobile {
    flex: 1;
    padding: 10px 8px;
    font-size: 0.8rem;
    min-width: fit-content;
  }

  @include mobile-small {
    font-size: 0.75rem;
    padding: 8px 6px;
  }

  &:hover {
    color: $text-secondary;
  }

  &.active {
    background: rgba($beige, 0.15);
    color: $beige;
  }
}
</style>
