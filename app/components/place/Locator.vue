<template>
  <svg
    class="locator"
    viewBox="0 0 360 180"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      class="locator__frame"
      x="0.5"
      y="0.5"
      width="359"
      height="179"
      rx="4"
    />
    <path class="locator__grid" :d="GRID" />
    <path class="locator__equator" d="M0 90H360M180 0V180" />
    <path class="locator__cross" :d="`M${x} 0V180M0 ${y}H360`" />
    <g :transform="`translate(${x} ${y})`">
      <circle class="locator__ping" r="9" />
      <circle class="locator__halo" r="14" />
      <circle class="locator__dot" r="6" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import type { LonLat } from "~~/types/data";

const GRID = [
  ...[30, 60, 90, 120, 150, 210, 240, 270, 300, 330].map((x) => `M${x} 0V180`),
  ...[30, 60, 120, 150].map((y) => `M0 ${y}H360`),
].join("");

const props = defineProps<{ coordinates: LonLat }>();

const x = computed(() => (props.coordinates[0] + 180).toFixed(2));
const y = computed(() => (90 - props.coordinates[1]).toFixed(2));
</script>

<style lang="scss" scoped>
.locator {
  width: 100%;
  height: auto;
  aspect-ratio: 2 / 1;
  overflow: visible;
}

.locator__frame {
  fill: rgb(236 230 214 / 0.025);
  stroke: var(--line-strong);
  vector-effect: non-scaling-stroke;
}

.locator__grid,
.locator__equator,
.locator__cross {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.locator__grid {
  stroke: var(--line);
}

.locator__equator {
  stroke: var(--line-strong);
  stroke-dasharray: 3 4;
}

.locator__cross {
  stroke: rgb(216 174 82 / 0.28);
}

.locator__dot {
  fill: var(--gold);
  stroke: var(--bg);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.locator__halo {
  fill: rgb(216 174 82 / 0.18);
}

.locator__ping {
  fill: none;
  stroke: var(--gold);
  stroke-width: 1.5;
  opacity: 0;
  vector-effect: non-scaling-stroke;
  transform-box: fill-box;
  transform-origin: center;
}

@include motion {
  .locator__halo {
    transform-box: fill-box;
    transform-origin: center;
    animation: locator-pulse 2.6s $ease-in-out infinite;
  }

  :where(a:hover, a:focus-visible) .locator__ping {
    animation: locator-ping 1.1s $ease-out infinite;
  }
}

@keyframes locator-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes locator-ping {
  from {
    opacity: 0.9;
    transform: scale(0.6);
  }
  to {
    opacity: 0;
    transform: scale(3.2);
  }
}
</style>
