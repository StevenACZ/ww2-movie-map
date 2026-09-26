<template>
  <header
    class="hero"
    :class="[
      `hero--${film.era}`,
      { 'hero--plain': !film.backdrop, 'hero--gold': film.gold },
    ]"
  >
    <div class="hero__backdrop">
      <img
        v-if="film.backdrop"
        :src="tmdbImage(film.backdrop, 'w1280')"
        :srcset="backdropSrcset"
        sizes="100vw"
        alt=""
        width="1280"
        height="720"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      />
      <span v-else class="hero__watermark stencil" aria-hidden="true">{{
        film.title
      }}</span>
    </div>
    <div class="hero__scrim" aria-hidden="true" />

    <div class="container hero__inner">
      <nav class="crumbs mono" :aria-label="t('titlePage.breadcrumb')">
        <ol>
          <li>
            <NuxtLinkLocale to="/">{{ t("nav.map") }}</NuxtLinkLocale>
          </li>
          <li>
            <NuxtLinkLocale to="/films">{{ t("nav.films") }}</NuxtLinkLocale>
          </li>
          <li>
            <span aria-current="page">{{ film.title }}</span>
          </li>
        </ol>
      </nav>

      <div class="hero__poster">
        <TitlePoster
          :path="film.poster"
          :title="film.title"
          :year="film.year"
          :era="film.era"
          :kind="film.kind"
          :gold="film.gold"
          :alt="film.title"
          sizes="(min-width: 900px) 300px, 170px"
          eager
        />
      </div>

      <div class="hero__copy">
        <p class="hero__eyebrow">
          <span v-if="film.gold" class="gold-badge"
            ><Icon name="medal" />{{ t("gold.label") }}</span
          >
          <span class="eyebrow"
            >{{ t(`era.${film.era}`) }} · {{ t(`kind.${film.kind}`) }} ·
            {{ years }}</span
          >
        </p>
        <h1 class="hero__title">{{ film.title }}</h1>
        <p v-if="secondary" class="hero__alt">{{ secondary }}</p>

        <ul class="hero__meta">
          <li v-if="film.directors.length">
            <span class="hero__meta-label">{{
              film.kind === "series"
                ? t("title.createdBy")
                : t("title.directedBy")
            }}</span>
            {{ film.directors.join(", ") }}
          </li>
          <li v-if="film.runtime">
            <Icon name="clock" />{{ t("title.runtime", { n: film.runtime }) }}
          </li>
          <li v-else-if="film.seasons">
            <Icon name="tv" />{{ t("title.seasons", film.seasons) }}
          </li>
          <li v-if="countries.length">
            <Icon name="globe" /><span class="visually-hidden"
              >{{ t("title.countries") }}:</span
            >
            {{ countries.join(", ") }}
          </li>
          <li v-if="languages.length">
            <span class="hero__meta-label">{{ t("title.languages") }}</span>
            {{ languages.join(", ") }}
          </li>
          <li v-if="film.vote" class="hero__vote">
            <Icon name="star" /><span class="visually-hidden"
              >{{ t("title.rating") }}:</span
            >
            <span class="mono">{{ film.vote.toFixed(1) }}</span>
            <span class="hero__meta-label">TMDB</span>
          </li>
        </ul>

        <ul
          v-if="film.genres?.length"
          class="hero__genres"
          :aria-label="t('title.genres')"
        >
          <li v-for="genre in film.genres" :key="genre" class="chip">
            {{ genre }}
          </li>
        </ul>

        <p class="hero__synopsis">{{ film.synopsis }}</p>

        <aside v-if="film.gold && film.goldReason" class="hero__gold">
          <p class="hero__gold-title">
            <Icon name="medal" />{{ t("gold.why") }}
          </p>
          <p>{{ film.goldReason }}</p>
        </aside>

        <div class="hero__actions">
          <button
            v-if="film.trailer"
            type="button"
            class="btn btn--gold"
            @click="playTrailer"
          >
            <Icon name="play" />{{ t("title.trailer") }}
          </button>
          <NuxtLinkLocale
            :to="{ path: '/', query: { title: film.id } }"
            class="btn"
          >
            <Icon name="globe" />{{ t("title.backToMap") }}
          </NuxtLinkLocale>
          <a href="#watch" class="btn btn--ghost"
            ><Icon name="tv" />{{ t("title.watch") }}</a
          >
        </div>
      </div>
    </div>

    <TitleTrailerDialog
      v-if="film.trailer"
      ref="trailer"
      :video-key="film.trailer"
      :label="`${t('title.trailer')}: ${film.title}`"
    />
  </header>
</template>

<script setup lang="ts">
import type { TitleDetail } from "~~/types/view";
import { tmdbImage } from "~/utils/seo";

const props = defineProps<{
  film: TitleDetail;
  countries: string[];
  languages: string[];
}>();

const { t } = useI18n();
const sound = useSound();
const trailer = ref<{ show: () => void }>();

const years = computed(() =>
  props.film.endYear
    ? `${props.film.year}–${props.film.endYear}`
    : String(props.film.year)
);

const secondary = computed(() => {
  const names = [props.film.altTitle, props.film.originalTitle].filter(
    (name): name is string => !!name && name !== props.film.title
  );
  return [...new Set(names)].join(" · ");
});

const backdropSrcset = computed(() =>
  ["w780", "w1280", "original"]
    .map(
      (size) =>
        `${tmdbImage(props.film.backdrop, size)} ${size === "original" ? 1920 : size.slice(1)}w`
    )
    .join(", ")
);

