<template>
  <div class="map-page">
    <WW2Map />
  </div>
</template>

<script setup lang="ts">
import WW2Map from "~/components/WW2Map.vue";
</script>

<style scoped>
.map-page {
  height: 100vh;
  overflow: hidden;
}
</style>
