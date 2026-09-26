<template>
  <NuxtLinkLocale
    :to="`/films/${title.id}`"
    class="tile"
    :class="{ 'tile--gold': title.gold }"
    @pointermove="tilt"
    @pointerleave="reset"
  >
    <div ref="media" class="tile__media">
      <TitlePoster
        :path="title.poster"
        :title="title.title"
        :year="title.year"
        :era="title.era"
        :kind="title.kind"
        :gold="title.gold"
        :sizes="sizes"
        :eager="eager"
      />
      <span v-if="title.gold" class="gold-badge tile__badge">
        <Icon name="medal" />{{ t("gold.label") }}
      </span>
    </div>
    <div class="tile__body">
      <component :is="`h${level}`" class="tile__title">{{
        title.title
      }}</component>
      <p class="tile__meta mono">
        {{ title.endYear ? `${title.year}–${title.endYear}` : title.year }} ·
        {{ t(`kind.${title.kind}`) }}
        <template v-if="title.vote">
          · <Icon name="star" class="tile__star" />{{
            title.vote.toFixed(1)
          }}</template
        >
      </p>
    </div>
  </NuxtLinkLocale>
</template>

<script setup lang="ts">
import type { TitleCard } from "~~/types/view";

withDefaults(
  defineProps<{
    title: TitleCard;
    level?: 2 | 3 | 4;
    sizes?: string;
    eager?: boolean;
  }>(),
  { level: 3, sizes: undefined }
);

const { t } = useI18n();
const media = ref<HTMLElement>();

function tilt(event: PointerEvent) {
  if (event.pointerType !== "mouse" || !media.value) return;
  const rect = media.value.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  media.value.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
  media.value.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
  media.value.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
}

function reset() {
  media.value?.style.removeProperty("--rx");
  media.value?.style.removeProperty("--ry");
}
</script>

<style lang="scss" scoped>
.tile {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--text);
  perspective: 900px;
}

.tile__media {
  position: relative;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 0 1px var(--line);
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition:
    transform 0.5s $ease-out,
    box-shadow 0.4s $ease-out;
  will-change: transform;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      60% 50% at var(--mx, 50%) 0%,
      rgb(255 255 255 / 0.18),
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s $ease-out;
    pointer-events: none;
  }

  .tile--gold & {
    box-shadow:
      0 0 0 1px rgb(216 174 82 / 0.55),
      0 18px 50px -24px rgb(216 174 82 / 0.45);
  }
}

.tile:hover .tile__media {
  transition-duration: 0.12s, 0.4s;
  box-shadow:
    0 0 0 1px var(--line-strong),
    var(--shadow);

  &::after {
    opacity: 1;
  }
}

.tile--gold:hover .tile__media {
  box-shadow:
    0 0 0 1px var(--gold),
    0 24px 60px -20px rgb(216 174 82 / 0.55);
}

.tile__badge {
  position: absolute;
  left: 8px;
  top: 8px;
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.5);
}

.tile__title {
  font-family: var(--font-display);
  font-size: 1.24rem;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  transition: color 0.2s $ease-out;

  .tile:hover & {
    color: var(--gold-2);
  }
}

.tile__meta {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.74rem;
  color: var(--faint);
}

.tile__star {
  width: 11px;
  height: 11px;
  color: var(--gold);
}
</style>
