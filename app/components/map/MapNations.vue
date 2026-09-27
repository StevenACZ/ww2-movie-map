<template>
  <div v-if="groups.length" class="nations" :class="{ 'is-open': open }">
    <button
      type="button"
      class="nations__toggle"
      :aria-expanded="open"
      aria-controls="map-nations"
      @click="open = !open"
    >
      <Icon name="flag" />
      <span class="nations__title">{{ t("nations.title") }}</span>
      <span v-if="!open" class="nations__preview" aria-hidden="true">
        <img
          v-for="nation in preview"
          :key="nation.id"
          :src="nation.flag.file"
          alt=""
          :width="Math.round(nation.flag.ratio * 14)"
          height="14"
        />
      </span>
      <span class="nations__count mono">{{ total }}</span>
      <Icon
        :name="open ? 'chevron-up' : 'chevron-down'"
        class="nations__chevron"
      />
    </button>

    <div v-show="open" id="map-nations" class="nations__body">
      <section
        v-for="group in groups"
        :key="group.key"
        class="nations__group"
        :aria-label="t(`status.${group.key}`)"
      >
        <p class="nations__side">
          <span
            class="nations__swatch"
            :class="{ 'is-hatched': group.key === 'occupied' }"
            :style="{ '--fill': fill(group.key), '--hatch': hatch(group.key) }"
          />
          {{ t(`status.${group.key}`) }}
          <span class="nations__n mono">{{ group.nations.length }}</span>
        </p>
        <ul class="nations__list">
          <li v-for="nation in group.nations" :key="nation.id">
            <button
              type="button"
              class="nations__item"
              :title="nation.name"
              @click="$emit('focus', nation.id)"
            >
              <img
                :src="nation.flag.file"
                alt=""
                loading="lazy"
                decoding="async"
                :width="Math.round(nation.flag.ratio * 15)"
                height="15"
              />
              <span>{{ nation.name }}</span>
            </button>
          </li>
        </ul>
      </section>
      <p class="nations__note">{{ t("nations.note") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorldData } from "~~/types/view";
import { swatch } from "~/globe/palette";
import { nationsAt, type NationGroup } from "~/utils/nations";

const props = defineProps<{ world: WorldData | null; time: number }>();
defineEmits<{ focus: [id: string] }>();

const { t, locale } = useI18n();
const open = defineModel<boolean>("open", { default: false });
const month = computed(() => Math.floor(props.time));

const groups = computed(() =>
  props.world ? nationsAt(props.world, month.value, locale.value) : []
);
const total = computed(() =>
  groups.value.reduce(
    (sum, group) =>
      group.key === "occupied" ? sum : sum + group.nations.length,
    0
  )
);
const preview = computed(() =>
  groups.value
    .filter((group) => group.key !== "occupied")
    .flatMap((group) => group.nations)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
);

const status = (key: NationGroup) =>
  key === "occupied" ? "occupied-axis" : key;
const fill = (key: NationGroup) => swatch(status(key), "side")[0];
const hatch = (key: NationGroup) => swatch(status(key), "side")[1];
</script>

<style lang="scss" scoped>
.nations {
  @include panel(1);
  width: 250px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.nations__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  padding: 11px 14px;
  font-family: var(--font-display);
  font-size: 0.96rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:focus-visible {
    @include focus-ring;
  }

  > svg {
    flex: none;
    width: 16px;
    height: 16px;
    color: var(--gold);
  }
}

.nations__title {
  white-space: nowrap;
}

.nations__preview {
  display: flex;
  flex: none;
  align-items: center;
  margin-left: auto;

  img {
    height: 14px;
    width: auto;
    border-radius: 2px;
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 0.55),
      0 0 0 2.5px rgb(20 21 16 / 1);

    & + img {
      margin-left: -5px;
    }
  }
}

.nations__count {
  flex: none;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  color: var(--muted);

  .is-open & {
    margin-left: auto;
  }
}

.nations__chevron {
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--muted);
}

.nations__body {
  display: grid;
  gap: 12px;
  padding: 2px 14px 14px;
  max-height: min(52vh, 460px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.nations__side {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  font-family: var(--font-mono);
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text);
}

.nations__swatch {
  flex: none;
  width: 14px;
  height: 10px;
  border-radius: 2px;
  background: var(--fill);
  box-shadow: inset 0 0 0 1px rgb(236 230 214 / 0.25);

  &.is-hatched {
    background: repeating-linear-gradient(
      135deg,
      var(--hatch) 0 2px,
      var(--fill) 2px 5px
    );
  }
}

.nations__n {
  margin-left: auto;
  color: var(--faint);
}

.nations__list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px 8px;
}

.nations__item {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  min-height: 28px;
  padding: 3px 4px;
  border-radius: 6px;
  font-size: 0.76rem;
  text-align: left;
  color: var(--muted);
  transition:
    background-color 0.2s $ease-out,
    color 0.2s $ease-out;

  img {
    flex: none;
    height: 15px;
    width: auto;
    max-width: 30px;
    object-fit: contain;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.55);
  }

  span {
    display: -webkit-box;
    min-width: 0;
    overflow: hidden;
    line-height: 1.15;
    hyphens: auto;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &:hover {
    color: var(--text);
    background: rgb(236 230 214 / 0.06);
  }

  &:focus-visible {
    @include focus-ring;
  }
}

.nations__note {
  font-size: 0.7rem;
  line-height: 1.4;
  color: var(--faint);
}
</style>
