<template>
  <svg
    class="art"
    :class="`art--${kind}`"
    viewBox="0 0 160 100"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="kind === 'timeline'">
      <text x="14" y="30" class="art__year">1914</text>
      <text x="146" y="30" text-anchor="end" class="art__year">1945</text>
      <path
        d="M18 60h124"
        stroke="var(--line-strong)"
        stroke-width="3"
        stroke-linecap="round"
      />
      <path
        class="art__fill"
        d="M18 60h124"
        stroke="var(--gold)"
        stroke-width="3"
        stroke-linecap="round"
      />
      <path
        v-for="x in [18, 42.8, 67.6, 92.4, 117.2, 142]"
        :key="x"
        :d="`M${x} 70v6`"
        stroke="var(--faint)"
        stroke-width="1.2"
      />
      <g class="art__knob">
        <circle
          cx="18"
          cy="60"
          r="9"
          fill="var(--bg)"
          stroke="var(--gold)"
          stroke-width="2.5"
        />
        <circle cx="18" cy="60" r="3" fill="var(--gold)" />
      </g>
    </template>

    <template v-else-if="kind === 'pin'">
      <circle
        cx="80"
        cy="74"
        r="40"
        fill="var(--surface-2)"
        stroke="var(--paper)"
        stroke-opacity=".5"
      />
      <ellipse
        cx="80"
        cy="74"
        rx="16"
        ry="40"
        stroke="var(--paper)"
        stroke-opacity=".25"
      />
      <path d="M40 74h80M46 54h68" stroke="var(--paper)" stroke-opacity=".25" />
      <ellipse
        class="art__ripple"
        cx="80"
        cy="46"
        rx="14"
        ry="4"
        stroke="var(--gold)"
        stroke-width="1.5"
      />
      <g class="art__pin">
        <rect
          x="68"
          y="4"
          width="24"
          height="34"
          rx="2"
          fill="var(--surface-3)"
          stroke="var(--gold)"
          stroke-width="1.5"
        />
        <path d="M72 30h16M72 34h10" stroke="var(--faint)" stroke-width="1.2" />
        <path
          d="m80 11 1.6 4.6h4.8l-3.9 2.9 1.5 4.6-4-2.8-4 2.8 1.5-4.6-3.9-2.9h4.8z"
          fill="var(--gold)"
        />
        <path
          d="M80 38v8"
          stroke="var(--gold)"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>
    </template>

    <template v-else>
      <rect
        x="22"
        y="12"
        width="116"
        height="70"
        rx="6"
        fill="var(--surface-2)"
        stroke="var(--paper)"
        stroke-opacity=".5"
      />
      <path
        d="M62 92h36M80 82v10"
        stroke="var(--paper)"
        stroke-opacity=".5"
        stroke-width="1.5"
      />
      <path
        class="art__scan"
        d="M26 20h108"
        stroke="var(--paper)"
        stroke-opacity=".12"
        stroke-width="6"
      />
      <circle
        class="art__ring"
        cx="80"
        cy="47"
        r="18"
        stroke="var(--red-2)"
        stroke-width="1.5"
      />
      <g class="art__play">
        <circle cx="80" cy="47" r="16" fill="var(--red)" />
        <path d="M75 39v16l13-8z" fill="var(--paper)" />
      </g>
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ kind: "timeline" | "pin" | "play" }>();
</script>

<style lang="scss" scoped>
.art {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
}

.art__year {
  font-family: var(--font-mono);
  font-size: 11px;
  fill: var(--muted);
}

.art__fill {
  transform-box: fill-box;
  transform-origin: left center;
  transform: scaleX(0.55);
}

.art__knob {
  transform: translateX(68px);
}

.art__ripple,
.art__ring {
  opacity: 0;
}

.art__play,
.art__ring,
.art__ripple {
  transform-box: fill-box;
  transform-origin: center;
}

@include motion {
  .art__fill {
    animation: art-fill 4.8s $ease-in-out infinite;
  }

  .art__knob {
    animation: art-knob 4.8s $ease-in-out infinite;
  }

  .art__pin {
    animation: art-drop 3.2s $ease-out infinite;
  }

  .art__ripple {
    animation: art-ripple 3.2s $ease-out infinite;
  }

  .art__play {
    animation: art-beat 1.8s $ease-in-out infinite;
  }

  .art__ring {
    animation: art-ring 1.8s $ease-out infinite;
  }

  .art__scan {
    animation: art-scan 2.4s linear infinite;
  }
}

@keyframes art-knob {
  0%,
  8% {
    transform: none;
  }
  50%,
  58% {
    transform: translateX(124px);
  }
  100% {
    transform: none;
  }
}

@keyframes art-fill {
  0%,
  8% {
    transform: scaleX(0);
  }
  50%,
  58% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}

@keyframes art-drop {
  0% {
    opacity: 0;
    transform: translateY(-40px);
  }
  12% {
    opacity: 1;
  }
  30% {
    transform: none;
  }
  36% {
    transform: translateY(-5px);
  }
  42%,
  86% {
    opacity: 1;
    transform: none;
  }
  100% {
    opacity: 0;
    transform: none;
  }
}

@keyframes art-ripple {
  0%,
  29% {
    opacity: 0;
    transform: scale(0.4);
  }
  32% {
    opacity: 1;
  }
  60%,
  100% {
    opacity: 0;
    transform: scale(2.2);
  }
}

@keyframes art-beat {
  0%,
  100% {
    transform: scale(1);
  }
  20% {
    transform: scale(1.12);
  }
  40% {
    transform: scale(0.96);
  }
}

@keyframes art-ring {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }
  80%,
  100% {
    opacity: 0;
    transform: scale(2.4);
  }
}

@keyframes art-scan {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(58px);
  }
}
</style>
