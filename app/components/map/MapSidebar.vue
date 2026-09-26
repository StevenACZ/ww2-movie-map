<template>
  <section class="side" :aria-label="t('map.list')">
    <header class="side__head">
      <p class="eyebrow">{{ t("site.tagline") }}</p>
      <h1 class="side__title">{{ t("map.title") }}</h1>
      <p class="side__intro">{{ t("map.intro") }}</p>
    </header>

    <div class="side__filters">
      <label class="side__search">
        <Icon name="search" />
        <span class="visually-hidden">{{ t("map.search") }}</span>
        <input
          :value="query"
          name="q"
          type="search"
          :placeholder="t('map.search')"
          autocomplete="off"
          enterkeyhint="search"
          @input="
            $emit('update:query', ($event.target as HTMLInputElement).value)
          "
        />
        <button
          v-if="query"
          type="button"
          class="side__clear"
          :aria-label="t('map.clear')"
          @click="$emit('update:query', '')"
        >
          <Icon name="x" />
        </button>
      </label>
      <div class="side__row" role="group" :aria-label="t('map.filters')">
        <button
          v-for="value in KINDS"
          :key="value"
          type="button"
          class="chip"
          :aria-pressed="kind === value"
          @click="$emit('update:kind', value)"
        >
          {{
            value === "all"
              ? t("kind.all")
              : value === "film"
                ? t("kind.films")
                : t("kind.seriesPlural")
          }}
        </button>
        <button
          type="button"
          class="chip chip--gold"
          :aria-pressed="goldOnly"
          @click="$emit('update:goldOnly', !goldOnly)"
        >
          <Icon name="medal" />{{ t("gold.label") }}
        </button>
      </div>
    </div>

    <div v-if="placeLabel" class="side__place">
      <Icon name="pin" />
      <span>{{ placeLabel }}</span>
      <button
        type="button"
        :aria-label="t('map.clear')"
        @click="$emit('clear-place')"
      >
        <Icon name="x" />
      </button>
    </div>

    <div class="side__meta">
      <p class="mono" aria-live="polite">
        {{ t("map.results", { n: titles.length }) }}
      </p>
      <button
        v-if="filtered"
        type="button"
        class="side__reset"
        @click="$emit('reset')"
      >
        {{ t("map.clear") }}
      </button>
    </div>

    <ul ref="list" class="side__list" data-lenis-prevent>
      <li v-for="title in shown" :key="title.id">
        <NuxtLinkLocale
          :to="`/films/${title.id}`"
          class="item"
          :class="{
            'is-active': title.id === selected,
            'item--gold': title.gold,
          }"
          :aria-current="title.id === selected ? 'true' : undefined"
          @click.prevent="$emit('select', title.id)"
        >
          <TitlePoster
            class="item__poster"
            :path="title.poster"
            :title="title.title"
            :year="title.year"
            :era="title.era"
            :kind="title.kind"
            :gold="title.gold"
            sizes="52px"
          />
          <span class="item__body">
            <span class="item__title">{{ title.title }}</span>
            <span class="item__meta mono">
              {{
                title.endYear ? `${title.year}–${title.endYear}` : title.year
              }}
              ·
              {{ t(`era.short.${title.era}`) }}
              <template v-if="title.kind === 'series'">
                · {{ t("kind.series") }}</template
              >
            </span>
            <span class="item__place">{{ placeOf(title) }}</span>
          </span>
          <Icon v-if="title.gold" name="medal" class="item__medal" />
        </NuxtLinkLocale>
      </li>
      <li
        v-if="shown.length < titles.length"
        ref="sentinel"
        class="side__more"
        aria-hidden="true"
      />
      <li v-if="!titles.length" class="side__empty">
        <p>{{ t("map.noResults") }}</p>
        <button type="button" class="btn btn--ghost" @click="$emit('reset')">
          {{ t("map.clear") }}
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { TitleCard } from "~~/types/view";

const KINDS = ["all", "film", "series"] as const;

const props = defineProps<{
  titles: TitleCard[];
  query: string;
  kind: "all" | "film" | "series";
  goldOnly: boolean;
  selected: string | null;
  filtered: boolean;
  placeLabel?: string;
}>();

defineEmits<{
  "update:query": [value: string];
  "update:kind": [value: "all" | "film" | "series"];
  "update:goldOnly": [value: boolean];
  select: [id: string];
  reset: [];
  "clear-place": [];
}>();

