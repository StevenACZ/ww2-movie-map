<template>
  <div class="legend" :class="{ 'is-open': open }">
    <button
      type="button"
      class="legend__toggle"
      :aria-expanded="open"
      aria-controls="map-legend"
      @click="open = !open"
    >
      <Icon name="layers" />
      <span>{{ t("map.legend") }}</span>
      <Icon
        :name="open ? 'chevron-up' : 'chevron-down'"
        class="legend__chevron"
      />
    </button>

    <div v-show="open" id="map-legend" class="legend__body">
      <p class="legend__label">{{ t("map.colorBy") }}</p>
      <div class="legend__modes" role="group" :aria-label="t('map.colorBy')">
        <button
          v-for="value in MODES"
          :key="value"
          type="button"
          class="chip"
          :aria-pressed="mode === value"
          @click="$emit('update:mode', value)"
        >
          {{ value === "side" ? t("map.bySide") : t("map.byWar") }}
        </button>
      </div>

      <ul class="legend__swatches">
        <li v-for="item in LEGEND[mode]" :key="item.key">
          <span
            class="legend__swatch"
            :style="{
              '--fill': item.fill,
              '--hatch': item.hatch ?? item.fill,
            }"
            :class="{ 'is-hatched': item.hatch }"
          />
          {{ t(`status.${item.key}`) }}
        </li>
        <li>
          <span class="legend__line legend__line--war" />
          {{ t("map.warBorder") }}
        </li>
        <li>
          <span class="legend__line legend__line--front" />
          {{ t("map.fronts") }}
        </li>
      </ul>

      <p class="legend__label">{{ t("map.layers") }}</p>
      <div class="legend__layers">
        <label v-for="key in LAYER_KEYS" :key="key" class="legend__check">
          <input
            type="checkbox"
            :name="`layer-${key}`"
            :checked="layers[key]"
            @change="
              $emit('update:layers', {
                ...layers,
                [key]: ($event.target as HTMLInputElement).checked,
              })
            "
          />
          <span class="legend__box" aria-hidden="true"
            ><Icon name="check" :stroke="3"
          /></span>
          {{ t(`map.layer.${key}`) }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GlobeLayers } from "~/globe/engine";
import { LEGEND, type ColorMode } from "~/globe/palette";

const MODES = ["side", "war"] as const;
const LAYER_KEYS = ["units", "fronts", "events", "labels"] as const;

const props = defineProps<{
  mode: ColorMode;
  layers: GlobeLayers;
  startOpen?: boolean;
}>();
defineEmits<{
  "update:mode": [value: ColorMode];
  "update:layers": [value: GlobeLayers];
}>();

const { t } = useI18n();
const open = ref(props.startOpen ?? false);
</script>

<style lang="scss" scoped>
.legend {
  @include panel(1);
  width: 250px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.legend__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  font-family: var(--font-display);
  font-size: 0.96rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  svg {
    width: 16px;
    height: 16px;
    color: var(--gold);
  }
}

.legend__chevron {
  margin-left: auto;
  color: var(--muted) !important;
}

.legend__body {
  padding: 0 14px 14px;
  max-height: min(62vh, 520px);
  overflow-y: auto;
}

.legend__label {
  @include eyebrow;
  margin: 10px 0 8px;
  font-size: 0.64rem;
}

.legend__modes {
  display: flex;
  gap: 6px;

  .chip {
    min-height: 30px;
    font-size: 0.78rem;
  }
}

.legend__swatches {
  list-style: none;
  display: grid;
  gap: 6px;
  margin-top: 12px;
  font-size: 0.8rem;
  color: var(--muted);

  li {
    display: flex;
    align-items: center;
    gap: 9px;
  }
}

.legend__swatch {
  flex: none;
  width: 18px;
  height: 12px;
  border-radius: 3px;
  background: var(--fill);
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.5);

  &.is-hatched {
    background: repeating-linear-gradient(
      135deg,
      var(--hatch) 0 2px,
      var(--fill) 2px 5px
    );
  }
}

.legend__line {
  flex: none;
  width: 18px;
  height: 0;
  border-top: 2px solid #e0452f;

  &--front {
    border-top: 3px dashed #ff8a5c;
    filter: drop-shadow(0 0 4px #ff4a26);
  }
}

.legend__layers {
  display: grid;
  gap: 4px;
}

.legend__check {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  font-size: 0.84rem;
  cursor: pointer;

  input {
    @include visually-hidden;
  }

  input:focus-visible + .legend__box {
    @include focus-ring;
  }
}

.legend__box {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid var(--line-strong);
  transition:
    background-color 0.2s $ease-out,
    border-color 0.2s $ease-out;

  svg {
    width: 12px;
    height: 12px;
    color: #17130a;
    scale: 0.4;
    opacity: 0;
  }

  input:checked + & {
    background: var(--gold);
    border-color: var(--gold);

    svg {
      scale: 1;
      opacity: 1;
      transition: scale 0.25s $ease-spring;
    }
  }
}
</style>
