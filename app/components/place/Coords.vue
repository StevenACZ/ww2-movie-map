<template>
  <span class="coords mono">{{ text }}</span>
</template>

<script setup lang="ts">
import type { LonLat } from "~~/types/data";

const props = defineProps<{ coordinates: LonLat }>();
const { locale } = useI18n();

const text = computed(() => {
  const [lon, lat] = props.coordinates;
  const west = locale.value === "es" ? "O" : "W";
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : west}`;
});
</script>

<style lang="scss" scoped>
.coords {
  letter-spacing: 0.04em;
  white-space: nowrap;
}
</style>
