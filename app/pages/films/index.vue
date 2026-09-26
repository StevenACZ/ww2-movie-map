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
            <img
              class="hero__era-img"
              :src="ERA_IMAGES[era]"
              alt=""
              width="720"
              height="405"
              loading="lazy"
              decoding="async"
            />
            <span class="hero__era-body">
              <span class="hero__era-meta mono">
                <span class="hero__era-dot" aria-hidden="true" />{{
                  t(`era.years.${era}`)
                }}
                · {{ t("films.count", { n: eraCounts[era] }) }}
              </span>
              <span class="hero__era-name">{{ t(`era.${era}`) }}</span>
            </span>
            <span class="hero__era-arrow" aria-hidden="true">
              <Icon name="arrow-right" />
            </span>
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
const ERA_IMAGES: Record<Era, string> = {
  ww1: "/img/events/battle-of-the-somme.webp",
  interwar: "/img/events/wall-street-crash.webp",
  ww2: "/img/events/d-day.webp",
};

const { t, locale } = useI18n();
const { data } = await useIndexData();

const titles = computed(() => data.value?.titles ?? []);
const count = computed(() => titles.value.length);
const eraCounts = computed(() => {
  const counts: Record<Era, number> = { ww1: 0, interwar: 0, ww2: 0 };
  for (const title of titles.value) counts[title.era] += 1;
  return counts;
});
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
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  min-height: 150px;
  padding: 18px 18px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
  overflow: hidden;
  isolation: isolate;
  transition: border-color 0.3s $ease-out;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      180deg,
      rgb(14 15 11 / 0.15) 0%,
      rgb(14 15 11 / 0.55) 45%,
      rgb(14 15 11 / 0.94) 100%
    );
  }

  &--ww1 {
    --accent: var(--olive);
  }

  &--interwar {
    --accent: var(--blue);
  }

  &:hover,
  &:focus-visible {
    border-color: var(--line-strong);
  }

  @include up($bp-md) {
    min-height: 176px;
  }
}

.hero__era-img {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) sepia(0.25) contrast(1.05) brightness(0.8);
  transition:
    transform 0.6s $ease-out,
    filter 0.6s $ease-out;

  .hero__era:hover &,
  .hero__era:focus-visible & {
    transform: scale(1.04);
    filter: grayscale(0.6) sepia(0.2) contrast(1.05) brightness(0.9);
  }
}

.hero__era-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.hero__era-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.hero__era-dot {
  flex: none;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
}

.hero__era-name {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.2vw, 1.75rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--paper);
}

.hero__era-arrow {
  display: grid;
  flex: none;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: rgb(14 15 11 / 0.6);
  color: var(--text);
  transition:
    transform 0.3s $ease-out,
    border-color 0.3s $ease-out;

  svg {
    width: 16px;
    height: 16px;
  }

  .hero__era:hover &,
  .hero__era:focus-visible & {
    transform: translateX(3px);
    border-color: var(--text);
  }
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}
</style>
