<template>
  <svg
    class="mini"
    :viewBox="`${x - span * 0.3} ${y - span / 4} ${span} ${span / 2}`"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      class="mini__sea"
      :x="x - span * 0.3"
      :y="y - span / 4"
      :width="span"
      :height="span / 2"
    />
    <use href="#places-land" />
    <circle
      v-for="([nx, ny], i) in near"
      :key="i"
      class="mini__near"
      :cx="nx"
      :cy="ny"
      :r="dot * 0.5"
    />
    <g :transform="`translate(${x} ${y})`">
      <circle class="mini__ping" :r="dot * 2.2" />
      <circle class="mini__dot" :r="dot" />
    </g>
  </svg>
</template>

<script setup lang="ts">
const props = defineProps<{
  x: number;
  y: number;
  span: number;
  near?: [number, number][];
}>();

const dot = computed(() => props.span * 0.02);
</script>

<style lang="scss" scoped>
.mini {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 2 / 1;
}

.mini__sea {
  fill: #121812;
}

.mini__near {
  fill: rgb(233 225 201 / 0.45);
}

.mini__dot {
  fill: var(--gold);
  stroke: #121812;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}

.mini__ping {
  fill: rgb(216 174 82 / 0.18);
  stroke: rgb(216 174 82 / 0.5);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  transform-box: fill-box;
  transform-origin: center;
}

@include motion {
  .place-card:hover .mini__ping,
  .place-card:focus-visible .mini__ping,
  .place-card.is-active .mini__ping {
    animation: mini-ping 1.6s $ease-out infinite;
  }
}

@keyframes mini-ping {
  from {
    opacity: 1;
    transform: scale(0.6);
  }
  to {
    opacity: 0;
    transform: scale(1.6);
  }
}
</style>
