<template>
  <li
    :id="event.id"
    class="ev"
    :class="[`ev--${side}`, { 'ev--major': event.major }]"
    :data-year="event.date.slice(0, 4)"
    :data-era="event.era"
  >
    <span class="ev__node" aria-hidden="true" />
    <article class="ev__card">
      <figure class="ev__figure" :class="{ 'ev__figure--art': !image }">
        <div class="ev__frame">
          <img
            v-if="image"
            class="ev__img"
            :src="image.src"
            :width="image.width"
            :height="image.height"
            :alt="event.title"
            :loading="rank < 3 ? 'eager' : 'lazy'"
            :fetchpriority="rank === 0 ? 'high' : undefined"
            decoding="async"
          />
          <svg
            v-else
            class="ev__img ev__art"
            viewBox="0 0 320 180"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <linearGradient :id="`${uid}-sky`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#15170f" />
                <stop offset="0.7" stop-color="#2b2a1a" />
                <stop offset="1" stop-color="#3a311a" />
              </linearGradient>
              <radialGradient :id="`${uid}-halo`" cx="0.7" cy="0.7" r="0.6">
                <stop offset="0" stop-color="#d8ae52" stop-opacity="0.28" />
                <stop offset="1" stop-color="#d8ae52" stop-opacity="0" />
              </radialGradient>
            </defs>
            <rect width="320" height="180" :fill="`url(#${uid}-sky)`" />
            <rect width="320" height="180" :fill="`url(#${uid}-halo)`" />
            <g v-if="event.category === 'war'">
              <path
                class="s-grid"
                d="M0 45H320M0 90H320M0 135H320M64 0V180M128 0V180M192 0V180M256 0V180"
              />
              <path
                class="s-land"
                d="M0 180V96c26-8 40 6 64-2s34-26 62-20 36 22 66 16 40-30 72-26 38 12 56 8V180Z"
              />
              <path
                class="s-front"
                d="M22 150c22-18 30-54 58-66s54 6 78-12 30-44 58-50 60 4 84-14"
              />
              <path
                class="s-arrow"
                d="M60 164c20-26 44-40 78-46l-4-10 26 16-24 18 2-10c-30 6-50 18-66 38Z"
              />
              <path
                class="s-arrow s-arrow--2"
                d="M150 158c26-32 52-50 92-60l-5-10 28 14-22 20 1-10c-34 10-58 26-80 52Z"
              />
              <circle class="s-city" cx="200" cy="64" r="5" />
              <circle class="s-city" cx="112" cy="104" r="4" />
              <circle class="s-city" cx="262" cy="118" r="4" />
              <circle class="s-ring" cx="200" cy="64" r="12" />
            </g>
            <g v-else-if="event.category === 'battle'">
              <circle class="s-burst" cx="236" cy="96" r="40" />
              <circle class="s-burst" cx="82" cy="88" r="26" />
              <path
                class="s-smoke"
                d="M206 104c-10-18 6-34 22-28 4-16 30-16 34 2 16-2 24 16 12 26Z"
              />
              <path
                class="s-land"
                d="M0 180V140c40-6 80 4 120-2s90-10 130-2 50 2 70 0V180Z"
              />
              <path
                class="s-ink"
                d="M86 136h112l12-14h-26v-10h-40l-8 10h-44Z"
              />
              <path class="s-ink" d="M150 108l66-8v5l-66 7Z" />
              <rect
                class="s-ink"
                x="80"
                y="134"
                width="134"
                height="16"
                rx="8"
              />
              <path
                class="s-post"
                d="M20 176l18-36M38 176l-18-36M262 176l18-36M280 176l-18-36"
              />
              <path
                class="s-wire"
                d="M0 160c20-8 30 8 50 0s30-8 50 0 30 8 50 0 30-8 50 0 30 8 50 0 30-8 70 0"
              />
              <circle
                v-for="x in WHEELS"
                :key="x"
                class="s-land"
                :cx="x"
                cy="142"
                r="5"
              />
            </g>
            <g v-else-if="event.category === 'naval'">
              <circle class="s-sun" cx="236" cy="118" r="34" />
              <path class="s-sea" d="M0 128H320V180H0Z" />
              <path class="s-ink" d="M34 128h250l-18 18H56Z" />
              <path
                class="s-ink"
                d="M70 128v-8h22v-8h28v-10h14v-16h8v16h12v10h22v8h16v-14h10v-14h6v14h12v14h30v8Z"
              />
              <path
                class="s-ink"
                d="M104 112l-34-4v3l34 4ZM214 112l40-5v3l-40 5Z"
              />
              <path class="s-mast" d="M146 86V58M136 68h20M200 92V70" />
              <path
                class="s-wake"
                d="M20 150h60M100 160h90M210 152h70M40 170h50M150 172h120"
              />
            </g>
            <g v-else-if="event.category === 'air'">
              <path class="s-beam" d="M60 180L150 20h16Z" />
              <path class="s-beam" d="M250 180L190 10h14Z" />
              <g class="s-ink">
                <path
                  v-for="(p, i) in PLANES"
                  :key="i"
                  :transform="p"
                  d="M-20 0l34-2 6 2-6 2ZM2-1l-6-24h-6l2 24ZM2 1l-6 24h-6l2-24ZM-15-1l-4-9h-3l2 10-2 10h3l4-9Z"
                />
              </g>
              <circle class="s-flak" cx="120" cy="40" r="3" />
              <circle class="s-flak" cx="222" cy="58" r="4" />
              <circle class="s-flak" cx="178" cy="30" r="2.5" />
              <path
                class="s-ink"
                d="M0 180v-30h18v-12h14v18h20v-26h10v-8h6v8h10v34h16v-20h24v14h14v-30h8l6-10 6 10h8v36h22v-16h18v22h20v-34h18v18h12v-10h20v20h18v-28h12v34h16V180Z"
              />
            </g>
            <g v-else-if="event.category === 'politics'">
              <circle class="s-sun" cx="160" cy="70" r="46" />
              <path class="s-ink" d="M70 70L160 34l90 36Z" />
              <path
                class="s-ink"
                d="M66 74h188v8H66ZM62 142h196v8H62ZM54 150h212v8H54Z"
              />
              <path
                class="s-ink"
                d="M78 86h12v56H78ZM106 86h12v56h-12ZM134 86h12v56h-12ZM174 86h12v56h-12ZM202 86h12v56h-12ZM230 86h12v56h-12Z"
              />
              <path class="s-flag" d="M150 86h20v44l-10-8-10 8Z" />
              <path
                class="s-crowd"
                d="M0 180v-14c8-8 14 0 20-4s12-6 18 0 10-4 18-2 12 6 20 2 14-6 22 0 10 2 18-2 14 2 20 4 12-6 20-2 12 4 20 0 12-4 20 2 12 2 20-2 14 2 20 4 12-4 20-2 12 4 18 2 12-6 18-2 12 4 20 2V180Z"
              />
            </g>
            <g v-else-if="event.category === 'diplomacy'">
              <path class="s-table" d="M0 110H320V180H0Z" />
              <g transform="rotate(-6 160 110)">
                <rect
                  class="s-paper"
                  x="92"
                  y="42"
                  width="136"
                  height="150"
                  rx="3"
                />
                <path
                  class="s-lines"
                  d="M110 62h100M110 74h92M110 86h100M110 98h70M110 110h96M110 122h84"
                />
                <path
                  class="s-sign"
                  d="M112 146c10-14 16 8 24-4s10-8 14 2 10-10 16-2 8 6 18-2"
                />
                <circle class="s-seal" cx="196" cy="160" r="16" />
                <path
                  class="s-star"
                  d="M196 150l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7Z"
                />
              </g>
              <path class="s-pen" d="M248 64l-44 70 4 3 44-70Z" />
              <path class="s-ink" d="M204 134l-4 10 8-7Z" />
            </g>
            <g v-else-if="event.category === 'holocaust'">
              <path class="s-ink" d="M232 180V70h-8l20-18 20 18h-8V180Z" />
              <path class="s-ink" d="M224 70h40v8h-40Z" />
              <path
                class="s-post"
                d="M30 180V96c0-10 8-12 14-8M110 180V96c0-10 8-12 14-8M190 180V96c0-10 8-12 14-8"
              />
              <path
                class="s-wire"
                d="M0 104H320M0 120H320M0 136H320M0 152H320"
              />
              <path
                class="s-wire"
                d="M30 100l80 56M110 100l80 56M30 156l80-56M110 156l80-56"
              />
              <path class="s-land" d="M0 180V164H320V180Z" />
              <path class="s-candle" d="M96 176v-18h10v18Z" />
              <path
                class="s-flame"
                d="M101 156c-6-6-3-12 0-16 3 4 6 10 0 16Z"
              />
              <circle class="s-glow" cx="101" cy="150" r="18" />
            </g>
            <g v-else-if="event.category === 'home-front'">
              <path
                class="s-smoke"
                d="M76 58c-8-14 6-26 18-20 6-12 26-10 28 4 14 0 18 16 6 22ZM196 50c-8-12 6-22 16-16 6-10 22-8 24 4 12 0 14 14 4 18Z"
              />
              <path
                class="s-ink"
                d="M86 132V64h10v40h14V70h10v34h20l20-14v14l20-14v14l20-14v14l20-14v14l20-14v42Z"
              />
              <path class="s-ink" d="M210 104V56h10v48Z" />
              <path
                class="s-win"
                d="M150 112h10v8h-10ZM170 112h10v8h-10ZM190 112h10v8h-10ZM210 112h10v8h-10ZM230 112h10v8h-10Z"
              />
              <path class="s-land" d="M0 180v-44h320v44Z" />
              <path
                class="s-ink"
                d="M10 180v-30l16-12 16 12v30ZM48 180v-26l14-10 14 10v26ZM250 180v-30l16-12 16 12v30ZM288 180v-26l14-10 14 10v26Z"
              />
            </g>
            <g v-else-if="event.category === 'technology'">
              <circle class="s-wave" cx="200" cy="64" r="30" />
              <circle class="s-wave" cx="200" cy="64" r="56" />
              <circle class="s-wave" cx="200" cy="64" r="84" />
              <path
                class="s-mast"
                d="M110 180L130 60 150 180M116 144h28M122 108h16M112 172l30-64M148 172l-30-64"
              />
              <path class="s-ink" d="M116 62a24 24 0 0 1 28-24l-6 30Z" />
              <path class="s-ink" d="M0 180v-20h320v20Z" />
              <circle class="s-city" cx="200" cy="64" r="4" />
            </g>
          </svg>
          <span v-if="event.major" class="ev__stamp stencil" aria-hidden="true">
            {{ event.date.slice(0, 4) }}
          </span>
        </div>
        <figcaption v-if="image" class="ev__credit mono">
          <span class="ev__author" :title="image.author">{{
            image.author
          }}</span>
          ·
          <a
            v-if="image.licenseUrl"
            :href="image.licenseUrl"
            target="_blank"
            rel="noopener license"
            >{{ image.license }}</a
          ><template v-else>{{ image.license }}</template>
          ·
          <a :href="image.source" target="_blank" rel="noopener">{{
            t("timelinePage.commons")
          }}</a>
        </figcaption>
      </figure>
      <div class="ev__meta">
        <time class="ev__date mono" :datetime="event.date">
          {{ date(event.date)
          }}<template v-if="event.endDate">
            – {{ date(event.endDate) }}</template
          >
        </time>
        <span class="ev__cat">
          <Icon :name="CATEGORY_ICON[event.category]" />{{
            t(`timeline.category.${event.category}`)
          }}
        </span>
      </div>
      <p v-if="event.major" class="ev__flag mono">
        {{ t("timelinePage.turningPoint") }}
      </p>
      <h3 class="ev__title">{{ event.title }}</h3>
      <p class="ev__summary">{{ event.summary }}</p>
      <p v-if="event.place" class="ev__place">
        <Icon name="pin" />{{ event.place }}
      </p>
      <a
        class="ev__link"
        :href="event.wikipedia"
        target="_blank"
        rel="noopener"
      >
        {{ t("timeline.readMore") }}<Icon name="external" />
        <span class="visually-hidden">{{ t("common.external") }}</span>
      </a>
      <div v-if="films.length" class="ev__films">
        <p class="ev__films-label eyebrow">
          {{ t("timeline.filmsOfThisTime") }}
        </p>
        <ul class="ev__posters">
          <li v-for="film in films" :key="film.id">
            <NuxtLinkLocale
              :to="`/films/${film.id}`"
              class="ev__poster"
              :title="film.title"
            >
              <TitlePoster
                :path="film.poster"
                :title="film.title"
                :year="film.year"
                :era="film.era"
                :kind="film.kind"
                :gold="film.gold"
                :alt="film.title"
                sizes="80px"
              />
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>
    </article>
  </li>
