<template>
  <div ref="root" class="tl">
    <header class="tl-hero container">
      <p class="tl-hero__eyebrow eyebrow">{{ t("timelinePage.eyebrow") }}</p>
      <h1 class="tl-hero__title">{{ t("timeline.h1") }}</h1>
      <p class="tl-hero__intro">{{ t("timeline.intro") }}</p>
      <div class="tl-strip" aria-hidden="true">
        <span class="tl-strip__year stencil">1914</span>
        <svg
          class="tl-strip__ruler"
          viewBox="0 0 320 40"
          preserveAspectRatio="none"
        >
          <line
            v-for="(tick, i) in TICKS"
            :key="tick.year"
            class="tl-strip__tick"
            :class="`tl-strip__tick--${tick.era}`"
            :x1="5 + i * 10"
            :x2="5 + i * 10"
            :y1="tick.big ? 6 : 16"
            y2="34"
            :style="{ '--i': i }"
          />
          <path class="tl-strip__line" d="M0 34H320" pathLength="1" />
        </svg>
        <TimelineYear
          class="tl-strip__year tl-strip__year--end stencil"
          :year="1945"
          :from="1914"
        />
      </div>
      <p class="tl-hero__stats mono">
        {{
          t("timelinePage.stats", {
            events: events.length,
            films: titles.length,
          })
        }}
      </p>
    </header>

    <nav class="tl-nav" :aria-label="t('timeline.jump')">
      <div class="tl-nav__inner container">
        <span class="tl-nav__label eyebrow">{{ t("timeline.jump") }}</span>
        <ul class="tl-nav__chips">
          <li v-for="chapter in chapters" :key="chapter.era">
            <a
              :href="`#${chapter.era}`"
              class="chip tl-nav__chip"
              :class="[
                `tl-nav__chip--${chapter.era}`,
                { 'is-active': current.era === chapter.era },
              ]"
              :aria-current="current.era === chapter.era ? 'true' : undefined"
              @click="play(chapter.era)"
            >
              {{ t(`era.short.${chapter.era}`) }}
              <span class="mono tl-nav__years">{{
                t(`era.years.${chapter.era}`)
              }}</span>
            </a>
          </li>
        </ul>
        <span
          class="tl-nav__pill mono"
          :class="`tl-nav__pill--${current.era}`"
          aria-hidden="true"
        >
          <TimelineYear :year="current.year" />
        </span>
      </div>
    </nav>

    <div class="tl-body container">
      <aside class="tl-side" aria-hidden="true">
        <div class="tl-side__sticky" :class="`tl-side__sticky--${current.era}`">
          <span class="tl-side__era eyebrow">{{
            t(`era.${current.era}`)
          }}</span>
          <TimelineYear class="tl-side__year stencil" :year="current.year" />
          <span class="tl-side__bar" />
        </div>
      </aside>

      <div class="tl-chapters">
        <section
          v-for="(chapter, n) in chapters"
          :id="chapter.era"
          :key="chapter.era"
          class="tl-chapter"
          :class="`tl-chapter--${chapter.era}`"
          :aria-labelledby="`${chapter.era}-title`"
        >
          <header class="tl-chapter__head">
            <p class="tl-chapter__num mono">
              {{ t("timeline.chapter", { n: n + 1 }) }}
            </p>
            <h2 :id="`${chapter.era}-title`" class="tl-chapter__title">
              {{ t(`era.${chapter.era}`) }}
            </h2>
            <p class="tl-chapter__years stencil">
              {{ t(`era.years.${chapter.era}`) }}
            </p>
          </header>
          <div class="tl-track">
            <span class="tl-track__fill" aria-hidden="true" />
            <ol class="tl-track__list">
              <TimelineEventCard
                v-for="(event, i) in chapter.events"
                :key="event.id"
                :event="event"
                :films="filmsFor(event)"
                :side="i % 2 === 0 ? 'left' : 'right'"
                :rank="n === 0 ? i : events.length"
              />
            </ol>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Era, Locale } from "~~/types/data";
import type { EventCard, TitleCard } from "~~/types/view";

const ERAS: Era[] = ["ww1", "interwar", "ww2"];
const TICKS = Array.from({ length: 32 }, (_, i) => {
  const year = 1914 + i;
  return {
    year,
    era: eraAt(toMonths(`${year}-06`)),
    big: year % 5 === 0 || i === 0 || i === 31,
  };
});

const { t, locale } = useI18n();
const { play } = useSound();
const { data } = await useIndexData();

