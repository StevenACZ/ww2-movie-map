<template>
  <div class="poster" :class="[`poster--${era}`, { 'poster--gold': gold }]">
    <img
      v-if="path"
      :src="`${TMDB_IMAGE}/w342${path}`"
      :srcset="SIZES.map((w) => `${TMDB_IMAGE}/w${w}${path} ${w}w`).join(', ')"
      :sizes="sizes"
      :alt="alt ?? ''"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
      width="342"
      height="513"
    />
    <div
      v-else
      class="poster__ph"
      :role="alt ? 'img' : undefined"
      :aria-label="alt"
    >
      <span class="poster__ph-top mono"
        >{{ t(`era.short.${era}`) }} · {{ t(`kind.${kind}`) }}</span
      >
      <span class="poster__ph-title">{{ title }}</span>
      <span class="poster__ph-year mono">{{ year }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Era } from "~~/types/data";
import { TMDB_IMAGE } from "~/utils/seo";

const SIZES = [185, 342, 500, 780];

withDefaults(
  defineProps<{
    path?: string;
    title: string;
    year: number;
    era: Era;
    kind: "film" | "series";
    gold?: boolean;
    alt?: string;
    sizes?: string;
    eager?: boolean;
  }>(),
  { sizes: "(min-width: 1200px) 240px, (min-width: 640px) 30vw, 45vw" }
);

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.poster {
  --ph-a: #2b3120;
  --ph-b: #151810;
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--surface-2);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--ww1 {
    --ph-a: #3d3325;
    --ph-b: #1b1711;
  }

  &--interwar {
    --ph-a: #3a2522;
    --ph-b: #1a1210;
  }
}

.poster__ph {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 12%;
  background:
    repeating-linear-gradient(
      135deg,
      rgb(255 255 255 / 0.025) 0 2px,
      transparent 2px 9px
    ),
    radial-gradient(120% 80% at 20% 0%, var(--ph-a), var(--ph-b));
  container-type: inline-size;

  &::before {
    content: "";
    position: absolute;
    inset: 6%;
    border: 1px solid var(--line-strong);
    border-radius: 3px;
    pointer-events: none;
  }

  .poster--gold &::before {
    border-color: rgb(216 174 82 / 0.6);
  }
}

.poster__ph-top {
  font-size: max(9px, 6.5cqi);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.poster__ph-title {
  margin-top: auto;
  font-family: var(--font-stencil);
  font-size: 14cqi;
  font-weight: 800;
  line-height: 0.95;
  text-transform: uppercase;
  color: var(--paper);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;

  .poster--gold & {
    color: var(--gold-2);
  }
}

.poster__ph-year {
  margin-top: 8%;
  font-size: max(10px, 8cqi);
  color: var(--faint);
}
</style>