</template>

<script setup lang="ts">
import images from "~~/data/event-images.json";
import type { EventCategory } from "~~/types/data";
import type { EventCard, TitleCard } from "~~/types/view";

type EventImage = {
  src: string;
  width: number;
  height: number;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
};

const props = defineProps<{
  event: EventCard;
  films: TitleCard[];
  side: "left" | "right";
  rank: number;
}>();

const IMAGES: Record<string, EventImage> = images;
const PLANES = [
  "translate(92 64) rotate(-8)",
  "translate(140 44) rotate(-8) scale(0.8)",
  "translate(186 80) rotate(-8) scale(0.9)",
  "translate(250 34) rotate(-8) scale(0.7)",
];
const WHEELS = [94, 114, 134, 154, 174, 194];

const CATEGORY_ICON = {
  war: "swords",
  battle: "crosshair",
  politics: "landmark",
  diplomacy: "handshake",
  holocaust: "flame",
  "home-front": "home",
  technology: "radio",
  naval: "ship",
  air: "plane",
} as const satisfies Record<EventCategory, string>;

const { t, locale } = useI18n();
const date = (value: string) => formatDate(value, locale.value);
const image = computed(() => IMAGES[props.event.id]);
const uid = useId();
</script>

<style lang="scss" scoped>
.ev {
  --accent: var(--era-c);
  position: relative;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: start;

  @include up($bp-md) {
    grid-template-columns: minmax(0, 1fr) 64px minmax(0, 1fr);
  }

  &--major {
    --accent: var(--red-2);
  }
}

