<template>
  <section class="browser" :aria-labelledby="headingId">
    <div class="browser__head container">
      <h2 :id="headingId" class="browser__heading">{{ t("films.all") }}</h2>
      <p class="browser__count mono" aria-live="polite">
        {{
          t("filmsPage.results", { n: results.length, total: titles.length })
        }}
      </p>
    </div>

    <div class="bar" role="search">
      <div class="bar__inner container">
        <div class="bar__row">
          <label class="bar__search">
            <span class="visually-hidden">{{ t("map.search") }}</span>
            <Icon name="search" class="bar__search-icon" />
            <input
              v-model="query"
              name="q"
              type="search"
              :placeholder="t('map.search')"
              autocomplete="off"
              spellcheck="false"
            />
            <button
              v-if="query"
              type="button"
              class="bar__search-clear"
              :aria-label="t('common.close')"
              @click="query = ''"
            >
              <Icon name="x" />
            </button>
          </label>

          <label class="bar__sort">
            <span class="bar__sort-label mono">{{ t("films.sort") }}</span>
            <select v-model="sort" name="sort">
              <option
                v-for="option in SORTS"
                :key="option.value"
                :value="option.value"
              >
                {{ t(option.label) }}
              </option>
            </select>
            <Icon name="chevron-down" class="bar__sort-icon" />
          </label>
        </div>

        <div class="bar__row bar__row--chips">
          <div class="bar__chips">
            <div
              v-if="!lockedEra"
              class="bar__segment"
              role="group"
              :aria-label="t('filmsPage.era')"
            >
              <button
                v-for="option in ERA_OPTIONS"
                :key="option"
                type="button"
                class="bar__seg"
                :aria-pressed="era === option"
                @click="era = option"
              >
                <span>{{ t(`era.short.${option}`) }}</span>
                <span v-if="option !== 'all'" class="bar__seg-years mono">
                  {{ t(`era.years.${option}`) }}
                </span>
              </button>
            </div>
            <span v-if="!lockedEra" class="bar__sep" aria-hidden="true" />
            <div
              class="bar__group"
              role="group"
              :aria-label="t('filmsPage.kind')"
            >
              <button
                v-for="option in KINDS"
                :key="option"
                type="button"
                class="chip"
                :aria-pressed="kind === option"
                @click="kind = option"
              >
                {{
                  t(
                    option === "all"
                      ? "kind.all"
                      : option === "film"
                        ? "kind.films"
                        : "kind.seriesPlural"
                  )
                }}
              </button>
            </div>
            <span class="bar__sep" aria-hidden="true" />
            <button
              type="button"
              class="chip chip--gold"
              :aria-pressed="goldOnly"
              @click="goldOnly = !goldOnly"
            >
              <Icon name="medal" />{{ t("gold.only") }}
            </button>
            <span class="bar__sep" aria-hidden="true" />
            <div
              class="bar__group"
              role="group"
              :aria-label="t('filmsPage.theater')"
            >
              <button
                v-for="option in theaterOptions"
                :key="option"
                type="button"
                class="chip"
                :aria-pressed="theaters.includes(option)"
                @click="toggle(theaters, option)"
              >
                {{ t(`theater.${option}`) }}
              </button>
            </div>
          </div>
          <button
            type="button"
            class="chip bar__more"
            :class="{ 'is-active': tags.length > 0 }"
            :aria-expanded="panelExpanded"
            :aria-controls="panelId"
            @click="panelOpen = !panelExpanded"
          >
            <Icon name="sliders" />{{ t("filmsPage.moreFilters") }}
            <span v-if="tags.length" class="bar__more-count mono">{{
              tags.length
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <div
      :id="panelId"
      class="panel container"
      :class="{
        'is-open': panelOpen === true,
        'is-closed': panelOpen === false,
      }"
    >
      <div class="panel__inner" role="group" :aria-label="t('filmsPage.tags')">
        <p class="panel__label eyebrow">{{ t("filmsPage.tags") }}</p>
        <div class="panel__chips">
          <button
            v-for="option in tagOptions"
            :key="option"
            type="button"
            class="chip"
            :aria-pressed="tags.includes(option)"
            @click="toggle(tags, option)"
          >
            {{ t(`tag.${option}`) }}
          </button>
        </div>
      </div>
    </div>

    <div class="container">
      <TransitionGroup
        v-if="results.length"
        tag="ul"
        name="grid"
        class="grid"
        @before-leave="pin"
      >
        <li
          v-for="item in items"
          :key="item.key"
          :class="item.type === 'divider' ? 'grid__divider' : 'grid__cell'"
          :style="{ '--i': item.order }"
        >
          <h3
            v-if="item.type === 'divider'"
            class="divider"
            :class="`divider--${item.era}`"
          >
            <span class="divider__name">{{ t(`era.${item.era}`) }}</span>
            <span class="divider__years mono">{{
              t(`era.years.${item.era}`)
            }}</span>
            <span class="divider__line" aria-hidden="true" />
            <span class="divider__count mono">{{
              t("films.count", { n: item.count })
            }}</span>
          </h3>
          <TitleTile
            v-else
            :title="item.title"
            :level="showDividers ? 4 : 3"
            sizes="(min-width: 1200px) 230px, (min-width: 900px) 22vw, (min-width: 640px) 30vw, 45vw"
          />
        </li>
      </TransitionGroup>

      <div v-else class="empty">
        <Icon name="search" class="empty__icon" />
        <p class="empty__text">{{ t("map.noResults") }}</p>
        <button type="button" class="btn btn--gold" @click="clearFilters">
          <Icon name="x" />{{ t("map.clear") }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Era, Tag, Theater } from "~~/types/data";
import type { TitleCard } from "~~/types/view";

type EraOption = Era | "all";
type KindOption = "all" | "film" | "series";
type SortOption = "story" | "year" | "rating" | "title";

const props = defineProps<{ titles: TitleCard[]; lockedEra?: Era }>();

const ERAS: Era[] = ["ww1", "interwar", "ww2"];
const ERA_OPTIONS: EraOption[] = ["all", ...ERAS];
const KINDS: KindOption[] = ["all", "film", "series"];
const SORTS: { value: SortOption; label: string }[] = [
  { value: "story", label: "films.sortStory" },
  { value: "year", label: "films.sortYear" },
  { value: "rating", label: "films.sortRating" },
  { value: "title", label: "films.sortTitle" },
];
const THEATERS: Theater[] = [
  "western-europe",
  "eastern-europe",
  "mediterranean",
  "atlantic",
  "pacific",
  "asia",
  "americas",
];
const TAGS: Tag[] = [
  "combat",
  "holocaust",
  "resistance",
  "espionage",
  "air",
  "naval",
  "home-front",
  "prisoners",
  "civil-war",
  "politics",
  "biography",
  "true-story",
  "animation",
  "documentary",
  "comedy",
  "romance",
];

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const uid = useId();
const headingId = `${uid}-heading`;
const panelId = `${uid}-panel`;

const query = ref("");
const era = ref<EraOption>("all");
const kind = ref<KindOption>("all");
const theaters = ref<Theater[]>([]);
const tags = ref<Tag[]>([]);
const goldOnly = ref(false);
const sort = ref<SortOption>("story");
const panelOpen = ref<boolean | null>(null);
const panelExpanded = computed(() => panelOpen.value ?? false);

const theaterOptions = computed(() =>
  THEATERS.filter((option) =>
    props.titles.some((title) => title.theaters.includes(option))
  )
);
const tagOptions = computed(() =>
  TAGS.filter((option) =>
    props.titles.some((title) => title.tags.includes(option))
  )
);

function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const haystacks = computed(
  () =>
    new Map(
      props.titles.map((title) => [
        title.id,
        fold(
          [
            title.title,
            title.altTitle ?? "",
            ...title.stops.map((stop) => stop.name),
          ].join(" ")
        ),
      ])
    )
);

const activeEra = computed<EraOption>(() => props.lockedEra ?? era.value);

const results = computed(() => {
  const needle = fold(query.value.trim());
  const filtered = props.titles.filter(
    (title) =>
      (activeEra.value === "all" || title.era === activeEra.value) &&
      (kind.value === "all" || title.kind === kind.value) &&
      (!goldOnly.value || title.gold) &&
      (!theaters.value.length ||
        theaters.value.some((option) => title.theaters.includes(option))) &&
      (!tags.value.length ||
        tags.value.some((option) => title.tags.includes(option))) &&
      (!needle || haystacks.value.get(title.id)!.includes(needle))
  );
  const sorted = [...filtered];
  if (sort.value === "story") {
    sorted.sort(
      (a, b) =>
        ERAS.indexOf(a.era) - ERAS.indexOf(b.era) ||
        toMonths(a.period.start) - toMonths(b.period.start)
    );
  } else if (sort.value === "year") {
    sorted.sort((a, b) => b.year - a.year);
  } else if (sort.value === "rating") {
    sorted.sort((a, b) => (b.vote ?? -1) - (a.vote ?? -1));
  } else {
    sorted.sort((a, b) => a.title.localeCompare(b.title, locale.value));
  }
  return sorted;
});

const showDividers = computed(
  () => sort.value === "story" && activeEra.value === "all"
);

type Item =
  | { type: "divider"; key: string; era: Era; count: number; order: number }
  | { type: "title"; key: string; title: TitleCard; order: number };

const items = computed<Item[]>(() => {
  const list: Item[] = [];
  let previous: Era | undefined;
  results.value.forEach((title, index) => {
    const order = Math.min(index, 12);
    if (showDividers.value && title.era !== previous) {
      previous = title.era;
      const count = results.value.filter(
        (item) => item.era === title.era
      ).length;
      list.push({
        type: "divider",
        key: `era-${title.era}`,
        era: title.era,
        count,
        order,
      });
    }
    list.push({ type: "title", key: title.id, title, order });
  });
  return list;
});

function toggle<T>(list: T[], value: T) {
  const index = list.indexOf(value);
  if (index === -1) list.push(value);
  else list.splice(index, 1);
}

function clearFilters() {
  query.value = "";
  era.value = "all";
  kind.value = "all";
  theaters.value = [];
  tags.value = [];
  goldOnly.value = false;
}

function pin(el: Element) {
  const node = el as HTMLElement;
  node.style.width = `${node.offsetWidth}px`;
  node.style.height = `${node.offsetHeight}px`;
  node.style.left = `${node.offsetLeft}px`;
  node.style.top = `${node.offsetTop}px`;
}

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | undefined {
  return typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

function pickList<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .filter((part): part is T => (allowed as readonly string[]).includes(part));
}

onMounted(() => {
  const params = route.query;
  if (typeof params.q === "string") query.value = params.q;
  if (!props.lockedEra) era.value = pick(params.era, ERAS) ?? "all";
  kind.value = pick(params.kind, ["film", "series"] as const) ?? "all";
  theaters.value = pickList(params.theater, THEATERS);
  tags.value = pickList(params.tag, TAGS);
  goldOnly.value = params.gold === "1";
  sort.value =
    pick(params.sort, ["year", "rating", "title"] as const) ?? "story";
  if (tags.value.length) panelOpen.value = true;
  else panelOpen.value = window.matchMedia("(min-width: 900px)").matches;

  watch(
    [query, era, kind, theaters, tags, goldOnly, sort],
    () => {
      const next: Record<string, string> = {};
      const q = query.value.trim();
      if (q) next.q = q;
      if (!props.lockedEra && era.value !== "all") next.era = era.value;
      if (kind.value !== "all") next.kind = kind.value;
      if (theaters.value.length) next.theater = theaters.value.join(",");
      if (tags.value.length) next.tag = tags.value.join(",");
      if (goldOnly.value) next.gold = "1";
      if (sort.value !== "story") next.sort = sort.value;
      router.replace({ query: next });
    },
    { deep: true }
  );
});
</script>

<style lang="scss" scoped>
.browser {
  padding-block: clamp(48px, 8vw, 96px) clamp(64px, 10vw, 120px);
}

.browser__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.browser__heading {
  @include display(clamp(2.2rem, 6vw, 3.6rem));
}

.browser__count {
  font-size: 0.8rem;
  color: var(--muted);
  white-space: nowrap;
}

.bar {
  position: sticky;
  top: var(--header-h);
  z-index: 20;
  padding-block: 10px;
  @include glass(0.86);
  border-width: 1px 0;
}

.bar__inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar__row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.bar__search {
  position: relative;
  flex: 1 1 220px;
  min-width: 0;

  input {
    width: 100%;
    height: 44px;
    padding: 0 40px 0 42px;
    border-radius: 999px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    font-size: 0.95rem;
    transition:
      border-color 0.2s $ease-out,
      background-color 0.2s $ease-out;

    &::placeholder {
      color: var(--faint);
    }

    &::-webkit-search-cancel-button {
      display: none;
    }

    &:focus-visible {
      outline: none;
      border-color: var(--gold);
      background: var(--surface-2);
    }
  }
}

.bar__search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  width: 17px;
  height: 17px;
  color: var(--muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.bar__search-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--muted);
  transform: translateY(-50%);

  &:hover {
    color: var(--text);
    background: var(--surface-3);
  }

  svg {
    width: 15px;
    height: 15px;
  }
}

