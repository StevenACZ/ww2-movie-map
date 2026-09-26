<template>
  <svg
    class="globe"
    viewBox="0 0 400 400"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient id="about-globe-shade" cx="38%" cy="34%" r="70%">
        <stop offset="0" stop-color="#262a1d" />
        <stop offset="0.65" stop-color="#15170f" />
        <stop offset="1" stop-color="#0b0c09" />
      </radialGradient>
    </defs>

    <g class="globe__bezel">
      <circle
        cx="200"
        cy="200"
        r="194"
        stroke="var(--line-strong)"
        stroke-dasharray="1.5 7.2"
      />
      <path
        v-for="tick in TICKS"
        :key="tick"
        :d="`M200 2v${tick % 90 === 0 ? 14 : 7}`"
        :transform="`rotate(${tick} 200 200)`"
        :stroke="tick % 90 === 0 ? 'var(--gold)' : 'var(--line-strong)'"
        stroke-width="1.4"
      />
    </g>

    <circle cx="200" cy="200" :r="R" fill="url(#about-globe-shade)" />

    <g
      class="globe__grid"
      stroke="var(--paper)"
      stroke-width="1"
      stroke-opacity=".38"
    >
      <path
        v-for="(line, i) in PARALLELS"
        :key="`p${i}`"
        class="globe__draw"
        :style="{ '--i': i }"
        pathLength="1"
        :d="line"
      />
      <g class="globe__spin">
        <ellipse
          v-for="i in MERIDIANS"
          :key="`m${i}`"
          class="globe__meridian"
          :style="{
            '--m': i - 1,
            transform: `scaleX(${Math.cos(((i - 1) * Math.PI) / MERIDIANS).toFixed(4)})`,
          }"
          cx="200"
          cy="200"
          :rx="R"
          :ry="R"
          vector-effect="non-scaling-stroke"
        />
      </g>
    </g>

    <circle
      class="globe__draw globe__rim"
      style="--i: 0"
      cx="200"
      cy="200"
      :r="R"
      pathLength="1"
      stroke="var(--paper)"
      stroke-width="2"
    />

    <g
      class="globe__front"
      stroke="var(--red-2)"
      stroke-width="2.2"
      stroke-linecap="round"
    >
      <path
        class="globe__draw"
        style="--i: 11"
        pathLength="1"
        d="M142 118c18 14 30 8 44 24s10 34 30 46 16 30 38 44"
        stroke-dasharray="4 5"
      />
    </g>

    <g class="globe__roundel">
      <circle
        class="globe__pulse"
        cx="200"
        cy="200"
        r="58"
        stroke="var(--gold)"
        stroke-width="1.5"
      />
      <circle
        cx="200"
        cy="200"
        r="58"
        fill="var(--bg)"
        stroke="var(--gold)"
        stroke-width="2"
      />
      <circle
        cx="200"
        cy="200"
        r="49"
        stroke="var(--gold-deep)"
        stroke-width="1"
      />
      <path
        class="globe__star"
        transform="translate(200 200) scale(4.6) translate(-20 -20)"
        d="M20 12.5 21.76 17.57 27.13 17.68 22.85 20.93 24.41 26.07 20 23 15.59 26.07 17.15 20.93 12.87 17.68 18.24 17.57Z"
        fill="var(--gold)"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
const R = 168;
const MERIDIANS = 6;
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const PARALLELS = [-60, -30, 0, 30, 60].map((lat) => {
  const rad = (lat * Math.PI) / 180;
  const y = +(200 - R * Math.sin(rad)).toFixed(2);
  const half = +(R * Math.cos(rad)).toFixed(2);
  return `M${200 - half} ${y}H${200 + half}`;
});
</script>

<style lang="scss" scoped>
.globe {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  overflow: visible;
}

.globe__meridian {
  transform-box: view-box;
  transform-origin: 200px 200px;
}

.globe__star {
  filter: drop-shadow(0 0 10px rgb(216 174 82 / 0.45));
}

.globe__pulse {
  opacity: 0;
}

@include motion {
  .globe__draw {
    stroke-dasharray: 1;
    animation-name: globe-draw;
    animation-duration: 1.4s;
    animation-timing-function: $ease-out;
    animation-delay: calc(var(--i) * 0.12s + 0.15s);
    animation-fill-mode: backwards;
  }

  .globe__spin {
    transform-box: view-box;
    transform-origin: 200px 200px;
    animation: globe-grow 1.6s $ease-out 0.5s backwards;
  }

  .globe__meridian {
    animation: globe-rotate 36s linear infinite;
    animation-delay: calc(var(--m) * -3s);
  }

  .globe__front .globe__draw {
    stroke-dasharray: 1;
  }

  .globe__bezel {
    transform-box: view-box;
    transform-origin: 200px 200px;
    animation: globe-bezel 120s linear infinite;
  }

  .globe__roundel {
    transform-box: view-box;
    transform-origin: 200px 200px;
    animation: globe-pop 0.9s $ease-spring 1.5s backwards;
  }

  .globe__pulse {
    transform-box: view-box;
    transform-origin: 200px 200px;
    animation: globe-pulse 3.6s $ease-out 2.4s infinite;
  }
}

@keyframes globe-draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes globe-grow {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes globe-rotate {
  0% {
    transform: scaleX(1);
    animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
  }
  50% {
    transform: scaleX(-1);
    animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
  }
  100% {
    transform: scaleX(1);
  }
}

@keyframes globe-bezel {
  to {
    transform: rotate(360deg);
  }
}

@keyframes globe-pop {
  from {
    opacity: 0;
    transform: scale(0.4);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes globe-pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  70%,
  100% {
    opacity: 0;
    transform: scale(1.9);
  }
}
</style>