const { t } = useI18n();
const PAGE = 40;
const limit = ref(PAGE);
const list = ref<HTMLElement>();
const sentinel = ref<HTMLElement>();
const shown = computed(() => {
  const count = Math.max(
    limit.value,
    props.titles.findIndex((title) => title.id === props.selected) + 1
  );
  return props.titles.slice(0, count);
});

watch(
  () => props.titles.map((title) => title.id).join(),
  () => {
    limit.value = PAGE;
    list.value?.scrollTo({ top: 0 });
  }
);

let observer: IntersectionObserver | undefined;
watch(sentinel, (element) => {
  observer?.disconnect();
  if (!element || !list.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) limit.value += PAGE;
    },
    { root: list.value, rootMargin: "400px" }
  );
  observer.observe(element);
});

onBeforeUnmount(() => observer?.disconnect());

function placeOf(title: TitleCard) {
  const stop = title.stops.find((s) => s.primary) ?? title.stops[0];
  if (!stop) return "";
  const extra = new Set(title.stops.map((s) => s.place)).size - 1;
  return extra > 0 ? `${stop.name} +${extra}` : stop.name;
}
</script>

<style lang="scss" scoped>
.side {
  @include panel(1);
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.side__head {
  padding: 18px 18px 12px;

  .eyebrow {
    color: var(--gold);
  }
}

.side__title {
  margin-top: 8px;
  @include display(1.75rem);
}

.side__intro {
  margin-top: 8px;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--muted);
}

.side__filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 18px 12px;
}

.side__search {
  position: relative;
  display: flex;
  align-items: center;

  > svg {
    position: absolute;
    left: 12px;
    width: 16px;
    height: 16px;
    color: var(--faint);
    pointer-events: none;
  }

  input {
    width: 100%;
    height: 42px;
    padding: 0 38px;
    border-radius: 999px;
    border: 1px solid var(--line-strong);
    background: rgb(0 0 0 / 0.3);
    font-size: 0.92rem;
    transition: border-color 0.2s $ease-out;

    &::placeholder {
      color: var(--faint);
    }

    &:focus {
      outline: none;
      border-color: var(--gold);
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }
}

.side__clear {
  position: absolute;
  right: 8px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: var(--muted);

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: var(--text);
  }
}

.side__row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .chip {
    min-height: 30px;
    font-size: 0.8rem;
  }
}

.side__place {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 18px 10px;
  padding: 6px 6px 6px 12px;
  border-radius: 999px;
  background: rgb(216 174 82 / 0.14);
  border: 1px solid rgb(216 174 82 / 0.4);
  font-size: 0.84rem;
  font-weight: 600;

  svg {
    width: 15px;
    height: 15px;
    color: var(--gold);
  }

  button {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    margin-left: auto;
    border-radius: 50%;

    &:hover {
      background: rgb(236 230 214 / 0.1);
    }
  }
}

.side__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 18px;
  border-top: 1px solid var(--line);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.side__reset {
  font-size: 0.78rem;
  color: var(--gold);
  text-transform: none;
  letter-spacing: 0;
}

.side__list {
  flex: 1;
  min-height: 0;
  list-style: none;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 8px 12px;
  scrollbar-width: thin;
}

.item {
  position: relative;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background-color 0.2s $ease-out;

  &:hover {
    background: rgb(236 230 214 / 0.06);
  }

  &.is-active {
    background: rgb(216 174 82 / 0.14);
    box-shadow: inset 0 0 0 1px rgb(216 174 82 / 0.4);
  }
}

.item__poster {
  width: 44px;
  border-radius: 5px;

  :deep(.poster__ph) {
    padding: 8%;
  }

  :deep(.poster__ph-top),
  :deep(.poster__ph-year) {
    display: none;
  }

  :deep(.poster__ph-title) {
    font-size: 17cqi;
    -webkit-line-clamp: 4;
  }
}

.item__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item__title {
  font-family: var(--font-display);
  font-size: 1.06rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .item--gold & {
    color: var(--gold-2);
  }
}

.item__meta {
  margin-top: 2px;
  font-size: 0.68rem;
  color: var(--faint);
}

.item__place {
  margin-top: 1px;
  font-size: 0.78rem;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item__medal {
  width: 18px;
  height: 18px;
  color: var(--gold);
}

.side__more {
  height: 1px;
}

.side__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 10px;
  color: var(--muted);
}
</style>
