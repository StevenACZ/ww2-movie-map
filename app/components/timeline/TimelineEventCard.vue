<template>
  <div
    class="timeline-card event-card"
    :style="{
      left: event.position + '%',
      bottom: event.offsetY + 'px',
      '--delay': index * 0.05 + 's',
      zIndex: 20 - event.level,
    }"
  >
    <div class="card-body">
      <div class="card-icon-wrapper">
        <span class="card-icon">{{ event.icon || "⚔️" }}</span>
      </div>
      <div class="card-text">
        <h3>{{ event.title }}</h3>
        <p class="card-date">{{ formatDate(event.date) }}</p>
      </div>
    </div>
    <!-- Connector (Down to axis) -->
    <div
      class="connector-line"
      :style="{ height: event.connectorHeight + 'px' }"
    ></div>
    <div class="timeline-dot"></div>
  </div>
</template>

<script setup lang="ts">
import type { PositionedEvent } from "../../../types/timeline";

const props = defineProps<{
  event: PositionedEvent;
  index: number;
}>();

// Date formatter
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
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
  color: #fca5a5;
}

// Event Cards (Red)
.event-card {
  .card-body {
    background: rgba(69, 10, 10, 0.8);
    border-color: $danger;
  }

  .card-icon-wrapper {
    background: rgba($danger, 0.2);
    color: #fca5a5;
  }

  &:hover {
    z-index: 50 !important;

    .card-body {
      transform: scale(1.05);
      box-shadow: 0 10px 40px rgba($danger, 0.6);
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
  top: 100%;
  transform-origin: top;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: $z-base;
  top: 100%;
  background: $danger;
  box-shadow: 0 0 10px rgba($danger, 0.8);
}
</style>
