<template>
  <Transition name="fade">
    <div v-if="film" class="film-hover-tooltip">
      <h3 class="film-title">{{ film.title }}</h3>
      <p class="film-year">{{ film.year }}</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Film } from "../../../types";

defineProps<{
  film: Film | null;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.film-hover-tooltip {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: $z-tooltip;
  background: linear-gradient(
    135deg,
    rgba(20, 25, 30, 0.98) 0%,
    rgba(15, 20, 25, 0.96) 100%
  );
  border: 2px solid rgba($beige, 0.6);
  border-radius: 10px;
  padding: 14px 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba($beige, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  min-width: 280px;
  text-align: center;
  pointer-events: none;

  @include mobile {
    top: 70px;
    min-width: 200px;
    max-width: calc(100vw - 40px);
    padding: 10px 16px;
  }

  .film-title {
    font-family: "Cinzel", serif;
    font-size: 22px;
    font-weight: 700;
    color: $beige;
    margin: 0 0 6px 0;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba($beige, 0.4);
    letter-spacing: 0.5px;

    @include mobile {
      font-size: 16px;
    }
  }

  .film-year {
    font-family: "Inter", sans-serif;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-weight: 500;
    letter-spacing: 2px;

    @include mobile {
      font-size: 14px;
    }
  }
}

// Fade Transition
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
