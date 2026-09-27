<template>
  <article class="about">
    <header class="hero container">
      <div class="hero__copy">
        <p class="eyebrow hero__eyebrow">{{ t("aboutPage.eyebrow") }}</p>
        <h1 class="hero__title stencil">{{ t("about.h1") }}</h1>
        <p class="hero__intro">{{ t("about.intro") }}</p>
      </div>
      <div class="hero__art">
        <AboutHeroGlobe />
      </div>
    </header>

    <section class="stats container" aria-labelledby="about-stats">
      <h2 id="about-stats" class="visually-hidden">
        {{ t("aboutPage.statsLabel") }}
      </h2>
      <dl class="stats__grid">
        <AboutStatCounter
          v-for="stat in stats"
          :key="stat.key"
          class="reveal"
          :value="stat.value"
          :label="t(`about.stats.${stat.key}`)"
        />
      </dl>
    </section>

    <section class="how container" aria-labelledby="about-how">
      <div class="section-head">
        <p class="eyebrow">{{ t("aboutPage.howEyebrow") }}</p>
        <h2 id="about-how" class="section-title">{{ t("about.how") }}</h2>
      </div>
      <ol class="how__steps">
        <li v-for="(step, i) in STEPS" :key="step.key" class="step reveal">
          <div class="step__art">
            <AboutStepArt :kind="step.art" />
          </div>
          <p class="step__num mono">{{ t("aboutPage.step", { n: i + 1 }) }}</p>
          <h3 class="step__title">{{ t(`about.${step.key}`) }}</h3>
          <p class="step__text">{{ t(`about.${step.key}Text`) }}</p>
        </li>
      </ol>
    </section>

    <section class="eras container" aria-labelledby="about-eras">
      <div class="section-head">
        <p class="eyebrow">{{ t("aboutPage.sounds.eyebrow") }}</p>
        <h2 id="about-eras" class="section-title">
          {{ t("aboutPage.sounds.title") }}
        </h2>
        <p class="section-intro">{{ t("aboutPage.sounds.intro") }}</p>
      </div>
      <AboutEraSounds />
    </section>

    <section class="credits container" aria-labelledby="about-sources">
      <div class="section-head">
        <p class="eyebrow">{{ t("aboutPage.credits.eyebrow") }}</p>
        <h2 id="about-sources" class="section-title">
          {{ t("about.sources") }}
        </h2>
        <p class="section-intro">{{ t("about.sourcesText") }}</p>
      </div>
      <ol class="credits__roll">
        <li
          v-for="(credit, i) in credits"
          :key="credit.name"
          class="credit reveal"
        >
          <span class="credit__index mono">{{
            String(i + 1).padStart(2, "0")
          }}</span>
          <div class="credit__body">
            <p class="credit__role">{{ credit.role }}</p>
            <p class="credit__name">
              <a
                v-if="credit.url"
                :href="credit.url"
                target="_blank"
                rel="noopener"
              >
                {{ credit.name }}
                <Icon name="external" />
                <span class="visually-hidden">{{ t("common.external") }}</span>
              </a>
              <template v-else>{{ credit.name }}</template>
            </p>
            <p v-if="credit.note" class="credit__note">{{ credit.note }}</p>
          </div>
          <span v-if="credit.license" class="credit__license mono">{{
            credit.license
          }}</span>
        </li>
      </ol>
    </section>

    <section class="author container" aria-labelledby="about-author">
      <div class="author__card reveal">
        <AppLogo class="author__logo" />
        <div class="author__copy">
          <p class="eyebrow">{{ t("aboutPage.authorEyebrow") }}</p>
          <h2 id="about-author" class="section-title">
            {{ t("about.author") }}
          </h2>
          <p class="author__text">{{ t("about.authorText") }}</p>
          <div class="author__actions">
            <a
              class="btn btn--gold"
              href="https://stevenacz.com"
              target="_blank"
              rel="noopener author"
            >
              {{ t("about.portfolio") }}
              <Icon name="external" />
              <span class="visually-hidden">{{ t("common.external") }}</span>
            </a>
            <a
              class="btn btn--ghost"
              href="https://github.com/StevenACZ/ww2-movie-map"
              target="_blank"
              rel="noopener"
            >
              <Icon name="github" />
              {{ t("about.source") }}
              <span class="visually-hidden">{{ t("common.external") }}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import type { Locale } from "~~/types/data";

const STEPS = [
  { key: "step1", art: "timeline" },
  { key: "step2", art: "pin" },
  { key: "step3", art: "play" },
] as const;

const { t, locale } = useI18n();
const config = useRuntimeConfig();

const stats = computed(() => [
  { key: "titles", value: Number(config.public.titleCount) },
  { key: "places", value: Number(config.public.placeCount) },
  { key: "events", value: Number(config.public.eventCount) },
  { key: "operations", value: Number(config.public.operationCount) },
]);

const credits = computed(() => [
  {
    name: "TMDB",
    role: t("aboutPage.credits.tmdb"),
    url: "https://www.themoviedb.org",
    note: t("about.tmdbNotice"),
  },
  {
    name: "JustWatch",
    role: t("aboutPage.credits.justwatch"),
    url: "https://www.justwatch.com",
  },
  {
    name: "historical-basemaps",
    role: t("aboutPage.credits.borders"),
    url: "https://github.com/aourednik/historical-basemaps",
    license: "GPL-3.0",
  },
  {
    name: "Wikipedia · Wikidata",
    role: t("aboutPage.credits.wiki"),
    license: "CC BY-SA",
  },
  {
    name: "Big Shoulders · Inter · JetBrains Mono",
    role: t("aboutPage.credits.fonts"),
    license: "OFL",
  },
  {
    name: "three.js",
    role: t("aboutPage.credits.three"),
    license: "MIT",
  },
  {
    name: "Freesound",
    role: t("aboutPage.credits.sounds"),
    url: "https://freesound.org",
    note: t("aboutPage.credits.soundsNote"),
    license: "CC0 · CC BY 4.0",
  },
]);