.bar__segment {
  flex: none;
  display: flex;
  padding: 2px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: var(--surface);
}

.bar__seg {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
  min-height: 30px;
  padding: 0 0.85em;
  border-radius: 999px;
  color: var(--muted);
  font-family: var(--font-display);
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  transition:
    background-color 0.25s $ease-out,
    color 0.25s $ease-out;

  &:hover {
    color: var(--text);
  }

  &[aria-pressed="true"] {
    background: var(--text);
    color: #12130d;

    .bar__seg-years {
      color: rgb(18 19 13 / 0.6);
    }
  }
}

.bar__seg-years {
  display: none;
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--faint);

  @include up($bp-lg) {
    display: inline;
  }
}

.bar__sort {
  position: relative;
  flex: none;
  display: flex;
  align-items: center;

  select {
    appearance: none;
    height: 44px;
    padding: 0 38px 0 14px;
    border-radius: 999px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    font-size: 0.88rem;
    cursor: pointer;

    &:focus-visible {
      @include focus-ring;
    }
  }
}

.bar__sort-label {
  display: none;
  margin-right: 10px;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--faint);

  @include up($bp-sm) {
    display: inline;
  }
}

.bar__sort-icon {
  position: absolute;
  right: 13px;
  top: 50%;
  width: 15px;
  height: 15px;
  color: var(--muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.bar__row--chips {
  gap: 8px;
}

.bar__chips {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent);
  padding-right: 24px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.bar__group {
  display: flex;
  gap: 6px;
}

.bar__sep {
  flex: none;
  width: 1px;
  height: 20px;
  background: var(--line-strong);
}

.bar__more {
  flex: none;
}

.bar__more-count {
  display: grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--gold);
  color: #17130a;
  font-size: 0.66rem;
}

.panel {
  display: none;

  @include up($bp-md) {
    display: block;
  }

  &.is-open {
    display: block;
  }

  &.is-closed {
    display: none;
  }
}

.panel__inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-block: 16px 4px;

  @include up($bp-md) {
    flex-direction: row;
    align-items: baseline;
    gap: 18px;
  }

  @include motion {
    animation: panel-in 0.35s $ease-out;
  }
}

