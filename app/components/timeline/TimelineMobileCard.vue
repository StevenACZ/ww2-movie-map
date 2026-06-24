<template>
  <div
    class="mobile-timeline-card"
    :class="[type === 'event' ? 'event-card' : 'film-card']"
    @click="handleClick"
  >
    <div class="mobile-card-icon">
      <FilmIcon v-if="type === 'film'" />
      <template v-else-if="eventIcon">{{ eventIcon }}</template>
      <SwordsIcon v-else />
    </div>
    <div class="mobile-card-content">
      <span class="mobile-card-date">{{ dateLabel }}</span>
      <h3>{{ title }}</h3>
    </div>
    <div
      class="mobile-card-badge"
      :class="[type === 'event' ? 'event-badge' : 'film-badge']"
    >
      {{ type === "event" ? "Event" : "Film" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PositionedEvent, PositionedFilm } from "../../../types/timeline";
import { formatHistoricalDate } from "../../utils/timelineDates";
import FilmIcon from "../icons/FilmIcon.vue";
import SwordsIcon from "../icons/SwordsIcon.vue";

const props = defineProps<{
  item: PositionedEvent | PositionedFilm;
  type: "event" | "film";
}>();

const emit = defineEmits<{
  (e: "select", item: PositionedFilm): void;
}>();

// Computed properties for display
const eventIcon = computed(() => {
  return (props.item as PositionedEvent).icon;
});

const title = computed(() => props.item.title);

const dateLabel = computed(() => {
  if (props.type === "event") {
    const event = props.item as PositionedEvent;
    return formatDate(event.date);
  }
  const film = props.item as PositionedFilm;
  return `${film.year} • ${formatEventPeriod(film)}`;
});

const formatDate = (dateString: string): string => {
  return formatHistoricalDate(dateString);
};

// Format event period display
const formatEventPeriod = (film: PositionedFilm): string => {
  if (film.eventYears.start === film.eventYears.end) {
    return String(film.eventYears.start);
  }
  return `${film.eventYears.start}-${film.eventYears.end}`;
};

// Click handler
const handleClick = () => {
  if (props.type === "film") {
    emit("select", props.item as PositionedFilm);
  }
};
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.mobile-timeline-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-card;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-md;
  margin-bottom: $spacing-sm;
  transition: all $transition-normal;

  &.event-card {
    border-left: 3px solid $danger;

    .mobile-card-icon {
      background: rgba($danger, 0.15);
      color: #fca5a5;
    }
  }

  &.film-card {
    border-left: 3px solid $beige;
    cursor: pointer;

    .mobile-card-icon {
      background: rgba($beige, 0.15);
      color: $beige;
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

.mobile-card-icon {
  width: 44px;
  height: 44px;
  border-radius: $border-radius-sm;
  @include flex-center;
  font-size: 1.2rem;
  flex-shrink: 0;

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
}

.mobile-card-content {
  flex: 1;
  min-width: 0;

  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    color: $text-primary;
    @include line-clamp(1);
  }
}

.mobile-card-date {
  font-size: 0.75rem;
  color: $text-muted;
  display: block;
  margin-bottom: 2px;
}

.mobile-card-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.event-badge {
    background: rgba($danger, 0.2);
    color: #fca5a5;
  }

  &.film-badge {
    background: rgba($beige, 0.2);
    color: $beige;
  }
}
</style>
