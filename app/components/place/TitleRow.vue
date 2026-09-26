<template>
  <article class="row" :class="{ 'row--gold': title.gold }">
    <NuxtLinkLocale
      :to="`/films/${title.id}`"
      class="row__poster"
      tabindex="-1"
      aria-hidden="true"
    >
      <TitlePoster
        :path="title.poster"
        :title="title.title"
        :year="title.year"
        :era="title.era"
        :kind="title.kind"
        :gold="title.gold"
        sizes="(min-width: 900px) 170px, 112px"
      />
    </NuxtLinkLocale>
    <div class="row__body">
      <span v-if="title.gold" class="gold-badge row__badge">
        <Icon name="medal" />{{ t("gold.label") }}
      </span>
      <h3 class="row__title">
        <NuxtLinkLocale :to="`/films/${title.id}`">{{
          title.title
        }}</NuxtLinkLocale>
      </h3>
      <p class="row__meta mono">
        {{ title.endYear ? `${title.year}–${title.endYear}` : title.year }} ·
        {{ t(`kind.${title.kind}`) }}
        <template v-if="title.altTitle"> · {{ title.altTitle }}</template>
      </p>
      <div class="row__here">
        <p class="row__label eyebrow">{{ t("places.here") }}</p>
        <ol class="row__stops">
          <li
            v-for="stop in title.here"
            :key="`${stop.date}-${stop.name}`"
            class="row__stop"
          >
            <p class="row__stop-head mono">
              <time :datetime="stop.date">{{
                formatDate(stop.date, locale)
              }}</time>
              <span>{{ t(`stopKind.${stop.kind}`) }}</span>
            </p>
            <p class="row__story">{{ stop.story }}</p>
          </li>
        </ol>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { StopDetail, TitleCard } from "~~/types/view";
import { formatDate } from "~~/shared/utils/time";

defineProps<{ title: TitleCard & { here: StopDetail[] } }>();

const { t, locale } = useI18n();
</script>

<style lang="scss" scoped>
.row {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  transition:
    border-color 0.3s $ease-out,
    transform 0.3s $ease-out;

  &:hover {
    border-color: var(--line-strong);
  }

  &--gold {
    border-color: rgb(216 174 82 / 0.35);
    background:
      radial-gradient(
        70% 90% at 0% 0%,
        rgb(216 174 82 / 0.07),
        transparent 60%
      ),
      var(--surface);
  }

  @include up($bp-md) {
    grid-template-columns: 170px minmax(0, 1fr);
    gap: 28px;
    padding: 20px;
  }
}

.row__poster {
  display: block;
  align-self: start;
  border-radius: var(--radius-sm);
  transition: transform 0.35s $ease-out;

  @include motion {
    .row:hover & {
      transform: translateY(-3px) rotate(-1deg);
    }
  }
}

.row__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.row__title {
  @include display(clamp(1.4rem, 1.1rem + 1.2vw, 2.1rem));
  color: var(--paper);
  overflow-wrap: anywhere;

  a {
    background: linear-gradient(currentColor, currentColor) 0 100% / 0 2px
      no-repeat;
    transition: background-size 0.35s $ease-out;

    &:hover,
    &:focus-visible {
      background-size: 100% 2px;
    }
  }

  .row--gold & {
    color: var(--gold-2);
  }
}

.row__meta {
  font-size: 0.78rem;
  color: var(--muted);
}

.row__here {
  width: 100%;
  margin-top: 6px;
  padding-top: 12px;
  border-top: 1px dashed var(--line-strong);
}

.row__label {
  margin-bottom: 8px;
  color: var(--gold);
}

.row__stops {
  display: grid;
  gap: 12px;
  list-style: none;
}

.row__stop-head {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);

  span {
    color: var(--faint);
  }
}

.row__story {
  max-width: 68ch;
  font-size: 0.95rem;
  color: var(--muted);
}
</style>
