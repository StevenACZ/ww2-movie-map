<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="ICONS[name]"
  />
</template>

<script setup lang="ts">
import { ICONS, type IconName } from "~/utils/icons";

withDefaults(defineProps<{ name: IconName; stroke?: number | string }>(), {
  stroke: 1.8,
});
</script>