.ev__node {
  grid-column: 1;
  grid-row: 1;
  justify-self: center;
  position: relative;
  z-index: 1;
  width: 13px;
  height: 13px;
  margin-top: 26px;
  border-radius: 50%;
  background: var(--bg);
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 5px var(--bg);

  @include up($bp-md) {
    grid-column: 2;
  }

  .ev--major & {
    width: 19px;
    height: 19px;
    margin-top: 30px;
    background: var(--red);
    border-color: var(--red-2);

    &::after {
      content: "";
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      border: 2px solid var(--red-2);
      opacity: 0;

      @include motion {
        animation-name: node-pulse;
        animation-duration: 2.4s;
        animation-iteration-count: infinite;
        animation-timing-function: $ease-out;
      }
    }
  }
}

.ev__card {
  grid-column: 2;
  grid-row: 1;
  position: relative;
  --pad-t: 20px;
  --pad-x: 20px;
  margin-block: 10px 34px;
  padding: var(--pad-t) var(--pad-x) 22px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: linear-gradient(180deg, var(--surface), var(--bg-2));
  transition:
    border-color 0.3s $ease-out,
    transform 0.3s $ease-out;

  &::before {
    content: "";
    position: absolute;
    top: 30px;
    width: 14px;
    height: 1px;
    background: var(--accent);
    left: -15px;
  }

  &:hover {
    border-color: var(--line-strong);
  }

  @include up($bp-md) {
    --pad-t: 24px;
    --pad-x: 26px;
    padding: var(--pad-t) var(--pad-x) 26px;
    max-width: min(520px, 100%);

    .ev--left & {
      grid-column: 1;
      justify-self: end;

      &::before {
        left: auto;
        right: -26px;
        width: 25px;
      }
    }

    .ev--right & {
      grid-column: 3;
      justify-self: start;

      &::before {
        left: -26px;
        width: 25px;
      }
    }
  }

  .ev--major & {
    border-color: rgb(200 65 47 / 0.45);
    background:
      radial-gradient(
        120% 70% at 0% 0%,
        rgb(200 65 47 / 0.16),
        transparent 60%
      ),
      linear-gradient(180deg, var(--surface-2), var(--bg-2));
    box-shadow: var(--shadow);

    &::before {
      top: 38px;
    }

    @include up($bp-md) {
      --pad-t: 30px;
      --pad-x: 32px;
      max-width: min(600px, 100%);
      padding: var(--pad-t) var(--pad-x) 32px;
    }
  }

  @supports (animation-timeline: view()) {
    @include motion {
      animation-name: card-in-right;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: view();
      animation-range: entry 0% entry 80%;

      @include up($bp-md) {
        .ev--left & {
          animation-name: card-in-left;
        }
      }
    }
  }
}

