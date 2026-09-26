<template>
  <NuxtLayout>
    <section class="lost container">
      <svg
        class="lost__compass"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <g class="lost__dial">
          <circle
            cx="100"
            cy="100"
            r="92"
            stroke="var(--line-strong)"
            stroke-dasharray="1.5 6"
          />
          <path
            v-for="tick in TICKS"
            :key="tick"
            :d="`M100 8v${tick % 90 === 0 ? 12 : 6}`"
            :transform="`rotate(${tick} 100 100)`"
            :stroke="tick % 90 === 0 ? 'var(--gold)' : 'var(--line-strong)'"
            stroke-width="1.4"
          />
        </g>
        <circle
          cx="100"
          cy="100"
          r="70"
          stroke="var(--paper)"
          stroke-opacity=".35"
        />
        <path
          d="M100 22v34M100 144v34M22 100h34M144 100h34"
          stroke="var(--paper)"
          stroke-opacity=".5"
        />
        <circle
          class="lost__sweep"
          cx="100"
          cy="100"
          r="46"
          stroke="var(--red-2)"
          stroke-width="1.5"
        />
        <g class="lost__needle">
          <path d="M100 38 110 100H90Z" fill="var(--red)" />
          <path d="M100 162 90 100h20Z" fill="var(--paper)" fill-opacity=".7" />
        </g>
        <circle
          cx="100"
          cy="100"
          r="6"
          fill="var(--bg)"
          stroke="var(--gold)"
          stroke-width="2"
        />
      </svg>

      <div class="lost__copy">
        <p class="eyebrow lost__eyebrow">
          {{
            is404
              ? t("aboutPage.error.notFoundEyebrow")
              : t("aboutPage.error.eyebrow")
          }}
        </p>
        <p class="lost__code stencil" aria-hidden="true">{{ code }}</p>
        <h1 class="lost__title">{{ heading }}</h1>
        <p class="lost__text">
          {{ is404 ? t("common.notFoundText") : t("aboutPage.error.text") }}
        </p>
        <p v-if="!is404" class="lost__status mono">
          {{ t("aboutPage.error.status", { code }) }}
        </p>
        <a class="btn btn--gold" :href="home" @click.prevent="backToMap">
          <Icon name="globe" />
          {{ t("common.home") }}
        </a>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

const TICKS = Array.from({ length: 36 }, (_, i) => i * 10);

const { t, locale } = useI18n();
const localePath = useLocalePath();

const code = computed(() => props.error.statusCode || 500);
const is404 = computed(() => code.value === 404);
const heading = computed(() =>
  is404.value ? t("common.notFound") : t("aboutPage.error.title")
);
const home = computed(() => localePath("/"));

function backToMap() {
  clearError({ redirect: home.value });
}

useHead(() => ({
  htmlAttrs: { lang: locale.value === "es" ? "es" : "en" },
  title: heading.value,
  meta: [{ name: "robots", content: "noindex, follow" }],
}));
</script>

<style lang="scss" scoped>
.lost {
  display: grid;
  align-items: center;
  justify-items: center;
  gap: clamp(28px, 6vw, 72px);
  min-height: calc(100dvh - var(--header-h) - 120px);
  padding-block: 40px;
  text-align: center;

  @include up($bp-md) {
    grid-template-columns: auto 1fr;
    justify-items: start;
    text-align: left;
  }
}

.lost__compass {
  width: clamp(180px, 40vw, 340px);
  height: auto;
  aspect-ratio: 1;
}

.lost__eyebrow {
  color: var(--red-2);
}

.lost__code {
  margin: 6px 0 4px;
  font-size: clamp(7rem, 30vw, 15rem);
  font-weight: 800;
  line-height: 0.8;
  color: var(--paper);
}

.lost__title {
  font-size: clamp(2rem, 6vw, 3.6rem);
  text-transform: uppercase;
}

.lost__text {
  max-width: 44ch;
  margin: 14px 0 28px;
  color: var(--muted);
}

.lost__status {
  margin: -14px 0 28px;
  font-size: 0.85rem;
  color: var(--faint);
}

.lost__sweep {
  opacity: 0;
}

.lost__dial,
.lost__needle,
.lost__sweep {
  transform-box: view-box;
  transform-origin: 100px 100px;
}

.lost__needle {
  transform: rotate(28deg);
}

@include motion {
  .lost__dial {
    animation: lost-spin 80s linear infinite;
  }

  .lost__needle {
    animation: lost-search 5s $ease-in-out infinite;
  }

  .lost__sweep {
    animation: lost-ping 2.5s $ease-out infinite;
  }

  .lost__code {
    animation: lost-flicker 6s steps(1) infinite;
  }
}

@keyframes lost-spin {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes lost-search {
  0% {
    transform: rotate(28deg);
  }
  22% {
    transform: rotate(-64deg);
  }
  40% {
    transform: rotate(-40deg);
  }
  62% {
    transform: rotate(132deg);
  }
  80% {
    transform: rotate(96deg);
  }
  100% {
    transform: rotate(28deg);
  }
}

@keyframes lost-ping {
  0% {
    opacity: 0.8;
    transform: scale(0.3);
  }
  80%,
  100% {
    opacity: 0;
    transform: scale(1.8);
  }
}

@keyframes lost-flicker {
  0%,
  100% {
    opacity: 1;
  }
  91% {
    opacity: 0.55;
  }
  92% {
    opacity: 1;
  }
  94% {
    opacity: 0.7;
  }
  95% {
    opacity: 1;
  }
}
</style>
