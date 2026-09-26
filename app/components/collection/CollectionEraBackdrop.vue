<template>
  <svg
    class="backdrop"
    :class="`backdrop--${era}`"
    viewBox="0 0 1200 600"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="beamId" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#f3d78e" stop-opacity="0.34" />
        <stop offset="1" stop-color="#f3d78e" stop-opacity="0" />
      </linearGradient>
    </defs>

    <g v-if="era === 'ww1'" class="ww1">
      <path class="draw draw--far" :d="trench(470, 0.55)" pathLength="1" />
      <path class="draw" :d="trench(540, 1)" pathLength="1" />
      <path
        v-for="(d, i) in wire"
        :key="i"
        class="draw draw--wire"
        :d="d"
        pathLength="1"
      />
    </g>

    <g v-else-if="era === 'interwar'" class="interwar">
      <circle
        v-for="n in 5"
        :key="n"
        class="wave"
        cx="930"
        cy="330"
        :r="70 + n * 80"
        :style="{ '--d': `${(n - 1) * 0.9}s` }"
      />
      <path
        class="mast"
        d="M930 330 L880 600 M930 330 L980 600 M892 540 L968 540 M904 470 L956 470 M916 400 L944 400 M890 540 L956 470 M970 540 L904 470"
      />
      <circle class="mast-light" cx="930" cy="324" r="7" />
    </g>

    <g v-else class="ww2">
      <polygon
        v-for="beam in BEAMS"
        :key="beam.x"
        class="beam"
        :points="`${beam.x},600 ${beam.x - 70},-120 ${beam.x + 70},-120`"
        :fill="`url(#${beamId})`"
        :style="{
          '--from': `${beam.from}deg`,
          '--to': `${beam.to}deg`,
          '--dur': `${beam.dur}s`,
        }"
      />
      <path class="skyline" :d="SKYLINE" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import type { Era } from "~~/types/data";

defineProps<{ era: Era }>();

const beamId = `${useId()}-beam`;

const BEAMS = [
  { x: 180, from: -24, to: 10, dur: 11 },
  { x: 560, from: 18, to: -14, dur: 14 },
  { x: 1010, from: -8, to: 26, dur: 12 },
];

const SKYLINE =
  "M0 600 V560 H60 V530 H90 V548 H150 V510 H170 V495 H180 V510 H230 V540 H300 V520 H340 V555 H420 V500 H440 V470 H452 V500 H480 V535 H560 V545 H640 V515 H700 V528 H760 V490 H790 V528 H860 V550 H930 V505 H990 V538 H1060 V520 H1110 V548 H1200 V600 Z";

function trench(y: number, scale: number) {
  const step = 120 * scale;
  let d = `M-20 ${y}`;
  for (let x = -20; x < 1220; x += step) {
    const depth = 26 * scale;
    d += ` H${x + step * 0.35} L${x + step * 0.45} ${y + depth} H${x + step * 0.8} L${x + step * 0.9} ${y}`;
  }
  return d;
}

const wire = (() => {
  const y = 430;
  const posts: string[] = [];
  let strand = `M-20 ${y}`;
  for (let x = -20; x < 1220; x += 150) {
    posts.push(`M${x + 150} ${y - 38} V${y + 34}`);
    strand += ` Q${x + 75} ${y + 26} ${x + 150} ${y}`;
  }
  const barbs: string[] = [];
  for (let x = 10; x < 1200; x += 50) {
    const t = ((x + 20) % 150) / 150;
    const sag = y + 4 * 26 * t * (1 - t) * 0.5;
    barbs.push(
      `M${x - 6} ${sag - 6} L${x + 6} ${sag + 6} M${x + 6} ${sag - 6} L${x - 6} ${sag + 6}`
    );
  }
  return [strand, posts.join(" "), barbs.join(" ")];
})();
</script>

<style lang="scss" scoped>
.backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  pointer-events: none;
}

.draw {
  fill: none;
  stroke: var(--olive);
  stroke-width: 2.2;
  stroke-linejoin: round;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  opacity: 0.55;

  &--far {
    stroke-width: 1.4;
    opacity: 0.3;
  }

  &--wire {
    stroke: var(--paper);
    stroke-width: 1.3;
    opacity: 0.35;
  }

  @include motion {
    animation: draw 3.2s $ease-in-out both;

    &--far {
      animation-delay: 0.3s;
    }

    &--wire {
      animation-duration: 2.6s;
      animation-delay: 1s;
    }
  }
}

.wave {
  fill: none;
  stroke: var(--blue);
  stroke-width: 1.4;
  opacity: 0.22;
  transform-box: fill-box;
  transform-origin: center;

  @include motion {
    animation: wave 4.5s $ease-out var(--d) infinite both;
  }
}

.mast {
  fill: none;
  stroke: var(--paper);
  stroke-width: 2;
  opacity: 0.4;
}

.mast-light {
  fill: var(--red-2);

  @include motion {
    animation: blink 1.8s steps(2, jump-none) infinite;
  }
}

.beam {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  transform: rotate(var(--from));
  mix-blend-mode: screen;

  @include motion {
    animation: sweep var(--dur) $ease-in-out infinite alternate;
  }
}

.skyline {
  fill: #070806;
}

@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes wave {
  from {
    transform: scale(0.55);
    opacity: 0.5;
  }
  to {
    transform: scale(1.25);
    opacity: 0;
  }
}

@keyframes blink {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.2;
  }
}

@keyframes sweep {
  from {
    transform: rotate(var(--from));
  }
  to {
    transform: rotate(var(--to));
  }
}
</style>
