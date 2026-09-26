<template>
  <footer class="footer">
    <div class="footer__marquee" aria-hidden="true">
      <div class="footer__track">
        <span v-for="n in 2" :key="n" class="footer__run">
          <template v-for="mark in MARKS" :key="`${n}-${mark}`">
            <span>{{ mark }}</span
            ><i />
          </template>
        </span>
      </div>
    </div>

    <div class="container footer__grid">
      <div class="footer__brand">
        <AppLogo class="footer__logo" />
        <p class="footer__word">WW2 <span>Film Map</span></p>
        <p class="footer__tag">{{ t("site.tagline") }}</p>
      </div>

      <nav class="footer__col" :aria-label="t('nav.menu')">
        <p class="eyebrow">{{ t("nav.menu") }}</p>
        <NuxtLinkLocale to="/">{{ t("nav.map") }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/films">{{ t("nav.films") }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/timeline">{{ t("nav.timeline") }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/places">{{ t("nav.places") }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/about">{{ t("nav.about") }}</NuxtLinkLocale>
      </nav>

      <nav class="footer__col" :aria-label="t('era.all')">
        <p class="eyebrow">{{ t("era.all") }}</p>
        <NuxtLinkLocale v-for="era in ERAS" :key="era" :to="`/era/${era}`">
          {{ t(`era.${era}`) }}
          <span class="mono">{{ t(`era.years.${era}`) }}</span>
        </NuxtLinkLocale>
      </nav>

      <div class="footer__col footer__credits">
        <p class="eyebrow">{{ t("about.sources") }}</p>
        <p>{{ t("footer.tmdb") }}</p>
        <p>{{ t("about.tmdbNotice") }}</p>
        <p>
          <a href="https://stevenacz.com" rel="author">{{
            t("footer.made")
          }}</a>
          ·
          <a
            href="https://github.com/StevenACZ/ww2-movie-map"
            rel="noopener"
            target="_blank"
          >
            GitHub<span class="visually-hidden">
              {{ t("common.external") }}</span
            >
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const ERAS = ["ww1", "interwar", "ww2"] as const;
const MARKS = [
  "1914",
  "Sarajevo",
  "1918",
  "Versailles",
  "1939",
  "Dunkirk",
  "1942",
  "Stalingrad",
  "1944",
  "Normandy",
  "1945",
];

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.footer {
  position: relative;
  margin-top: 120px;
  border-top: 1px solid var(--line);
  background: linear-gradient(to bottom, var(--bg-2), var(--bg));
  overflow: hidden;
}

.footer__marquee {
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
  overflow: hidden;
}

.footer__track {
  display: flex;
  width: max-content;

  @include motion {
    animation: marquee 60s linear infinite;
  }
}

.footer__run {
  display: flex;
  align-items: center;
  gap: 28px;
  padding-right: 28px;
  font-family: var(--font-stencil);
  font-size: clamp(2rem, 5vw, 3.6rem);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: transparent;
  -webkit-text-stroke: 1px var(--line-strong);

  span:nth-child(4n + 1) {
    color: var(--surface-3);
  }

  i {
    width: 10px;
    height: 10px;
    background: var(--red);
    transform: rotate(45deg);
    opacity: 0.7;
  }
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

.footer__grid {
  display: grid;
  gap: 40px;
  padding-block: 56px 64px;

  @include up($bp-md) {
    grid-template-columns: 1.4fr 1fr 1fr 1.4fr;
  }
}

.footer__logo {
  width: 44px;
  height: 44px;
  margin-bottom: 14px;
}

.footer__word {
  font-family: var(--font-stencil);
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1;

  span {
    color: var(--gold);
  }
}

.footer__tag {
  margin-top: 10px;
  max-width: 30ch;
  color: var(--muted);
}

.footer__col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  .eyebrow {
    margin-bottom: 6px;
  }

  a {
    color: var(--text);
    transition: color 0.2s $ease-out;

    &:hover {
      color: var(--gold);
    }

    .mono {
      margin-left: 6px;
      font-size: 0.76rem;
      color: var(--faint);
    }
  }
}

.footer__credits p {
  font-size: 0.9rem;
  color: var(--muted);
}
</style>
