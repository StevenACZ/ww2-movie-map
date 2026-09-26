<template>
  <div class="journey">
    <div class="journey__route">
      <svg
        class="journey__line"
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path class="journey__line-base" d="M1 0V100" />
        <path class="journey__line-draw" d="M1 0V100" pathLength="1" />
      </svg>
      <ol class="journey__stops">
        <li
          v-for="(stop, index) in journey"
          :key="`${stop.place}-${index}`"
          class="stop reveal"
          :class="{ 'stop--primary': stop.primary }"
        >
          <span class="stop__num mono" aria-hidden="true">{{
            String(index + 1).padStart(2, "0")
          }}</span>
          <article class="stop__card">
            <p class="stop__meta">
              <span class="stop__kind"
                ><Icon :name="KIND_ICONS[stop.kind]" />{{
                  t(`stopKind.${stop.kind}`)
                }}</span
              >
              <time class="mono" :datetime="stop.date">{{
                formatDate(stop.date, locale)
              }}</time>
            </p>
            <h3 class="stop__name">
              <span class="visually-hidden"
                >{{ t("title.stop", { n: index + 1 }) }}:
              </span>
              <NuxtLinkLocale
                v-if="placePages.includes(stop.place)"
                :to="`/places/${stop.place}`"
              >
                {{ stop.name }}<Icon name="arrow-right" />
              </NuxtLinkLocale>
              <template v-else>{{ stop.name }}</template>
            </h3>
            <p v-if="stop.primary" class="stop__primary">
              <Icon name="crosshair" />{{ t("titlePage.primaryStop") }}
            </p>
            <p class="stop__story">{{ stop.story }}</p>
            <aside v-if="stop.history" class="stop__history">
              <p class="stop__history-label">{{ t("title.history") }}</p>
              <p>{{ stop.history }}</p>
            </aside>
          </article>
        </li>
      </ol>
    </div>
    <div class="journey__globe" aria-hidden="true">
      <MapGlobe
        lazy
        :zoom="false"
        :titles="[]"
        :events="[]"
        :t="globeTime"
        mode="side"
        :layers="GLOBE_LAYERS"
        :selected="null"
        :journey="globeStops"
        :active-stop="null"
        :fit="globeFit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StopKind } from "~~/types/data";
import type { StopDetail } from "~~/types/view";
import type { IconName } from "~/utils/icons";
import { formatDate, toMonths } from "~~/shared/utils/time";

const props = defineProps<{ journey: StopDetail[]; placePages: string[] }>();

const GLOBE_LAYERS = { units: true, fronts: true, events: false, labels: true };
const globeStops = computed(() =>
  props.journey.map((stop) => ({ lonLat: stop.coordinates, label: stop.name }))
);
const globeFit = computed(() => props.journey.map((stop) => stop.coordinates));
const globeTime = computed(() => {
  const primary =
    props.journey.find((stop) => stop.primary) ?? props.journey[0];
  return primary ? toMonths(primary.date) : toMonths("1942-01-01");
});

const KIND_ICONS: Record<StopKind, IconName> = {
  battle: "swords",
  city: "landmark",
  front: "front",
  camp: "flag",
  sea: "ship",
  landing: "anchor",
  base: "plane",
  home: "home",
  journey: "route",
};

const { t, locale } = useI18n();
</script>

<style lang="scss" scoped>
.journey {
  @include up($bp-lg) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 40%;
    gap: clamp(40px, 4vw, 72px);
    align-items: start;
  }
}

.journey__route {
  position: relative;
  view-timeline-name: --journey;
}

.journey__line {
  position: absolute;
  left: 21px;
  top: 22px;
  bottom: 22px;
  width: 2px;
  height: calc(100% - 44px);
  overflow: visible;

  path {
    fill: none;
    stroke-width: 2;
  }
}

.journey__line-base {
  stroke: var(--line-strong);
}

