<template>
  <div class="sounds">
    <ul class="sounds__list">
      <li v-for="era in ERAS" :key="era.id">
        <button
          type="button"
          class="sound"
          :class="[`sound--${era.id}`, { 'is-playing': playing === era.id }]"
          @click="playEra(era.id)"
        >
          <span class="sound__icon"><Icon :name="era.icon" /></span>
          <span class="sound__text">
            <span class="sound__era">{{ t(`era.${era.id}`) }}</span>
            <span class="sound__name">{{
              t(`aboutPage.sounds.${era.id}`)
            }}</span>
            <span class="sound__years mono">{{
              t(`era.years.${era.id}`)
            }}</span>
          </span>
          <span class="sound__eq" aria-hidden="true">
            <i v-for="n in 5" :key="n" :style="{ '--n': n }" />
          </span>
        </button>
      </li>
    </ul>
    <p class="sounds__status" aria-live="polite">
      <template v-if="!sound.enabled.value">
        <Icon name="sound-off" />
        {{ t("aboutPage.sounds.off") }}
      </template>
      <span v-else-if="playing" class="visually-hidden">
        {{
          t("aboutPage.sounds.playing", {
            sound: t(`aboutPage.sounds.${playing}`),
          })
        }}
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
type Era = "ww1" | "interwar" | "ww2";

const ERAS = [
  { id: "ww1", icon: "flag" },
  { id: "interwar", icon: "radio" },
  { id: "ww2", icon: "crosshair" },
] as const;

const { t } = useI18n();
const sound = useSound();
const playing = ref<Era>();
let timer: ReturnType<typeof setTimeout> | undefined;

function playEra(era: Era) {
  sound.play(era);
  if (!sound.enabled.value) return;
  playing.value = era;
  clearTimeout(timer);
  timer = setTimeout(() => (playing.value = undefined), 800);
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style lang="scss" scoped>
.sounds__list {
  display: grid;
  gap: 14px;
  list-style: none;

  @include up($bp-md) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.sound {
  --accent: var(--gold);
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-height: 96px;
  padding: 18px 20px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  background: linear-gradient(145deg, var(--surface-2), var(--surface));
  text-align: left;
  overflow: hidden;
  transition:
    border-color 0.25s $ease-out,
    transform 0.25s $ease-out;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 15% 50%,
      var(--accent),
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.4s $ease-out;
  }

  &--ww1 {
    --accent: var(--olive);
  }

  &--interwar {
    --accent: var(--blue);
  }

  &--ww2 {
    --accent: var(--red);
  }

  &:hover,
  &.is-playing {
    border-color: var(--accent);
  }

  &:hover::before {
    opacity: 0.12;
  }

  &.is-playing::before {
    opacity: 0.28;
  }

  &:active {
    transform: scale(0.98);
  }

  > * {
    position: relative;
  }
}

.sound__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--accent);
  color: var(--text);

  svg {
    width: 22px;
    height: 22px;
  }
}

.sound__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.sound__era {
  @include eyebrow;
}

.sound__name {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
}

.sound__years {
  font-size: 0.78rem;
  color: var(--faint);
}

.sound__eq {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 28px;

  i {
    width: 4px;
    height: 20%;
    border-radius: 2px;
    background: var(--accent);
    opacity: 0.55;
    transition: height 0.2s $ease-out;
  }
}

.is-playing .sound__eq i {
  height: calc(30% + var(--n) * 12%);
  opacity: 1;

  @include motion {
    animation: eq 0.32s $ease-in-out calc(var(--n) * -0.07s) infinite alternate;
  }
}

.sounds__status {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 1.6em;
  margin-top: 16px;
  font-size: 0.92rem;
  color: var(--muted);

  svg {
    width: 18px;
    height: 18px;
    flex: none;
  }
}

@keyframes eq {
  from {
    height: 15%;
  }
  to {
    height: 100%;
  }
}
</style>
