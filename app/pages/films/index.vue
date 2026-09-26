<template>
  <div class="films">
    <header class="hero container">
      <p class="hero__eyebrow eyebrow">
        <span class="hero__dot" aria-hidden="true" />{{
          t("filmsPage.eyebrow", { n: count })
        }}
      </p>
      <h1 class="hero__title">{{ t("films.h1") }}</h1>
      <p class="hero__intro">{{ t("films.intro", { count }) }}</p>
      <ul class="hero__eras">
        <li v-for="era in ERAS" :key="era">
          <NuxtLinkLocale
            :to="`/era/${era}`"
            class="hero__era"
            :class="`hero__era--${era}`"
          >
            <span class="hero__era-name">{{ t(`era.${era}`) }}</span>
            <span class="hero__era-years mono">{{
              t(`era.years.${era}`)
            }}</span>
            <Icon name="arrow-right" class="hero__era-arrow" />
          </NuxtLinkLocale>
        </li>
      </ul>
    </header>

    <CollectionGold v-if="gold.length" :titles="gold" eager />

    <CollectionBrowser :titles="titles" />
  </div>
</template>

<script setup lang="ts">
import type { Era, Locale } from "~~/types/data";

const ERAS: Era[] = ["ww1", "interwar", "ww2"];

const { t, locale } = useI18n();
const { data } = await useIndexData();

const titles = computed(() => data.value?.titles ?? []);
const count = computed(() => titles.value.length);
const gold = computed(() => titles.value.filter((title) => title.gold));

usePageSeo(() => {
  const current = locale.value as Locale;
  const description = t("films.intro", { count: count.value });
  return {
    path: "/films",
    title: t("films.title"),
    description,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t("films.title"),
        description,
        url: absoluteUrl("/films", current),
        inLanguage: current,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: titles.value.length,
          itemListElement: titles.value.map((title, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/films/${title.id}`, current),
            name: title.title,
          })),
        },
      },
      breadcrumbGraph(current, [
        { name: t("nav.map"), path: "/" },
        { name: t("nav.films"), path: "/films" },
      ]),
    ],
  };
});
</script>

<style lang="scss" scoped>
.hero {
  position: relative;
  padding-block: clamp(48px, 10vw, 120px) clamp(40px, 7vw, 80px);
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.7em;
}

.hero__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--red-2);
  box-shadow: 0 0 0 4px rgb(227 89 63 / 0.18);
}

.hero__title {
  margin-top: 18px;
  font-family: var(--font-stencil);
  font-size: clamp(3.6rem, 15vw, 11rem);
  font-weight: 800;
  line-height: 0.85;
  text-transform: uppercase;
  background: linear-gradient(
    180deg,
    var(--paper) 30%,
    rgb(233 225 201 / 0.55)
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;

  @include motion {
    animation: hero-in 0.9s $ease-out both;
  }
}

.hero__intro {
  margin-top: clamp(18px, 3vw, 28px);
  max-width: 58ch;
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  color: var(--muted);

  @include motion {
    animation: hero-in 0.9s 0.12s $ease-out both;
  }
}

.hero__eras {
  list-style: none;
  display: grid;
  gap: 10px;
  margin-top: clamp(28px, 4vw, 44px);

  @include up($bp-sm) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @include motion {
    animation: hero-in 0.9s 0.24s $ease-out both;
  }
}

.hero__era {
  --accent: var(--red-2);
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2px 12px;
  padding: 14px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  box-shadow: inset 0 2px 0 var(--accent);
  background: var(--surface);
  transition:
    border-color 0.25s $ease-out,
    background-color 0.25s $ease-out;

  &--ww1 {
    --accent: var(--olive);
  }

  &--interwar {
    --accent: var(--blue);
  }

  &:hover {
    border-color: var(--line-strong);
    background: var(--surface-2);
  }
}

.hero__era-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.hero__era-years {
  grid-row: 2;
  font-size: 0.74rem;
  color: var(--accent);
}

.hero__era-arrow {
  grid-row: 1 / span 2;
  grid-column: 2;
  width: 18px;
  height: 18px;
  color: var(--muted);
  transition: transform 0.3s $ease-out;

  .hero__era:hover & {
    transform: translateX(4px);
    color: var(--text);
  }
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}
</style>