function playTrailer() {
  sound.play("click");
  trailer.value?.show();
}
</script>

<style lang="scss" scoped>
.hero {
  --tint-a: #2b3120;
  --tint-b: #10120b;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding-block: 20px clamp(48px, 7vw, 96px);

  &--ww1 {
    --tint-a: #3d3325;
    --tint-b: #14110c;
  }

  &--interwar {
    --tint-a: #3a2522;
    --tint-b: #130d0b;
  }
}

.hero__backdrop {
  position: absolute;
  inset: 0;
  z-index: -2;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 25%;

    @include motion {
      animation: hero-zoom 1.8s $ease-out both;
    }
  }

  .hero--plain & {
    background:
      repeating-linear-gradient(
        135deg,
        rgb(255 255 255 / 0.02) 0 2px,
        transparent 2px 11px
      ),
      radial-gradient(90% 70% at 78% 18%, var(--tint-a), transparent 70%),
      radial-gradient(
        60% 60% at 8% 100%,
        rgb(200 65 47 / 0.12),
        transparent 70%
      ),
      linear-gradient(var(--tint-b), var(--bg));
  }
}

.hero__watermark {
  position: absolute;
  right: -0.04em;
  top: 50%;
  max-width: 120%;
  font-size: clamp(7rem, 24vw, 22rem);
  font-weight: 800;
  line-height: 0.8;
  text-align: right;
  text-transform: uppercase;
  color: var(--paper);
  opacity: 0.05;
  transform: translateY(-58%) rotate(-4deg);
  overflow-wrap: anywhere;
  white-space: normal;
  pointer-events: none;
  user-select: none;
}

.hero__scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(
      to top,
      var(--bg) 2%,
      rgb(11 12 9 / 0.88) 34%,
      rgb(11 12 9 / 0.45) 68%,
      rgb(11 12 9 / 0.7)
    ),
    linear-gradient(90deg, rgb(11 12 9 / 0.85), transparent 75%);
}

.hero__inner {
  display: grid;
  gap: 24px;

  @include up($bp-md) {
    grid-template-columns: 300px minmax(0, 1fr);
    column-gap: clamp(32px, 4vw, 64px);
    align-items: end;
  }
}

.crumbs {
  grid-column: 1 / -1;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--faint);

  ol {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    list-style: none;
  }

  li {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;

    & + li::before {
      content: "/";
      color: var(--line-strong);
    }
  }

  a {
    color: var(--muted);
    transition: color 0.2s $ease-out;

    &:hover {
      color: var(--gold-2);
    }
  }

  span[aria-current] {
    max-width: 40ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text);
  }
}

.hero__poster {
  width: 170px;
  box-shadow:
    0 0 0 1px var(--line-strong),
    0 40px 80px -30px rgb(0 0 0 / 0.9);
  border-radius: var(--radius-sm);

  @include up($bp-md) {
    width: 300px;
    rotate: -1.2deg;
    margin-top: clamp(40px, 8vw, 120px);
  }

  @include motion {
    animation: hero-poster 1s $ease-out both;
  }
}

.hero__copy {
  min-width: 0;

  > * + * {
    margin-top: 18px;
  }

  @include motion {
    > * {
      animation: hero-rise 0.8s $ease-out both;
    }

    @for $i from 1 through 9 {
      > :nth-child(#{$i}) {
        animation-delay: #{80 + $i * 70}ms;
      }
    }
  }
}

.hero__eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.hero__title {
  @include display(clamp(2.8rem, 8.5vw, 6.6rem));
  color: var(--paper);
  overflow-wrap: anywhere;
  text-shadow: 0 6px 40px rgb(0 0 0 / 0.5);

  .hero--gold & {
    background: linear-gradient(180deg, var(--paper) 30%, var(--gold-2));
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  }
}

.hero__copy > .hero__alt {
  margin-top: 10px;
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.2vw, 1.5rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  list-style: none;
  font-size: 0.92rem;
  color: var(--text);

  li {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  svg {
    width: 15px;
    height: 15px;
    color: var(--muted);
  }
}

.hero__meta-label {
  @include eyebrow;
  font-size: 0.66rem;
  color: var(--faint);
}

.hero__vote svg {
  color: var(--gold);
}

.hero__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;

  .chip {
    min-height: 30px;
    font-size: 0.78rem;
  }
}

.hero__synopsis {
  max-width: 62ch;
  font-size: clamp(1.05rem, 1.5vw, 1.22rem);
  line-height: 1.6;
  color: var(--paper);
}

.hero__gold {
  position: relative;
  max-width: 62ch;
  padding: 16px 18px;
  border: 1px solid rgb(216 174 82 / 0.4);
  border-radius: var(--radius-sm);
  background: linear-gradient(
    100deg,
    rgb(216 174 82 / 0.14),
    rgb(216 174 82 / 0.03) 70%
  );
  color: var(--paper);
  font-size: 0.95rem;
}

.hero__gold-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gold-2);

  svg {
    width: 18px;
    height: 18px;
  }
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 6px;
}

@keyframes hero-zoom {
  from {
    transform: scale(1.08);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@keyframes hero-poster {
  from {
    opacity: 0;
    translate: 0 30px;
    scale: 0.94;
  }
  to {
    opacity: 1;
    translate: 0 0;
    scale: 1;
  }
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