usePageSeo(() => {
  const current = locale.value as Locale;
  return {
    path: "/about",
    title: t("about.title"),
    description: t("about.intro"),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${absoluteUrl("/about", current)}#page`,
        url: absoluteUrl("/about", current),
        name: t("about.title"),
        description: t("about.intro"),
        inLanguage: current,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#website` },
        author: { "@id": `${SITE_URL}/#person` },
      },
      breadcrumbGraph(current, [
        { name: t("nav.map"), path: "/" },
        { name: t("nav.about"), path: "/about" },
      ]),
    ],
  };
});
</script>

<style lang="scss" scoped>
.about {
  padding-top: clamp(24px, 6vw, 72px);
}

.hero {
  display: grid;
  align-items: center;
  gap: clamp(32px, 6vw, 72px);

  @include up($bp-md) {
    grid-template-columns: 1.1fr 0.9fr;
  }
}

.hero__eyebrow {
  color: var(--gold);
}

.hero__title {
  margin: 14px 0 22px;
  font-size: clamp(4.2rem, 16vw, 11rem);
  font-weight: 800;
  line-height: 0.82;
  text-transform: uppercase;
  color: var(--paper);
}

.hero__intro {
  max-width: 56ch;
  font-size: clamp(1.05rem, 2vw, 1.3rem);
  line-height: 1.55;
  color: var(--muted);
}

.hero__art {
  width: min(100%, 520px);
  margin-inline: auto;
  padding: 12px;
}

@include motion {
  .hero__copy > * {
    animation: about-rise 0.9s $ease-out backwards;
  }

  .hero__title {
    animation-delay: 0.08s;
  }

  .hero__intro {
    animation-delay: 0.18s;
  }
}

.stats {
  margin-top: clamp(56px, 10vw, 120px);
}

.stats__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px 24px;

  @include up($bp-md) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

section + section {
  margin-top: clamp(80px, 12vw, 160px);
}

.section-head {
  max-width: 720px;
  margin-bottom: clamp(28px, 5vw, 48px);
}

.section-title {
  margin-top: 10px;
  font-size: clamp(2.4rem, 7vw, 4.6rem);
  text-transform: uppercase;
}

.section-intro {
  margin-top: 16px;
  color: var(--muted);
}

.how__steps {
  display: grid;
  gap: 20px;
  list-style: none;

  @include up($bp-md) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.step {
  padding: 18px 18px 26px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  transition:
    border-color 0.3s $ease-out,
    transform 0.3s $ease-out;

  &:hover {
    border-color: var(--line-strong);
    transform: translateY(-4px);
  }
}

.step__art {
  margin-bottom: 22px;
  padding: 14px;
  border-radius: var(--radius-sm);
  background:
    linear-gradient(var(--line) 1px, transparent 1px) 0 0 / 20px 20px,
    linear-gradient(90deg, var(--line) 1px, transparent 1px) 0 0 / 20px 20px,
    var(--bg-2);
}

.step__num {
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
}

.step__title {
  margin: 8px 0 10px;
  font-size: 1.9rem;
  text-transform: uppercase;
}

.step__text {
  color: var(--muted);
}

.credits__roll {
  list-style: none;
  border-top: 1px solid var(--line-strong);
}

.credit {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 18px;
  padding: 22px 0;
  border-bottom: 1px dashed var(--line-strong);

  @include up($bp-sm) {
    grid-template-columns: 56px 1fr auto;
    align-items: center;
  }
}

.credit__index {
  font-size: 0.8rem;
  color: var(--faint);
}

.credit__role {
  @include eyebrow;
}

.credit__name {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4.4vw, 2.4rem);
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
  overflow-wrap: anywhere;

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    transition: color 0.2s $ease-out;

    &:hover {
      color: var(--gold);
    }
  }

  svg {
    width: 0.55em;
    height: 0.55em;
    opacity: 0.6;
  }
}

.credit__note {
  margin-top: 6px;
  font-size: 0.88rem;
  color: var(--muted);
}

.credit__license {
  grid-column: 2;
  justify-self: start;
  padding: 4px 10px;
  border: 1px solid var(--gold-deep);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--gold);

  @include up($bp-sm) {
    grid-column: 3;
  }
}

.author__card {
  display: grid;
  gap: 28px;
  padding: clamp(24px, 5vw, 56px);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background:
    radial-gradient(circle at 90% 0%, rgb(216 174 82 / 0.12), transparent 50%),
    var(--surface);

  @include up($bp-md) {
    grid-template-columns: 160px 1fr;
    align-items: center;
  }
}

.author__logo {
  width: clamp(96px, 20vw, 160px);
  height: auto;
  color: var(--paper);

  @include motion {
    transition: transform 0.8s $ease-spring;

    .author__card:hover & {
      transform: rotate(-12deg) scale(1.05);
    }
  }
}

.author__text {
  max-width: 56ch;
  margin: 16px 0 24px;
  color: var(--muted);
}

.author__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@keyframes about-rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
