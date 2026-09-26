<template>
  <dl class="details">
    <div class="details__row">
      <dt>{{ t("titlePage.originalTitle") }}</dt>
      <dd>{{ film.originalTitle ?? film.altTitle ?? film.title }}</dd>
    </div>
    <div v-if="film.directors.length" class="details__row">
      <dt>
        {{
          film.kind === "series" ? t("title.createdBy") : t("title.directedBy")
        }}
      </dt>
      <dd>{{ film.directors.join(", ") }}</dd>
    </div>
    <div v-if="countries.length" class="details__row">
      <dt>{{ t("title.countries") }}</dt>
      <dd>{{ countries.join(", ") }}</dd>
    </div>
    <div v-if="languages.length" class="details__row">
      <dt>{{ t("title.languages") }}</dt>
      <dd>{{ languages.join(", ") }}</dd>
    </div>
    <div v-if="film.runtime" class="details__row">
      <dt>{{ t("titlePage.runtime") }}</dt>
      <dd class="mono">{{ t("title.runtime", { n: film.runtime }) }}</dd>
    </div>
    <div v-else-if="film.seasons" class="details__row">
      <dt>{{ t("titlePage.seasons") }}</dt>
      <dd class="mono">{{ t("title.seasons", film.seasons) }}</dd>
    </div>
    <div class="details__row">
      <dt>{{ t("title.released") }}</dt>
      <dd class="mono">
        {{ film.endYear ? `${film.year}–${film.endYear}` : film.year }}
      </dd>
    </div>
    <div class="details__row">
      <dt>{{ t("title.period") }}</dt>
      <dd class="mono">
        <time :datetime="film.period.start">{{
          formatDate(film.period.start, locale)
        }}</time>
        –
        <time :datetime="film.period.end">{{
          formatDate(film.period.end, locale)
        }}</time>
      </dd>
    </div>
    <div v-if="film.theaters.length" class="details__row">
      <dt>{{ t("titlePage.theaters") }}</dt>
      <dd>{{ film.theaters.map((x) => t(`theater.${x}`)).join(", ") }}</dd>
    </div>
    <div v-if="film.tags.length" class="details__row details__row--wide">
      <dt>{{ t("titlePage.tags") }}</dt>
      <dd>
        <ul class="details__chips">
          <li v-for="tag in film.tags" :key="tag" class="chip">
            {{ t(`tag.${tag}`) }}
          </li>
        </ul>
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { TitleDetail } from "~~/types/view";
import { formatDate } from "~~/shared/utils/time";

defineProps<{ film: TitleDetail; countries: string[]; languages: string[] }>();

const { t, locale } = useI18n();
</script>

<style lang="scss" scoped>
.details {
  display: grid;
  border-top: 1px solid var(--line);

  @include up($bp-md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: clamp(24px, 4vw, 64px);
  }
}

.details__row {
  display: grid;
  gap: 4px;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);

  @include up($bp-sm) {
    grid-template-columns: 11rem minmax(0, 1fr);
    gap: 16px;
    align-items: baseline;
  }

  &--wide {
    grid-column: 1 / -1;
  }

  dt {
    @include eyebrow;
    font-size: 0.68rem;
    color: var(--faint);
  }

  dd {
    color: var(--paper);
  }
}

.details__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
}
</style>