const events = computed(() => data.value?.events ?? []);
const titles = computed(() => data.value?.titles ?? []);

const chapters = computed(() =>
  ERAS.map((era) => ({
    era,
    events: events.value.filter((event) => event.era === era),
  }))
);

const films = computed(() => {
  const spans = titles.value.map((title) => ({
    title,
    start: Math.floor(toMonths(title.period.start)),
    end: Math.floor(toMonths(title.period.end)),
  }));
  const map = new Map<string, TitleCard[]>();
  for (const event of events.value) {
    const at = Math.floor(toMonths(event.date));
    const matches = spans
      .filter((span) => span.start <= at && at <= span.end)
      .sort(
        (a, b) =>
          a.end - a.start - (b.end - b.start) ||
          Math.abs(at - a.start) - Math.abs(at - b.start)
      )
      .slice(0, 4)
      .map((span) => span.title);
    map.set(event.id, matches);
  }
  return map;
});

function filmsFor(event: EventCard) {
  return films.value.get(event.id) ?? [];
}

const current = reactive<{ year: number; era: Era }>({
  year: 1914,
  era: "ww1",
});
const root = ref<HTMLElement>();
let observer: IntersectionObserver | undefined;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        current.year = Number(el.dataset.year);
        current.era = el.dataset.era as Era;
      }
    },
    { rootMargin: "-45% 0px -55% 0px" }
  );
  root.value
    ?.querySelectorAll<HTMLElement>("[data-year]")
    .forEach((el) => observer!.observe(el));
});

onBeforeUnmount(() => observer?.disconnect());

usePageSeo(() => ({
  path: "/timeline",
  title: t("timeline.title"),
  description: t("timeline.intro"),
  jsonLd: [
    breadcrumbGraph(locale.value as Locale, [
      { name: t("nav.map"), path: "/" },
      { name: t("nav.timeline"), path: "/timeline" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: t("timeline.title"),
      numberOfItems: events.value.length,
      itemListElement: events.value.map((event, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Event",
          name: event.title,
          startDate: event.date,
          ...(event.endDate ? { endDate: event.endDate } : {}),
          ...(event.place
            ? { location: { "@type": "Place", name: event.place } }
            : {}),
          sameAs: event.wikipedia,
        },
      })),
    },
  ],
}));
</script>

<style lang="scss" scoped>
.tl {
  --c-ww1: color-mix(in oklab, var(--paper) 55%, var(--gold-deep));
  --c-interwar: color-mix(in oklab, var(--red) 70%, var(--gold-deep));
  --c-ww2: color-mix(in oklab, var(--olive) 55%, var(--gold));
  --nav-h: 58px;
  overflow-x: clip;
}

.tl-hero {
  padding-block: clamp(48px, 10vw, 120px) clamp(36px, 6vw, 72px);
}

.tl-hero__eyebrow {
  color: var(--gold);
}

.tl-hero__title {
  margin-top: 14px;
  @include display(clamp(3rem, 11vw, 8.5rem));
  color: var(--paper);
  max-width: 14ch;
}

.tl-hero__intro {
  margin-top: 22px;
  max-width: 58ch;
  font-size: clamp(1rem, 1.6vw, 1.2rem);
  color: var(--muted);
}

.tl-strip {
  margin-top: clamp(32px, 6vw, 64px);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: end;
  gap: clamp(12px, 2vw, 28px);
  font-size: clamp(2.6rem, 9vw, 6.5rem);
  font-weight: 800;
  line-height: 1;
}

.tl-strip__year {
  color: var(--c-ww1);

  &--end {
    color: var(--gold);
  }
}

.tl-strip__ruler {
  width: 100%;
  height: 0.5em;
  margin-bottom: 0.12em;
  overflow: visible;
}

.tl-strip__line {
  fill: none;
  stroke: var(--line-strong);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;

  @include motion {
    animation-name: draw;
    animation-duration: 1.4s;
    animation-timing-function: $ease-in-out;
    animation-fill-mode: both;
  }
}

.tl-strip__tick {
  stroke-width: 2;
  vector-effect: non-scaling-stroke;

  &--ww1 {
    stroke: var(--c-ww1);
  }

  &--interwar {
    stroke: var(--c-interwar);
  }

  &--ww2 {
    stroke: var(--c-ww2);
  }

  @include motion {
    transform-box: fill-box;
    transform-origin: bottom;
    animation-name: tick-up;
    animation-duration: 0.5s;
    animation-delay: calc(0.3s + var(--i) * 35ms);
    animation-timing-function: $ease-spring;
    animation-fill-mode: both;
  }
}