.ev__figure {
  margin: calc(var(--pad-t) * -1) calc(var(--pad-x) * -1) 18px;
}

.ev__frame {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: calc(var(--radius) - 1px) calc(var(--radius) - 1px) 0 0;
  background: var(--surface-2);
  isolation: isolate;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, transparent 55%, rgb(16 18 9 / 0.85)),
      linear-gradient(
        135deg,
        rgb(125 138 79 / 0.5),
        rgb(216 174 82 / 0.32) 60%,
        rgb(125 95 31 / 0.45)
      );
    mix-blend-mode: multiply;
    pointer-events: none;
    transition: opacity 0.6s $ease-out;
  }

  .ev__figure--art &::after {
    background: linear-gradient(180deg, transparent 60%, rgb(16 18 9 / 0.7));
    mix-blend-mode: normal;
  }
}

.ev__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) sepia(0.55) contrast(1.08) brightness(0.84);
  transition: filter 0.6s $ease-out;

  @supports (animation-timeline: view()) {
    @include motion {
      animation-name: img-in;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: view();
      animation-range: entry 10% cover 35%;
    }
  }
}

.ev__art {
  filter: none;
}

.ev__card:hover,
.ev__card:focus-within {
  .ev__img:not(.ev__art) {
    filter: none;
  }

  .ev__figure:not(.ev__figure--art) .ev__frame::after {
    opacity: 0.35;
  }
}