.journey__line-draw {
  stroke: var(--gold);
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .journey__line-draw {
      animation-name: journey-draw;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --journey;
      animation-range: entry 35% exit 35%;
    }
  }
}

.journey__stops {
  display: grid;
  gap: 18px;
  list-style: none;
}

.stop {
  position: relative;
  padding-left: 60px;
}

.stop__num {
  position: absolute;
  left: 0;
  top: 0;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: var(--surface);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
  box-shadow: 0 0 0 6px var(--bg);
  transition:
    border-color 0.3s $ease-out,
    color 0.3s $ease-out;

  .stop--primary & {
    border-color: var(--gold);
    background: var(--gold);
    color: #17130a;
    box-shadow:
      0 0 0 6px var(--bg),
      0 0 0 7px rgb(216 174 82 / 0.35),
      0 0 30px rgb(216 174 82 / 0.35);
  }

  .stop:hover & {
    border-color: var(--gold);
    color: var(--gold-2);
  }

  .stop--primary:hover & {
    color: #17130a;
  }
}

.stop__card {
  padding: 18px 20px 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: linear-gradient(180deg, var(--surface), var(--bg-2));
  transition:
    border-color 0.3s $ease-out,
    transform 0.3s $ease-out;

  .stop:hover & {
    border-color: var(--line-strong);
  }

  .stop--primary & {
    border-color: rgb(216 174 82 / 0.45);
    background:
      radial-gradient(
        120% 90% at 0% 0%,
        rgb(216 174 82 / 0.12),
        transparent 60%
      ),
      linear-gradient(180deg, var(--surface), var(--bg-2));
  }

  > * + * {
    margin-top: 10px;
  }
}

.stop__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 14px;

  time {
    font-size: 0.76rem;
    color: var(--faint);
  }
}

.stop__kind {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  @include eyebrow;
  color: var(--red-2);

  svg {
    width: 15px;
    height: 15px;
  }
}

.stop__name {
  font-size: clamp(1.45rem, 2.6vw, 1.9rem);
  text-transform: uppercase;
  letter-spacing: 0.01em;
  color: var(--paper);

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: color 0.2s $ease-out;

    svg {
      width: 0.7em;
      height: 0.7em;
      transition: transform 0.25s $ease-out;
    }

    &:hover {
      color: var(--gold-2);

      svg {
        transform: translateX(4px);
      }
    }
  }
}

.stop__primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  @include eyebrow;
  color: var(--gold);

  svg {
    width: 14px;
    height: 14px;
  }
}

.stop__story {
  max-width: 64ch;
  color: var(--text);
}

.stop__history {
  padding: 12px 14px;
  border: 1px solid rgb(125 138 79 / 0.35);
  border-radius: var(--radius-sm);
  background: rgb(125 138 79 / 0.1);
  font-size: 0.92rem;
  color: var(--muted);

  .stop__card > & {
    margin-top: 14px;
  }
}

.stop__history-label {
  @include eyebrow;
  font-size: 0.64rem;
  margin-bottom: 4px;
  color: var(--olive);
  filter: brightness(1.4);
}

.journey__globe {
  display: none;

  @include up($bp-lg) {
    display: block;
    position: sticky;
    top: calc(var(--header-h) + 24px);
    min-height: 420px;
    height: clamp(420px, 72vh, 680px);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background:
      radial-gradient(
        circle at 50% 50%,
        transparent 0 34%,
        var(--line) 34.2%,
        transparent 34.6%
      ),
      radial-gradient(
        circle at 50% 50%,
        rgb(125 138 79 / 0.14),
        transparent 62%
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0 39px,
        rgb(236 230 214 / 0.035) 39px 40px
      ),
      repeating-linear-gradient(
        90deg,
        transparent 0 39px,
        rgb(236 230 214 / 0.035) 39px 40px
      ),
      var(--bg-2);
    box-shadow: inset 0 0 80px rgb(0 0 0 / 0.6);
  }
}

@keyframes journey-draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style>