.panel__label {
  flex: none;
}

.panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
}

.grid {
  position: relative;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px 14px;
  margin-top: 28px;

  @include up($bp-sm) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 32px 18px;
  }

  @include up($bp-md) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @include up($bp-lg) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 40px 22px;
  }
}

.grid__divider {
  grid-column: 1 / -1;
  padding-top: 12px;

  &:first-child {
    padding-top: 0;
  }
}

.divider {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  text-transform: uppercase;
}

.divider__years {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--gold);

  .divider--ww1 & {
    color: var(--olive);
  }

  .divider--interwar & {
    color: var(--blue);
  }

  .divider--ww2 & {
    color: var(--red-2);
  }
}

.divider__line {
  flex: 1 1 60px;
  align-self: center;
  height: 1px;
  background: linear-gradient(to right, var(--line-strong), transparent);
}

.divider__count {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--faint);
}

@include motion {
  .grid-move,
  .grid-enter-active,
  .grid-leave-active {
    transition:
      opacity 0.4s $ease-out,
      transform 0.5s $ease-out;
  }

  .grid-enter-active {
    transition-delay: calc(var(--i, 0) * 25ms);
  }

  .grid-enter-from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }

  .grid-leave-active {
    position: absolute;
    transition-duration: 0.25s;
  }

  .grid-leave-to {
    opacity: 0;
    transform: scale(0.94);
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: clamp(56px, 10vw, 110px) 16px;
  margin-top: 28px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  text-align: center;
}

.empty__icon {
  width: 34px;
  height: 34px;
  color: var(--faint);
}

.empty__text {
  max-width: 34ch;
  color: var(--muted);
}
</style>