.tl-hero__stats {
  margin-top: 18px;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--faint);
}

.tl-nav {
  position: sticky;
  top: var(--header-h);
  z-index: 50;
  @include glass(0.82);
  border-inline: 0;
}

.tl-nav__inner {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--nav-h);
}

.tl-nav__label {
  display: none;

  @include up($bp-md) {
    display: inline;
  }
}

.tl-nav__chips {
  display: flex;
  gap: 6px;
  list-style: none;
  overflow-x: auto;
  scrollbar-width: none;
  min-width: 0;
}

.tl-nav__chip {
  --c: var(--c-ww1);

  &--interwar {
    --c: var(--c-interwar);
  }

  &--ww2 {
    --c: var(--c-ww2);
  }

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--c);
  }

  &.is-active {
    background: var(--c);
    border-color: var(--c);
    color: #12130d;

    &::before {
      background: #12130d;
    }
  }
}

.tl-nav__years {
  display: none;
  font-size: 0.72rem;
  opacity: 0.75;

  @include up($bp-sm) {
    display: inline;
  }
}

.tl-nav__pill {
  margin-left: auto;
  flex: none;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--c, var(--line-strong));
  font-size: 1rem;
  font-weight: 600;
  color: var(--c);
  transition:
    color 0.4s $ease-out,
    border-color 0.4s $ease-out;

  &--ww1 {
    --c: var(--c-ww1);
  }

  &--interwar {
    --c: var(--c-interwar);
  }

  &--ww2 {
    --c: var(--c-ww2);
  }

  @include up($bp-lg) {
    display: none;
  }
}

.tl-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  padding-bottom: clamp(64px, 10vw, 140px);

  @include up($bp-lg) {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 32px;
  }
}

.tl-side {
  display: none;

  @include up($bp-lg) {
    display: block;
  }
}

.tl-side__sticky {
  --c: var(--c-ww1);
  position: sticky;
  top: calc(var(--header-h) + var(--nav-h) + 32px);
  padding-top: 48px;
  display: grid;
  gap: 10px;

  &--interwar {
    --c: var(--c-interwar);
  }

  &--ww2 {
    --c: var(--c-ww2);
  }
}

.tl-side__era {
  color: var(--c);
  transition: color 0.4s $ease-out;
}

.tl-side__year {
  font-size: 5.6rem;
  font-weight: 800;
  color: var(--paper);
}

.tl-side__bar {
  width: 64px;
  height: 3px;
  border-radius: 3px;
  background: var(--c);
  transition: background-color 0.4s $ease-out;
}

.tl-chapter {
  --era-c: var(--c-ww1);
  scroll-margin-top: calc(var(--header-h) + var(--nav-h));

  &--interwar {
    --era-c: var(--c-interwar);
  }

  &--ww2 {
    --era-c: var(--c-ww2);
  }
}

.tl-chapter__head {
  position: relative;
  padding-block: clamp(56px, 9vw, 110px) clamp(28px, 4vw, 48px);

  @include up($bp-md) {
    text-align: center;
  }

  @supports (animation-timeline: view()) {
    @include motion {
      animation-name: head-in;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: view();
      animation-range: entry 10% cover 40%;
    }
  }
}

.tl-chapter__num {
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--era-c);
}

.tl-chapter__title {
  margin-top: 10px;
  @include display(clamp(2.8rem, 9vw, 6.8rem));
  color: var(--paper);
}

.tl-chapter__years {
  margin-top: 8px;
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  font-weight: 700;
  color: var(--era-c);
  letter-spacing: 0.04em;
}

.tl-track {
  position: relative;

  &::before,
  .tl-track__fill {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 17px;
    width: 3px;
    border-radius: 3px;

    @include up($bp-md) {
      left: calc(50% - 1.5px);
    }
  }

  &::before {
    background: var(--line);
  }
}

.tl-track__list {
  position: relative;
  list-style: none;
}

.tl-track__fill {
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--era-c) 60%, transparent),
    var(--era-c)
  );
  box-shadow: 0 0 18px color-mix(in oklab, var(--era-c) 45%, transparent);
  transform-origin: top;

  @supports (animation-timeline: view()) {
    @include motion {
      animation-name: fill-grow;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: view();
      animation-range: entry 50% exit 50%;
    }
  }
}

@keyframes fill-grow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

@keyframes head-in {
  from {
    opacity: 0;
    transform: translateY(48px);
    letter-spacing: 0.08em;
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes tick-up {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}
</style>
