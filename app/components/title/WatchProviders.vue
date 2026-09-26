<template>
  <div class="watch">
    <div v-if="ready && options.length > 1" class="watch__region">
      <label :for="`watch-region-${id}`" class="eyebrow">{{
        t("watch.region")
      }}</label>
      <div class="watch__select">
        <select :id="`watch-region-${id}`" v-model="region" @change="persist">
          <option v-for="code in options" :key="code" :value="code">
            {{ regionName(code) }}
          </option>
        </select>
        <Icon name="chevron-down" />
      </div>
    </div>

    <div class="watch__body" aria-live="polite">
      <p v-if="!ready" class="watch__status mono">{{ t("watch.loading") }}</p>
      <div v-else-if="groups.length" class="watch__groups">
        <div v-for="group in groups" :key="group.key" class="watch__group">
          <h3 class="watch__group-title">{{ t(`watch.${group.label}`) }}</h3>
          <ul class="watch__logos">
            <li v-for="provider in group.providers" :key="provider.id">
              <a
                :href="current!.link"
                target="_blank"
                rel="noopener"
                class="watch__logo"
                :title="provider.name"
              >
                <img
                  :src="tmdbImage(provider.logo, 'w92')"
                  :alt="provider.name"
                  width="44"
                  height="44"
                  loading="lazy"
                  decoding="async"
                />
                <span class="visually-hidden">{{ t("common.external") }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div v-else class="watch__empty">
        <p>{{ t("watch.none", { region: regionName(region) }) }}</p>
        <a
          class="btn"
          :href="`https://www.justwatch.com/${region.toLowerCase()}/search?q=${encodeURIComponent(title)}`"
          target="_blank"
          rel="noopener"
        >
          <Icon name="search" />{{ t("watch.search") }}
          <span class="visually-hidden">{{ t("common.external") }}</span>
        </a>
      </div>
    </div>

    <p class="watch__attribution mono">
      <a href="https://www.justwatch.com" target="_blank" rel="noopener">
        {{ t("watch.attribution") }}<Icon name="external" />
        <span class="visually-hidden">{{ t("common.external") }}</span>
      </a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { tmdbImage } from "~/utils/seo";

interface Provider {
  id: number;
  name: string;
  logo: string;
}

interface Region {
  link: string;
  flatrate?: Provider[];
  free?: Provider[];
  ads?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
}

const GROUPS = [
  ["flatrate", "stream"],
  ["free", "free"],
  ["ads", "ads"],
  ["rent", "rent"],
  ["buy", "buy"],
] as const;

const STORAGE_KEY = "ww2_region";

const props = defineProps<{ id: string; title: string; available?: boolean }>();

const { t, locale } = useI18n();
const ready = ref(false);
const regions = ref<Record<string, Region>>({});
const region = ref("US");

const current = computed(() => regions.value[region.value]);

const groups = computed(() =>
  GROUPS.map(([key, label]) => ({
    key,
    label,
    providers: current.value?.[key] ?? [],
  })).filter((group) => group.providers.length > 0)
);

const options = computed(() =>
  [...new Set([...Object.keys(regions.value), region.value])].sort((a, b) =>
    regionName(a).localeCompare(regionName(b), locale.value)
  )
);

function regionName(code: string): string {
  try {
    return (
      new Intl.DisplayNames([locale.value], { type: "region" }).of(code) ?? code
    );
  } catch {
    return code;
  }
}

function initialRegion(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && /^[A-Z]{2}$/.test(saved)) return saved;
  } catch {
    /* storage blocked */
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const part = tag.split("-").pop()?.toUpperCase();
    if (part && part !== tag.toUpperCase() && /^[A-Z]{2}$/.test(part))
      return part;
  }
  return "US";
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, region.value);
  } catch {
    /* storage blocked */
  }
}

async function load() {
  regions.value = {};
  if (props.available) {
    try {
      const response = await fetch(`/data/watch/${props.id}.json`);
      if (response.ok) {
        const json = (await response.json()) as {
          regions?: Record<string, Region>;
        };
        if (json && typeof json.regions === "object" && json.regions)
          regions.value = json.regions;
      }
    } catch {
      regions.value = {};
    }
  }
  ready.value = true;
}

onMounted(() => {
  region.value = initialRegion();
  load();
});

watch(() => [props.id, props.available], load);
</script>

<style lang="scss" scoped>
.watch {
  display: grid;
  gap: 24px;
  padding: clamp(20px, 3vw, 32px);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    radial-gradient(
      80% 120% at 100% 0%,
      rgb(216 174 82 / 0.07),
      transparent 60%
    ),
    var(--surface);
}

.watch__region {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.watch__select {
  position: relative;

  select {
    appearance: none;
    min-height: 44px;
    min-width: 220px;
    max-width: 100%;
    padding: 0 40px 0 16px;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    background: var(--surface-2);
    cursor: pointer;

    &:hover {
      border-color: var(--gold);
    }
  }

  svg {
    position: absolute;
    right: 14px;
    top: 50%;
    width: 16px;
    height: 16px;
    translate: 0 -50%;
    pointer-events: none;
    color: var(--muted);
  }
}

.watch__status {
  font-size: 0.82rem;
  color: var(--faint);
}

.watch__groups {
  display: grid;
  gap: 22px;

  @include up($bp-md) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

.watch__group-title {
  @include eyebrow;
  margin-bottom: 10px;
}

.watch__logos {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
}

.watch__logo {
  display: block;
  border-radius: 10px;
  transition: transform 0.25s $ease-spring;

  img {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    box-shadow: 0 0 0 1px var(--line-strong);
  }

  &:hover {
    transform: translateY(-3px) scale(1.06);
  }
}

.watch__empty {
  display: grid;
  justify-items: start;
  gap: 14px;
  color: var(--muted);
}

.watch__attribution {
  font-size: 0.72rem;
  color: var(--faint);

  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &:hover {
      color: var(--text);
    }
  }

  svg {
    width: 12px;
    height: 12px;
  }
}
</style>