.ev__stamp {
  position: absolute;
  z-index: 1;
  left: 14px;
  bottom: 4px;
  font-size: clamp(2.6rem, 7vw, 3.6rem);
  font-weight: 800;
  line-height: 1;
  color: var(--paper);
  opacity: 0.88;
  text-shadow: 0 2px 16px rgb(0 0 0 / 0.7);
}

.ev__credit {
  display: flex;
  gap: 6px;
  padding: 7px var(--pad-x) 0;
  font-size: 0.62rem;
  line-height: 1.5;
  color: var(--faint);
  white-space: nowrap;

  a {
    color: var(--muted);
    text-decoration: underline;
    text-decoration-color: var(--line-strong);
    text-underline-offset: 2px;

    &:hover {
      color: var(--gold);
    }
  }
}

.ev__author {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ev__art {
  .s-ink,
  .s-pen,
  .s-crowd {
    fill: var(--bg);
  }

  .s-land,
  .s-sea {
    fill: var(--bg-2);
  }

  .s-table {
    fill: var(--surface-2);
  }

  .s-grid {
    fill: none;
    stroke: var(--text);
    stroke-opacity: 0.07;
  }

  .s-front {
    fill: none;
    stroke: var(--red);
    stroke-width: 2.5;
    stroke-dasharray: 6 5;
  }

  .s-arrow {
    fill: var(--gold);
    fill-opacity: 0.85;
  }

  .s-arrow--2 {
    fill: var(--olive);
  }

  .s-city {
    fill: var(--paper);
  }

  .s-ring {
    fill: none;
    stroke: var(--paper);
    stroke-opacity: 0.5;
  }

  .s-burst,
  .s-sun,
  .s-glow {
    fill: var(--gold);
    fill-opacity: 0.2;
  }

  .s-sun {
    fill-opacity: 0.35;
  }

  .s-smoke {
    fill: var(--muted);
    fill-opacity: 0.16;
  }

  .s-post,
  .s-mast {
    fill: none;
    stroke: var(--bg);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .s-wire {
    fill: none;
    stroke: var(--faint);
    stroke-opacity: 0.7;
    stroke-width: 1.2;
  }

  .s-wake,
  .s-wave {
    fill: none;
    stroke: var(--gold);
    stroke-opacity: 0.35;
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  .s-beam {
    fill: var(--gold-2);
    fill-opacity: 0.08;
  }

  .s-flak {
    fill: var(--red-2);
    fill-opacity: 0.8;
  }

  .s-flag,
  .s-seal {
    fill: var(--red);
  }

  .s-paper {
    fill: var(--paper);
    fill-opacity: 0.9;
  }

  .s-lines {
    fill: none;
    stroke: var(--gold-deep);
    stroke-opacity: 0.55;
    stroke-width: 2;
  }

  .s-sign {
    fill: none;
    stroke: var(--surface);
    stroke-width: 1.6;
  }

  .s-star,
  .s-candle {
    fill: var(--paper);
    fill-opacity: 0.75;
  }

  .s-flame {
    fill: var(--gold-2);
  }

  .s-win {
    fill: var(--gold);
    fill-opacity: 0.55;
  }
}

.ev__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
}

.ev__date {
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  color: var(--accent);

  .ev--major & {
    font-size: 0.9rem;
  }
}

.ev__cat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  @include eyebrow;
  font-size: 0.68rem;

  svg {
    width: 15px;
    height: 15px;
    color: var(--text);
  }
}

.ev__flag {
  margin-top: 14px;
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--red);
  color: var(--paper);
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.ev__title {
  margin-top: 12px;
  @include display(clamp(1.45rem, 3.4vw, 1.9rem));
  color: var(--paper);

  .ev--major & {
    font-size: clamp(1.8rem, 4.6vw, 2.6rem);
  }
}

.ev__summary {
  margin-top: 10px;
  color: var(--muted);
  font-size: 0.95rem;
}

.ev__place {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.86rem;
  color: var(--text);

  svg {
    width: 15px;
    height: 15px;
    color: var(--gold);
    flex: none;
  }
}

.ev__link {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--gold);
  border-bottom: 1px solid transparent;
  transition:
    color 0.2s $ease-out,
    border-color 0.2s $ease-out;

  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.25s $ease-out;
  }

  &:hover {
    color: var(--gold-2);
    border-color: currentColor;

    svg {
      transform: translate(2px, -2px);
    }
  }
}

.ev__films {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed var(--line-strong);
}

.ev__films-label {
  font-size: 0.66rem;
}

.ev__posters {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
}

.ev__poster {
  display: block;
  width: 56px;
  border-radius: var(--radius-sm);
  transition:
    transform 0.25s $ease-spring,
    box-shadow 0.25s $ease-out;

  &:hover {
    transform: translateY(-4px) rotate(-2deg);
    box-shadow: 0 12px 24px -10px rgb(0 0 0 / 0.9);
  }

  @include up($bp-sm) {
    width: 64px;
  }
}

@keyframes node-pulse {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

@keyframes img-in {
  from {
    opacity: 0;
    transform: scale(1.12);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes card-in-right {
  from {
    opacity: 0;
    transform: translateX(36px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes card-in-left {
  from {
    opacity: 0;
    transform: translateX(-36px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
